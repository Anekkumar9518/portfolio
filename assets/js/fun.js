/* =========================================================
   Fun layer: things to play with on the page
   1. 1,149 leads drawn as 1,149 dots (Meta Ads section)
   2. Chart wipe + scrambled section labels
   3. Leads-for-budget calculator
   4. Ctrl/Cmd + K command menu
   5. Terminal mode (press ` or open it from the menu)
   6. Achievements + confetti
   7. Konami code: retro 8-bit mode
   8. Magnetic buttons, Noida "right now" line
   9. Install as an app (PWA)
   ========================================================= */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem("ak-fun-" + k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ak-fun-" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const WA = "https://wa.me/919518848804";

  /* ---------- confetti ---------- */
  let cfx = null;
  const confetti = (n, x, y) => {
    if (reduce) return;
    if (!cfx) {
      const c = document.createElement("canvas"); c.className = "fx-confetti"; c.setAttribute("aria-hidden", "true"); document.body.appendChild(c);
      cfx = { c, x: c.getContext("2d"), parts: [], raf: 0 };
    }
    const c = cfx.c; c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    const cols = ["#e2571f", "#ff8a5c", "#2e9e57", "#4285f4", "#fbbc05", "#f1f0ec"];
    const ox = x == null ? innerWidth / 2 : x, oy = y == null ? innerHeight / 3 : y;
    for (let i = 0; i < (n || 120); i++) {
      const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
      cfx.parts.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: 3 + Math.random() * 4, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 1 });
    }
    if (cfx.raf) return;
    const step = () => {
      const g = cfx.x, d = devicePixelRatio;
      g.clearRect(0, 0, c.width, c.height);
      cfx.parts.forEach((p) => { p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
        g.save(); g.globalAlpha = Math.max(0, p.life); g.translate(p.x * d, p.y * d); g.rotate(p.rot); g.fillStyle = p.c; g.fillRect(-p.r * d, -p.r * d / 2, p.r * 2 * d, p.r * d); g.restore(); });
      cfx.parts = cfx.parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
      if (cfx.parts.length) cfx.raf = requestAnimationFrame(step); else { cfx.raf = 0; g.clearRect(0, 0, c.width, c.height); }
    };
    cfx.raf = requestAnimationFrame(step);
  };

  /* ---------- toast ---------- */
  const toast = (html, ms) => {
    let box = $(".fx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "fx-toasts"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "fx-toast"; t.innerHTML = html; box.appendChild(t); icons();
    setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 400); }, ms || 3800);
  };

  /* =========================================================
     6. Achievements
     ========================================================= */
  const ACH = [
    { id: "unlock", n: "First unlock", d: "Unlocked the phone", i: "smartphone" },
    { id: "explorer", n: "Explorer", d: "Saw every section of the site", i: "compass" },
    { id: "gamer", n: "Gamer", d: "Played a game on the phone", i: "gamepad-2" },
    { id: "calc", n: "Planner", d: "Used the leads calculator", i: "calculator" },
    { id: "cmdk", n: "Power user", d: "Opened the command menu", i: "command" },
    { id: "hacker", n: "Hacker", d: "Opened the terminal", i: "terminal" },
    { id: "retro", n: "Retro", d: "Found the Konami code", i: "joystick" },
    { id: "cv", n: "Recruiter", d: "Downloaded the CV", i: "file-down" },
    { id: "talk", n: "Let's talk", d: "Opened WhatsApp to message Anek", i: "message-circle" },
    { id: "owl", n: "Night owl", d: "Visited between midnight and 5 AM", i: "moon" },
  ];
  let got = store.get("ach", []);
  const award = (id) => {
    if (got.includes(id)) return;
    const a = ACH.find((x) => x.id === id); if (!a) return;
    got.push(id); store.set("ach", got);
    toast(`<span class="fx-toast__ic"><i data-lucide="${a.i}"></i></span><span><small>Achievement unlocked · ${got.length}/${ACH.length}</small><b>${esc(a.n)}</b><em>${esc(a.d)}</em></span>`);
    confetti(70, innerWidth - 160, 90);
    if (got.length === ACH.length) setTimeout(() => { toast(`<span class="fx-toast__ic"><i data-lucide="trophy"></i></span><span><small>All ${ACH.length} found</small><b>Completionist</b><em>You've seen everything. Time to talk?</em></span>`, 6000); confetti(200); }, 1200);
  };
  if (new Date().getHours() < 5) setTimeout(() => award("owl"), 4000);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    const h = a.getAttribute("href") || "";
    if (/\.pdf$/i.test(h)) { award("cv"); confetti(90, e.clientX, e.clientY); }
    else if (/wa\.me/.test(h)) award("talk");
  }, true);
  // explorer
  const SECTIONS = ["about", "work", "results", "rankings", "ads", "resume", "contact"];
  const seen = new Set(store.get("seen", []));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      seen.add(en.target.id); store.set("seen", Array.from(seen)); io.unobserve(en.target);
      if (SECTIONS.every((s) => seen.has(s))) award("explorer");
    }), { threshold: 0.15 });
    SECTIONS.forEach((s) => { const el = document.getElementById(s); if (el && !seen.has(s)) io.observe(el); });
  }
  // phone: unlock + games
  const scr = document.getElementById("dScreen");
  if (scr && "MutationObserver" in window) {
    const GAMES = ["g2048", "ttt", "snake", "flappy", "memory", "mines", "bricks", "sudoku", "catcher"];
    new MutationObserver(() => {
      const st = scr.dataset.state;
      if (st === "home" || st === "app") award("unlock");
      if (st === "app") { const w = $$("#dWin .dapp-win", scr).find((x) => !x.hidden); if (w && GAMES.includes(w.dataset.app)) award("gamer"); }
    }).observe(scr, { attributes: true, subtree: true, attributeFilter: ["data-state", "hidden"] });
  }

  /* =========================================================
     1. 1,149 leads = 1,149 dots
     ========================================================= */
  const dotsBox = document.getElementById("leadDots");
  if (dotsBox) {
    const cv = $("canvas", dotsBox), g = cv.getContext("2d");
    const N = 1149;
    let parts = [], W = 0, H = 0, t0 = 0, raf = 0, visible = false, mx = -999, my = -999;
    const layout = () => {
      W = dotsBox.clientWidth; H = Math.round(Math.min(260, Math.max(150, W * 0.24)));
      const d = devicePixelRatio || 1; cv.width = W * d; cv.height = H * d; cv.style.height = H + "px"; g.setTransform(d, 0, 0, d, 0, 0);
      // sample the text "1,149" on an offscreen canvas
      const o = document.createElement("canvas"); o.width = W; o.height = H; const ox = o.getContext("2d");
      ox.fillStyle = "#000"; ox.textAlign = "center"; ox.textBaseline = "middle";
      let fs = H * 1.05; ox.font = `800 ${fs}px "Bricolage Grotesque", sans-serif`;
      while (ox.measureText("1,149").width > W * 0.92) { fs -= 4; ox.font = `800 ${fs}px "Bricolage Grotesque", sans-serif`; }
      ox.fillText("1,149", W / 2, H / 2 + fs * 0.04);
      const img = ox.getImageData(0, 0, W, H).data, pts = [];
      for (let step = 3; step < 12; step += 0.5) {
        pts.length = 0;
        for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (img[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) pts.push([x, y]);
        if (pts.length <= N * 1.6) break;
      }
      // keep exactly N points, spread evenly
      const pick = []; for (let i = 0; i < N; i++) pick.push(pts[Math.floor(i * pts.length / N)] || [Math.random() * W, Math.random() * H]);
      const old = parts;
      parts = pick.map((p, i) => ({ tx: p[0], ty: p[1], x: old[i] ? old[i].x : Math.random() * W, y: old[i] ? old[i].y : -20 - Math.random() * H * 1.5, delay: Math.random() * 900, ox: 0, oy: 0 }));
      dotR = Math.max(1.2, Math.min(2.6, Math.sqrt((W * H * 0.18) / N) / 2.2));
    };
    let dotR = 2;
    const draw = (t) => {
      if (!t0) t0 = t;
      const el = t - t0, col = css("--ink") || "#e2571f";
      g.clearRect(0, 0, W, H); g.fillStyle = col;
      let moving = false;
      for (const p of parts) {
        const k = reduce ? 1 : Math.max(0, Math.min(1, (el - p.delay) / 1100));
        const e = 1 - Math.pow(1 - k, 3);
        let x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e;
        if (k < 1) moving = true; else { p.x = p.tx; p.y = p.ty; }
        // pointer pushes dots away
        const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < 2500) { const f = (2500 - d2) / 2500 * 14; const dd = Math.sqrt(d2) || 1; p.ox += (dx / dd * f - p.ox) * 0.3; p.oy += (dy / dd * f - p.oy) * 0.3; moving = true; }
        else if (Math.abs(p.ox) + Math.abs(p.oy) > 0.1) { p.ox *= 0.88; p.oy *= 0.88; moving = true; } else { p.ox = 0; p.oy = 0; }
        g.beginPath(); g.arc(x + p.ox, y + p.oy, dotR, 0, 6.283); g.fill();
      }
      raf = visible && (moving || mx > -999) ? requestAnimationFrame(draw) : 0;
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(draw); };
    let started = false;
    const start = () => { if (started) return; started = true; layout(); t0 = 0; kick(); };
    if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) { start(); kick(); } }, { threshold: 0.3 }).observe(dotsBox);
    else { visible = true; start(); }
    let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (started) { layout(); parts.forEach((p) => { p.x = p.tx; p.y = p.ty; }); kick(); } }, 200); });
    dotsBox.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    dotsBox.addEventListener("pointerleave", () => { mx = -999; my = -999; kick(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (started) { layout(); parts.forEach((p) => { p.x = p.tx; p.y = p.ty; }); kick(); } });
  }

  /* =========================================================
     2. Chart wipe + scrambled labels
     ========================================================= */
  if ("IntersectionObserver" in window) {
    // A cover slides off the real screenshot. The image itself is never clipped,
    // so lazy loading always sees it and it always loads.
    const wipes = [];
    $$(".tile--chart img").forEach((img) => { const w = document.createElement("span"); w.className = "fx-wipe fx-wipe--block"; img.parentNode.insertBefore(w, img); w.appendChild(img); wipes.push([w, w]); });
    $$(".display__screen").forEach((sc) => { sc.classList.add("fx-wipe"); wipes.push([sc, sc.closest(".display") || sc]); });
    const reveal = (t) => wipes.forEach((w) => { if (w[1] === t) w[0].classList.add("is-wiped"); });
    const wio = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { reveal(en.target); wio.unobserve(en.target); } }), { threshold: 0.12 });
    wipes.forEach((w) => wio.observe(w[1]));

    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";
    const scramble = (el) => {
      const final = el.textContent; if (reduce || !final.trim()) return;
      let f = 0; const total = 22;
      const tick = () => {
        f++;
        el.textContent = final.split("").map((ch, i) => (ch === " " || ch === "·" ? ch : i < (f / total) * final.length ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
        if (f < total) requestAnimationFrame(tick); else el.textContent = final;
      };
      tick();
    };
    const sio = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { scramble(en.target); sio.unobserve(en.target); } }), { threshold: 1 });
    $$(".idx > span:not(.idx__r)").forEach((el) => sio.observe(el));
  }

  /* =========================================================
     3. Leads-for-budget calculator
     ========================================================= */
  const calc = document.getElementById("leadCalc");
  if (calc) {
    const r = $("#calcBudget", calc), CPL = 288;
    const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
    let used = false;
    const upd = () => {
      const b = +r.value, leads = Math.round(b / CPL), meet = Math.max(1, Math.round(leads / 10));
      $("#calcBudgetOut", calc).textContent = inr(b);
      $("#calcLeads", calc).textContent = leads.toLocaleString("en-IN");
      $("#calcMeet", calc).textContent = meet.toLocaleString("en-IN");
      $("#calcPer", calc).textContent = "≈ " + inr(b / meet);
      r.style.setProperty("--fill", ((b - r.min) / (r.max - r.min) * 100).toFixed(1) + "%");
      $("#calcCta", calc).href = WA + "?text=" + encodeURIComponent(`Hi Anek, I have a monthly ad budget of ${inr(b)}. Can you plan Meta ads for my business?`);
    };
    r.addEventListener("input", () => { upd(); if (!used) { used = true; award("calc"); } });
    upd();
  }

  /* =========================================================
     8. Magnetic buttons + Noida right-now line
     ========================================================= */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach((b) => {
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`; });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }
  const now = document.getElementById("nowText");
  if (now) {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    const hourIST = () => +new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(new Date());
    const mood = (h) => h < 6 ? "asleep. Leave a message and he'll reply in the morning." : h < 9 ? "having chai and planning the day." : h < 13 ? "deep in code." : h < 14 ? "at lunch." : h < 18 ? "checking ad and SEO numbers." : h < 21 ? "wrapping up the day's work." : "building side projects.";
    const tick = () => { now.textContent = `It's ${fmt.format(new Date()).toUpperCase()} in Noida. Anek is probably ${mood(hourIST())}`; };
    tick(); setInterval(tick, 30000);
  }

  /* =========================================================
     9. Install as app
     ========================================================= */
  let deferred = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
  addEventListener("appinstalled", () => { toast(`<span class="fx-toast__ic"><i data-lucide="smartphone"></i></span><span><b>Installed!</b><em>Find "Anek Kumar" on your home screen.</em></span>`); confetti(120); });
  const install = async () => {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; return; }
    if (matchMedia("(display-mode: standalone)").matches) { toast(`<span class="fx-toast__ic"><i data-lucide="check"></i></span><span><b>Already installed</b><em>You're using the app right now.</em></span>`); return; }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    toast(`<span class="fx-toast__ic"><i data-lucide="smartphone"></i></span><span><b>Install this site as an app</b><em>${ios ? "In Safari, tap Share, then \"Add to Home Screen\"." : "Open the browser menu and choose \"Install app\" or \"Add to Home screen\"."}</em></span>`, 7000);
  };
  if ("serviceWorker" in navigator && location.protocol === "https:") addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

  /* =========================================================
     7. Konami code: retro mode
     ========================================================= */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  const retro = (on) => {
    const root = document.documentElement;
    on = on === undefined ? !root.classList.contains("retro") : on;
    if (on && !$("#retroFont")) { const l = document.createElement("link"); l.id = "retroFont"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"; document.head.appendChild(l); }
    root.classList.toggle("retro", on);
    if (on) { award("retro"); toast(`<span class="fx-toast__ic"><i data-lucide="joystick"></i></span><span><b>Retro mode on</b><em>Press Esc or enter the code again to go back.</em></span>`); confetti(100); }
  };
  document.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[kpos]) { kpos++; if (kpos === KONAMI.length) { kpos = 0; retro(); } } else kpos = k === KONAMI[0] ? 1 : 0;
    if (e.key === "Escape" && document.documentElement.classList.contains("retro") && !openLayer()) retro(false);
  });

  /* =========================================================
     5. Terminal
     ========================================================= */
  const KEYWORDS = ["Best Property Advisor in Noida", "2 Crore on Noida Expressway", "Real Estate Consultant in Noida RERA-Registered Advisory", "New Commercial Property for Sale in Noida for 2026", "Noida's Most Exclusive Luxury Flats In Sector 94", "How to Safely Buy a Home in India", "5 Most Expensive Homes in Noida"];
  let term = null;
  const termOpen = () => {
    if (!term) {
      term = document.createElement("div"); term.className = "fx-term"; term.hidden = true;
      term.setAttribute("role", "dialog"); term.setAttribute("aria-label", "Terminal");
      term.innerHTML = `<div class="fx-term__win"><div class="fx-term__bar"><span>anek@portfolio: ~</span><button type="button" data-term-x aria-label="Close terminal"><i data-lucide="x"></i></button></div><div class="fx-term__out" aria-live="polite"></div><form class="fx-term__in"><span>❯</span><input aria-label="Terminal command" autocomplete="off" spellcheck="false" autocapitalize="off"></form></div>`;
      document.body.appendChild(term); icons();
      const out = $(".fx-term__out", term), inp = $("input", term), hist = []; let hp = 0;
      const print = (html, cls) => { const p = document.createElement("div"); if (cls) p.className = cls; p.innerHTML = html; out.appendChild(p); out.scrollTop = out.scrollHeight; };
      const CMDS = {
        help: () => print(`Commands: <b>whoami</b> · <b>skills</b> · <b>experience</b> · <b>projects</b> · <b>results</b> · <b>rankings</b> · <b>contact</b> · <b>cv</b> · <b>hire</b> · <b>ls</b> · <b>cd</b> &lt;section&gt; · <b>retro</b> · <b>matrix</b> · <b>coffee</b> · <b>date</b> · <b>clear</b> · <b>exit</b>`),
        whoami: () => print("Anek Kumar · Full Stack Developer &amp; Digital Marketer · Noida, India.<br>I build websites, then I bring them customers."),
        skills: () => print("<b>code</b>     Python, Django, DRF, PHP, MySQL, JavaScript, React, Node.js<br><b>growth</b>   SEO, Meta Ads, Google Ads, Pixel + Conversion API, GA4, GTM<br><b>tools</b>    Git, Linux, cPanel, Hostinger, WhatsApp API, Zapier"),
        experience: () => print("2026 – now  Shubharambh Infra Advisors<br>2024 – 26   Matrix Acres<br>2024        Ryoto Electrix<br>2023 – 24   Xaas Technologies"),
        projects: () => print("shubharambhinfraadvisors.com · matrixacres.in · visionwavetechnology.com · lmcstore.in · harisabziwala.com · ezzycommerce.store · allfiles.space · github.com/Anekkumar9518/devtab (Chrome extension)"),
        results: () => print("<b>SEO</b>   3.43k → 1.22M Google impressions in 6 months · #1 for 56 keywords<br><b>Ads</b>   1,149 property leads at ₹288 each · ≈ 1 in 10 became a site meeting"),
        rankings: () => print(KEYWORDS.map((k) => `<span class="ok">#1</span> ${esc(k)}`).join("<br>") + "<br>… 56 keywords at #1. Type <b>cd rankings</b> to see all."),
        contact: () => print(`WhatsApp/call  +91 95188 48804<br>Email          anekkumar9518@gmail.com<br>GitHub         github.com/Anekkumar9518`),
        cv: () => { print("Downloading Anek-Kumar-CV.pdf …", "ok"); const a = document.createElement("a"); a.href = "assets/cv/Anek-Kumar-CV.pdf"; a.download = "Anek-Kumar-CV.pdf"; document.body.appendChild(a); a.click(); a.remove(); },
        hire: () => { print("Opening WhatsApp …", "ok"); window.open(WA + "?text=" + encodeURIComponent("Hi Anek, I found you through the terminal on your portfolio!"), "_blank", "noopener"); },
        ls: () => print(SECTIONS.concat(["testdrive"]).join("  ")),
        cd: (a) => { const id = (a || "").replace(/^#/, ""); const el = document.getElementById(id === "phone" ? "testdrive" : id); if (!el) return print(`cd: no such section: ${esc(a || "")}`, "err"); print(`→ ${esc(id)}`, "ok"); termClose(); el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); },
        retro: () => { retro(); },
        date: () => print(new Date().toString()),
        coffee: () => print("<pre>   ( (\n    ) )\n  ........\n  |      |]\n  \\      /\n   `----'</pre>Brewing … ready. Now let's build something."),
        matrix: () => matrix(out),
        clear: () => { out.innerHTML = ""; },
        exit: () => termClose(),
        sudo: (a) => { if (/hire\s+anek/i.test(a || "")) { print("Permission granted. Opening WhatsApp …", "ok"); confetti(150); setTimeout(CMDS.hire, 600); } else print("sudo: nice try 😄", "err"); },
      };
      const run = (line) => {
        print(`<span class="fx-term__p">❯</span> ${esc(line)}`, "cmd");
        const [c, ...rest] = line.trim().split(/\s+/); if (!c) return;
        const fn = CMDS[c.toLowerCase()];
        if (fn) fn(rest.join(" ")); else print(`command not found: ${esc(c)}. Type <b>help</b>.`, "err");
      };
      $("form", term).addEventListener("submit", (e) => { e.preventDefault(); const v = inp.value; inp.value = ""; if (v.trim()) { hist.push(v); hp = hist.length; } run(v); });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") { if (hp > 0) { hp--; inp.value = hist[hp]; } e.preventDefault(); }
        else if (e.key === "ArrowDown") { if (hp < hist.length) { hp++; inp.value = hist[hp] || ""; } e.preventDefault(); }
        else if (e.key === "Tab") { e.preventDefault(); const m = Object.keys(CMDS).filter((k) => k.startsWith(inp.value.trim())); if (m.length === 1) inp.value = m[0] + " "; else if (m.length) print(m.join("  ")); }
        else if (e.key === "Escape") termClose();
      });
      term.addEventListener("click", (e) => { if (e.target.closest("[data-term-x]") || e.target === term) termClose(); else if (!e.target.closest("pre")) inp.focus(); });
      print("AK terminal v1.0 · Type <b>help</b> to see what you can do. Try <b>sudo hire anek</b>.");
    }
    term.hidden = false; document.body.classList.add("fx-lock");
    setTimeout(() => $("input", term).focus(), 30);
    award("hacker");
  };
  const termClose = () => { if (term) { term.hidden = true; document.body.classList.remove("fx-lock"); const a = document.activeElement; if (a && term.contains(a)) a.blur(); } };
  const matrix = (out) => {
    const c = document.createElement("canvas"); c.className = "fx-matrix"; c.width = out.clientWidth; c.height = 180; out.appendChild(c); out.scrollTop = out.scrollHeight;
    const g = c.getContext("2d"), cols = Math.floor(c.width / 12), y = Array(cols).fill(0); let n = 0;
    const id = setInterval(() => { g.fillStyle = "rgba(10,10,9,.18)"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#4be37a"; g.font = "12px monospace"; y.forEach((v, i) => { g.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 12, v * 12); y[i] = v * 12 > c.height && Math.random() > 0.95 ? 0 : v + 1; }); if (++n > 90) clearInterval(id); }, 45);
  };
  document.addEventListener("keydown", (e) => {
    if ((e.key === "`" || e.key === "~") && !e.target.closest("input, textarea, select, [contenteditable]")) { e.preventDefault(); term && !term.hidden ? termClose() : termOpen(); }
  });

  /* =========================================================
     4. Command menu (Ctrl/Cmd + K)
     ========================================================= */
  let pal = null, items = [], sel = 0;
  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
  const phoneApp = (attr, val) => { const b = document.createElement("button"); b.hidden = true; b.dataset[attr] = val; document.body.appendChild(b); b.click(); b.remove(); };
  const SITES = [["Shubharambh Infra Advisors", "https://shubharambhinfraadvisors.com"], ["Matrix Acres", "https://www.matrixacres.in"], ["Visionwave Technology", "https://visionwavetechnology.com"], ["LMC Healthcare Store", "https://lmcstore.in"], ["Hari Sabzi Wala", "https://harisabziwala.com"], ["EzzyCommerce", "https://ezzycommerce.store"], ["AllFiles", "https://allfiles.space"]];
  const ALL = () => [
    ...[["Home", "home", "house"], ["At a glance", "about", "user"], ["Work", "work", "layout-grid"], ["Phone demo", "testdrive", "smartphone"], ["SEO results", "results", "chart-line"], ["Google rankings", "rankings", "trophy"], ["Meta Ads results", "ads", "megaphone"], ["Leads calculator", "leadCalc", "calculator"], ["Resume", "resume", "file-text"], ["Contact", "contact", "message-circle"]]
      .map((x) => ({ g: "Go to", t: x[0], i: x[2], run: () => go(x[1]) })),
    { g: "Actions", t: "Download CV", i: "file-down", run: () => { const a = document.createElement("a"); a.href = "assets/cv/Anek-Kumar-CV.pdf"; a.download = "Anek-Kumar-CV.pdf"; document.body.appendChild(a); a.click(); a.remove(); award("cv"); } },
    { g: "Actions", t: "Message on WhatsApp", i: "message-circle", run: () => { window.open(WA, "_blank", "noopener"); award("talk"); } },
    { g: "Actions", t: "Copy email address", i: "copy", run: () => { (navigator.clipboard ? navigator.clipboard.writeText("anekkumar9518@gmail.com") : Promise.reject()).then(() => toast(`<span class="fx-toast__ic"><i data-lucide="check"></i></span><span><b>Email copied</b><em>anekkumar9518@gmail.com</em></span>`), () => {}); } },
    { g: "Actions", t: "Open terminal", i: "terminal", k: "`", run: termOpen },
    { g: "Actions", t: "Retro mode", i: "joystick", run: () => retro() },
    { g: "Actions", t: "Install as an app", i: "smartphone", run: install },
    { g: "Actions", t: "Achievements (" + got.length + "/" + ACH.length + ")", i: "trophy", run: showAch },
    { g: "Actions", t: "Confetti", i: "party-popper", run: () => confetti(160) },
    ...[["Ask the Assistant", "assistant", "mic"], ["Play a game (Store)", "store", "gamepad-2"], ["Play music", "music", "music"], ["Run a speed test", "speed", "gauge"], ["Scan or share QR", "qr", "qr-code"]].map((x) => ({ g: "Phone", t: x[0], i: x[2], run: () => phoneApp("droidApp", x[1]) })),
    { g: "Phone", t: "Search Google for \"best property advisor in noida\"", i: "search", run: () => phoneApp("droidSearch", "best property advisor in noida") },
    ...SITES.map((s) => ({ g: "Live sites", t: s[0], i: "external-link", run: () => window.open(s[1], "_blank", "noopener") })),
    ...KEYWORDS.map((k) => ({ g: "#1 on Google", t: k, i: "search", run: () => window.open("https://www.google.com/search?q=" + encodeURIComponent(k), "_blank", "noopener") })),
  ];
  const palOpen = () => {
    if (!pal) {
      pal = document.createElement("div"); pal.className = "fx-pal"; pal.hidden = true; pal.setAttribute("role", "dialog"); pal.setAttribute("aria-label", "Command menu");
      pal.innerHTML = `<div class="fx-pal__box"><label class="fx-pal__in"><i data-lucide="search"></i><input type="text" placeholder="Search sections, projects, actions…" aria-label="Search commands" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="fxPalList"><kbd>Esc</kbd></label><ul class="fx-pal__list" id="fxPalList" role="listbox"></ul><p class="fx-pal__foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>\`</kbd> terminal</span></p></div>`;
      document.body.appendChild(pal);
      const inp = $("input", pal);
      inp.addEventListener("input", () => { sel = 0; render(); });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { sel = Math.min(items.length - 1, sel + 1); render(true); e.preventDefault(); }
        else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); render(true); e.preventDefault(); }
        else if (e.key === "Enter") { e.preventDefault(); pick(sel); }
        else if (e.key === "Escape") palClose();
      });
      pal.addEventListener("click", (e) => { const li = e.target.closest("[data-pi]"); if (li) pick(+li.dataset.pi); else if (e.target === pal) palClose(); });
      pal.addEventListener("pointermove", (e) => { const li = e.target.closest("[data-pi]"); if (li && +li.dataset.pi !== sel) { sel = +li.dataset.pi; render(true); } });
    }
    pal.hidden = false; document.body.classList.add("fx-lock");
    const inp = $("input", pal); inp.value = ""; sel = 0; render();
    setTimeout(() => inp.focus(), 20);
    award("cmdk");
  };
  const palClose = () => { if (pal) { pal.hidden = true; document.body.classList.remove("fx-lock"); const a = document.activeElement; if (a && pal.contains(a)) a.blur(); } };
  const pick = (i) => { const it = items[i]; if (!it) return; palClose(); setTimeout(it.run, 60); };
  const render = (keepScroll) => {
    const q = $("input", pal).value.trim().toLowerCase();
    const all = ALL();
    items = q ? all.map((it) => { const t = (it.g + " " + it.t).toLowerCase(); let s = t.indexOf(q); if (s < 0) { let j = 0; for (const ch of t) if (ch === q[j]) j++; s = j === q.length ? 100 : -1; } return { it, s }; }).filter((x) => x.s >= 0).sort((a, b) => a.s - b.s).map((x) => x.it) : all;
    let last = "";
    $(".fx-pal__list", pal).innerHTML = items.length ? items.map((it, i) => { const head = it.g !== last ? `<li class="fx-pal__g" role="presentation">${esc(it.g)}</li>` : ""; last = it.g; return head + `<li role="option" data-pi="${i}" class="${i === sel ? "is-on" : ""}" aria-selected="${i === sel}"><i data-lucide="${it.i}"></i><span>${esc(it.t)}</span>${it.k ? `<kbd>${it.k}</kbd>` : ""}</li>`; }).join("") : `<li class="fx-pal__empty">Nothing found. Try "seo", "cv" or "game".</li>`;
    icons();
    const on = $(".fx-pal__list .is-on", pal); if (on && keepScroll) on.scrollIntoView({ block: "nearest" });
  };
  function showAch() {
    const box = document.createElement("div"); box.className = "fx-pal fx-ach"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Achievements");
    box.innerHTML = `<div class="fx-pal__box"><div class="fx-ach__head"><b>Achievements</b><span>${got.length} / ${ACH.length}</span><button type="button" data-x aria-label="Close"><i data-lucide="x"></i></button></div><ul class="fx-ach__list">${ACH.map((a) => `<li class="${got.includes(a.id) ? "is-got" : ""}"><span class="fx-toast__ic"><i data-lucide="${got.includes(a.id) ? a.i : "lock"}"></i></span><span><b>${esc(a.n)}</b><em>${esc(a.d)}</em></span></li>`).join("")}</ul></div>`;
    document.body.appendChild(box); document.body.classList.add("fx-lock"); icons();
    const close = () => { box.remove(); document.body.classList.remove("fx-lock"); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    box.addEventListener("click", (e) => { if (e.target === box || e.target.closest("[data-x]")) close(); });
  }
  const openLayer = () => (pal && !pal.hidden) || (term && !term.hidden) || $(".fx-ach");
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal && !pal.hidden ? palClose() : palOpen(); }
  });
  $$("[data-cmdk]").forEach((b) => b.addEventListener("click", palOpen));
  $$("[data-install]").forEach((b) => b.addEventListener("click", install));
  $$("[data-ach]").forEach((b) => b.addEventListener("click", showAch));
})();
