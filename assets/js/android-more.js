/* =========================================================
   AK Phone: tools (loads after android.js and android-apps.js)
   Recorder, Translate, Dictionary, Currency, News, Paint,
   Piano, Compass, and a Screenshot quick-settings tile.
   Live data comes from free, keyless public APIs:
   MyMemory (translate), dictionaryapi.dev, Frankfurter (ECB
   exchange rates) and the Hacker News Firebase API.
   ========================================================= */
(function () {
  "use strict";
  const P = window.AKPhone;
  if (!P) return;
  const { APPS, RUN, S, save, openApp, notify, toast, beep, buzz, ic, icons, esc, bar, offline, online, photos, TILES, screen } = P;
  const qs = (sel, el) => el.querySelector(sel);
  const pad = (n) => String(n).padStart(2, "0");
  const getJSON = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
  const scripts = {};
  const loadScript = (src) => scripts[src] || (scripts[src] = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = () => { delete scripts[src]; rej(new Error("load")); };
    document.head.appendChild(s);
  }));
  const ago = (sec) => { const m = Math.floor((Date.now() / 1000 - sec) / 60); return m < 60 ? m + "m ago" : m < 1440 ? Math.floor(m / 60) + "h ago" : Math.floor(m / 1440) + "d ago"; };
  // keys typed on the page only reach the phone after the visitor last clicked inside it
  let inside = false;
  document.addEventListener("pointerdown", (e) => { inside = screen.contains(e.target); }, true);

  Object.assign(APPS, {
    recorder: { n: "Recorder", i: "mic-vocal", c: "#c2185b", tool: true },
    translate: { n: "Translate", i: "languages", c: "#1a73e8", tool: true },
    dict: { n: "Dictionary", i: "book-open", c: "#6d4c41", tool: true },
    currency: { n: "Currency", i: "indian-rupee", c: "#2e7d32", tool: true },
    news: { n: "News", i: "newspaper", c: "#e65100", tool: true },
    paint: { n: "Paint", i: "palette", c: "#8e24aa", tool: true },
    piano: { n: "Piano", i: "piano", c: "#37474f", tool: true },
    compass: { n: "Compass", i: "compass", c: "#00838f", tool: true },
  });

  /* =========================================================
     Recorder: MediaRecorder + a live waveform from an AnalyserNode
     ========================================================= */
  RUN.recorder = (el) => {
    let mr = null, stream = null, ac = null, an = null, raf = 0, t0 = 0, chunks = [];
    const clips = [];
    const fmt = (ms) => { const s = Math.floor(ms / 1000); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); };
    el.innerHTML = bar("Recorder") + `<div class="dapp-body dx-rec">
      <canvas class="dx-rec__wave" width="656" height="160" aria-hidden="true"></canvas>
      <div class="dx-rec__time">00:00</div>
      <button type="button" class="dx-rec__btn" data-rec aria-label="Start recording">${ic("mic")}</button>
      <p class="dx-note" data-rec-msg>Tap to record. Clips stay in this tab; nothing is uploaded.</p>
      <ul class="dx-list" data-rec-list></ul></div>`;
    const cv = qs("canvas", el), g = cv.getContext("2d"), btn = qs("[data-rec]", el), timeEl = qs(".dx-rec__time", el), msg = qs("[data-rec-msg]", el);
    const color = () => getComputedStyle(screen).getPropertyValue("--pa").trim() || "#ff8a5c";
    const wave = (data) => {
      g.clearRect(0, 0, cv.width, cv.height);
      g.fillStyle = color();
      const n = 48, w = cv.width / n;
      for (let i = 0; i < n; i++) {
        const v = data ? data[Math.floor((i * data.length) / n)] / 255 : 0;
        const h = Math.max(4, v * cv.height * 0.95);
        g.fillRect(i * w + 2, (cv.height - h) / 2, w - 4, h);
      }
    };
    const loop = () => {
      const d = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d); wave(d);
      timeEl.textContent = fmt(performance.now() - t0);
      raf = requestAnimationFrame(loop);
    };
    const drawList = () => {
      qs("[data-rec-list]", el).innerHTML = clips.map((c, i) => `<li><audio src="${c.url}" controls preload="metadata"></audio>
        <div class="dx-list__row"><span>Clip ${clips.length - i} · ${fmt(c.ms)}</span><a href="${c.url}" download="ak-phone-clip-${clips.length - i}.${c.ext}" aria-label="Download clip">${ic("download")}</a><button type="button" data-rec-del="${i}" aria-label="Delete clip">${ic("trash-2")}</button></div></li>`).join("");
      icons();
    };
    const stop = () => {
      if (mr && mr.state === "recording") mr.stop();
      cancelAnimationFrame(raf);
      if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
      if (ac) { ac.close().catch(() => {}); ac = null; }
      btn.classList.remove("is-on"); btn.innerHTML = ic("mic"); btn.setAttribute("aria-label", "Start recording"); icons();
      wave(null);
    };
    const start = async () => {
      if (!navigator.mediaDevices || !window.MediaRecorder) { msg.textContent = "This browser can't record audio."; return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { msg.textContent = "Microphone blocked or not found. You can allow it from the address bar."; return; }
      ac = new (window.AudioContext || window.webkitAudioContext)();
      an = ac.createAnalyser(); an.fftSize = 256; ac.createMediaStreamSource(stream).connect(an);
      chunks = []; mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        const type = mr.mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        clips.unshift({ url: URL.createObjectURL(blob), ms: performance.now() - t0, ext: type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm" });
        drawList(); msg.textContent = "Saved. Play it below, or download it."; timeEl.textContent = "00:00";
      };
      mr.start(); t0 = performance.now();
      btn.classList.add("is-on"); btn.innerHTML = ic("square"); btn.setAttribute("aria-label", "Stop recording"); icons();
      msg.textContent = "Recording… tap to stop."; buzz(20); loop();
    };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-rec]")) { if (mr && mr.state === "recording") stop(); else start(); return; }
      const d = e.target.closest("[data-rec-del]");
      if (d) { const [c] = clips.splice(+d.dataset.recDel, 1); URL.revokeObjectURL(c.url); drawList(); toast("Clip deleted"); }
    });
    wave(null);
    return { hide: stop, destroy: () => { stop(); clips.forEach((c) => URL.revokeObjectURL(c.url)); } };
  };

  /* =========================================================
     Translate: MyMemory API, read aloud with speechSynthesis
     ========================================================= */
  const LANGS = [["en", "English"], ["hi", "Hindi"], ["bn", "Bengali"], ["pa", "Punjabi"], ["ta", "Tamil"], ["te", "Telugu"], ["mr", "Marathi"], ["gu", "Gujarati"], ["ur", "Urdu"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["ar", "Arabic"], ["ja", "Japanese"], ["zh-CN", "Chinese"], ["ru", "Russian"]];
  RUN.translate = (el) => {
    let from = "en", to = "hi", busy = false;
    const opts = (sel) => LANGS.map(([k, n]) => `<option value="${k}"${k === sel ? " selected" : ""}>${n}</option>`).join("");
    el.innerHTML = bar("Translate") + `<div class="dapp-body dx-tr">
      <div class="dx-tr__langs"><select data-tr-from aria-label="From">${opts(from)}</select><button type="button" class="dx-icon" data-tr-swap aria-label="Swap languages">${ic("arrow-left-right")}</button><select data-tr-to aria-label="To">${opts(to)}</select></div>
      <textarea class="dx-field" data-tr-in maxlength="480" placeholder="Type something to translate" aria-label="Text to translate">I build websites, then I bring them customers.</textarea>
      <button type="button" class="dx-btn" data-tr-go>${ic("languages")}Translate</button>
      <div class="dx-card dx-tr__out" data-tr-out hidden><p></p><button type="button" class="dx-icon" data-tr-say aria-label="Read aloud">${ic("volume-2")}</button></div>
      <p class="dx-note">Translations by MyMemory, free and keyless.</p></div>`;
    const out = qs("[data-tr-out]", el), txt = qs("[data-tr-in]", el);
    const go = async () => {
      const q = txt.value.trim(); if (!q || busy) return;
      if (!online()) { out.hidden = false; out.querySelector("p").innerHTML = offline("Translate"); return; }
      if (from === to) { out.hidden = false; qs("p", out).textContent = q; return; }
      busy = true; out.hidden = false; qs("p", out).textContent = "Translating…";
      try {
        const j = await getJSON(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${from}|${to}`);
        const t = j && j.responseData && j.responseData.translatedText;
        qs("p", out).textContent = t && j.responseStatus === 200 ? t : "Couldn't translate that. Try a shorter sentence.";
      } catch (e) { qs("p", out).textContent = "The translation service didn't answer. Try again in a moment."; }
      busy = false;
    };
    el.addEventListener("change", (e) => {
      if (e.target.matches("[data-tr-from]")) from = e.target.value;
      if (e.target.matches("[data-tr-to]")) to = e.target.value;
    });
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-tr-go]")) go();
      else if (e.target.closest("[data-tr-swap]")) {
        [from, to] = [to, from]; qs("[data-tr-from]", el).value = from; qs("[data-tr-to]", el).value = to;
        const p = qs("p", out); if (!out.hidden && p.textContent && !/…|Couldn't|didn't/.test(p.textContent)) { txt.value = p.textContent; go(); }
      } else if (e.target.closest("[data-tr-say]")) {
        if (!window.speechSynthesis) { toast("Speech isn't available in this browser"); return; }
        const u = new SpeechSynthesisUtterance(qs("p", out).textContent); u.lang = to; speechSynthesis.cancel(); speechSynthesis.speak(u);
      }
    });
    return { hide: () => window.speechSynthesis && speechSynthesis.cancel() };
  };

  /* =========================================================
     Dictionary: dictionaryapi.dev, with pronunciation audio
     ========================================================= */
  RUN.dict = (el) => {
    let audio = null;
    el.innerHTML = bar("Dictionary") + `<div class="dapp-body dx-dict">
      <form class="dx-search" data-dict-form><input class="dx-field" name="w" placeholder="Look up an English word" autocomplete="off" aria-label="Word"><button type="submit" class="dx-icon" aria-label="Search">${ic("search")}</button></form>
      <div data-dict-out><div class="dx-chips">${["serendipity", "lucrative", "resilient", "property", "ephemeral"].map((w) => `<button type="button" data-dict-w="${w}">${w}</button>`).join("")}</div><p class="dx-note">Definitions from the free Dictionary API.</p></div></div>`;
    const out = qs("[data-dict-out]", el);
    const look = async (w) => {
      w = w.trim().toLowerCase(); if (!w) return;
      qs("input", el).value = w;
      if (!online()) { out.innerHTML = offline("Dictionary"); icons(); return; }
      out.innerHTML = `<p class="dx-note">Looking up “${esc(w)}”…</p>`;
      try {
        const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
        if (r.status === 404) { out.innerHTML = `<p class="dempty">${ic("search-x")}No definition found for “${esc(w)}”.</p>`; icons(); return; }
        const [e] = await r.json();
        const ph = (e.phonetics || []).find((p) => p.audio) || {};
        audio = ph.audio || null;
        const means = (e.meanings || []).slice(0, 3).map((m) => `<div class="dx-dict__m"><em>${esc(m.partOfSpeech)}</em><ol>${m.definitions.slice(0, 3).map((d) => `<li>${esc(d.definition)}${d.example ? `<q>${esc(d.example)}</q>` : ""}</li>`).join("")}</ol>${m.synonyms && m.synonyms.length ? `<p class="dx-dict__syn">Similar: ${m.synonyms.slice(0, 5).map(esc).join(", ")}</p>` : ""}</div>`).join("");
        out.innerHTML = `<div class="dx-dict__head"><div><h3>${esc(e.word)}</h3><span>${esc(e.phonetic || ph.text || "")}</span></div>${audio ? `<button type="button" class="dx-icon dx-icon--big" data-dict-say aria-label="Play pronunciation">${ic("volume-2")}</button>` : ""}</div>${means}`;
      } catch (err) { out.innerHTML = `<p class="dempty">${ic("cloud-off")}The dictionary didn't answer. Try again.</p>`; }
      icons();
    };
    el.addEventListener("submit", (e) => { e.preventDefault(); look(e.target.w.value); P.hideKb && P.hideKb(); });
    el.addEventListener("click", (e) => {
      const c = e.target.closest("[data-dict-w]"); if (c) { look(c.dataset.dictW); return; }
      if (e.target.closest("[data-dict-say]") && audio) new Audio(audio).play().catch(() => toast("Couldn't play the audio"));
    });
    return {};
  };

  /* =========================================================
     Currency: Frankfurter (European Central Bank reference rates)
     ========================================================= */
  const CUR = [["INR", "₹", "Indian rupee"], ["USD", "$", "US dollar"], ["EUR", "€", "Euro"], ["GBP", "£", "British pound"], ["JPY", "¥", "Japanese yen"], ["AUD", "A$", "Australian dollar"], ["CAD", "C$", "Canadian dollar"], ["SGD", "S$", "Singapore dollar"], ["CHF", "Fr", "Swiss franc"], ["CNY", "¥", "Chinese yuan"], ["HKD", "HK$", "Hong Kong dollar"], ["THB", "฿", "Thai baht"]];
  RUN.currency = (el) => {
    let base = S.curBase || "INR", amt = S.curAmt || 1000;
    const cache = {};
    el.innerHTML = bar("Currency", `<button type="button" class="dbar__act" data-cur-ref aria-label="Refresh rates">${ic("refresh-cw")}</button>`) + `<div class="dapp-body dx-cur">
      <div class="dx-cur__in"><select data-cur-base aria-label="Currency">${CUR.map(([k]) => `<option${k === base ? " selected" : ""}>${k}</option>`).join("")}</select><input class="dx-field" data-cur-amt type="number" inputmode="decimal" min="0" value="${amt}" aria-label="Amount"></div>
      <ul class="dx-cur__list" data-cur-list></ul><p class="dx-note" data-cur-date></p></div>`;
    const list = qs("[data-cur-list]", el), note = qs("[data-cur-date]", el);
    const nf = (v, k) => v.toLocaleString("en-IN", { maximumFractionDigits: k === "JPY" ? 0 : 2 });
    const draw = () => {
      const r = cache[base]; if (!r) return;
      list.innerHTML = CUR.filter(([k]) => k !== base && r.rates[k]).map(([k, sym, name]) => `<li><span class="dx-cur__code">${k}</span><span class="dx-cur__name">${name}</span><b>${sym} ${nf(amt * r.rates[k], k)}</b></li>`).join("");
      const d = new Date(r.date + "T12:00:00");
      note.textContent = `ECB reference rates for ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, via Frankfurter. 1 ${base} = ${r.rates[base === "USD" ? "INR" : "USD"]} ${base === "USD" ? "INR" : "USD"}.`;
    };
    const load = async (force) => {
      if (cache[base] && !force) { draw(); return; }
      if (!online()) { list.innerHTML = `<li class="dx-cur__off">${offline("Currency rates")}</li>`; icons(); return; }
      list.innerHTML = `<li class="dx-note">Loading rates…</li>`;
      try { cache[base] = await getJSON(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${CUR.map(([k]) => k).filter((k) => k !== base).join(",")}`); draw(); }
      catch (e) { list.innerHTML = `<li class="dx-note">Couldn't load rates. Tap refresh to try again.</li>`; }
    };
    el.addEventListener("change", (e) => { if (e.target.matches("[data-cur-base]")) { base = e.target.value; S.curBase = base; save(); load(); } });
    el.addEventListener("input", (e) => { if (e.target.matches("[data-cur-amt]")) { amt = Math.max(0, parseFloat(e.target.value) || 0); S.curAmt = amt; save(); draw(); } });
    el.addEventListener("click", (e) => { if (e.target.closest("[data-cur-ref]")) load(true); });
    load();
    return { show: () => load() };
  };

  /* =========================================================
     News: today's top tech stories from Hacker News
     ========================================================= */
  RUN.news = (el) => {
    let items = [], at = 0;
    el.innerHTML = bar("News", `<button type="button" class="dbar__act" data-news-ref aria-label="Refresh">${ic("refresh-cw")}</button>`) + `<div class="dapp-body dx-news"><p class="dx-news__src">${ic("flame")}Top stories on Hacker News</p><ol data-news-list></ol></div>`;
    const list = qs("[data-news-list]", el);
    const draw = () => {
      list.innerHTML = items.map((it, i) => {
        const host = it.url ? new URL(it.url).hostname.replace(/^www\./, "") : "news.ycombinator.com";
        return `<li><a href="${esc(it.url || "https://news.ycombinator.com/item?id=" + it.id)}" target="_blank" rel="noopener"><span class="dx-news__n">${i + 1}</span><span><b>${esc(it.title)}</b><small>${esc(host)} · ${it.score} points · ${it.descendants || 0} comments · ${ago(it.time)}</small></span></a></li>`;
      }).join("");
    };
    const load = async (force) => {
      if (items.length && !force && Date.now() - at < 10 * 60 * 1000) return;
      if (!online()) { list.innerHTML = `<li>${offline("News")}</li>`; icons(); return; }
      list.innerHTML = `<li class="dx-note">Loading stories…</li>`;
      try {
        const ids = (await getJSON("https://hacker-news.firebaseio.com/v0/topstories.json")).slice(0, 20);
        items = (await Promise.all(ids.map((id) => getJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null)))).filter((x) => x && x.title);
        at = Date.now(); draw();
      } catch (e) { list.innerHTML = `<li class="dx-note">Couldn't load the news. Tap refresh to try again.</li>`; }
    };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-news-ref]")) load(true); });
    load();
    return { show: () => load() };
  };

  /* =========================================================
     Paint: pressure-aware brush, eraser, undo, save to Gallery
     ========================================================= */
  RUN.paint = (el) => {
    const COLORS = ["#1c1b1a", "#e2571f", "#1a73e8", "#188038", "#f9ab00", "#a142f4", "#ffffff"];
    let color = COLORS[1], size = 8, erase = false, drawing = false, last = null, ready = false;
    const undo = [];
    el.innerHTML = bar("Paint", `<button type="button" class="dbar__act" data-pt="undo" aria-label="Undo">${ic("undo-2")}</button><button type="button" class="dbar__act" data-pt="clear" aria-label="Clear">${ic("trash-2")}</button><button type="button" class="dbar__act" data-pt="save" aria-label="Save to Gallery">${ic("download")}</button>`)
      + `<div class="dx-paint"><canvas aria-label="Drawing canvas"></canvas></div>
      <div class="dx-paint__tools">${COLORS.map((c) => `<button type="button" class="dx-sw${c === color ? " is-on" : ""}" data-pt-c="${c}" style="--sw:${c}" aria-label="Colour ${c}"></button>`).join("")}
        <button type="button" class="dx-icon${erase ? " is-on" : ""}" data-pt="erase" aria-label="Eraser">${ic("eraser")}</button>
        <input type="range" min="2" max="28" value="${size}" data-pt-size aria-label="Brush size"></div>`;
    const cv = qs("canvas", el), g = cv.getContext("2d");
    const setup = () => {
      const box = qs(".dx-paint", el), w = box.clientWidth, h = box.clientHeight;
      if (!w || !h || ready) return;
      const d = window.devicePixelRatio || 1;
      cv.width = Math.round(w * d); cv.height = Math.round(h * d); g.scale(d, d);
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.lineCap = "round"; g.lineJoin = "round";
      ready = true;
    };
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (cv.clientWidth / r.width), y: (e.clientY - r.top) * (cv.clientHeight / r.height), p: e.pressure > 0 && e.pointerType === "pen" ? e.pressure : 0.6 }; };
    cv.addEventListener("pointerdown", (e) => {
      setup(); drawing = true; cv.setPointerCapture(e.pointerId);
      undo.push(g.getImageData(0, 0, cv.width, cv.height)); if (undo.length > 15) undo.shift();
      last = pt(e); g.beginPath(); g.fillStyle = erase ? "#fff" : color; g.arc(last.x, last.y, (size * last.p) / 1.2, 0, Math.PI * 2); g.fill();
    });
    cv.addEventListener("pointermove", (e) => {
      if (!drawing) return; const p = pt(e);
      g.strokeStyle = erase ? "#fff" : color; g.lineWidth = size * p.p * 1.6;
      g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p;
    });
    ["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => { drawing = false; }));
    el.addEventListener("input", (e) => { if (e.target.matches("[data-pt-size]")) size = +e.target.value; });
    el.addEventListener("click", (e) => {
      const c = e.target.closest("[data-pt-c]");
      if (c) { color = c.dataset.ptC; erase = false; el.querySelectorAll(".dx-sw, [data-pt=erase]").forEach((b) => b.classList.toggle("is-on", b === c)); return; }
      const a = e.target.closest("[data-pt]"); if (!a) return;
      const k = a.dataset.pt; setup();
      if (k === "erase") { erase = !erase; a.classList.toggle("is-on", erase); el.querySelectorAll(".dx-sw").forEach((b) => b.classList.toggle("is-on", !erase && b.dataset.ptC === color)); }
      else if (k === "undo") { const im = undo.pop(); if (im) g.putImageData(im, 0, 0); }
      else if (k === "clear") { undo.push(g.getImageData(0, 0, cv.width, cv.height)); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); }
      else if (k === "save") {
        const url = cv.toDataURL("image/png"); photos.unshift(url);
        notify({ app: "paint", icon: "image", title: "Drawing saved", text: "Tap to see it in Gallery", go: () => openApp("gallery", { tab: "photos" }) });
      }
    });
    return { show: () => requestAnimationFrame(setup) };
  };

  /* =========================================================
     Piano: two octaves on the Web Audio API, plus a demo tune
     ========================================================= */
  RUN.piano = (el) => {
    const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ";": 16 };
    const notes = []; for (let i = 0; i < 24; i++) notes.push({ i, name: NAMES[i % 12] + (4 + Math.floor(i / 12)), black: NAMES[i % 12].includes("#"), f: 261.63 * Math.pow(2, i / 12) });
    let ac = null, timer = 0;
    const whites = notes.filter((n) => !n.black);
    el.innerHTML = bar("Piano", `<button type="button" class="dbar__act" data-pn-demo aria-label="Play a demo tune">${ic("play")}</button>`)
      + `<div class="dx-piano"><p class="dx-note">Tap the keys, or type A–L on your keyboard. ▶ plays a tune.</p>
      <div class="dx-piano__keys">${whites.map((n) => `<button type="button" class="dx-key" data-pn="${n.i}"><span>${n.name}</span></button>`).join("")}
      ${notes.filter((n) => n.black).map((n) => { const pos = whites.filter((w) => w.i < n.i).length; return `<button type="button" class="dx-key dx-key--b" data-pn="${n.i}" style="--x:${pos}" aria-label="${n.name}"></button>`; }).join("")}</div></div>`;
    const keyEl = (i) => qs(`[data-pn="${i}"]`, el);
    const play = (i, len) => {
      const n = notes[i]; if (!n) return;
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const t = ac.currentTime, o = ac.createOscillator(), o2 = ac.createOscillator(), gn = ac.createGain();
      const vol = Math.max(0.05, (S.vol || 60) / 100) * 0.35;
      o.type = "triangle"; o2.type = "sine"; o.frequency.value = n.f; o2.frequency.value = n.f * 2;
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + 0.01); gn.gain.exponentialRampToValueAtTime(0.001, t + (len || 1.2));
      o.connect(gn); o2.connect(gn); gn.connect(ac.destination); o.start(t); o2.start(t); o.stop(t + (len || 1.2)); o2.stop(t + (len || 1.2));
      const k = keyEl(i); if (k) { k.classList.add("is-down"); setTimeout(() => k.classList.remove("is-down"), 180); }
    };
    // Twinkle Twinkle Little Star (traditional, public domain)
    const TUNE = [0, 0, 7, 7, 9, 9, 7, -1, 5, 5, 4, 4, 2, 2, 0, -1, 7, 7, 5, 5, 4, 4, 2, -1, 7, 7, 5, 5, 4, 4, 2, -1, 0, 0, 7, 7, 9, 9, 7, -1, 5, 5, 4, 4, 2, 2, 0];
    const demo = () => {
      clearTimeout(timer); let j = 0;
      const step = () => { if (j >= TUNE.length) return; const n = TUNE[j++]; if (n >= 0) play(n, 0.6); timer = setTimeout(step, n < 0 ? 380 : 360); };
      step();
    };
    el.addEventListener("pointerdown", (e) => { const k = e.target.closest("[data-pn]"); if (k) { e.preventDefault(); play(+k.dataset.pn); } });
    el.addEventListener("click", (e) => { if (e.target.closest("[data-pn-demo]")) demo(); });
    const onKey = (e) => {
      if (!inside || P.current() !== "piano" || el.hidden || e.repeat || e.target.closest("input, textarea, select")) return;
      const i = KEYMAP[e.key.toLowerCase()]; if (i === undefined) return;
      e.preventDefault(); play(i);
    };
    document.addEventListener("keydown", onKey);
    return { hide: () => clearTimeout(timer), destroy: () => { clearTimeout(timer); document.removeEventListener("keydown", onKey); if (ac) ac.close().catch(() => {}); } };
  };

  /* =========================================================
     Compass + spirit level: DeviceOrientation sensors
     ========================================================= */
  RUN.compass = (el) => {
    let on = false, got = false, heading = null, tm = 0;
    const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    el.innerHTML = bar("Compass") + `<div class="dapp-body dx-cmp">
      <div class="dx-cmp__dial"><div class="dx-cmp__rose">${["N", "E", "S", "W"].map((d, i) => `<b style="--r:${i * 90}deg">${d}</b>`).join("")}${Array.from({ length: 36 }, (_, i) => `<i style="--r:${i * 10}deg"></i>`).join("")}</div><span class="dx-cmp__needle"></span></div>
      <div class="dx-cmp__read"><b data-cmp-deg>--°</b><span data-cmp-dir>Compass</span></div>
      <div class="dx-cmp__level"><span data-cmp-bubble></span></div>
      <p class="dx-note" data-cmp-msg>Uses your phone's motion sensors. Desktops and laptops don't have one.</p>
      <button type="button" class="dx-btn" data-cmp-on>${ic("compass")}Start compass</button></div>`;
    const rose = qs(".dx-cmp__rose", el), deg = qs("[data-cmp-deg]", el), dir = qs("[data-cmp-dir]", el), bub = qs("[data-cmp-bubble]", el), msg = qs("[data-cmp-msg]", el);
    const onOri = (e) => {
      let h = null;
      if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === "number") h = 360 - e.alpha;
      if (typeof e.beta === "number" && typeof e.gamma === "number") {
        got = true;
        const x = Math.max(-1, Math.min(1, e.gamma / 45)), y = Math.max(-1, Math.min(1, e.beta / 45));
        bub.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
      }
      if (h !== null) {
        got = true; heading = (h + 360) % 360;
        rose.style.transform = `rotate(${-heading}deg)`;
        deg.textContent = Math.round(heading) + "°"; dir.textContent = DIRS[Math.round(heading / 45) % 8];
      }
    };
    const stop = () => { window.removeEventListener("deviceorientationabsolute", onOri); window.removeEventListener("deviceorientation", onOri); clearTimeout(tm); on = false; };
    const start = async () => {
      if (on) return;
      const D = window.DeviceOrientationEvent;
      if (!D) { msg.textContent = "This browser has no motion sensor access."; return; }
      if (typeof D.requestPermission === "function") {
        try { if ((await D.requestPermission()) !== "granted") { msg.textContent = "Motion access was declined."; return; } } catch (e) { msg.textContent = "Motion access was declined."; return; }
      }
      on = true; got = false;
      window.addEventListener("ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation", onOri);
      msg.textContent = "Hold the phone flat and turn around slowly.";
      qs("[data-cmp-on]", el).hidden = true;
      tm = setTimeout(() => { if (!got) { msg.textContent = "No compass sensor found. Open this page on a phone to try it."; qs("[data-cmp-on]", el).hidden = false; stop(); } }, 2500);
    };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-cmp-on]")) start(); });
    return { hide: stop, destroy: stop };
  };

  /* =========================================================
     Screenshot: a quick-settings tile, saved into Gallery
     ========================================================= */
  const shoot = async () => {
    const flash = document.createElement("div"); flash.className = "dx-flash"; screen.appendChild(flash);
    try {
      await new Promise((r) => setTimeout(r, 350)); // let the shade close first
      // html-to-image lets the browser itself paint the screen (via SVG foreignObject),
      // so modern CSS like color-mix() renders exactly as on screen
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js");
      const url = await window.htmlToImage.toPng(screen, { pixelRatio: 1, cacheBust: false, skipFonts: true,
        filter: (n) => n !== flash && !(n.tagName === "IFRAME") && !(n.nodeType === 1 && n.hidden) });
      photos.unshift(url);
      flash.classList.add("is-on"); beep(1400, 0, 50); buzz(25);
      notify({ app: "gallery", icon: "image", title: "Screenshot saved", text: "Tap to see it in Gallery", go: () => openApp("gallery", { tab: "photos" }) });
    } catch (e) { toast("Couldn't take a screenshot"); }
    setTimeout(() => flash.remove(), 700);
  };
  TILES.push({ k: "shot", n: "Screenshot", i: "scan-line", on: () => false, run: shoot });

  if (P.drawHome) P.drawHome();
})();
