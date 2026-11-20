/* =========================================================
   AK Phone: extra apps and games (loads after android.js)
   Assistant, Device Info, QR, Speed Test, Music, Videos,
   and six games: Flappy, Memory, Minesweeper, Bricks,
   Sudoku, Lead Catcher.
   ========================================================= */
(function () {
  "use strict";
  const P = window.AKPhone;
  if (!P) return;
  const { APPS, RUN, S, save, openApp, notify, toast, beep, buzz, ic, icons, esc, bar, offline, online, swipeDir, keyDirs, setMedia } = P;

  Object.assign(APPS, {
    assistant: { n: "Assistant", i: "mic", c: "#4f46e5" },
    music: { n: "Music", i: "music", c: "#d81b60" },
    videos: { n: "Videos", i: "clapperboard", c: "#c62828" },
    device: { n: "Device Info", i: "cpu", c: "#455a64" },
    qr: { n: "QR", i: "qr-code", c: "#0b8043" },
    speed: { n: "Speed Test", i: "gauge", c: "#0277bd" },
    flappy: { n: "Flappy", i: "bird", c: "#f9a825", game: true, d: "Tap to fly through the gaps. One touch and it's over." },
    memory: { n: "Memory", i: "brain", c: "#8e24aa", game: true, d: "Flip two cards at a time and find all eight pairs in as few moves as you can." },
    mines: { n: "Minesweeper", i: "bomb", c: "#546e7a", game: true, d: "Open every safe square. Numbers tell you how many mines touch that square." },
    bricks: { n: "Bricks", i: "brick-wall", c: "#d84315", game: true, d: "Bounce the ball and break every brick. Drag the paddle or use the arrow keys." },
    sudoku: { n: "Sudoku", i: "grid-3x3", c: "#3949ab", game: true, d: "Fill the grid so every row, column and box has 1 to 9." },
    catcher: { n: "Lead Catcher", i: "magnet", c: "#e2571f", game: true, d: "Catch the leads, grab the gold #1 rankings, dodge the spam. Every lead is worth ₹288." },
  });
  const best = (k, v) => { S.best = S.best || {}; if (v !== undefined && v > (S.best[k] || 0)) { S.best[k] = v; save(); } return S.best[k] || 0; };
  const scripts = {};
  const loadScript = (src) => scripts[src] || (scripts[src] = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = () => { delete scripts[src]; rej(new Error("load")); };
    document.head.appendChild(s);
  }));
  const qs = (sel, el) => el.querySelector(sel);

  /* =========================================================
     Assistant: voice in (Web Speech API), voice out (speechSynthesis)
     ========================================================= */
  RUN.assistant = (el) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec = null, listening = false;
    const log = [{ me: false, t: "Hi! I'm Anek's assistant. Ask me who he is, what he's built, his results, or how to reach him." }];
    const OPEN = { camera: "camera", maps: "maps", map: "maps", weather: "weather", music: "music", songs: "music", videos: "videos", youtube: "videos", settings: "settings", store: "store", gallery: "gallery", photos: "gallery", clock: "clock", timer: "clock", calculator: "calc", calendar: "calendar", notes: "notes", files: "files", browser: "browser", chrome: "browser", phone: "phone", messages: "messages", qr: "qr", "speed test": "speed", speed: "speed", "device info": "device" };
    const INTENTS = [
      { k: /\b(hi|hello|hey|namaste|hii)\b/, a: "Hello! Ask me about Anek: his work, his results, his skills, or how to contact him." },
      { k: /(contact|phone number|number|call him|email|whatsapp|reach)/, a: "You can WhatsApp or call Anek on plus 91 95188 48804, or email anekkumar9518 at gmail dot com.", act: { label: "Message on WhatsApp", run: () => window.open("https://wa.me/919518848804", "_blank", "noopener") } },
      { k: /(hire|cost|price|charge|rate|quote|freelance|available|availability|job)/, a: "Anek works full-time at Shubharambh Infra Advisors and takes freelance projects alongside: websites, online stores, CRMs, SEO and Meta or Google ads. Send him your project on WhatsApp and he'll reply with a plan and a quote.", act: { label: "Send project on WhatsApp", run: () => window.open("https://wa.me/919518848804?text=" + encodeURIComponent("Hi Anek, I'd like a quote for a project."), "_blank", "noopener") } },
      { k: /(seo|google|rank|ranking|impression|search console|traffic)/, a: "For Shubharambh Infra Advisors, Anek grew Google impressions from 3.43 thousand to 1.22 million in six months, and the site ranks number one on Google for 55 keywords, including best property advisor in Noida and real estate consultant in Noida." },
      { k: /(meta|facebook|instagram|\bads?\b|leads?|campaign|cpl|marketing)/, a: "On Meta ads Anek has generated 1,149 property leads at 288 rupees each for Shubharambh, with about one in ten leads becoming a site meeting. He's managed over 10 lakh rupees of ad spend in total." },
      { k: /(experience|years|worked|companies|career|history)/, a: "Anek has over three years of experience across four companies: Xaas Technologies, Ryoto Electrix, Matrix Acres, and now Shubharambh Infra Advisors since March 2026." },
      { k: /(current|now|shubharambh|present)/, a: "Since March 2026 Anek is a full stack developer and digital marketing specialist at Shubharambh Infra Advisors in Noida. He built their website and runs their SEO and Meta ads." },
      { k: /(skill|stack|tech|language|django|php|react|python|node|code|develop)/, a: "Anek codes in Python with Django, PHP with MySQL, JavaScript, React and Node. On the marketing side: SEO, Meta and Google Ads, Meta Pixel with Conversion API, GA4, Tag Manager and WhatsApp API automation." },
      { k: /(project|website|built|portfolio|work)/, a: "His live projects include Shubharambh Infra Advisors, Matrix Acres with a 300 module CRM, Visionwave Technology, LMC Healthcare store, Hari Sabzi Wala, EzzyCommerce and AllFiles. Open the My work folder on the home screen to see them.", act: { label: "Open Shubharambh site", run: () => openApp("browser", { site: "shubh" }) } },
      { k: /(education|degree|study|studied|college|university|b\.?sc|qualification)/, a: "Anek has a B.Sc. in Mathematics from Dr. Bhimrao Ambedkar University, Agra, completed in 2021." },
      { k: /(certif|hubspot|aptron|course)/, a: "He holds HubSpot certifications in Digital Marketing and Content Marketing, and completed Python Full Stack Development at APTRON, Noida." },
      { k: /(where|location|city|based|live|noida)/, a: "Anek is based in Noida, Delhi NCR, and works remotely or on-site." },
      { k: /(cv|resume|biodata)/, a: "Opening Anek's CV now.", act: { label: "Open CV", run: () => window.open("assets/cv/Anek-Kumar-CV.pdf", "_blank", "noopener") }, auto: true },
      { k: /(who|kaun|about|introduce|anek|tell me)/, a: "Anek Kumar is a full stack developer and digital marketer from Noida. He builds websites, then brings them customers with SEO and Meta ads." },
      { k: /(time|clock)/, a: () => "It's " + new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) + "." },
      { k: /(date|day|today)/, a: () => "Today is " + new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + "." },
      { k: /(joke|funny)/, a: "Why did the website go to the doctor? It had too many broken links. Anek fixes those, by the way." },
    ];
    const answer = (raw) => {
      const q = raw.toLowerCase().trim();
      let m = q.match(/^(search|google|search for)\s+(.+)/);
      if (m) return { t: "Searching the web for " + m[2] + ".", run: () => openApp("browser", { search: m[2] }) };
      m = q.match(/^(open|launch|start|show)\s+(?:the\s+)?(.+?)(?:\s+app)?$/);
      if (m && OPEN[m[2]]) return { t: "Opening " + APPS[OPEN[m[2]]].n + ".", run: () => openApp(OPEN[m[2]]) };
      if (/weather|temperature|rain/.test(q)) return { t: "Here's the live weather for Noida.", run: () => openApp("weather") };
      for (const it of INTENTS) if (it.k.test(q)) return { t: typeof it.a === "function" ? it.a() : it.a, act: it.act, auto: it.auto };
      return { t: "I don't know that one yet. Try asking who Anek is, his SEO results, his skills, or how to contact him.", act: { label: "Search the web instead", run: () => openApp("browser", { search: raw }) } };
    };
    const speak = (t) => {
      if (!S.speak || !("speechSynthesis" in window)) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(t);
        const vs = speechSynthesis.getVoices();
        u.voice = vs.find((v) => v.lang === "en-IN") || vs.find((v) => /^en-(GB|US)/.test(v.lang)) || null;
        u.rate = 1.02; speechSynthesis.speak(u);
      } catch (e) {}
    };
    let lastAct = null;
    const ask = (q) => {
      if (!q.trim()) return;
      log.push({ me: true, t: q });
      const r = answer(q);
      log.push({ me: false, t: r.t });
      lastAct = r.act || null;
      draw(); speak(r.t);
      if (r.run) setTimeout(r.run, 900);
      if (r.auto && r.act) setTimeout(r.act.run, 900);
    };
    const chips = ["Who is Anek?", "SEO results", "Meta ads results", "Skills", "How to contact", "Open camera"];
    const draw = () => {
      el.innerHTML = bar("Assistant", `<button type="button" class="dbar__act" data-as-voice aria-label="${S.speak ? "Mute voice" : "Turn on voice"}">${ic(S.speak ? "volume-2" : "volume-x")}</button>`)
        + `<div class="dapp-body das"><div class="das__log">${log.map((m) => `<p class="dmsg__b${m.me ? " is-me" : ""}">${esc(m.t)}</p>`).join("")}${lastAct ? `<button type="button" class="das__act" data-as-act>${esc(lastAct.label)}${ic("arrow-up-right")}</button>` : ""}</div>
          <div class="das__chips">${chips.map((c) => `<button type="button" data-as-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>
        <div class="das__bar"><button type="button" class="das__mic${listening ? " is-on" : ""}" data-as-mic aria-label="${listening ? "Stop listening" : "Speak"}">${ic(listening ? "mic-off" : "mic")}</button>
          <form class="dmsg__form" data-as-form><input name="q" placeholder="${listening ? "Listening…" : "Ask or type a command"}" aria-label="Ask the assistant" autocomplete="off"><button type="submit" aria-label="Send">${ic("send-horizontal")}</button></form></div>`;
      const lg = qs(".das", el); lg.scrollTop = lg.scrollHeight;
      icons();
    };
    const listen = () => {
      if (!SR) { toast("Voice input works in Chrome and Edge. You can type instead."); return; }
      if (listening) { try { rec.stop(); } catch (e) {} return; }
      rec = new SR(); rec.lang = "en-IN"; rec.interimResults = true; rec.maxAlternatives = 1;
      let final = "";
      rec.onresult = (e) => { let t = ""; for (const r of e.results) { t += r[0].transcript; if (r.isFinal) final = t; } const i = qs("input", el); if (i) i.value = t; };
      rec.onerror = (e) => { if (e.error === "not-allowed") toast("Microphone blocked. Allow it from the address bar."); };
      rec.onend = () => { listening = false; draw(); if (final) ask(final); };
      try { rec.start(); listening = true; beep(660, 0, 60); buzz(20); draw(); } catch (e) { listening = false; }
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest("[data-as-mic]")) return listen();
      if (t.closest("[data-as-voice]")) { S.speak = !S.speak; save(); if (!S.speak && "speechSynthesis" in window) speechSynthesis.cancel(); draw(); return; }
      const c = t.closest("[data-as-chip]"); if (c) return ask(c.dataset.asChip);
      if (t.closest("[data-as-act]") && lastAct) lastAct.run();
    });
    el.addEventListener("submit", (e) => { e.preventDefault(); const v = e.target.q.value; e.target.q.value = ""; ask(v); });
    draw();
    const stop = () => { try { if (rec) rec.abort(); } catch (e) {} listening = false; if ("speechSynthesis" in window) speechSynthesis.cancel(); };
    return { hide: stop, destroy: stop };
  };

  /* =========================================================
     Device Info: what the visitor's own browser reports
     ========================================================= */
  RUN.device = (el) => {
    const ua = navigator.userAgent, uad = navigator.userAgentData;
    const gpu = (() => { try { const c = document.createElement("canvas"); const g = c.getContext("webgl") || c.getContext("experimental-webgl"); if (!g) return "Not available"; const d = g.getExtension("WEBGL_debug_renderer_info"); return String(d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)).replace(/^ANGLE \((.+)\)$/, "$1"); } catch (e) { return "Not available"; } })();
    const os = () => { if (/Android/.test(ua)) return "Android " + ((ua.match(/Android ([\d.]+)/) || [])[1] || ""); if (/iPhone|iPad|iPod/.test(ua)) return "iOS " + ((ua.match(/OS ([\d_]+)/) || ["", ""])[1].replace(/_/g, ".")); if (/Windows/.test(ua)) return "Windows"; if (/Mac OS X/.test(ua)) return "macOS"; if (/CrOS/.test(ua)) return "ChromeOS"; if (/Linux/.test(ua)) return "Linux"; return "Unknown"; };
    const browser = () => {
      if (uad && uad.brands) { const b = uad.brands.find((x) => !/Not.?A.?Brand|Chromium/i.test(x.brand)) || uad.brands[0]; if (b) return b.brand + " " + b.version; }
      const m = ua.match(/(Edg|OPR|Firefox|Chrome|Version)\/([\d.]+)/); if (!m) return "Unknown";
      return ({ Edg: "Edge", OPR: "Opera", Version: "Safari" }[m[1]] || m[1]) + " " + m[2].split(".")[0];
    };
    const st = { model: "", hz: "Measuring…", storage: "Checking…" };
    const row = (k, v) => `<div class="dset__info"><small>${k}</small><b>${esc(v)}</b></div>`;
    const draw = () => {
      const c = navigator.connection || {};
      const mobile = uad ? uad.mobile : /Mobi|Android|iPhone/.test(ua);
      el.innerHTML = bar("Device Info") + `<div class="dapp-body">
        <div class="dset__hero">${ic(mobile ? "smartphone" : "monitor")}<b>${esc(st.model || (mobile ? "Your phone" : "Your computer"))}</b><small>Read from your browser and shown only to you. Nothing is sent anywhere.</small></div>
        <h5 class="dset__h">System</h5>${row("Operating system", os())}${row("Browser", browser())}${row("CPU cores", navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " cores" : "Not shared")}${row("Memory (RAM)", navigator.deviceMemory ? "About " + navigator.deviceMemory + " GB (browsers round this)" : "Not shared by this browser")}${row("Graphics", gpu)}
        <h5 class="dset__h">Display</h5>${row("Screen", screen.width + " × " + screen.height + " at " + (window.devicePixelRatio || 1) + "x")}${row("Browser window", innerWidth + " × " + innerHeight)}${row("Refresh rate", st.hz)}${row("Touch points", navigator.maxTouchPoints ? navigator.maxTouchPoints + " (touchscreen)" : "None (mouse)")}${row("Colour depth", screen.colorDepth + "-bit")}
        <h5 class="dset__h">Network</h5>${row("Status", navigator.onLine ? "Online" : "Offline")}${c.effectiveType ? row("Connection", c.effectiveType.toUpperCase() + (c.downlink ? " · about " + c.downlink + " Mbps" : "") + (c.rtt ? " · " + c.rtt + " ms" : "")) : ""}${c.saveData ? row("Data saver", "On") : ""}
        <h5 class="dset__h">Other</h5>${row("Battery", P.battery.level + "%" + (P.battery.charging ? ", charging" : ""))}${row("Storage for websites", st.storage)}${row("Language", navigator.language || "-")}${row("Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone || "-")}${row("Theme preference", matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light")}
      </div>`;
      icons();
    };
    if (uad && uad.getHighEntropyValues) uad.getHighEntropyValues(["model", "platformVersion"]).then((h) => { if (h.model) st.model = h.model; draw(); }).catch(() => {});
    let frames = 0, t0 = 0;
    const measure = (t) => { if (!t0) t0 = t; frames++; if (t - t0 < 1000) requestAnimationFrame(measure); else { const hz = Math.round(frames * 1000 / (t - t0)); st.hz = "About " + ([60, 75, 90, 120, 144, 165, 240].reduce((a, b) => Math.abs(b - hz) < Math.abs(a - hz) ? b : a)) + " Hz"; draw(); } };
    requestAnimationFrame(measure);
    if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then((q) => { st.storage = (q.quota / 1e9).toFixed(1) + " GB available to websites"; draw(); }).catch(() => {});
    else st.storage = "Not shared";
    draw();
    return { show: draw };
  };

  /* =========================================================
     QR: share my contact, scan any QR code
     ========================================================= */
  const VCARD = "BEGIN:VCARD\nVERSION:3.0\nN:Kumar;Anek;;;\nFN:Anek Kumar\nTITLE:Full Stack Developer & Digital Marketer\nTEL;TYPE=CELL:+919518848804\nEMAIL:anekkumar9518@gmail.com\nURL:https://www.anekkumar.in\nADR;TYPE=WORK:;;;Noida;Uttar Pradesh;;India\nEND:VCARD";
  const QRGEN = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
  const JSQR = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
  RUN.qr = (el) => {
    let tab = "share", stream = null, timer = 0, found = null, detector = null;
    const draw = () => {
      const tabs = `<div class="dst__tabs"><button type="button" data-qr-tab="share" class="${tab === "share" ? "is-on" : ""}">My contact</button><button type="button" data-qr-tab="scan" class="${tab === "scan" ? "is-on" : ""}">Scan</button></div>`;
      if (tab === "share") {
        el.innerHTML = bar("QR") + tabs + `<div class="dapp-body dqr"><div class="dqr__code" id="qrBox"><span class="dspin"></span></div><b>Anek Kumar</b><small>Scan with any phone camera to save my contact</small>
          <div class="dqr__acts"><button type="button" data-qr-save>${ic("user-plus")}Save contact</button>${navigator.share ? `<button type="button" data-qr-share>${ic("share-2")}Share</button>` : ""}<button type="button" data-qr-copy>${ic("copy")}Copy number</button></div></div>`;
        loadScript(QRGEN).then(() => {
          const box = qs("#qrBox", el); if (!box) return;
          const q = window.qrcode(0, "M"); q.addData(VCARD); q.make(); box.innerHTML = q.createSvgTag(6, 0);
        }).catch(() => { const box = qs("#qrBox", el); if (box) box.textContent = "Couldn't load the QR maker. Check your internet."; });
      } else {
        el.innerHTML = bar("QR") + tabs + `<div class="dapp-body dqr dqr--scan"><div class="dqr__cam"><video playsinline muted></video><span class="dqr__frame"></span>${stream ? "" : `<button type="button" class="dqr__start" data-qr-start>${ic("scan-line")}Start scanning</button>`}</div>
          ${found ? `<div class="dqr__res"><small>Found</small><p>${esc(found)}</p><div class="dqr__acts">${/^https?:\/\//i.test(found) ? `<button type="button" data-qr-open>${ic("globe")}Open in browser</button>` : ""}<button type="button" data-qr-copyres>${ic("copy")}Copy</button><button type="button" data-qr-again>${ic("rotate-ccw")}Scan again</button></div></div>` : `<small class="dqr__hint">Point the camera at a QR code. The image never leaves your device.</small>`}</div>`;
        if (stream) { const v = qs("video", el); v.srcObject = stream; v.play().catch(() => {}); }
      }
      icons();
    };
    const stop = () => { clearInterval(timer); if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } };
    const start = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast("This browser can't use a camera here"); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); }
      catch (e) { toast("Camera blocked or not found"); return; }
      found = null; draw();
      if ("BarcodeDetector" in window) { try { const f = await window.BarcodeDetector.getSupportedFormats(); if (f.includes("qr_code")) detector = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {} }
      if (!detector) { try { await loadScript(JSQR); } catch (e) { toast("Couldn't load the scanner"); return; } }
      const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
      timer = setInterval(async () => {
        const v = qs("video", el); if (!v || v.readyState < 2) return;
        let txt = null;
        if (detector) { try { const r = await detector.detect(v); if (r[0]) txt = r[0].rawValue; } catch (e) {} }
        else if (window.jsQR) { cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0); const d = cx.getImageData(0, 0, cv.width, cv.height); const r = window.jsQR(d.data, d.width, d.height); if (r) txt = r.data; }
        if (txt) { found = txt; beep(1320, 0, 80); buzz(40); stop(); draw(); }
      }, 300);
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const tb = t.closest("[data-qr-tab]"); if (tb) { stop(); tab = tb.dataset.qrTab; found = null; draw(); return; }
      if (t.closest("[data-qr-save]")) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([VCARD], { type: "text/vcard" })); a.download = "Anek-Kumar.vcf"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("Contact file downloaded"); return; }
      if (t.closest("[data-qr-share]")) { navigator.share({ title: "Anek Kumar", text: "Anek Kumar, Full Stack Developer & Digital Marketer. +91 95188 48804", url: "https://www.anekkumar.in" }).catch(() => {}); return; }
      if (t.closest("[data-qr-copy]")) { (navigator.clipboard ? navigator.clipboard.writeText("+91 95188 48804") : Promise.reject()).then(() => toast("Number copied"), () => toast("+91 95188 48804")); return; }
      if (t.closest("[data-qr-start]") || t.closest("[data-qr-again]")) { found = null; start(); return; }
      if (t.closest("[data-qr-open]")) { openApp("browser", { url: found }); return; }
      if (t.closest("[data-qr-copyres]")) { (navigator.clipboard ? navigator.clipboard.writeText(found) : Promise.reject()).then(() => toast("Copied"), () => {}); }
    });
    draw();
    return { hide: () => { if (stream) { stop(); draw(); } }, destroy: stop };
  };

  /* =========================================================
     Speed Test: real download/upload/ping against Cloudflare
     ========================================================= */
  RUN.speed = (el) => {
    const API = "https://speed.cloudflare.com/";
    let busy = false, res = { ping: null, down: null, up: null }, phase = "", live = 0, server = "", abort = false;
    const fmt = (v) => (v == null ? "-" : v >= 100 ? Math.round(v) : v.toFixed(1));
    const draw = () => {
      const pct = Math.min(1, Math.log10(1 + live) / Math.log10(1001));
      el.innerHTML = bar("Speed Test") + `<div class="dapp-body dsp">
        <div class="dsp__gauge"><svg viewBox="0 0 200 120" aria-hidden="true"><path class="dsp__track" d="M20 110 A80 80 0 0 1 180 110"/><path class="dsp__fill" d="M20 110 A80 80 0 0 1 180 110" style="stroke-dashoffset:${(252 * (1 - pct)).toFixed(1)}"/></svg>
          <b>${busy || live ? fmt(live) : "Go"}</b><small>${busy ? phase : res.down != null ? "Done" : "Mbps"}</small></div>
        <div class="dsp__stats"><span><small>${ic("activity")}Ping</small><b>${res.ping == null ? "-" : Math.round(res.ping)}<i>ms</i></b></span><span><small>${ic("download")}Download</small><b>${fmt(res.down)}<i>Mbps</i></b></span><span><small>${ic("upload")}Upload</small><b>${fmt(res.up)}<i>Mbps</i></b></span></div>
        <button type="button" class="dsp__go" data-sp-go ${busy ? "disabled" : ""}>${busy ? "Testing…" : res.down != null ? "Test again" : "Start test"}</button>
        <p class="dsp__note">Measures your real connection against Cloudflare${server ? " (" + esc(server) + ")" : ""}. Uses about 25 MB of data.</p></div>`;
      icons();
    };
    const ms = () => performance.now();
    const run = async () => {
      if (!online()) { toast("No internet connection"); return; }
      busy = true; abort = false; res = { ping: null, down: null, up: null }; live = 0;
      try {
        phase = "Ping"; draw();
        const pings = [];
        for (let i = 0; i < 8 && !abort; i++) { const t = ms(); const r = await fetch(API + "__down?bytes=0&r=" + Math.random(), { cache: "no-store" }); if (i === 0) server = r.headers.get("cf-meta-colo") ? "server " + r.headers.get("cf-meta-colo") : ""; await r.arrayBuffer(); pings.push(ms() - t); }
        pings.sort((a, b) => a - b); res.ping = pings[Math.floor(pings.length / 2)]; draw();
        phase = "Download"; const speeds = []; const tStart = ms();
        for (const n of [1e5, 1e6, 1e7, 2.5e7]) {
          if (abort) break;
          const t = ms(); const r = await fetch(API + "__down?bytes=" + n + "&r=" + Math.random(), { cache: "no-store" });
          const rd = r.body.getReader(); let got = 0;
          for (;;) { const { done, value } = await rd.read(); if (done) break; got += value.length; const sec = (ms() - t) / 1000; if (sec > 0.05) { live = got * 8 / sec / 1e6; draw(); } }
          speeds.push(got * 8 / ((ms() - t) / 1000) / 1e6);
          if (ms() - tStart > 7000) break;
        }
        res.down = Math.max(...speeds.slice(-2)); live = res.down; draw();
        phase = "Upload"; const ups = [];
        for (const n of [1e5, 1e6, 3e6]) {
          if (abort) break;
          const body = new Blob([new Uint8Array(n)]); const t = ms();
          await fetch(API + "__up?r=" + Math.random(), { method: "POST", body, cache: "no-store" });
          const v = n * 8 / ((ms() - t) / 1000) / 1e6; ups.push(v); live = v; draw();
        }
        res.up = ups.length ? Math.max(...ups.slice(-2)) : null;
      } catch (e) { toast("The test couldn't finish. Check your connection."); }
      busy = false; live = res.down || 0; draw();
    };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-sp-go]") && !busy) run(); });
    draw();
    return { destroy: () => { abort = true; } };
  };

  /* =========================================================
     Music: three tracks made in the browser (no copyright, no
     download), plus a live YouTube radio. Lock-screen player
     and the visitor's own media keys via the Media Session API.
     ========================================================= */
  const TRACKS = [
    { id: "nights", t: "Noida Nights", s: "Lo-fi · made in this phone", c: "#6a1b9a", bpm: 78, bars: 16, key: [0, 9, 2, 7] },
    { id: "rush", t: "Lead Rush", s: "Chiptune · made in this phone", c: "#e2571f", bpm: 128, bars: 16, key: [0, 5, 7, 5] },
    { id: "rank", t: "Rank #1", s: "Ambient · made in this phone", c: "#1565c0", bpm: 64, bars: 8, key: [0, 4, 9, 5] },
  ];
  const RADIO = [{ id: "4xDzrJKXOOY", t: "synthwave radio", s: "Lofi Girl · live on YouTube", c: "#311b92" }];
  const render = async (tr) => {
    const sr = 22050, beat = 60 / tr.bpm, dur = tr.bars * 4 * beat + 1.5;
    const ac = new OfflineAudioContext(1, Math.ceil(sr * dur), sr);
    const master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = tr.id === "rush" ? 5000 : 1800; lp.connect(master);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const tone = (m, t, len, type, vol, a, dest) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = hz(m);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + (a || 0.01)); g.gain.exponentialRampToValueAtTime(0.0008, t + len);
      o.connect(g); g.connect(dest || lp); o.start(t); o.stop(t + len + 0.05);
    };
    const nb = ac.createBuffer(1, sr, sr); const nd = nb.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
    const noise = (t, len, vol, type, f) => { const s = ac.createBufferSource(); s.buffer = nb; const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + len); s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + len + 0.02); };
    const kick = (t) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32); };
    let seed = tr.id.length * 97; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const penta = [0, 2, 4, 7, 9, 12, 14, 16];
    for (let bar2 = 0; bar2 < tr.bars; bar2++) {
      const t0 = bar2 * 4 * beat, root = 48 + tr.key[bar2 % 4];
      const minor = tr.key[bar2 % 4] === 9 || tr.key[bar2 % 4] === 2;
      const chord = [0, minor ? 3 : 4, 7, minor ? 10 : 11].map((x) => root + 12 + x);
      if (tr.id === "nights") {
        chord.forEach((m) => tone(m, t0, 4 * beat, "triangle", 0.07, 0.25));
        tone(root - 12, t0, 2 * beat, "sine", 0.35, 0.02); tone(root - 12, t0 + 2.5 * beat, 1.4 * beat, "sine", 0.3, 0.02);
        for (let b = 0; b < 4; b++) { if (b % 2 === 0) kick(t0 + b * beat); else noise(t0 + b * beat, 0.18, 0.35, "bandpass", 1800); }
        for (let e = 0; e < 8; e++) noise(t0 + e * beat / 2 + (e % 2 ? beat * 0.08 : 0), 0.05, 0.12, "highpass", 7000);
        for (let e = 0; e < 8; e++) if (rnd() > 0.55) tone(root + 24 + penta[Math.floor(rnd() * penta.length)], t0 + e * beat / 2, beat * 0.9, "sine", 0.12, 0.02);
      } else if (tr.id === "rush") {
        for (let s = 0; s < 16; s++) tone(chord[s % 4] + (s % 8 > 3 ? 12 : 0), t0 + s * beat / 4, beat / 4, "square", 0.05, 0.005);
        for (let b = 0; b < 4; b++) { kick(t0 + b * beat); tone(root - 12, t0 + b * beat + beat / 2, beat / 2, "square", 0.08, 0.005); if (b % 2) noise(t0 + b * beat, 0.12, 0.3, "bandpass", 2500); }
        if (bar2 % 2 === 1) for (let e = 0; e < 4; e++) tone(root + 24 + penta[Math.floor(rnd() * 6)], t0 + e * beat, beat * 0.8, "triangle", 0.1, 0.01);
      } else {
        chord.forEach((m, i) => tone(m, t0 + i * 0.12, 4 * beat + 1, "sine", 0.06, 1.2));
        tone(root - 12, t0, 4 * beat, "sine", 0.2, 0.8);
        for (let e = 0; e < 4; e++) if (rnd() > 0.4) tone(root + 24 + penta[Math.floor(rnd() * penta.length)], t0 + e * beat + rnd() * 0.3, beat * 2, "triangle", 0.05, 0.05);
      }
    }
    const buf = await ac.startRendering();
    // encode 16-bit mono WAV
    const d = buf.getChannelData(0), n = d.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
    const gain = peak > 0 ? 0.9 / peak : 1;
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i] * gain)) * 0x7fff, true);
    return URL.createObjectURL(new Blob([ab], { type: "audio/wav" }));
  };
  RUN.music = (el) => {
    const audio = new Audio(); audio.preload = "auto";
    const urls = {};
    let idx = 0, radio = null, loading = false, raf = 0;
    const cur = () => (radio ? radio : TRACKS[idx]);
    const ytCmd = (f) => { const fr = qs(".dmu__yt iframe", el); if (fr && fr.contentWindow) fr.contentWindow.postMessage(JSON.stringify({ event: "command", func: f, args: [] }), "*"); };
    let ytPlaying = false;
    const playing = () => (radio ? ytPlaying : !audio.paused);
    const sync = () => {
      const c = cur();
      setMedia({ title: c.t, sub: c.s, icon: radio ? "radio" : "music", color: c.c, playing: playing(), toggle, next: radio ? null : next, prev: radio ? null : prev });
      if ("mediaSession" in navigator && !radio) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({ title: c.t, artist: "AK Phone", album: "Anek Kumar portfolio", artwork: [{ src: "assets/img/og-image.png", sizes: "1200x630", type: "image/png" }] });
          navigator.mediaSession.setActionHandler("play", toggle); navigator.mediaSession.setActionHandler("pause", toggle);
          navigator.mediaSession.setActionHandler("nexttrack", next); navigator.mediaSession.setActionHandler("previoustrack", prev);
        } catch (e) {}
      }
      draw();
    };
    const playTrack = async (i) => {
      radio = null; idx = (i + TRACKS.length) % TRACKS.length; ytPlaying = false;
      const tr = TRACKS[idx];
      if (!urls[tr.id]) { loading = true; draw(); try { urls[tr.id] = await render(tr); } catch (e) { loading = false; toast("This browser can't make the music"); draw(); return; } loading = false; }
      audio.src = urls[tr.id]; audio.play().then(sync).catch(sync);
    };
    const toggle = () => {
      if (radio) { ytPlaying = !ytPlaying; ytCmd(ytPlaying ? "playVideo" : "pauseVideo"); sync(); return; }
      if (!audio.src) return playTrack(idx);
      if (audio.paused) audio.play().then(sync); else { audio.pause(); sync(); }
    };
    const next = () => playTrack(idx + 1), prev = () => playTrack(idx - 1);
    audio.addEventListener("ended", next);
    el.innerHTML = bar("Music") + `<div class="dapp-body dmu">
        <div class="dmu__now"><span class="dmu__art" data-art></span><b data-title></b><small data-sub></small>
          <div class="dmu__yt" data-yt hidden></div><div class="dmu__bar" data-bar><i></i></div>
          <div class="dmu__ctl" data-ctl></div></div>
        <h5 class="dset__h">Made in this phone</h5><ul class="dmu__list">${TRACKS.map((t, i) => `<li><button type="button" data-mu-track="${i}"><span style="--c:${t.c}">${ic("music")}</span><span class="dset__tx"><b>${esc(t.t)}</b><small>${esc(t.s)}</small></span></button></li>`).join("")}</ul>
        <h5 class="dset__h">Live radio</h5><ul class="dmu__list">${RADIO.map((r, i) => `<li><button type="button" data-mu-radio="${i}"><span style="--c:${r.c}">${ic("radio")}</span><span class="dset__tx"><b>${esc(r.t)}</b><small>${esc(r.s)}</small></span></button></li>`).join("")}</ul>
        <p class="dwx__src">Tracks are composed by code in your browser. Music keeps playing when you leave the app; control it from the lock screen or quick settings.</p></div>`;
    let ytFor = null;
    const draw = () => {
      const c = cur(), p = playing();
      const art = qs("[data-art]", el); art.style.setProperty("--c", c.c); art.classList.toggle("is-playing", p); art.innerHTML = ic(radio ? "radio" : "music");
      qs("[data-title]", el).textContent = c.t; qs("[data-sub]", el).textContent = c.s;
      const yt = qs("[data-yt]", el);
      if (radio && ytFor !== radio.id) { ytFor = radio.id; yt.innerHTML = `<iframe title="YouTube radio" src="https://www.youtube.com/embed/${radio.id}?autoplay=1&enablejsapi=1&playsinline=1&origin=${encodeURIComponent(location.origin)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; }
      if (!radio && ytFor) { ytFor = null; yt.innerHTML = ""; }
      yt.hidden = !radio; qs("[data-bar]", el).hidden = !!radio;
      qs("[data-ctl]", el).innerHTML = `${radio ? "" : `<button type="button" data-mu="prev" aria-label="Previous">${ic("skip-back")}</button>`}<button type="button" class="dmu__play" data-mu="toggle" aria-label="${p ? "Pause" : "Play"}">${loading ? `<span class="dspin"></span>` : ic(p ? "pause" : "play")}</button>${radio ? "" : `<button type="button" data-mu="next" aria-label="Next">${ic("skip-forward")}</button>`}`;
      el.querySelectorAll("[data-mu-track]").forEach((b) => b.classList.toggle("is-on", !radio && +b.dataset.muTrack === idx && !!audio.src));
      el.querySelectorAll("[data-mu-radio]").forEach((b) => b.classList.toggle("is-on", radio === RADIO[+b.dataset.muRadio]));
      icons();
    };
    const tick = () => { if (!radio && !audio.paused && P.current() === "music") { const b = qs("[data-bar] i", el); if (b && audio.duration) b.style.width = (audio.currentTime / audio.duration * 100).toFixed(1) + "%"; } raf = requestAnimationFrame(tick); };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const m = t.closest("[data-mu]"); if (m) { ({ toggle, next, prev })[m.dataset.mu](); return; }
      const tr = t.closest("[data-mu-track]"); if (tr) { playTrack(+tr.dataset.muTrack); return; }
      const rd = t.closest("[data-mu-radio]");
      if (rd) { if (!online()) { toast("No internet connection"); return; } audio.pause(); radio = RADIO[+rd.dataset.muRadio]; ytPlaying = true; sync(); }
    });
    draw(); tick();
    return { show: draw, destroy: () => { cancelAnimationFrame(raf); audio.pause(); audio.src = ""; Object.values(urls).forEach((u) => URL.revokeObjectURL(u)); setMedia(null); } };
  };

  /* =========================================================
     Videos: play any YouTube link inside the phone
     ========================================================= */
  RUN.videos = (el) => {
    let vid = null, title = "", author = "";
    const PRESETS = [{ id: "4xDzrJKXOOY", t: "synthwave radio", a: "Lofi Girl · live" }];
    const parseId = (s) => { s = (s || "").trim(); const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/) || s.match(/^([A-Za-z0-9_-]{11})$/); return m ? m[1] : null; };
    const draw = () => {
      el.innerHTML = bar("Videos") + `<div class="dapp-body dvid">
        ${vid ? `<div class="dvid__player"><iframe title="${esc(title || "YouTube video")}" src="https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><b class="dvid__t">${esc(title || "Loading…")}</b><small class="dvid__a">${esc(author)}</small>` : `<div class="dvid__empty">${ic("clapperboard")}<span>Paste a YouTube link to watch it here</span></div>`}
        <form class="dmap__bar dvid__form" data-v-form>${ic("link")}<input name="u" placeholder="Paste a YouTube link" aria-label="YouTube link" autocomplete="off"><button type="submit" aria-label="Play">${ic("play")}</button></form>
        <h5 class="dset__h">Try</h5><ul class="dmu__list">${PRESETS.map((p) => `<li><button type="button" data-v="${p.id}"><span style="--c:#c62828">${ic("play")}</span><span class="dset__tx"><b>${esc(p.t)}</b><small>${esc(p.a)}</small></span></button></li>`).join("")}</ul></div>`;
      icons();
    };
    const play = (id) => {
      if (!online()) { toast("No internet connection"); return; }
      vid = id; title = ""; author = ""; draw();
      fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id)).then((r) => r.json()).then((j) => { if (vid === id) { title = j.title || ""; author = j.author_name || ""; const t = qs(".dvid__t", el), a = qs(".dvid__a", el); if (t) t.textContent = title; if (a) a.textContent = author; } }).catch(() => {});
    };
    el.addEventListener("submit", (e) => { e.preventDefault(); const id = parseId(e.target.u.value); if (id) play(id); else toast("That doesn't look like a YouTube link"); });
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) play(b.dataset.v); });
    draw();
    return { hide: () => { if (vid) { vid = null; draw(); } }, back: () => { if (vid) { vid = null; draw(); return true; } return false; } };
  };

  /* =========================================================
     GAMES
     ========================================================= */
  const loop = (fn) => { let id = 0, last = 0, on = false; const f = (t) => { if (!on) return; const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; fn(dt); id = requestAnimationFrame(f); }; return { start() { if (on) return; on = true; last = 0; id = requestAnimationFrame(f); }, stop() { on = false; cancelAnimationFrame(id); }, get on() { return on; } }; };
  const scoreBar = (items) => `<div class="dg__score">${items.map((x) => `<span><small>${x[0]}</small><b data-s="${x[1]}">${x[2]}</b></span>`).join("")}</div>`;

  /* ---------- Flappy ---------- */
  RUN.flappy = (el) => {
    const W = 320, H = 420;
    el.innerHTML = bar("Flappy") + `<div class="dapp-body dg">${scoreBar([["Score", "s", 0], ["Best", "b", best("flappy")]])}<div class="dgame" style="width:${W}px;height:${H}px"><canvas width="${W}" height="${H}"></canvas><button type="button" class="dsnake__start" data-go>Tap to start</button></div><p class="dg__hint">Tap the board, or press Space.</p></div>`;
    const cv = qs("canvas", el), x = cv.getContext("2d"), go = qs("[data-go]", el);
    let b, pipes, sc, dead = true, t = 0;
    const reset = () => { b = { y: H / 2, v: 0 }; pipes = []; sc = 0; t = 0; qs('[data-s="s"]', el).textContent = 0; };
    const flap = () => { if (dead) { reset(); dead = false; go.hidden = true; L.start(); } b.v = -260; beep(700, 0, 40); };
    const paint = () => {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#5ec8f2"); g.addColorStop(1, "#c8f0ff"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = "#3f9b3a"; pipes.forEach((p) => { x.fillRect(p.x, 0, 46, p.gap - 70); x.fillRect(p.x, p.gap + 70, 46, H); });
      x.fillStyle = "#d8b25b"; x.fillRect(0, H - 18, W, 18);
      x.save(); x.translate(80, b.y); x.rotate(Math.max(-0.5, Math.min(0.9, b.v / 500))); x.fillStyle = "#f9a825"; x.beginPath(); x.arc(0, 0, 13, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(5, -4, 4, 0, 7); x.fill(); x.fillStyle = "#222"; x.beginPath(); x.arc(6, -4, 2, 0, 7); x.fill(); x.fillStyle = "#ef6c00"; x.fillRect(10, 0, 9, 5); x.restore();
    };
    const L = loop((dt) => {
      t += dt; b.v += 900 * dt; b.y += b.v * dt;
      if (t > 1.5) { t = 0; pipes.push({ x: W, gap: 110 + Math.random() * (H - 240), passed: false }); }
      pipes.forEach((p) => { p.x -= 140 * dt; if (!p.passed && p.x + 46 < 80) { p.passed = true; sc++; qs('[data-s="s"]', el).textContent = sc; beep(990, 0, 30); } });
      pipes = pipes.filter((p) => p.x > -60);
      const hit = b.y > H - 30 || b.y < 0 || pipes.some((p) => p.x < 93 && p.x + 46 > 67 && (b.y - 12 < p.gap - 70 || b.y + 12 > p.gap + 70));
      paint();
      if (hit) { dead = true; L.stop(); buzz(80); beep(200, 0, 200); qs('[data-s="b"]', el).textContent = best("flappy", sc); go.textContent = "Score " + sc + " · Play again"; go.hidden = false; }
    });
    reset(); paint();
    qs(".dgame", el).addEventListener("pointerdown", (e) => { e.preventDefault(); flap(); });
    return { key: (k) => { if (k === " " || k === "ArrowUp") { flap(); return true; } }, hide: () => { if (!dead) { L.stop(); dead = true; go.textContent = "Tap to start"; go.hidden = false; } }, destroy: () => L.stop() };
  };

  /* ---------- Memory ---------- */
  RUN.memory = (el) => {
    const ICONS = ["search", "megaphone", "globe", "code-xml", "chart-line", "smartphone", "rocket", "trophy"];
    let cards, open, moves, matched, t0, lock;
    const reset = () => { cards = ICONS.concat(ICONS).map((i) => ({ i, up: false, ok: false })).sort(() => Math.random() - 0.5); open = []; moves = 0; matched = 0; t0 = 0; lock = false; draw(); };
    const draw = () => {
      el.innerHTML = bar("Memory", `<button type="button" class="dbar__act" data-new aria-label="New game">${ic("rotate-ccw")}</button>`) + `<div class="dapp-body dg">${scoreBar([["Moves", "m", moves], ["Pairs", "p", matched + "/8"], ["Best", "b", best("memory") ? best("memory") + " moves" : "-"]])}
        <div class="dmem">${cards.map((c, k) => `<button type="button" data-c="${k}" class="${c.up || c.ok ? "is-up" : ""}${c.ok ? " is-ok" : ""}" aria-label="Card ${k + 1}"><span>${c.up || c.ok ? ic(c.i) : ""}</span></button>`).join("")}</div>
        <p class="dg__hint">${matched === 8 ? "All pairs found in " + moves + " moves and " + Math.round((Date.now() - t0) / 1000) + " s!" : "Find the matching pairs."}</p></div>`;
      icons();
    };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-new]")) return reset();
      const b = e.target.closest("[data-c]"); if (!b || lock) return;
      const c = cards[+b.dataset.c]; if (c.up || c.ok) return;
      if (!t0) t0 = Date.now();
      c.up = true; open.push(c); beep(520, 0, 30); draw();
      if (open.length === 2) {
        moves++; lock = true;
        setTimeout(() => {
          if (open[0].i === open[1].i) { open.forEach((o) => { o.ok = true; }); matched++; beep(880, 1320, 80); buzz(20); if (matched === 8) { const prev = best("memory"); if (!prev || moves < prev) { S.best.memory = moves; save(); } } }
          else open.forEach((o) => { o.up = false; });
          open = []; lock = false; draw();
        }, 650);
      }
    });
    reset();
    return {};
  };

  /* ---------- Minesweeper ---------- */
  RUN.mines = (el) => {
    const N = 9, M = 10;
    let g, first, over, flags, flagMode, t0, tick = 0;
    const nb = (i) => { const r = Math.floor(i / N), c = i % N, out = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if ((dr || dc) && rr >= 0 && cc >= 0 && rr < N && cc < N) out.push(rr * N + cc); } return out; };
    const reset = () => { g = Array.from({ length: N * N }, () => ({ m: false, o: false, f: false, n: 0 })); first = true; over = ""; flags = 0; flagMode = false; t0 = 0; clearInterval(tick); draw(); };
    const plant = (safe) => { const ban = new Set([safe, ...nb(safe)]); let k = 0; while (k < M) { const i = Math.floor(Math.random() * N * N); if (!g[i].m && !ban.has(i)) { g[i].m = true; k++; } } g.forEach((c, i) => { c.n = nb(i).filter((j) => g[j].m).length; }); };
    const reveal = (i) => { const st = [i]; while (st.length) { const j = st.pop(), c = g[j]; if (c.o || c.f) continue; c.o = true; if (!c.n && !c.m) nb(j).forEach((k) => st.push(k)); } };
    const draw = () => {
      const secs = t0 ? Math.round(((over ? t0.end : Date.now()) - t0.s) / 1000) : 0;
      el.innerHTML = bar("Minesweeper", `<button type="button" class="dbar__act" data-new aria-label="New game">${ic("rotate-ccw")}</button>`) + `<div class="dapp-body dg">${scoreBar([["Mines", "m", M - flags], ["Time", "t", secs + "s"], ["Best", "b", best("minesFast") ? best("minesFast") + "s" : "-"]])}
        <div class="dmine">${g.map((c, i) => `<button type="button" data-i="${i}" class="${c.o ? "is-o" : ""}${c.o && c.m ? " is-boom" : ""}${c.o && c.n ? " n" + c.n : ""}" aria-label="Square ${i + 1}">${c.f && !c.o ? ic("flag") : c.o ? (c.m ? ic("bomb") : c.n || "") : over && c.m ? ic("bomb") : ""}</button>`).join("")}</div>
        <div class="dmine__bar"><button type="button" data-flag class="${flagMode ? "is-on" : ""}">${ic("flag")}${flagMode ? "Flag mode on" : "Flag mode"}</button></div>
        <p class="dg__hint">${over === "win" ? "Cleared! " + secs + " seconds." : over === "lose" ? "Boom. Tap ↻ to try again." : "Tap to open. Use flag mode (or right-click) to mark mines."}</p></div>`;
      icons();
    };
    const act = (i, flag) => {
      if (over) return;
      const c = g[i];
      if (flag) { if (!c.o) { c.f = !c.f; flags += c.f ? 1 : -1; buzz(10); } draw(); return; }
      if (c.f || c.o) return;
      if (first) { plant(i); first = false; t0 = { s: Date.now() }; tick = setInterval(() => { if (P.current() === "mines" && !over) { const t = el.querySelector('[data-s="t"]'); if (t) t.textContent = Math.round((Date.now() - t0.s) / 1000) + "s"; } }, 1000); }
      if (c.m) { c.o = true; over = "lose"; t0.end = Date.now(); clearInterval(tick); buzz([60, 40, 120]); beep(150, 0, 300); draw(); return; }
      reveal(i); beep(600, 0, 20);
      if (g.filter((x) => !x.o).length === M) { over = "win"; t0.end = Date.now(); clearInterval(tick); const s = Math.round((t0.end - t0.s) / 1000); const prev = best("minesFast"); if (!prev || s < prev) { S.best.minesFast = s; save(); } beep(880, 1320, 150); }
      draw();
    };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-new]")) return reset();
      if (e.target.closest("[data-flag]")) { flagMode = !flagMode; draw(); return; }
      const b = e.target.closest("[data-i]"); if (b) act(+b.dataset.i, flagMode);
    });
    el.addEventListener("contextmenu", (e) => { const b = e.target.closest("[data-i]"); if (b) { e.preventDefault(); act(+b.dataset.i, true); } });
    reset();
    return { destroy: () => clearInterval(tick) };
  };

  /* ---------- Bricks ---------- */
  RUN.bricks = (el) => {
    const W = 320, H = 420, COLS = ["#ff7a45", "#ffb74d", "#4be37a", "#5b9cf5", "#b388ff"];
    el.innerHTML = bar("Bricks") + `<div class="dapp-body dg">${scoreBar([["Score", "s", 0], ["Lives", "l", 3], ["Best", "b", best("bricks")]])}<div class="dgame" style="width:${W}px;height:${H}px"><canvas width="${W}" height="${H}"></canvas><button type="button" class="dsnake__start" data-go>Start</button></div><p class="dg__hint">Drag on the board or use the arrow keys.</p></div>`;
    const cv = qs("canvas", el), x = cv.getContext("2d"), go = qs("[data-go]", el);
    let pad, ball, bricks, sc, lives, keys = {};
    const reset = () => { pad = { x: W / 2 - 35 }; ball = { x: W / 2, y: H - 60, vx: 140, vy: -260 }; bricks = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) bricks.push({ x: 8 + c * 44, y: 40 + r * 22, a: true, c: COLS[r] }); sc = 0; lives = 3; upd(); };
    const upd = () => { qs('[data-s="s"]', el).textContent = sc; qs('[data-s="l"]', el).textContent = lives; };
    const paint = () => {
      x.fillStyle = "#151a24"; x.fillRect(0, 0, W, H);
      bricks.forEach((b) => { if (b.a) { x.fillStyle = b.c; x.fillRect(b.x, b.y, 40, 16); } });
      x.fillStyle = "#f1f0ec"; x.fillRect(pad.x, H - 24, 70, 10);
      x.fillStyle = "#fff"; x.beginPath(); x.arc(ball.x, ball.y, 6, 0, 7); x.fill();
    };
    const end = (msg) => { L.stop(); qs('[data-s="b"]', el).textContent = best("bricks", sc); go.textContent = msg; go.hidden = false; };
    const L = loop((dt) => {
      if (keys.l) pad.x -= 320 * dt; if (keys.r) pad.x += 320 * dt; pad.x = Math.max(0, Math.min(W - 70, pad.x));
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < 6 || ball.x > W - 6) { ball.vx *= -1; ball.x = Math.max(6, Math.min(W - 6, ball.x)); }
      if (ball.y < 6) { ball.vy = Math.abs(ball.vy); }
      if (ball.y > H - 30 && ball.y < H - 14 && ball.x > pad.x - 4 && ball.x < pad.x + 74 && ball.vy > 0) { ball.vy = -Math.abs(ball.vy) * 1.02; ball.vx = ((ball.x - (pad.x + 35)) / 35) * 220; beep(500, 0, 25); }
      for (const b of bricks) if (b.a && ball.x > b.x - 5 && ball.x < b.x + 45 && ball.y > b.y - 5 && ball.y < b.y + 21) { b.a = false; ball.vy *= -1; sc += 10; upd(); beep(880, 0, 25); buzz(8); break; }
      if (ball.y > H + 10) { lives--; upd(); buzz(60); if (lives <= 0) return end("Score " + sc + " · Play again"); ball = { x: pad.x + 35, y: H - 60, vx: 140, vy: -260 }; }
      if (!bricks.some((b) => b.a)) return end("You cleared it! Play again");
      paint();
    });
    const board = qs(".dgame", el);
    board.addEventListener("pointermove", (e) => { const r = board.getBoundingClientRect(); pad.x = ((e.clientX - r.left) / r.width) * W - 35; });
    let paused = false;
    go.addEventListener("click", () => { if (!paused) reset(); paused = false; go.hidden = true; L.start(); });
    reset(); paint();
    return { key: (k) => { if (k === "ArrowLeft" || k === "a") { keys.l = true; setTimeout(() => { keys.l = false; }, 120); return true; } if (k === "ArrowRight" || k === "d") { keys.r = true; setTimeout(() => { keys.r = false; }, 120); return true; } }, hide: () => { if (L.on) { L.stop(); paused = true; go.textContent = "Resume"; go.hidden = false; } }, destroy: () => L.stop() };
  };

  /* ---------- Sudoku ---------- */
  RUN.sudoku = (el) => {
    let sol, puz, cur, sel = -1, done = false;
    const ok = (g, i, v) => { const r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3; for (let k = 0; k < 9; k++) { if (g[r * 9 + k] === v || g[k * 9 + c] === v || g[(br + Math.floor(k / 3)) * 9 + bc + k % 3] === v) return false; } return true; };
    const fill = (g) => { const i = g.indexOf(0); if (i < 0) return true; const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5); for (const v of nums) if (ok(g, i, v)) { g[i] = v; if (fill(g)) return true; g[i] = 0; } return false; };
    const newGame = () => { sol = Array(81).fill(0); fill(sol); puz = sol.slice(); let holes = 0; while (holes < 42) { const i = Math.floor(Math.random() * 81); if (puz[i]) { puz[i] = 0; holes++; } } cur = puz.slice(); sel = -1; done = false; draw(); };
    const bad = (i) => { const v = cur[i]; if (!v) return false; const g = cur.slice(); g[i] = 0; return !ok(g, i, v); };
    const draw = () => {
      el.innerHTML = bar("Sudoku", `<button type="button" class="dbar__act" data-new aria-label="New puzzle">${ic("rotate-ccw")}</button>`) + `<div class="dapp-body dg">
        <div class="dsud">${cur.map((v, i) => { const r = Math.floor(i / 9), c = i % 9; const same = sel >= 0 && (Math.floor(sel / 9) === r || sel % 9 === c); return `<button type="button" data-i="${i}" class="${puz[i] ? "is-given" : ""}${i === sel ? " is-sel" : same ? " is-line" : ""}${bad(i) ? " is-bad" : ""}${c % 3 === 2 && c < 8 ? " br" : ""}${r % 3 === 2 && r < 8 ? " bb" : ""}">${v || ""}</button>`; }).join("")}</div>
        <div class="dsud__pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-n="${n}">${n}</button>`).join("")}<button type="button" data-n="0" aria-label="Erase">${ic("eraser")}</button></div>
        <p class="dg__hint">${done ? "Solved! Nice work." : "Pick a square, then a number."}</p></div>`;
      icons();
    };
    const put = (n) => {
      if (sel < 0 || puz[sel] || done) return;
      cur[sel] = n; beep(n ? 600 : 300, 0, 25);
      if (!cur.includes(0) && cur.every((v, i) => !bad(i))) { done = true; beep(880, 1320, 200); buzz([30, 50, 30]); }
      draw();
    };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-new]")) return newGame();
      const c = e.target.closest("[data-i]"); if (c) { sel = +c.dataset.i; draw(); return; }
      const n = e.target.closest("[data-n]"); if (n) put(+n.dataset.n);
    });
    newGame();
    return { key: (k) => { if (/^[0-9]$/.test(k)) { put(+k); return true; } if (k === "Backspace") { put(0); return true; } const d = keyDirs[k]; if (d && sel >= 0) { sel = (sel + { up: -9, down: 9, left: -1, right: 1 }[d] + 81) % 81; draw(); return true; } } };
  };

  /* ---------- Lead Catcher ---------- */
  RUN.catcher = (el) => {
    const W = 320, H = 420;
    el.innerHTML = bar("Lead Catcher") + `<div class="dapp-body dg">${scoreBar([["Leads", "s", 0], ["Lives", "l", 3], ["Best", "b", best("catcher")]])}<div class="dgame" style="width:${W}px;height:${H}px"><canvas width="${W}" height="${H}"></canvas><button type="button" class="dsnake__start" data-go>Start</button></div><p class="dg__hint" data-worth>Green = lead, gold #1 = 5 leads, red = spam.</p></div>`;
    const cv = qs("canvas", el), x = cv.getContext("2d"), go = qs("[data-go]", el);
    let bx, items, sc, lives, t, speed, keys = {};
    const reset = () => { bx = W / 2 - 34; items = []; sc = 0; lives = 3; t = 0; speed = 110; qs('[data-s="s"]', el).textContent = 0; qs('[data-s="l"]', el).textContent = 3; };
    const paint = () => {
      x.fillStyle = "#14110f"; x.fillRect(0, 0, W, H);
      items.forEach((it) => {
        if (it.k === "lead") { x.fillStyle = "#4be37a"; x.beginPath(); x.arc(it.x, it.y, 9, 0, 7); x.fill(); }
        else if (it.k === "gold") { x.fillStyle = "#ffc94a"; x.fillRect(it.x - 13, it.y - 11, 26, 22); x.fillStyle = "#3d2a00"; x.font = "bold 12px sans-serif"; x.textAlign = "center"; x.fillText("#1", it.x, it.y + 4); }
        else { x.fillStyle = "#ff5a4f"; x.beginPath(); x.moveTo(it.x, it.y - 11); x.lineTo(it.x + 11, it.y + 9); x.lineTo(it.x - 11, it.y + 9); x.fill(); }
      });
      x.fillStyle = "#e2571f"; x.fillRect(bx, H - 26, 68, 14); x.fillStyle = "#ff8a5c"; x.fillRect(bx, H - 30, 68, 4);
    };
    const L = loop((dt) => {
      if (keys.l) bx -= 330 * dt; if (keys.r) bx += 330 * dt; bx = Math.max(0, Math.min(W - 68, bx));
      t += dt; speed += dt * 4;
      if (t > Math.max(0.35, 0.9 - speed / 600)) { t = 0; const r = Math.random(); items.push({ x: 16 + Math.random() * (W - 32), y: -12, k: r < 0.12 ? "gold" : r < 0.35 ? "spam" : "lead" }); }
      items.forEach((it) => { it.y += speed * dt; });
      items = items.filter((it) => {
        if (it.y > H - 34 && it.y < H - 10 && it.x > bx - 8 && it.x < bx + 76) {
          if (it.k === "spam") { lives--; buzz(60); beep(200, 0, 120); qs('[data-s="l"]', el).textContent = lives; }
          else { sc += it.k === "gold" ? 5 : 1; beep(it.k === "gold" ? 1320 : 880, 0, 30); qs('[data-s="s"]', el).textContent = sc; }
          return false;
        }
        if (it.y > H + 12) { if (it.k !== "spam") { /* missed lead: no penalty */ } return false; }
        return true;
      });
      paint();
      if (lives <= 0) { L.stop(); qs('[data-s="b"]', el).textContent = best("catcher", sc); qs("[data-worth]", el).textContent = sc + " leads, worth ₹" + (sc * 288).toLocaleString("en-IN") + " at my ₹288 cost per lead."; go.textContent = "Play again"; go.hidden = false; }
    });
    const board = qs(".dgame", el);
    board.addEventListener("pointermove", (e) => { const r = board.getBoundingClientRect(); bx = ((e.clientX - r.left) / r.width) * W - 34; });
    let paused = false;
    go.addEventListener("click", () => { if (!paused) reset(); paused = false; go.hidden = true; L.start(); });
    reset(); paint();
    return { key: (k) => { if (k === "ArrowLeft" || k === "a") { keys.l = true; setTimeout(() => { keys.l = false; }, 120); return true; } if (k === "ArrowRight" || k === "d") { keys.r = true; setTimeout(() => { keys.r = false; }, 120); return true; } }, hide: () => { if (L.on) { L.stop(); paused = true; go.textContent = "Resume"; go.hidden = false; } }, destroy: () => L.stop() };
  };

  P.drawHome();
})();
