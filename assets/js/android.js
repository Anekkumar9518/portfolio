/* =========================================================
   AK Phone: an Android-style phone simulator, built in plain
   HTML/CSS/JS. Lock screen, status bar, notification shade with
   quick settings, home screen with a folder, app drawer, recents,
   back/home/recents navigation, side keys, and working apps:
   Browser (live sites + Google), Store (installs games), Settings,
   Phone, Messages, Camera, Gallery, Maps, Weather, Clock,
   Calculator, Calendar, Notes, Files, and three games.
   Real Android apps and Google Play can't run inside a web page,
   so every app here is written for this phone.
   ========================================================= */
(function () {
  "use strict";
  const phone = document.getElementById("droid");
  if (!phone) return;
  const wrap = document.getElementById("droidWrap");
  const scr = document.getElementById("dScreen");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, cls) => `<i data-lucide="${n}"${cls ? ` class="${cls}"` : ""}></i>`;
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const qs = (sel, el) => (el || scr).querySelector(sel);
  const qsa = (sel, el) => Array.from((el || scr).querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");
  const online = () => !S.air && S.wifi && navigator.onLine !== false;

  const KEY = "ak-phone-v1";
  const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  const S = Object.assign({
    theme: "dark", wall: 0, bright: 100, vol: 60, wifi: true, bt: true, air: false, dnd: false, torch: false,
    installed: [], notes: [{ id: 1, t: "Call Anek", b: "Ask about a website + SEO + Meta ads package for the new project." }],
    dev: false, best2048: 0, vib: true, kb: true, speak: true, best: {},
  }, saved);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  /* ---------- content ---------- */
  const SITES = {
    shubh: { n: "Shubharambh", full: "Shubharambh Infra Advisors", url: "https://shubharambhinfraadvisors.com/", shot: "assets/img/android/shubh.webp", i: "landmark", c: "#b8913d", d: "Real estate advisory site I built and run. Project search, EMI calculator, area converters. #1 on Google for 56 keywords." },
    matrix: { n: "Matrix Acres", full: "Matrix Acres", url: "https://www.matrixacres.in/", shot: "assets/img/android/matrix.webp", i: "building-2", c: "#1e2b3c", d: "Real estate website plus a 300+ module CRM behind it, and the lead campaigns that fed it." },
    vision: { n: "Visionwave", full: "Visionwave Technology", url: "https://visionwavetechnology.com/", shot: "assets/img/android/vision.webp", i: "rocket", c: "#3d42d6", d: "Digital agency website with 29 free tools." },
    lmc: { n: "LMC", full: "LMC Healthcare Store", url: "https://lmcstore.in/", shot: "assets/img/android/lmc.webp", i: "leaf", c: "#b3202b", d: "Ayurvedic wellness e-commerce store." },
    sabzi: { n: "Hari Sabzi", full: "Hari Sabzi Wala", url: "https://harisabziwala.com/", shot: "assets/img/android/sabzi.webp", i: "carrot", c: "#1f7a43", d: "Grocery delivery website with a rider app." },
    ezzy: { n: "Ezzy", full: "EzzyCommerce", url: "https://ezzycommerce.store/", i: "shirt", c: "#e3262e", d: "Streetwear fashion e-commerce. Loads fully live." },
    allfiles: { n: "AllFiles", full: "AllFiles", url: "https://allfiles.space/", shot: "assets/img/android/allfiles.webp", i: "cloud", c: "#6d5dfc", d: "Private cloud storage with free tools." },
  };
  const HOSTS = {};
  Object.keys(SITES).forEach((k) => { HOSTS[new URL(SITES[k].url).hostname.replace(/^www\./, "")] = k; });

  const APPS = {
    browser: { n: "Browser", i: "globe", c: "#e8eaed", f: "#1a73e8" },
    store: { n: "Store", i: "shopping-bag", c: "#01875f" },
    settings: { n: "Settings", i: "settings", c: "#5f6368" },
    phone: { n: "Phone", i: "phone", c: "#2f7d4f" },
    messages: { n: "Messages", i: "message-square-text", c: "#1a73e8" },
    camera: { n: "Camera", i: "camera", c: "#3c4043" },
    gallery: { n: "Gallery", i: "images", c: "#e8710a" },
    maps: { n: "Maps", i: "map-pinned", c: "#188038" },
    weather: { n: "Weather", i: "cloud-sun", c: "#1967d2" },
    clock: { n: "Clock", i: "alarm-clock", c: "#174ea6" },
    calc: { n: "Calculator", i: "calculator", c: "#3c4043" },
    calendar: { n: "Calendar", i: "calendar-days", c: "#1a73e8" },
    notes: { n: "Notes", i: "notebook-pen", c: "#e37400" },
    files: { n: "Files", i: "folder", c: "#1a73e8" },
    g2048: { n: "2048", i: "grid-2x2", c: "#c56a00", game: true, d: "Slide the tiles and merge equal numbers. Reach 2048." },
    ttt: { n: "Tic Tac Toe", i: "hash", c: "#7b1fa2", game: true, d: "You against the phone. It plays perfectly, so a draw is a good result." },
    snake: { n: "Snake", i: "gamepad-2", c: "#2e7d32", game: true, d: "The classic. Swipe or use the arrow keys." },
  };
  const isInstalled = (id) => !APPS[id].game || S.installed.includes(id);
  /* apps shown on the home screen (the rest live in the app drawer) */
  const HOME = ["store", "assistant", "music", "videos", "gallery", "maps", "weather", "clock", "calc", "settings", "device", "qr", "speed", "notes", "calendar", "files"];
  const buzz = (p) => { if (S.vib !== false && navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) { try { navigator.vibrate(p || 8); } catch (e) {} } };

  /* ---------- skeleton ---------- */
  scr.innerHTML = `
    <div class="dwall" data-wall="${S.wall}"></div>
    <div class="dsb" id="dsb"><span class="dsb__time" data-time>0:00</span><span class="dsb__cam"></span><span class="dsb__sys" id="dsbSys"></span></div>
    <div class="dlock" id="dLock">
      <div class="dlock__clock" data-time>0:00</div>
      <div class="dlock__date" data-date-long></div>
      <div class="dlock__chg" id="dLockChg" hidden></div>
      <div class="dmedia" id="dLockMedia" hidden></div>
      <div class="dlock__notes" id="dLockNotes"></div>
      <button type="button" class="dlock__hint" id="dUnlock">${ic("fingerprint")}<span>Swipe up or tap to unlock</span></button>
    </div>
    <div class="dhome" id="dHome">
      <div class="dglance"><b data-date-short></b><span id="dGlanceWx">${ic("map-pin")}Noida · #1 on Google for 56 keywords</span></div>
      <div class="dgrid" id="dGrid"></div>
      <button type="button" class="dhome__up" data-drawer aria-label="All apps">${ic("chevron-up")}<span>All apps</span></button>
      <div class="ddock" id="dDock"></div>
      <form class="dsearch" data-search>${ic("search")}<input type="search" name="q" placeholder="Search the web" aria-label="Search the web" autocomplete="off"><button type="submit" aria-label="Search">${ic("arrow-right")}</button></form>
    </div>
    <div class="dfolder" id="dFolder" hidden><div class="dfolder__box"><p class="dfolder__t">My work</p><div class="dfolder__grid"></div></div></div>
    <div class="ddrawer" id="dDrawer" hidden><div class="ddrawer__bar">${ic("search")}<input type="search" placeholder="Search apps" aria-label="Search apps" id="dDrawerQ"></div><div class="ddrawer__grid" id="dDrawerGrid"></div></div>
    <div class="dwin" id="dWin" hidden></div>
    <div class="drec" id="dRec" hidden><p class="drec__t">Recent apps</p><div class="drec__list" id="dRecList"></div><button type="button" class="drec__clear" id="dRecClear">Clear all</button></div>
    <div class="dshade" id="dShade" hidden>
      <div class="dshade__top"><b data-time></b><span data-date-long></span></div>
      <div class="dtiles" id="dTiles"></div>
      <div class="dmedia" id="dShadeMedia" hidden></div>
      <label class="dshade__bright">${ic("sun")}<input type="range" min="25" max="100" id="dBright" aria-label="Brightness"></label>
      <div class="dshade__notes" id="dShadeNotes"></div>
      <button type="button" class="dshade__close" id="dShadeClose" aria-label="Close">${ic("chevron-up")}</button>
    </div>
    <div class="dheads" id="dHeads" hidden></div>
    <div class="dvol" id="dVol" hidden>${ic("volume-2")}<span class="dvol__bar"><i></i></span></div>
    <div class="dtoast" id="dToast" hidden></div>
    <div class="dkb" id="dKb" hidden></div>
    <div class="ddim" id="dDim"></div>
    <div class="dpower" id="dPower" hidden><div class="dpower__box" id="dPowerBox"></div></div>
    <div class="dsos" id="dSos" hidden><div class="dsos__in">${ic("siren")}<b>Emergency</b><p>This phone is a simulator and can't call anyone. In a real emergency, call <strong>112</strong> from your own phone.</p><div class="dsos__info"><small>Phone owner</small><span>Anek Kumar · portfolio phone</span></div><button type="button" class="dsos__close" data-sos-close>Close</button></div></div>
    <div class="dchg" id="dChg" hidden><div class="dchg__ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="dchg__arc" cx="60" cy="60" r="52"/></svg><b id="dChgPct">0%</b></div><span>${ic("zap")}Charging</span></div>
    <div class="dboot" id="dBoot" hidden><div class="dboot__logo">AK</div><div class="dboot__bar"><i></i></div><small>AK Phone</small></div>
    <div class="doff" id="dOff" hidden></div>
    <nav class="dnav" aria-label="Phone navigation">
      <button type="button" data-nav="back" aria-label="Back"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5 7 12l9 7z"/></svg></button>
      <button type="button" data-nav="home" aria-label="Home"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg></button>
      <button type="button" data-nav="recents" aria-label="Recent apps"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>
    </nav>`;
  const lock = qs("#dLock"), home = qs("#dHome"), win = qs("#dWin"), shade = qs("#dShade"), drawer = qs("#dDrawer"), folder = qs("#dFolder"), rec = qs("#dRec");

  /* ---------- fit the 380x800 phone into its column ---------- */
  const fit = () => wrap.style.setProperty("--s", Math.min(1, wrap.clientWidth / 380).toFixed(4));
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(wrap); else addEventListener("resize", fit);
  fit();

  /* ---------- theme, brightness, status icons ---------- */
  const applyState = () => {
    scr.classList.toggle("is-light", S.theme === "light");
    qs(".dwall").dataset.wall = S.wall;
    qs("#dDim").style.opacity = ((100 - S.bright) / 100 * 0.75).toFixed(2);
    const sys = [];
    if (S.dnd) sys.push(ic("bell-off"));
    if (S.torch) sys.push(ic("flashlight"));
    if (S.bt && !S.air) sys.push(ic("bluetooth"));
    if (S.air) sys.push(ic("plane"));
    else { sys.push(ic(S.wifi ? "wifi" : "wifi-off")); sys.push(ic("signal-high")); }
    sys.push(`<span class="dsb__bat${battery.level <= 15 && !battery.charging ? " is-low" : ""}"><span class="dsb__batfill" style="width:${battery.level}%"></span></span><span>${battery.level}%</span>`);
    const chg = qs("#dLockChg");
    if (chg) { chg.hidden = !battery.charging; chg.innerHTML = ic("zap") + "Charging · " + battery.level + "%"; }
    qs("#dsbSys").innerHTML = sys.join("");
    phone.classList.toggle("is-charging", battery.charging);
    phone.classList.toggle("is-torch", S.torch);
    icons();
    drawTiles();
  };
  const battery = { level: 100, charging: false };
  let booted = false, lowWarned = false;
  const chargeAnim = () => {
    if (state === "boot") return;
    const c = qs("#dChg"); qs("#dChgPct").textContent = battery.level + "%";
    c.style.setProperty("--lvl", battery.level);
    c.hidden = false; c.classList.remove("is-on"); void c.offsetWidth; c.classList.add("is-on");
    buzz([20, 40, 20]);
    setTimeout(() => { c.hidden = true; }, 2600);
  };
  const lowCheck = () => {
    if (lowWarned || battery.charging || battery.level > 20 || !booted) return;
    lowWarned = true;
    notify({ app: "settings", icon: "battery-low", title: "Battery low", text: battery.level + "% left. Plug in your charger.", go: () => openApp("settings", { page: "battery" }) });
    toast("Battery low: " + battery.level + "%");
  };
  if (navigator.getBattery) navigator.getBattery().then((b) => {
    const upd = () => {
      const was = battery.charging;
      battery.level = Math.round(b.level * 100); battery.charging = b.charging; applyState();
      if (!was && battery.charging && booted) chargeAnim();
      lowCheck();
    };
    upd(); b.addEventListener("levelchange", upd); b.addEventListener("chargingchange", upd);
  }).catch(() => {});

  /* ---------- clock ---------- */
  const tick = () => {
    const n = new Date();
    qsa("[data-time]").forEach((e) => { e.textContent = n.getHours() + ":" + pad(n.getMinutes()); });
    qsa("[data-date-short]").forEach((e) => { e.textContent = n.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); });
    qsa("[data-date-long]").forEach((e) => { e.textContent = n.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); });
  };
  tick(); setInterval(tick, 10000);

  /* ---------- toast + volume ---------- */
  let toastT = 0;
  const toast = (msg) => {
    const t = qs("#dToast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
  };
  let volT = 0;
  const showVol = () => {
    const v = qs("#dVol"); v.hidden = false; qs(".dvol__bar i", v).style.height = S.vol + "%";
    clearTimeout(volT); volT = setTimeout(() => { v.hidden = true; }, 1500);
  };
  let actx = null;
  const beep = (f1, f2, ms) => {
    if (!S.vol) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const g = actx.createGain(); g.gain.value = (S.vol / 100) * 0.12; g.connect(actx.destination);
      [f1, f2].filter(Boolean).forEach((f) => { const o = actx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(); o.stop(actx.currentTime + ms / 1000); });
    } catch (e) {}
  };

  /* ---------- notifications ---------- */
  const notes = [];
  const noteC = (n) => { const a = APPS[n.app] || {}; return "--c:" + (a.c || "#555") + ";color:" + (a.f || "#fff"); };
  const drawNotes = () => {
    const html = notes.length ? notes.map((n, i) => `<button type="button" class="dnote" data-note="${i}"><span class="dnote__ic" style="${noteC(n)}">${ic(n.icon || (APPS[n.app] && APPS[n.app].i) || "bell")}</span><span class="dnote__tx"><b>${esc(n.title)}</b><span>${esc(n.text)}</span></span><small>${esc(n.when)}</small></button>`).join("") : `<p class="dshade__empty">No notifications</p>`;
    qs("#dShadeNotes").innerHTML = html + (notes.length ? `<button type="button" class="dshade__clear" id="dClearNotes">Clear all</button>` : "");
    qs("#dLockNotes").innerHTML = notes.slice(0, 2).map((n, i) => `<button type="button" class="dnote dnote--lock" data-note="${i}"><span class="dnote__ic" style="${noteC(n)}">${ic(n.icon || APPS[n.app].i)}</span><span class="dnote__tx"><b>${esc(n.title)}</b><span>${esc(n.text)}</span></span></button>`).join("");
    icons();
  };
  const notify = (n) => {
    const t = new Date(); n.when = t.getHours() + ":" + pad(t.getMinutes());
    notes.unshift(n); drawNotes();
    if (S.dnd || state === "off") return;
    const h = qs("#dHeads");
    h.innerHTML = `<button type="button" class="dnote dnote--heads" data-note="0"><span class="dnote__ic" style="${noteC(n)}">${ic(n.icon || APPS[n.app].i)}</span><span class="dnote__tx"><b>${esc(n.title)}</b><span>${esc(n.text)}</span></span><small>now</small></button>`;
    h.hidden = false; icons(); beep(880, 0, 90); buzz([30, 60, 30]);
    setTimeout(() => { h.hidden = true; }, 4500);
  };
  const runNote = (i) => {
    const n = notes[i]; if (!n) return;
    notes.splice(i, 1); drawNotes(); qs("#dHeads").hidden = true;
    if (state === "lock") unlock();
    closeShade();
    if (n.go) n.go();
  };

  /* ---------- screens ---------- */
  let state = "lock"; // off | lock | home | app
  const setVis = () => {
    lock.hidden = state !== "lock";
    home.hidden = !(state === "home" || state === "app");
    win.hidden = state !== "app";
    qs("#dOff").hidden = state !== "off";
    if (state === "off" || state === "boot") { qs("#dPower").hidden = true; qs("#dSos").hidden = true; }
    scr.dataset.state = state;
  };
  let firstUnlock = true;
  const unlock = () => {
    if (state !== "lock") return;
    lock.classList.add("is-leaving");
    setTimeout(() => { lock.classList.remove("is-leaving"); state = cur ? "app" : "home"; setVis(); }, reduce ? 0 : 280);
    if (firstUnlock) {
      firstUnlock = false;
      setTimeout(() => notify({ app: "browser", icon: "search", title: "Google", text: "#1 for \"Best Property Advisor in Noida\". Tap to see it live.", go: () => openApp("browser", { search: "best property advisor in noida" }) }), 3500);
      setTimeout(() => notify({ app: "messages", title: "Anek Kumar", text: "Hi! Want a website that brings you customers?", go: () => openApp("messages") }), 20000);
    }
  };
  const lockPhone = () => { closeOverlays(); state = "lock"; setVis(); };
  let poweredOff = false;
  const powerKey = () => {
    if (state === "boot") return;
    if (state === "off") { if (poweredOff) boot(); else { state = "lock"; setVis(); } }
    else { closeOverlays(); hideKb(); stopMedia(); state = "off"; setVis(); }
    buzz(15);
  };
  const boot = () => {
    poweredOff = false; state = "boot"; setVis();
    const b = qs("#dBoot"); b.hidden = false; b.classList.remove("is-on"); void b.offsetWidth; b.classList.add("is-on");
    setTimeout(() => { b.hidden = true; state = "lock"; setVis(); buzz(30); }, reduce ? 300 : 3000);
  };
  const shutDown = (then) => {
    const box = qs("#dPowerBox");
    box.innerHTML = `<div class="dpower__wait"><span class="dspin"></span>${then === "restart" ? "Restarting…" : "Powering off…"}</div>`;
    setTimeout(() => {
      qs("#dPower").hidden = true;
      closeOverlays(); hideKb();
      Array.from(running.keys()).forEach(closeApp);
      setMedia(null);
      state = "off"; poweredOff = true; setVis();
      if (then === "restart") setTimeout(boot, 700);
    }, 1200);
  };
  const openPower = () => {
    if (state === "off" || state === "boot") return;
    hideKb(); closeShade();
    qs("#dPowerBox").innerHTML = `<button type="button" data-pw="off">${ic("power")}<span>Power off</span></button><button type="button" data-pw="restart">${ic("rotate-ccw")}<span>Restart</span></button><button type="button" data-pw="sos">${ic("siren")}<span>Emergency</span></button>`;
    qs("#dPower").hidden = false; icons(); buzz(25);
  };

  /* swipe helper: calls fn(dir) on a vertical swipe, or tap() on a click */
  const swipe = (el, fn, tap) => {
    let y0 = null, x0 = 0;
    el.addEventListener("pointerdown", (e) => { y0 = e.clientY; x0 = e.clientX; });
    el.addEventListener("pointerup", (e) => {
      if (y0 === null) return;
      const s = parseFloat(getComputedStyle(wrap).getPropertyValue("--s")) || 1;
      const dy = (e.clientY - y0) / s, dx = (e.clientX - x0) / s; y0 = null;
      if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) fn(dy < 0 ? "up" : "down", e);
      else if (tap) tap(e);
    });
  };
  swipe(lock, (d) => { if (d === "up") unlock(); }, (e) => { if (e.target.closest("#dUnlock")) unlock(); });
  swipe(qs("#dsb"), (d) => { if (d === "down") openShade(); }, () => openShade());
  swipe(home, (d, e) => { if (d === "up" && !e.target.closest("input")) openDrawer(); else if (d === "down" && !e.target.closest("input")) openShade(); });
  swipe(shade, (d) => { if (d === "up") closeShade(); });

  /* ---------- home ---------- */
  const appIcon = (id, opts) => {
    const a = APPS[id];
    return `<button type="button" class="dapp" data-open="${id}"><span class="dapp__ic" style="--c:${a.c}${a.f ? ";--f:" + a.f : ""}">${ic(a.i)}</span>${opts && opts.noName ? "" : `<span class="dapp__nm">${esc(a.n)}</span>`}</button>`;
  };
  const siteIcon = (k) => { const s = SITES[k]; return `<button type="button" class="dapp" data-site="${k}"><span class="dapp__ic" style="--c:${s.c}">${ic(s.i)}</span><span class="dapp__nm">${esc(s.n)}</span></button>`; };
  const drawHome = () => {
    const games = S.installed.filter((id) => APPS[id]);
    const mini = (cs) => cs.slice(0, 4).map((c) => `<i style="--c:${c}"></i>`).join("");
    const grid = [`<button type="button" class="dapp" data-folder="work"><span class="dapp__ic dapp__ic--folder">${mini(Object.keys(SITES).map((k) => SITES[k].c))}</span><span class="dapp__nm">My work</span></button>`];
    if (games.length) grid.push(`<button type="button" class="dapp" data-folder="games"><span class="dapp__ic dapp__ic--folder">${mini(games.map((id) => APPS[id].c))}</span><span class="dapp__nm">Games</span></button>`);
    const tools = Object.keys(APPS).filter((id) => APPS[id].tool);
    if (tools.length) grid.push(`<button type="button" class="dapp" data-folder="tools"><span class="dapp__ic dapp__ic--folder">${mini(tools.map((id) => APPS[id].c))}</span><span class="dapp__nm">Tools</span></button>`);
    HOME.filter((id) => APPS[id]).slice(0, 16 - grid.length).forEach((id) => grid.push(appIcon(id)));
    qs("#dGrid").innerHTML = grid.join("");
    qs("#dDock").innerHTML = ["phone", "messages", "browser", "camera"].map((id) => appIcon(id, { noName: true })).join("");
    icons();
  };
  const openFolder = (kind) => {
    const games = S.installed.filter((id) => APPS[id]);
    const tools = Object.keys(APPS).filter((id) => APPS[id].tool);
    qs(".dfolder__t").textContent = kind === "games" ? "Games" : kind === "tools" ? "Tools" : "My work";
    qs(".dfolder__grid").innerHTML = kind === "games" ? games.map((id) => appIcon(id)).join("") : kind === "tools" ? tools.map((id) => appIcon(id)).join("") : Object.keys(SITES).map(siteIcon).join("");
    folder.hidden = false; icons();
  };
  const openDrawer = () => {
    closeShade();
    const ids = Object.keys(APPS).filter(isInstalled).sort((a, b) => APPS[a].n.localeCompare(APPS[b].n));
    const q = qs("#dDrawerQ"); q.value = "";
    const draw = () => {
      const t = q.value.trim().toLowerCase();
      qs("#dDrawerGrid").innerHTML = ids.filter((id) => APPS[id].n.toLowerCase().includes(t)).map((id) => appIcon(id)).join("")
        + Object.keys(SITES).filter((k) => SITES[k].n.toLowerCase().includes(t)).map(siteIcon).join("");
      icons();
    };
    q.oninput = draw; draw();
    drawer.hidden = false;
  };
  swipe(drawer, (d, e) => { if (d === "down" && !e.target.closest("input") && qs("#dDrawerGrid").scrollTop <= 0) drawer.hidden = true; });

  /* ---------- quick settings ---------- */
  const TILES = [
    { k: "wifi", n: "Wi-Fi", i: "wifi", on: () => S.wifi && !S.air },
    { k: "bt", n: "Bluetooth", i: "bluetooth", on: () => S.bt && !S.air },
    { k: "torch", n: "Flashlight", i: "flashlight", on: () => S.torch },
    { k: "theme", n: "Dark theme", i: "moon", on: () => S.theme === "dark" },
    { k: "air", n: "Airplane", i: "plane", on: () => S.air },
    { k: "dnd", n: "Do not disturb", i: "bell-off", on: () => S.dnd },
  ];
  function drawTiles() {
    const box = qs("#dTiles"); if (!box) return;
    box.innerHTML = TILES.map((t) => `<button type="button" class="dtile${t.on() ? " is-on" : ""}" data-tile="${t.k}" aria-pressed="${t.on()}">${ic(t.i)}<span>${t.n}</span></button>`).join("");
    qs("#dBright").value = S.bright;
    icons();
  }
  const toggleTile = (k) => {
    if (k === "wifi") { if (S.air) S.air = false; S.wifi = !S.wifi; }
    else if (k === "bt") S.bt = !S.bt;
    else if (k === "torch") S.torch = !S.torch;
    else if (k === "theme") S.theme = S.theme === "dark" ? "light" : "dark";
    else if (k === "air") S.air = !S.air;
    else if (k === "dnd") S.dnd = !S.dnd;
    else if (k === "vib") { S.vib = !S.vib; if (S.vib) buzz(30); }
    else if (k === "kb") S.kb = !S.kb;
    else if (k === "speak") S.speak = !S.speak;
    else { const tl = TILES.find((x) => x.k === k); if (tl && tl.run) { closeShade(); tl.run(); } return; }
    save(); applyState(); broadcast();
  };
  const openShade = () => { if (state === "off") return; drawNotes(); shade.hidden = false; };
  const closeShade = () => { shade.hidden = true; };
  qs("#dBright").addEventListener("input", (e) => { S.bright = +e.target.value; save(); applyState(); });
  const closeOverlays = () => { closeShade(); drawer.hidden = true; folder.hidden = true; rec.hidden = true; };

  /* ---------- window manager ---------- */
  const running = new Map();
  let cur = null;
  const listeners = new Set(); // apps that react to network/theme changes
  const broadcast = () => listeners.forEach((fn) => fn());
  const RUN = {};
  const openApp = (id, arg) => {
    if (!APPS[id] || !isInstalled(id)) return;
    closeOverlays();
    if (state === "off" || state === "lock") { state = "lock"; unlock(); }
    let r = running.get(id);
    if (!r) {
      const el = document.createElement("section");
      el.className = "dapp-win"; el.dataset.app = id;
      win.appendChild(el);
      r = { el, api: RUN[id](el, arg) || {} };
      running.set(id, r);
    } else if (arg && r.api.arg) r.api.arg(arg);
    if (cur && cur !== id && running.get(cur) && running.get(cur).api.hide) running.get(cur).api.hide();
    running.forEach((v, k) => { v.el.hidden = k !== id; });
    cur = id;
    state = state === "lock" ? "lock" : "app";
    setVis();
    win.classList.remove("is-in"); void win.offsetWidth; win.classList.add("is-in");
    if (r.api.show) r.api.show();
    icons();
  };
  const goHome = () => {
    closeOverlays();
    if (cur && running.get(cur) && running.get(cur).api.hide) running.get(cur).api.hide();
    cur = null;
    if (state === "app") state = "home";
    setVis();
  };
  const closeApp = (id) => {
    const r = running.get(id); if (!r) return;
    if (r.api.hide) r.api.hide();
    if (r.api.destroy) r.api.destroy();
    r.el.remove(); running.delete(id);
    if (cur === id) { cur = null; if (state === "app") state = "home"; setVis(); }
  };
  const stopMedia = () => { running.forEach((v) => { if (v.api.hide) v.api.hide(); }); };
  const back = () => {
    if (state === "off" || state === "boot") return;
    if (!kb.hidden) { const a = document.activeElement; hideKb(); if (a && scr.contains(a)) a.blur(); return; }
    if (!qs("#dPower").hidden) { qs("#dPower").hidden = true; return; }
    if (!qs("#dSos").hidden) { qs("#dSos").hidden = true; return; }
    if (state === "lock") return;
    if (!qs("#dShade").hidden) return closeShade();
    if (!rec.hidden) { rec.hidden = true; return; }
    if (!folder.hidden) { folder.hidden = true; return; }
    if (!drawer.hidden) { drawer.hidden = true; return; }
    if (state === "app" && cur) {
      const api = running.get(cur).api;
      if (api.back && api.back()) return;
      goHome();
    }
  };
  const showRecents = () => {
    if (state === "lock" || state === "off") return;
    closeShade();
    const ids = Array.from(running.keys()).reverse();
    qs("#dRecList").innerHTML = ids.length ? ids.map((id) => `<div class="drec__card"><button type="button" class="drec__open" data-open="${id}"><span class="dapp__ic" style="--c:${APPS[id].c}${APPS[id].f ? ";--f:" + APPS[id].f : ""}">${ic(APPS[id].i)}</span><b>${esc(APPS[id].n)}</b></button><button type="button" class="drec__x" data-close="${id}" aria-label="Close ${esc(APPS[id].n)}">${ic("x")}</button></div>`).join("") : `<p class="drec__empty">No recent apps</p>`;
    rec.hidden = false; icons();
  };
  qs("#dRecClear").addEventListener("click", () => { Array.from(running.keys()).forEach(closeApp); showRecents(); });

  /* ---------- global clicks inside the phone ---------- */
  scr.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("button, a")) buzz(6);
    const pw = t.closest("[data-pw]");
    if (pw) { const a = pw.dataset.pw; if (a === "sos") { qs("#dPower").hidden = true; qs("#dSos").hidden = false; } else shutDown(a); return; }
    if (t.closest("[data-sos-close]")) { qs("#dSos").hidden = true; return; }
    if (t === qs("#dPower")) { qs("#dPower").hidden = true; return; }
    const md = t.closest("[data-media]"); if (md) { if (media && media[md.dataset.media]) media[md.dataset.media](); return; }
    const nav = t.closest("[data-nav]");
    if (nav) { const n = nav.dataset.nav; beep(0, 0, 0); if (n === "back") back(); else if (n === "home") { if (state === "lock") unlock(); else goHome(); } else showRecents(); return; }
    const op = t.closest("[data-open]"); if (op) { rec.hidden = true; openApp(op.dataset.open); return; }
    const st = t.closest("[data-site]"); if (st) { openApp("browser", { site: st.dataset.site }); return; }
    const fd = t.closest("[data-folder]"); if (fd) { openFolder(fd.dataset.folder); return; }
    if (t === folder) { folder.hidden = true; return; }
    if (t.closest("[data-drawer]")) { openDrawer(); return; }
    const cl = t.closest("[data-close]"); if (cl) { closeApp(cl.dataset.close); showRecents(); return; }
    const tile = t.closest("[data-tile]"); if (tile) { toggleTile(tile.dataset.tile); return; }
    const nt = t.closest("[data-note]"); if (nt) { runNote(+nt.dataset.note); return; }
    if (t.closest("#dClearNotes")) { notes.length = 0; drawNotes(); return; }
    if (t.closest("#dShadeClose")) { closeShade(); return; }
  });
  qs("[data-search]").addEventListener("submit", (e) => { e.preventDefault(); const q = e.target.q.value.trim(); e.target.q.value = ""; e.target.q.blur(); if (q) openApp("browser", { q }); });

  /* side keys */
  const keyBtn = (sel, fn) => { const b = phone.querySelector(sel); if (b) b.addEventListener("click", fn); };
  const pkey = phone.querySelector(".droid__key--power");
  if (pkey) {
    let pT = 0, pLong = false;
    pkey.title = "Press: screen on/off. Hold: power menu";
    pkey.addEventListener("pointerdown", () => { pLong = false; pT = setTimeout(() => { pLong = true; openPower(); }, 550); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => pkey.addEventListener(ev, () => clearTimeout(pT)));
    pkey.addEventListener("click", () => { if (pLong) { pLong = false; return; } powerKey(); });
    pkey.addEventListener("contextmenu", (e) => { e.preventDefault(); openPower(); });
  }
  keyBtn(".droid__key--up", () => { S.vol = Math.min(100, S.vol + 10); save(); showVol(); beep(660, 0, 60); });
  keyBtn(".droid__key--down", () => { S.vol = Math.max(0, S.vol - 10); save(); showVol(); beep(520, 0, 60); });
  qs("#dOff").addEventListener("click", powerKey);

  /* =========================================================
     APPS
     ========================================================= */
  const bar = (title, extra) => `<header class="dbar"><button type="button" class="dbar__back" data-nav="back" aria-label="Back">${ic("arrow-left")}</button><h4>${esc(title)}</h4>${extra || ""}</header>`;
  const offline = (what) => `<div class="doffline">${ic("wifi-off")}<b>You're offline</b><span>${esc(what)} needs the internet. Turn off Airplane mode or turn on Wi-Fi in quick settings.</span></div>`;

  /* ---------- Browser ---------- */
  RUN.browser = (el, arg) => {
    el.innerHTML = `
      <form class="dbr__bar" data-bform>
        <button type="button" class="dbr__icon" data-bact="ntp" aria-label="Start page">${ic("house")}</button>
        <label class="dbr__omni">${ic("lock", "dbr__lock")}<input type="text" name="q" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Search or type web address" aria-label="Search or type web address"></label>
        <span class="dbr__tabs" aria-label="Pages visited">1</span>
        <button type="button" class="dbr__icon" data-bact="live" aria-label="Open this page in a real tab">${ic("external-link")}</button>
      </form>
      <div class="dbr__progress"><i></i></div>
      <div class="dbr__view">
        <div class="dntp">
          <p class="dntp__hi">Where to?</p>
          <form class="dntp__search" data-bform>${ic("search")}<input type="search" name="q" placeholder="Search or type web address" aria-label="Search or type web address" autocomplete="off"></form>
          <div class="dntp__tiles">${Object.keys(SITES).map((k) => `<button type="button" data-bsite="${k}"><span style="--c:${SITES[k].c}">${SITES[k].n[0]}</span>${esc(SITES[k].n)}</button>`).join("")}<button type="button" data-bq="best property advisor in noida"><span style="--c:#e2571f">G</span>Google</button></div>
        </div>
        <iframe class="dbr__frame" title="Web page inside the phone" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" hidden></iframe>
        <div class="dshot" hidden><img alt="" loading="lazy"></div>
        <div class="dbr__off" hidden></div>
        <div class="dsnack" hidden><span></span><a href="#" target="_blank" rel="noopener">Open live</a></div>
      </div>`;
    const omni = qs(".dbr__omni input", el), frame = qs("iframe", el), shot = qs(".dshot", el), shotImg = qs(".dshot img", el);
    const ntp = qs(".dntp", el), prog = qs(".dbr__progress", el), snack = qs(".dsnack", el), offBox = qs(".dbr__off", el);
    let stack = [], loadT = 0, snackT = 0;
    const cur2 = () => stack[stack.length - 1];
    const search = (q) => ({ kind: "frame", url: "https://www.google.com/search?igu=1&q=" + encodeURIComponent(q), label: q, live: "https://www.google.com/search?q=" + encodeURIComponent(q), isSearch: true });
    const site = (k) => { const s = SITES[k], host = new URL(s.url).hostname.replace(/^www\./, ""); return s.shot ? { kind: "shot", url: s.url, img: s.shot, label: host } : { kind: "frame", url: s.url, label: host }; };
    const parse = (q) => {
      q = (q || "").trim(); if (!q) return null;
      if (/^https?:\/\//i.test(q) || /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(q)) {
        let u; try { u = new URL(/^https?:\/\//i.test(q) ? q : "https://" + q); } catch (e) { return search(q); }
        const k = HOSTS[u.hostname.replace(/^www\./, "")]; if (k) return site(k);
        return { kind: "frame", url: u.href, label: u.hostname.replace(/^www\./, "") };
      }
      return search(q);
    };
    const showSnack = (txt, href, stay) => {
      clearTimeout(snackT); qs("span", snack).textContent = txt; qs("a", snack).href = href; snack.hidden = false;
      if (!stay) snackT = setTimeout(() => { snack.hidden = true; }, 6500);
    };
    const render = () => {
      const e = cur2();
      qs(".dbr__tabs", el).textContent = String(Math.max(1, stack.filter((x) => x.kind !== "ntp").length));
      snack.hidden = true; clearTimeout(loadT); prog.classList.remove("is-loading"); offBox.hidden = true;
      el.classList.toggle("is-secure", !!(e && e.kind !== "ntp"));
      if (!e || e.kind === "ntp") { omni.value = ""; ntp.hidden = false; frame.hidden = true; shot.hidden = true; return; }
      omni.value = e.label; ntp.hidden = true;
      if (e.kind === "shot") {
        frame.hidden = true; frame.removeAttribute("src"); shot.hidden = false; shot.scrollTop = 0;
        shotImg.alt = "Mobile snapshot of " + e.label; shotImg.src = e.img;
        showSnack("Snapshot, 16 Nov 2026. This site blocks being opened inside other websites.", e.url, true);
        return;
      }
      shot.hidden = true;
      if (!online()) { frame.hidden = true; frame.removeAttribute("src"); offBox.innerHTML = offline("This page"); offBox.hidden = false; icons(); return; }
      frame.hidden = false; prog.classList.add("is-loading"); frame.src = e.url;
      loadT = setTimeout(() => { prog.classList.remove("is-loading"); if (!e.isSearch) showSnack("Page blank? Some sites block being opened inside other websites.", e.live || e.url); }, 8000);
    };
    frame.addEventListener("load", () => {
      const e = cur2(); if (!e || e.kind !== "frame" || frame.hidden) return;
      clearTimeout(loadT); prog.classList.remove("is-loading");
      if (e.isSearch) showSnack("Live Google search. If Google asks you to prove you're not a robot, open it in a real tab.", e.live);
    });
    const go = (entry) => { if (!entry) return; stack.push(entry); render(); };
    const take = (a) => {
      if (!a) { if (!stack.length) go({ kind: "ntp" }); return; }
      if (a.site) go(site(a.site)); else if (a.search) go(search(a.search)); else if (a.q) go(parse(a.q)); else if (a.url) go(parse(a.url));
    };
    el.addEventListener("submit", (ev) => { const f = ev.target.closest("[data-bform]"); if (!f) return; ev.preventDefault(); const q = f.q.value; f.q.blur(); if (f.classList.contains("dntp__search")) f.q.value = ""; go(parse(q)); });
    el.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-bact],[data-bsite],[data-bq]"); if (!b) return;
      if (b.dataset.bsite) go(site(b.dataset.bsite));
      else if (b.dataset.bq) go(search(b.dataset.bq));
      else if (b.dataset.bact === "ntp") go({ kind: "ntp" });
      else if (b.dataset.bact === "live") { const e = cur2(); if (e && e.url) window.open(e.live || e.url, "_blank", "noopener"); else toast("Open a page first"); }
    });
    omni.addEventListener("focus", () => { const e = cur2(); if (e && e.url && !e.isSearch) omni.value = e.url; omni.select(); });
    omni.addEventListener("blur", () => { const e = cur2(); if (e && e.label) omni.value = e.label; });
    listeners.add(() => { if (!el.hidden) render(); });
    take(arg);
    return { arg: take, back: () => { if (stack.length > 1) { stack.pop(); render(); return true; } return false; } };
  };

  /* ---------- Store ---------- */
  RUN.store = (el) => {
    let tab = "games", detail = null, busy = {};
    const items = () => tab === "games"
      ? Object.keys(APPS).filter((id) => APPS[id].game).map((id) => ({ id, n: APPS[id].n, i: APPS[id].i, c: APPS[id].c, cat: "Game", d: APPS[id].d }))
      : Object.keys(SITES).map((k) => ({ id: "site:" + k, n: SITES[k].full, i: SITES[k].i, c: SITES[k].c, cat: "Website", d: SITES[k].d, shot: SITES[k].shot, url: SITES[k].url }));
    const btn = (it) => {
      if (busy[it.id]) return `<span class="dst__btn is-busy"><i style="--p:${busy[it.id]}%"></i>${busy[it.id]}%</span>`;
      if (it.id.startsWith("site:") || isInstalled(it.id)) return `<button type="button" class="dst__btn is-open" data-st-open="${it.id}">Open</button>`;
      return `<button type="button" class="dst__btn" data-st-install="${it.id}">Install</button>`;
    };
    const draw = () => {
      if (detail) {
        const it = items().concat(tab === "games" ? [] : []).find((x) => x.id === detail) || detail;
        const all = Object.keys(APPS).filter((id) => APPS[id].game).map((id) => ({ id, n: APPS[id].n, i: APPS[id].i, c: APPS[id].c, cat: "Game", d: APPS[id].d }))
          .concat(Object.keys(SITES).map((k) => ({ id: "site:" + k, n: SITES[k].full, i: SITES[k].i, c: SITES[k].c, cat: "Website", d: SITES[k].d, shot: SITES[k].shot })));
        const x = all.find((a) => a.id === detail) || it;
        el.innerHTML = bar(x.n) + `<div class="dapp-body dst__detail">
          <div class="dst__head"><span class="dapp__ic dst__big" style="--c:${x.c}">${ic(x.i)}</span><div><b>${esc(x.n)}</b><span>Anek Kumar</span><small>${x.cat}</small></div></div>
          <div class="dst__act">${btn(x)}</div>
          ${x.shot ? `<div class="dst__shots"><img src="${x.shot}" alt="Screenshot of ${esc(x.n)}" loading="lazy"></div>` : `<div class="dst__shots dst__shots--game" style="--c:${x.c}">${ic(x.i)}</div>`}
          <h5>About this ${x.cat === "Game" ? "game" : "website"}</h5><p>${esc(x.d)}</p>
          <p class="dst__fine">${x.cat === "Game" ? "Made for this phone in HTML and JavaScript. Free, no ads." : "A website I built. Opens in the Browser."}</p>
        </div>`;
      } else {
        el.innerHTML = `<header class="dbar dbar--store"><span class="dst__logo">${ic("shopping-bag")}</span><h4>Store</h4></header>
          <div class="dst__tabs" role="tablist"><button type="button" role="tab" data-st-tab="games" class="${tab === "games" ? "is-on" : ""}">Games</button><button type="button" role="tab" data-st-tab="apps" class="${tab === "apps" ? "is-on" : ""}">My websites</button></div>
          <div class="dapp-body"><p class="dst__note">${tab === "games" ? "Games I made for this phone. Install one and it appears on the home screen." : "Websites I built. Open one to see it on this phone."}</p>
          <ul class="dst__list">${items().map((it) => `<li><button type="button" class="dst__row" data-st-detail="${it.id}"><span class="dapp__ic" style="--c:${it.c}">${ic(it.i)}</span><span class="dst__tx"><b>${esc(it.n)}</b><small>${it.cat} · Anek Kumar</small></span></button>${btn(it)}</li>`).join("")}</ul></div>`;
      }
      icons();
    };
    const install = (id) => {
      busy[id] = 0; draw();
      const step = () => {
        busy[id] = Math.min(100, busy[id] + 9 + Math.round(Math.random() * 12));
        if (busy[id] >= 100) { delete busy[id]; if (!S.installed.includes(id)) S.installed.push(id); save(); drawHome(); draw(); notify({ app: "store", title: "Store", text: APPS[id].n + " installed. It's on your home screen.", go: () => openApp(id) }); return; }
        draw(); setTimeout(step, 180);
      };
      setTimeout(step, 250);
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const tb = t.closest("[data-st-tab]"); if (tb) { tab = tb.dataset.stTab; draw(); return; }
      const ins = t.closest("[data-st-install]"); if (ins) { if (!online()) { toast("No internet connection"); return; } install(ins.dataset.stInstall); return; }
      const op = t.closest("[data-st-open]"); if (op) { const id = op.dataset.stOpen; if (id.startsWith("site:")) openApp("browser", { site: id.slice(5) }); else openApp(id); return; }
      const dt = t.closest("[data-st-detail]"); if (dt) { detail = dt.dataset.stDetail; draw(); }
    });
    draw();
    return { back: () => { if (detail) { detail = null; draw(); return true; } return false; }, show: draw };
  };

  /* ---------- Settings ---------- */
  RUN.settings = (el, arg0) => {
    let page = (arg0 && arg0.page) || null, taps = 0;
    const sw = (k, on, label, sub) => `<button type="button" class="dset__row" data-set-tog="${k}"><span class="dset__tx"><b>${label}</b>${sub ? `<small>${sub}</small>` : ""}</span><span class="dswitch${on ? " is-on" : ""}" aria-hidden="true"></span></button>`;
    const row = (p, i, label, sub) => `<button type="button" class="dset__row" data-set-page="${p}"><span class="dset__ic">${ic(i)}</span><span class="dset__tx"><b>${label}</b><small>${sub}</small></span></button>`;
    const info = (k, v) => `<div class="dset__info"><small>${k}</small><b>${v}</b></div>`;
    const draw = () => {
      const conn = navigator.connection || {};
      if (!page) {
        el.innerHTML = bar("Settings") + `<div class="dapp-body"><ul class="dset">
          ${row("net", "wifi", "Network & internet", S.air ? "Airplane mode" : S.wifi ? "Wi-Fi on" : "Wi-Fi off")}
          ${row("dev", "bluetooth", "Connected devices", S.bt ? "Bluetooth on" : "Bluetooth off")}
          ${row("display", "sun", "Display", (S.theme === "dark" ? "Dark" : "Light") + " theme, brightness, wallpaper")}
          ${row("sound", "volume-2", "Sound", "Volume " + S.vol + "%" + (S.dnd ? ", Do not disturb" : ""))}
          ${row("battery", "battery-medium", "Battery", battery.level + "%" + (battery.charging ? ", charging" : ""))}
          ${row("apps", "layout-grid", "Apps", Object.keys(APPS).filter(isInstalled).length + " apps")}
          ${row("system", "keyboard", "System", "Keyboard, vibration, assistant voice")}
          ${row("about", "smartphone", "About phone", "AK Phone")}
        </ul></div>`;
      } else if (page === "net") {
        el.innerHTML = bar("Network & internet") + `<div class="dapp-body"><ul class="dset">${sw("wifi", S.wifi && !S.air, "Wi-Fi", "Uses your real internet connection")}${sw("air", S.air, "Airplane mode", "Turns off the internet inside this phone")}</ul>
          <h5 class="dset__h">Your real connection</h5>${info("Status", navigator.onLine ? "Online" : "Offline")}${conn.effectiveType ? info("Network type", conn.effectiveType.toUpperCase()) : ""}${conn.downlink ? info("Speed estimate", conn.downlink + " Mbps") : ""}</div>`;
      } else if (page === "dev") {
        el.innerHTML = bar("Connected devices") + `<div class="dapp-body"><ul class="dset">${sw("bt", S.bt && !S.air, "Bluetooth", S.air ? "Off in Airplane mode" : "Visible as AK Phone")}</ul></div>`;
      } else if (page === "display") {
        el.innerHTML = bar("Display") + `<div class="dapp-body"><ul class="dset">${sw("theme", S.theme === "dark", "Dark theme", "Apps, menus and quick settings")}</ul>
          <h5 class="dset__h">Brightness</h5><input class="dset__range" type="range" min="25" max="100" value="${S.bright}" data-set-range="bright" aria-label="Brightness">
          <h5 class="dset__h">Wallpaper</h5><div class="dset__walls">${[0, 1, 2, 3].map((w) => `<button type="button" class="dset__wall${S.wall === w ? " is-on" : ""}" data-set-wall="${w}" aria-label="Wallpaper ${w + 1}"><i data-wall="${w}"></i></button>`).join("")}</div></div>`;
      } else if (page === "sound") {
        el.innerHTML = bar("Sound") + `<div class="dapp-body"><h5 class="dset__h">Media and key volume</h5><input class="dset__range" type="range" min="0" max="100" step="10" value="${S.vol}" data-set-range="vol" aria-label="Volume">
          <ul class="dset">${sw("dnd", S.dnd, "Do not disturb", "Hide pop-up notifications")}</ul></div>`;
      } else if (page === "system") {
        el.innerHTML = bar("System") + `<div class="dapp-body"><ul class="dset">${sw("kb", S.kb, "On-screen keyboard", "Shows when you type inside the phone")}${sw("vib", S.vib, "Vibration", navigator.vibrate ? "Taps and notifications vibrate your real phone" : "Your device doesn't support vibration here")}${sw("speak", S.speak, "Assistant voice", "The Assistant reads answers out loud")}</ul></div>`;
      } else if (page === "battery") {
        el.innerHTML = bar("Battery") + `<div class="dapp-body"><div class="dset__bat"><b>${battery.level}%</b><span class="dset__batbar"><i style="width:${battery.level}%"></i></span><small>${battery.charging ? "Charging" : "Not charging"} · read from your device</small></div></div>`;
      } else if (page === "apps") {
        el.innerHTML = bar("Apps") + `<div class="dapp-body"><ul class="dset">${Object.keys(APPS).filter(isInstalled).sort((a, b) => APPS[a].n.localeCompare(APPS[b].n)).map((id) => `<li class="dset__app"><span class="dapp__ic" style="--c:${APPS[id].c}${APPS[id].f ? ";--f:" + APPS[id].f : ""}">${ic(APPS[id].i)}</span><span class="dset__tx"><b>${APPS[id].n}</b><small>${APPS[id].game ? "Installed from Store" : "System app"}</small></span>${APPS[id].game ? `<button type="button" class="dset__un" data-set-un="${id}">Uninstall</button>` : ""}</li>`).join("")}</ul></div>`;
      } else if (page === "about") {
        el.innerHTML = bar("About phone") + `<div class="dapp-body">
          <div class="dset__hero">${ic("smartphone")}<b>AK Phone</b><small>A phone simulator built in HTML, CSS and JavaScript by Anek Kumar</small></div>
          ${info("Software", "Android-style interface, version 1.0")}${info("Screen", "360 × 780")}${info("Apps", Object.keys(APPS).filter(isInstalled).length + " installed")}
          ${info("Your browser language", navigator.language || "-")}
          <button type="button" class="dset__info dset__build" data-set-build><small>Build number</small><b>AK1.2026.11</b></button>
          <button type="button" class="dset__reset" data-set-reset>Reset phone</button></div>`;
      }
      icons();
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const p = t.closest("[data-set-page]"); if (p) { page = p.dataset.setPage; draw(); return; }
      const tg = t.closest("[data-set-tog]"); if (tg) { toggleTile(tg.dataset.setTog); draw(); return; }
      const w = t.closest("[data-set-wall]"); if (w) { S.wall = +w.dataset.setWall; save(); applyState(); draw(); return; }
      const un = t.closest("[data-set-un]"); if (un) { const id = un.dataset.setUn; closeApp(id); S.installed = S.installed.filter((x) => x !== id); save(); drawHome(); toast(APPS[id].n + " uninstalled"); draw(); return; }
      if (t.closest("[data-set-build]")) { if (S.dev) { toast("No need, you are already a developer."); return; } taps++; if (taps >= 7) { S.dev = true; save(); toast("You are now a developer!"); } else if (taps >= 3) toast("You are now " + (7 - taps) + " steps away from being a developer."); return; }
      if (t.closest("[data-set-reset]")) { try { localStorage.removeItem(KEY); } catch (er) {} toast("Phone reset"); setTimeout(() => location.reload(), 700); }
    });
    el.addEventListener("input", (e) => { const r = e.target.closest("[data-set-range]"); if (!r) return; S[r.dataset.setRange] = +r.value; save(); applyState(); if (r.dataset.setRange === "vol") showVol(); });
    draw();
    return { arg: (a) => { if (a && a.page) { page = a.page; draw(); } }, back: () => { if (page) { page = null; draw(); return true; } return false; }, show: draw };
  };

  /* ---------- Phone ---------- */
  RUN.phone = (el) => {
    let tab = "keys", num = "", calling = false;
    const KEYS = [["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"], ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"], ["*", ""], ["0", "+"], ["#", ""]];
    const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], "*": [941, 1209], 0: [941, 1336], "#": [941, 1477] };
    const draw = () => {
      if (calling) {
        el.innerHTML = `<div class="dcall"><span class="dcall__av">${num === "+91 95188 48804" ? "AK" : ic("user")}</span><b>${num === "+91 95188 48804" ? "Anek Kumar" : esc(num)}</b><small>Calling… (simulated)</small>
          <a class="dcall__real" href="tel:${esc(num.replace(/\s/g, ""))}">${ic("phone-outgoing")}Call for real from your device</a>
          <button type="button" class="dcall__end" data-ph-end aria-label="End call">${ic("phone-off")}</button></div>`;
      } else if (tab === "keys") {
        el.innerHTML = `<div class="dapp-body dph"><div class="dph__num">${esc(num) || "&nbsp;"}</div>
          <div class="dph__keys">${KEYS.map((k) => `<button type="button" data-ph-key="${k[0]}"><b>${k[0]}</b><small>${k[1]}</small></button>`).join("")}</div>
          <div class="dph__row"><span></span><button type="button" class="dph__call" data-ph-call aria-label="Call">${ic("phone")}</button><button type="button" class="dph__del" data-ph-del aria-label="Delete">${ic("delete")}</button></div></div>` + tabs();
      } else {
        el.innerHTML = `<div class="dapp-body"><h4 class="dapp-h">Contacts</h4><div class="dct"><span class="dct__av">AK</span><b>Anek Kumar</b><small>Full Stack Developer &amp; Digital Marketer · Noida</small>
          <div class="dct__acts"><a href="tel:+919518848804">${ic("phone")}Call</a><a href="https://wa.me/919518848804" target="_blank" rel="noopener">${ic("message-circle")}WhatsApp</a><a href="mailto:anekkumar9518@gmail.com">${ic("mail")}Email</a></div>
          <div class="dct__info"><small>Mobile</small><b>+91 95188 48804</b><small>Email</small><b>anekkumar9518@gmail.com</b></div></div></div>` + tabs();
      }
      icons();
    };
    const tabs = () => `<nav class="dtabs"><button type="button" data-ph-tab="keys" class="${tab === "keys" ? "is-on" : ""}">${ic("grid-3x3")}<span>Keypad</span></button><button type="button" data-ph-tab="contacts" class="${tab === "contacts" ? "is-on" : ""}">${ic("users")}<span>Contacts</span></button></nav>`;
    el.addEventListener("click", (e) => {
      const t = e.target;
      const k = t.closest("[data-ph-key]"); if (k) { if (num.length < 16) num += k.dataset.phKey; const f = DTMF[k.dataset.phKey]; beep(f[0], f[1], 120); draw(); return; }
      if (t.closest("[data-ph-del]")) { num = num.slice(0, -1); draw(); return; }
      if (t.closest("[data-ph-call]")) { if (!num) { num = "+91 95188 48804"; } calling = true; draw(); return; }
      if (t.closest("[data-ph-end]")) { calling = false; draw(); return; }
      const tb = t.closest("[data-ph-tab]"); if (tb) { tab = tb.dataset.phTab; draw(); }
    });
    draw();
    return { back: () => { if (calling) { calling = false; draw(); return true; } return false; } };
  };

  /* ---------- Messages ---------- */
  RUN.messages = (el) => {
    const msgs = [
      { me: false, t: "Hi! I'm Anek." },
      { me: false, t: "I build websites, then I bring them customers with SEO and Meta ads." },
      { me: false, t: "Type a message below. Sending it opens WhatsApp, so it reaches my real phone." },
    ];
    let open = false;
    const draw = () => {
      if (!open) {
        el.innerHTML = bar("Messages") + `<div class="dapp-body"><button type="button" class="dmsg__thread" data-msg-open><span class="dct__av">AK</span><span class="dset__tx"><b>Anek Kumar</b><small>${esc(msgs[msgs.length - 1].t)}</small></span></button></div>`;
      } else {
        el.innerHTML = bar("Anek Kumar", `<a class="dbar__act" href="tel:+919518848804" aria-label="Call">${ic("phone")}</a>`) + `<div class="dapp-body dmsg"><div class="dmsg__list">${msgs.map((m) => `<p class="dmsg__b${m.me ? " is-me" : ""}">${esc(m.t)}</p>`).join("")}</div></div>
          <form class="dmsg__form" data-msg-form><input name="m" placeholder="Text message" aria-label="Text message" autocomplete="off"><button type="submit" aria-label="Send">${ic("send-horizontal")}</button></form>`;
        const list = qs(".dmsg", el); list.scrollTop = list.scrollHeight;
      }
      icons();
    };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-msg-open]")) { open = true; draw(); } });
    el.addEventListener("submit", (e) => {
      e.preventDefault(); const v = e.target.m.value.trim(); if (!v) return;
      msgs.push({ me: true, t: v }); draw();
      setTimeout(() => { msgs.push({ me: false, t: "Opening WhatsApp so this reaches me for real…" }); draw(); window.open("https://wa.me/919518848804?text=" + encodeURIComponent(v), "_blank", "noopener"); }, 600);
    });
    draw();
    return { back: () => { if (open) { open = false; draw(); return true; } return false; } };
  };

  /* ---------- Camera + Gallery ---------- */
  const photos = []; // session only, never uploaded
  RUN.camera = (el) => {
    let stream = null, facing = "user";
    el.innerHTML = `<div class="dcam"><video playsinline muted></video><div class="dcam__ask">${ic("camera")}<b>Use your camera?</b><span>Photos stay in this browser tab. Nothing is uploaded.</span><button type="button" data-cam-on>Turn on camera</button></div>
      <div class="dcam__bar"><button type="button" class="dcam__thumb" data-cam-gal aria-label="Open Gallery"></button><button type="button" class="dcam__shut" data-cam-shot aria-label="Take photo"></button><button type="button" class="dcam__flip" data-cam-flip aria-label="Switch camera">${ic("switch-camera")}</button></div><div class="dcam__flash"></div></div>`;
    const video = qs("video", el), ask = qs(".dcam__ask", el);
    const start = async () => {
      stop();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { qs("span", ask).textContent = "This browser can't use a camera here."; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        video.srcObject = stream; await video.play(); ask.hidden = true; el.classList.toggle("is-front", facing === "user");
      } catch (err) { ask.hidden = false; qs("span", ask).textContent = "Camera blocked or not found. You can allow it from the address bar."; }
    };
    const stop = () => { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } video.srcObject = null; };
    el.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest("[data-cam-on]")) start();
      else if (t.closest("[data-cam-flip]")) { facing = facing === "user" ? "environment" : "user"; if (stream) start(); }
      else if (t.closest("[data-cam-gal]")) openApp("gallery", { tab: "photos" });
      else if (t.closest("[data-cam-shot]")) {
        if (!stream) { toast("Turn on the camera first"); return; }
        const c = document.createElement("canvas"); c.width = video.videoWidth; c.height = video.videoHeight;
        const x = c.getContext("2d"); if (facing === "user") { x.translate(c.width, 0); x.scale(-1, 1); } x.drawImage(video, 0, 0);
        const url = c.toDataURL("image/jpeg", 0.85); photos.unshift(url);
        qs(".dcam__thumb", el).style.backgroundImage = `url(${url})`;
        const f = qs(".dcam__flash", el); f.classList.remove("is-on"); void f.offsetWidth; f.classList.add("is-on"); beep(1200, 0, 40);
      }
    });
    return { hide: stop, destroy: stop };
  };
  const WORK = ["shubharambh", "matrixacres", "visionwave", "lmc", "harisabzi", "ezzy", "allfiles"];
  RUN.gallery = (el, arg) => {
    let tab = (arg && arg.tab) || "work", view = -1;
    const list = () => (tab === "photos" ? photos : WORK.flatMap((w) => [`assets/img/projects/${w}-m.webp`, `assets/img/projects/${w}.webp`]));
    const draw = () => {
      const L = list();
      if (view >= 0 && L[view]) {
        el.innerHTML = `<div class="dgal__view"><img src="${L[view]}" alt="Photo ${view + 1}"><div class="dgal__nav"><button type="button" data-gal-step="-1" aria-label="Previous">${ic("chevron-left")}</button><span>${view + 1} / ${L.length}</span><button type="button" data-gal-step="1" aria-label="Next">${ic("chevron-right")}</button></div></div>`;
      } else {
        el.innerHTML = bar("Gallery") + `<div class="dst__tabs"><button type="button" data-gal-tab="work" class="${tab === "work" ? "is-on" : ""}">My work</button><button type="button" data-gal-tab="photos" class="${tab === "photos" ? "is-on" : ""}">Photos</button></div>
          <div class="dapp-body">${L.length ? `<div class="dgal">${L.map((s, i) => `<button type="button" data-gal-i="${i}"><img src="${s}" alt="" loading="lazy"></button>`).join("")}</div>` : `<p class="dempty">${ic("camera")}No photos yet. Take one with Camera, draw in Paint, or use the Screenshot tile.</p>`}</div>`;
      }
      icons();
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const tb = t.closest("[data-gal-tab]"); if (tb) { tab = tb.dataset.galTab; view = -1; draw(); return; }
      const g = t.closest("[data-gal-i]"); if (g) { view = +g.dataset.galI; draw(); return; }
      const s = t.closest("[data-gal-step]"); if (s) { const L = list(); view = (view + +s.dataset.galStep + L.length) % L.length; draw(); }
    });
    draw();
    return { arg: (a) => { if (a && a.tab) { tab = a.tab; view = -1; draw(); } }, back: () => { if (view >= 0) { view = -1; draw(); return true; } return false; }, show: draw };
  };

  /* ---------- Maps ---------- */
  RUN.maps = (el) => {
    let q = "Noida, Uttar Pradesh";
    el.innerHTML = `<form class="dmap__bar" data-map-form>${ic("search")}<input name="q" placeholder="Search here" aria-label="Search places" autocomplete="off"></form><div class="dmap"><iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="dbr__off" hidden></div></div>`;
    const fr = qs("iframe", el), off = qs(".dbr__off", el);
    const load = () => {
      if (!online()) { fr.hidden = true; off.innerHTML = offline("Maps"); off.hidden = false; icons(); return; }
      off.hidden = true; fr.hidden = false;
      const src = "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&z=13&output=embed";
      if (fr.getAttribute("src") !== src) fr.src = src;
    };
    el.addEventListener("submit", (e) => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) { q = v; load(); e.target.q.blur(); } });
    listeners.add(() => { if (running.has("maps")) load(); });
    load();
    return {};
  };

  /* ---------- Weather (live, Open-Meteo, no key) ---------- */
  RUN.weather = (el) => {
    const WMO = { 0: ["Clear", "sun"], 1: ["Mostly clear", "sun"], 2: ["Partly cloudy", "cloud-sun"], 3: ["Cloudy", "cloud"], 45: ["Fog", "cloud-fog"], 48: ["Fog", "cloud-fog"], 51: ["Drizzle", "cloud-drizzle"], 53: ["Drizzle", "cloud-drizzle"], 55: ["Drizzle", "cloud-drizzle"], 61: ["Rain", "cloud-rain"], 63: ["Rain", "cloud-rain"], 65: ["Heavy rain", "cloud-rain"], 71: ["Snow", "snowflake"], 80: ["Showers", "cloud-rain"], 81: ["Showers", "cloud-rain"], 82: ["Heavy showers", "cloud-rain"], 95: ["Thunderstorm", "cloud-lightning"], 96: ["Thunderstorm", "cloud-lightning"], 99: ["Thunderstorm", "cloud-lightning"] };
    const w = (c) => WMO[c] || ["-", "cloud"];
    let data = null, err = false;
    const draw = () => {
      if (!online()) { el.innerHTML = bar("Weather") + `<div class="dapp-body">${offline("Weather")}</div>`; icons(); return; }
      if (!data) { el.innerHTML = bar("Weather") + `<div class="dapp-body"><p class="dempty">${err ? ic("cloud-off") + "Couldn't load the weather. " + `<button type="button" data-wx-retry>Try again</button>` : ic("loader") + "Loading live weather for Noida…"}</p></div>`; icons(); return; }
      const c = data.current, d = data.daily;
      el.innerHTML = bar("Weather") + `<div class="dapp-body dwx"><p class="dwx__place">${ic("map-pin")}Noida</p>
        <div class="dwx__now">${ic(w(c.weather_code)[1])}<b>${Math.round(c.temperature_2m)}°</b></div><p class="dwx__cond">${w(c.weather_code)[0]} · feels ${Math.round(c.apparent_temperature)}°</p>
        <div class="dwx__meta"><span>${ic("droplets")}${c.relative_humidity_2m}%</span><span>${ic("wind")}${Math.round(c.wind_speed_10m)} km/h</span></div>
        <ul class="dwx__days">${d.time.map((t, i) => `<li><span>${i === 0 ? "Today" : new Date(t).toLocaleDateString("en-US", { weekday: "short" })}</span>${ic(w(d.weather_code[i])[1])}<b>${Math.round(d.temperature_2m_max[i])}°</b><small>${Math.round(d.temperature_2m_min[i])}°</small></li>`).join("")}</ul>
        <p class="dwx__src">Live data from Open-Meteo</p></div>`;
      icons();
    };
    const load = () => {
      if (!online()) return draw();
      err = false; draw();
      fetch("https://api.open-meteo.com/v1/forecast?latitude=28.5355&longitude=77.391&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=6")
        .then((r) => r.json()).then((j) => { data = j; draw(); const g = qs("#dGlanceWx"); if (g) { g.innerHTML = ic(w(j.current.weather_code)[1]) + Math.round(j.current.temperature_2m) + "° Noida · #1 on Google for 56 keywords"; icons(); } })
        .catch(() => { err = true; draw(); });
    };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-wx-retry]")) load(); });
    listeners.add(() => { if (running.has("weather")) { if (!data) load(); else draw(); } });
    load();
    return {};
  };

  /* ---------- Clock ---------- */
  RUN.clock = (el) => {
    let tab = "clock", sw = { run: false, t0: 0, acc: 0, laps: [] }, tm = { left: 300, run: false, end: 0 }, raf = 0, iv = 0;
    const fmt = (ms) => { const s = Math.floor(ms / 1000); return pad(Math.floor(s / 60)) + ":" + pad(s % 60) + "." + pad(Math.floor((ms % 1000) / 10)); };
    const zone = (tz, label) => { const t = new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }); return `<li><span><b>${label}</b><small>${tz.split("/")[1].replace("_", " ")}</small></span><strong>${t}</strong></li>`; };
    const draw = () => {
      let body = "";
      if (tab === "clock") {
        const n = new Date();
        body = `<div class="dclk__big">${n.getHours()}:${pad(n.getMinutes())}<small>:${pad(n.getSeconds())}</small></div><p class="dclk__date">${n.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <ul class="dclk__zones">${zone("Asia/Kolkata", "Noida")}${zone("Asia/Dubai", "Dubai")}${zone("Europe/London", "London")}${zone("America/New_York", "New York")}</ul>`;
      } else if (tab === "sw") {
        const ms = sw.acc + (sw.run ? performance.now() - sw.t0 : 0);
        body = `<div class="dclk__big dclk__big--sw">${fmt(ms)}</div><div class="dclk__btns"><button type="button" data-sw="${sw.run ? "lap" : "reset"}">${sw.run ? "Lap" : "Reset"}</button><button type="button" class="is-main" data-sw="${sw.run ? "stop" : "start"}">${sw.run ? "Stop" : "Start"}</button></div>
          <ol class="dclk__laps">${sw.laps.map((l, i) => `<li><span>Lap ${sw.laps.length - i}</span><b>${fmt(l)}</b></li>`).join("")}</ol>`;
      } else {
        const left = tm.run ? Math.max(0, Math.ceil((tm.end - Date.now()) / 1000)) : tm.left;
        body = `<div class="dclk__big">${pad(Math.floor(left / 60))}:${pad(left % 60)}</div>
          <div class="dclk__presets">${[1, 3, 5, 10].map((m) => `<button type="button" data-tm-set="${m}">${m} min</button>`).join("")}</div>
          <div class="dclk__btns"><button type="button" data-tm="reset">Reset</button><button type="button" class="is-main" data-tm="${tm.run ? "pause" : "start"}">${tm.run ? "Pause" : "Start"}</button></div>`;
      }
      el.innerHTML = `<div class="dapp-body dclk">${body}</div><nav class="dtabs"><button type="button" data-clk-tab="clock" class="${tab === "clock" ? "is-on" : ""}">${ic("clock")}<span>Clock</span></button><button type="button" data-clk-tab="sw" class="${tab === "sw" ? "is-on" : ""}">${ic("timer")}<span>Stopwatch</span></button><button type="button" data-clk-tab="tm" class="${tab === "tm" ? "is-on" : ""}">${ic("hourglass")}<span>Timer</span></button></nav>`;
      icons();
    };
    const loop = () => {
      if (tm.run && Date.now() >= tm.end) { tm.run = false; tm.left = 0; beep(880, 0, 300); setTimeout(() => beep(880, 0, 300), 450); notify({ app: "clock", icon: "hourglass", title: "Timer", text: "Time's up!", go: () => openApp("clock") }); }
      if (!el.hidden && cur === "clock") { if (tab === "sw" && sw.run) { const big = qs(".dclk__big", el); if (big) big.textContent = fmt(sw.acc + performance.now() - sw.t0); } }
      raf = requestAnimationFrame(loop);
    };
    iv = setInterval(() => { if (cur === "clock" && !el.hidden && (tab === "clock" || tab === "tm")) draw(); }, 1000);
    el.addEventListener("click", (e) => {
      const t = e.target;
      const tb = t.closest("[data-clk-tab]"); if (tb) { tab = tb.dataset.clkTab; draw(); return; }
      const s = t.closest("[data-sw]");
      if (s) { const a = s.dataset.sw; if (a === "start") { sw.run = true; sw.t0 = performance.now(); } else if (a === "stop") { sw.run = false; sw.acc += performance.now() - sw.t0; } else if (a === "lap") sw.laps.unshift(sw.acc + performance.now() - sw.t0); else { sw.acc = 0; sw.laps = []; } draw(); return; }
      const ts = t.closest("[data-tm-set]"); if (ts) { tm.run = false; tm.left = +ts.dataset.tmSet * 60; draw(); return; }
      const tt = t.closest("[data-tm]");
      if (tt) { const a = tt.dataset.tm; if (a === "start" && tm.left > 0) { tm.run = true; tm.end = Date.now() + tm.left * 1000; } else if (a === "pause") { tm.left = Math.max(0, Math.ceil((tm.end - Date.now()) / 1000)); tm.run = false; } else if (a === "reset") { tm.run = false; tm.left = 300; } draw(); }
    });
    draw(); loop();
    return { destroy: () => { cancelAnimationFrame(raf); clearInterval(iv); }, show: draw };
  };

  /* ---------- Calculator (no eval) ---------- */
  RUN.calc = (el) => {
    let expr = "", result = "";
    const K = ["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "back", "0", ".", "="];
    const evaluate = (s) => {
      const toks = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").match(/\d*\.?\d+%?|[()+\-*/]/g);
      if (!toks) return "";
      let i = 0;
      const num = () => { const t = toks[i++]; if (t === "(") { const v = add(); i++; return v; } if (t === "-") return -num(); if (t === undefined) throw 0; return t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t); };
      const mul = () => { let v = num(); while (toks[i] === "*" || toks[i] === "/") { const o = toks[i++]; const r = num(); v = o === "*" ? v * r : v / r; } return v; };
      const add = () => { let v = mul(); while (toks[i] === "+" || toks[i] === "-") { const o = toks[i++]; const r = mul(); v = o === "+" ? v + r : v - r; } return v; };
      const v = add();
      if (!isFinite(v)) return "Can't divide by 0";
      return String(+v.toPrecision(12));
    };
    const draw = () => {
      el.innerHTML = `<div class="dcalc"><div class="dcalc__out"><span>${esc(expr) || "0"}</span><b>${esc(result)}</b></div><div class="dcalc__keys">${K.map((k) => k === "back" ? `<button type="button" data-ck="back" class="is-fn dcalc__bk" aria-label="Backspace">${ic("delete")}</button>` : `<button type="button" data-ck="${k}" class="${/[÷×−+=]/.test(k) ? "is-op" : k === "C" ? "is-fn" : ""}">${k}</button>`).join("")}</div></div>`;
      icons();
    };
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ck]"); if (!b) return;
      const k = b.dataset.ck; beep(0, 0, 0);
      if (k === "C") { expr = ""; result = ""; }
      else if (k === "back") expr = expr.slice(0, -1);
      else if (k === "=") { try { const r = evaluate(expr); if (r !== "") { expr = r.startsWith("C") ? "" : r; result = r.startsWith("C") ? r : ""; } } catch (er) { result = "Error"; } }
      else { expr += k; }
      if (k !== "=" && k !== "C") { try { const r = evaluate(expr); result = r && r !== expr ? "= " + r : ""; } catch (er) { result = ""; } }
      draw();
    });
    draw();
    return {};
  };

  /* ---------- Calendar ---------- */
  RUN.calendar = (el) => {
    const now = new Date(); let y = now.getFullYear(), m = now.getMonth();
    const draw = () => {
      const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), start = (first.getDay() + 6) % 7;
      let cells = ""; for (let i = 0; i < start; i++) cells += "<span></span>";
      for (let d = 1; d <= days; d++) { const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear(); cells += `<span class="${today ? "is-today" : ""}">${d}</span>`; }
      el.innerHTML = bar(first.toLocaleDateString("en-GB", { month: "long", year: "numeric" }), `<button type="button" class="dbar__act" data-cal="-1" aria-label="Previous month">${ic("chevron-left")}</button><button type="button" class="dbar__act" data-cal="1" aria-label="Next month">${ic("chevron-right")}</button>`)
        + `<div class="dapp-body"><div class="dcal">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<b>${d}</b>`).join("")}${cells}</div>
        <div class="dcal__ev"><small>Today</small><p>${ic("search")}Google rankings checked: 56 keywords at #1</p><p>${ic("handshake")}Site meetings: about 1 per 10 leads</p></div></div>`;
      icons();
    };
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-cal]"); if (!b) return; m += +b.dataset.cal; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw(); });
    draw();
    return {};
  };

  /* ---------- Notes (saved in this browser) ---------- */
  RUN.notes = (el) => {
    let edit = null;
    const draw = () => {
      if (edit) {
        const n = S.notes.find((x) => x.id === edit) || { t: "", b: "" };
        el.innerHTML = bar("Note", `<button type="button" class="dbar__act" data-nt-del aria-label="Delete note">${ic("trash-2")}</button>`) + `<div class="dapp-body dnt__ed"><input data-nt-t value="${esc(n.t)}" placeholder="Title" aria-label="Title"><textarea data-nt-b placeholder="Note" aria-label="Note">${esc(n.b)}</textarea></div>`;
      } else {
        el.innerHTML = bar("Notes") + `<div class="dapp-body">${S.notes.length ? `<div class="dnt">${S.notes.map((n) => `<button type="button" data-nt="${n.id}"><b>${esc(n.t || "Untitled")}</b><span>${esc(n.b)}</span></button>`).join("")}</div>` : `<p class="dempty">${ic("notebook-pen")}No notes yet</p>`}</div><button type="button" class="dfab" data-nt-new aria-label="New note">${ic("plus")}</button>`;
      }
      icons();
    };
    el.addEventListener("click", (e) => {
      const t = e.target;
      const n = t.closest("[data-nt]"); if (n) { edit = +n.dataset.nt; draw(); return; }
      if (t.closest("[data-nt-new]")) { const id = Date.now(); S.notes.unshift({ id, t: "", b: "" }); save(); edit = id; draw(); qs("[data-nt-t]", el).focus(); return; }
      if (t.closest("[data-nt-del]")) { S.notes = S.notes.filter((x) => x.id !== edit); save(); edit = null; draw(); toast("Note deleted"); }
    });
    el.addEventListener("input", (e) => { const n = S.notes.find((x) => x.id === edit); if (!n) return; if (e.target.matches("[data-nt-t]")) n.t = e.target.value; if (e.target.matches("[data-nt-b]")) n.b = e.target.value; save(); });
    draw();
    return { back: () => { if (edit) { const n = S.notes.find((x) => x.id === edit); if (n && !n.t && !n.b) S.notes = S.notes.filter((x) => x !== n); save(); edit = null; draw(); return true; } return false; } };
  };

  /* ---------- Files ---------- */
  RUN.files = (el) => {
    let dir = null;
    const draw = () => {
      if (dir === "docs") {
        el.innerHTML = bar("Documents") + `<div class="dapp-body"><a class="dfile" href="assets/cv/Anek-Kumar-CV.pdf" target="_blank" rel="noopener">${ic("file-text")}<span><b>Anek-Kumar-CV.pdf</b><small>PDF · 2 pages · opens in a new tab</small></span></a></div>`;
      } else if (dir === "dl") {
        el.innerHTML = bar("Downloads") + `<div class="dapp-body"><p class="dempty">${ic("download")}No downloads</p></div>`;
      } else {
        el.innerHTML = bar("Files") + `<div class="dapp-body"><div class="dfiles__store"><small>Storage this site may use in your browser</small><b data-quota>Checking…</b><span class="dset__batbar"><i data-quota-bar style="width:2%"></i></span></div>
          <ul class="dset">
            <li><button type="button" class="dset__row" data-dir="docs"><span class="dset__ic">${ic("file-text")}</span><span class="dset__tx"><b>Documents</b><small>1 file</small></span></button></li>
            <li><button type="button" class="dset__row" data-open-gal><span class="dset__ic">${ic("image")}</span><span class="dset__tx"><b>Images</b><small>${WORK.length * 2 + photos.length} images</small></span></button></li>
            <li><button type="button" class="dset__row" data-dir="dl"><span class="dset__ic">${ic("download")}</span><span class="dset__tx"><b>Downloads</b><small>Empty</small></span></button></li>
          </ul></div>`;
        if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then((q) => {
          const mb = (b) => b > 1e9 ? (b / 1e9).toFixed(1) + " GB" : (b / 1e6).toFixed(1) + " MB";
          const a = qs("[data-quota]", el), bar2 = qs("[data-quota-bar]", el);
          if (a) a.textContent = mb(q.usage || 0) + " used of " + mb(q.quota || 0);
          if (bar2) bar2.style.width = Math.max(2, ((q.usage || 0) / (q.quota || 1)) * 100) + "%";
        }).catch(() => {});
        else { const a = qs("[data-quota]", el); if (a) a.textContent = "Not available in this browser"; }
      }
      icons();
    };
    el.addEventListener("click", (e) => { const d = e.target.closest("[data-dir]"); if (d) { dir = d.dataset.dir; draw(); return; } if (e.target.closest("[data-open-gal]")) openApp("gallery", { tab: "work" }); });
    draw();
    return { back: () => { if (dir) { dir = null; draw(); return true; } return false; } };
  };

  /* ---------- Games ---------- */
  const swipeDir = (el, fn) => {
    let p = null;
    el.addEventListener("pointerdown", (e) => { p = [e.clientX, e.clientY]; });
    el.addEventListener("pointerup", (e) => { if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up")); });
  };
  const keyDirs = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };

  RUN.g2048 = (el) => {
    let g, score, over;
    const reset = () => { g = Array(16).fill(0); score = 0; over = false; add(); add(); draw(); };
    const add = () => { const e = g.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); if (e.length) g[e[Math.floor(Math.random() * e.length)]] = Math.random() < 0.9 ? 2 : 4; };
    const line = (a) => { const f = a.filter(Boolean); for (let i = 0; i < f.length - 1; i++) if (f[i] === f[i + 1]) { f[i] *= 2; score += f[i]; f.splice(i + 1, 1); } while (f.length < 4) f.push(0); return f; };
    const move = (d) => {
      if (over) return;
      const before = g.join();
      for (let r = 0; r < 4; r++) {
        const idx = [0, 1, 2, 3].map((c) => (d === "left" ? r * 4 + c : d === "right" ? r * 4 + 3 - c : d === "up" ? c * 4 + r : (3 - c) * 4 + r));
        const out = line(idx.map((i) => g[i])); idx.forEach((i, k) => { g[i] = out[k]; });
      }
      if (g.join() !== before) { add(); beep(440, 0, 30); }
      if (score > S.best2048) { S.best2048 = score; save(); }
      over = !g.includes(0) && ![0, 1, 2, 3].some((r) => [0, 1, 2].some((c) => g[r * 4 + c] === g[r * 4 + c + 1] || g[c * 4 + r] === g[(c + 1) * 4 + r]));
      draw();
    };
    const draw = () => {
      el.innerHTML = bar("2048", `<button type="button" class="dbar__act" data-g-new aria-label="New game">${ic("rotate-ccw")}</button>`) + `<div class="dapp-body dg"><div class="dg__score"><span><small>Score</small><b>${score}</b></span><span><small>Best</small><b>${S.best2048}</b></span></div>
        <div class="d2048" data-board>${g.map((v) => `<span class="t${v}">${v || ""}</span>`).join("")}</div>
        <p class="dg__hint">${over ? "No moves left. Tap ↻ to play again." : "Swipe on the board, or click the phone and use arrow keys."}</p></div>`;
      icons();
    };
    swipeDir(el, (d) => { if (cur === "g2048") move(d); });
    el.addEventListener("click", (e) => { if (e.target.closest("[data-g-new]")) reset(); });
    reset();
    return { key: (k) => { if (keyDirs[k]) { move(keyDirs[k]); return true; } } };
  };

  RUN.ttt = (el) => {
    let b, turn, msg, score = { you: 0, phone: 0, draw: 0 };
    const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const win = (bb) => { for (const l of L) if (bb[l[0]] && bb[l[0]] === bb[l[1]] && bb[l[0]] === bb[l[2]]) return bb[l[0]]; return bb.every(Boolean) ? "draw" : null; };
    const mm = (bb, me) => {
      const w = win(bb); if (w === "O") return { s: 1 }; if (w === "X") return { s: -1 }; if (w === "draw") return { s: 0 };
      let best = { s: me ? -2 : 2, i: -1 };
      bb.forEach((v, i) => { if (v) return; bb[i] = me ? "O" : "X"; const r = mm(bb, !me); bb[i] = ""; if (me ? r.s > best.s : r.s < best.s) best = { s: r.s, i }; });
      return best;
    };
    const reset = () => { b = Array(9).fill(""); turn = "X"; msg = "Your turn. You are X."; draw(); };
    const end = () => { const w = win(b); if (!w) return false; if (w === "X") { score.you++; msg = "You win!"; } else if (w === "O") { score.phone++; msg = "The phone wins."; } else { score.draw++; msg = "Draw. Nice defence."; } turn = null; return true; };
    const draw = () => {
      el.innerHTML = bar("Tic Tac Toe", `<button type="button" class="dbar__act" data-t-new aria-label="New game">${ic("rotate-ccw")}</button>`) + `<div class="dapp-body dg"><div class="dg__score"><span><small>You</small><b>${score.you}</b></span><span><small>Draws</small><b>${score.draw}</b></span><span><small>Phone</small><b>${score.phone}</b></span></div>
        <div class="dttt">${b.map((v, i) => `<button type="button" data-t="${i}" class="${v ? "is-" + v : ""}" aria-label="Square ${i + 1}">${v}</button>`).join("")}</div><p class="dg__hint">${msg}</p></div>`;
      icons();
    };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-t-new]")) { reset(); return; }
      const c = e.target.closest("[data-t]"); if (!c || turn !== "X" || b[+c.dataset.t]) return;
      b[+c.dataset.t] = "X"; beep(520, 0, 40);
      if (end()) return draw();
      turn = "O"; msg = "Phone is thinking…"; draw();
      setTimeout(() => { const m = b.filter(Boolean).length === 1 && !b[4] ? { i: 4 } : mm(b.slice(), true); b[m.i] = "O"; beep(392, 0, 40); if (!end()) { turn = "X"; msg = "Your turn."; } draw(); }, 350);
    });
    reset();
    return {};
  };

  RUN.snake = (el) => {
    const N = 16;
    let sn, dir, nd, food, run = false, sc = 0, best = 0, loopT = 0, speed = 150;
    el.innerHTML = bar("Snake") + `<div class="dapp-body dg"><div class="dg__score"><span><small>Score</small><b data-sc>0</b></span><span><small>Best</small><b data-best>0</b></span></div>
      <div class="dsnake" data-board><canvas width="320" height="320" aria-label="Snake board"></canvas><button type="button" class="dsnake__start" data-sn-start>Start</button></div>
      <div class="dpad"><button type="button" data-d="up" aria-label="Up">${ic("chevron-up")}</button><button type="button" data-d="left" aria-label="Left">${ic("chevron-left")}</button><button type="button" data-d="down" aria-label="Down">${ic("chevron-down")}</button><button type="button" data-d="right" aria-label="Right">${ic("chevron-right")}</button></div></div>`;
    const cv = qs("canvas", el), x = cv.getContext("2d"), C = 320 / N, startBtn = qs("[data-sn-start]", el);
    const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (sn.some((p) => p[0] === food[0] && p[1] === food[1])); };
    const paint = () => {
      x.fillStyle = "#14231a"; x.fillRect(0, 0, 320, 320);
      x.fillStyle = "#ff7a45"; x.beginPath(); x.arc(food[0] * C + C / 2, food[1] * C + C / 2, C / 2.6, 0, 7); x.fill();
      sn.forEach((p, i) => { x.fillStyle = i ? "#4be37a" : "#b6f5c8"; x.fillRect(p[0] * C + 1, p[1] * C + 1, C - 2, C - 2); });
    };
    const reset = () => { sn = [[8, 8], [7, 8], [6, 8]]; dir = nd = "right"; sc = 0; speed = 150; place(); paint(); qs("[data-sc]", el).textContent = 0; };
    const step = () => {
      dir = nd;
      const h = sn[0].slice(); if (dir === "up") h[1]--; if (dir === "down") h[1]++; if (dir === "left") h[0]--; if (dir === "right") h[0]++;
      if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || sn.some((p) => p[0] === h[0] && p[1] === h[1])) { run = false; startBtn.textContent = "Play again"; startBtn.hidden = false; beep(220, 0, 200); return; }
      sn.unshift(h);
      if (h[0] === food[0] && h[1] === food[1]) { sc++; best = Math.max(best, sc); qs("[data-sc]", el).textContent = sc; qs("[data-best]", el).textContent = best; place(); beep(880, 0, 40); speed = Math.max(70, speed - 4); } else sn.pop();
      paint(); loopT = setTimeout(step, speed);
    };
    const turn = (d) => { const opp = { up: "down", down: "up", left: "right", right: "left" }; if (run && d !== opp[dir]) nd = d; };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-sn-start]")) { reset(); run = true; startBtn.hidden = true; clearTimeout(loopT); loopT = setTimeout(step, speed); } const d = e.target.closest("[data-d]"); if (d) turn(d.dataset.d); });
    swipeDir(qs("[data-board]", el), turn);
    reset();
    const stop = () => { clearTimeout(loopT); if (run) { run = false; startBtn.textContent = "Resume"; startBtn.hidden = false; } };
    return { key: (k) => { if (keyDirs[k]) { turn(keyDirs[k]); return true; } }, hide: stop, destroy: () => clearTimeout(loopT) };
  };

  /* keyboard: arrow keys go to the open game while the phone has focus */
  /* keys go to the phone while it was the last thing the visitor touched */
  let phoneActive = false;
  document.addEventListener("pointerdown", (e) => { phoneActive = phone.contains(e.target); }, true);
  document.addEventListener("keydown", (e) => {
    if (!phoneActive || state !== "app") return;
    if (e.target.matches && e.target.matches("input, textarea, select")) return;
    const r = cur && running.get(cur);
    if (r && r.api.key && r.api.key(e.key)) e.preventDefault();
    if (e.key === "Escape") back();
  });

  /* ---------- on-screen keyboard ---------- */
  const kb = qs("#dKb");
  const coarse = matchMedia("(pointer: coarse)").matches;
  let kbT = null, kbShift = false, kbSym = false;
  const KB = {
    a: [[..."qwertyuiop"], [..."asdfghjkl"], ["SHIFT", ..."zxcvbnm", "BK"], ["SYM", ",", "SPACE", ".", "ENTER"]],
    s: [[..."1234567890"], ["@", "#", "₹", "_", "&", "-", "+", "(", ")", "/"], ["=", "*", '"', "'", ":", ";", "!", "?", "BK"], ["ABC", ",", "SPACE", ".", "ENTER"]],
  };
  const drawKb = () => {
    kb.innerHTML = KB[kbSym ? "s" : "a"].map((row) => `<div class="dkb__row">${row.map((k) => {
      if (k === "SHIFT") return `<button type="button" class="dkb__k dkb__k--fn${kbShift ? " is-on" : ""}" data-k="SHIFT" aria-label="Shift">${ic("arrow-big-up")}</button>`;
      if (k === "BK") return `<button type="button" class="dkb__k dkb__k--fn" data-k="BK" aria-label="Backspace">${ic("delete")}</button>`;
      if (k === "SYM" || k === "ABC") return `<button type="button" class="dkb__k dkb__k--fn dkb__k--mode" data-k="${k}">${k === "SYM" ? "?123" : "ABC"}</button>`;
      if (k === "SPACE") return `<button type="button" class="dkb__k dkb__k--space" data-k=" ">English</button>`;
      if (k === "ENTER") return `<button type="button" class="dkb__k dkb__k--enter" data-k="ENTER" aria-label="Enter">${ic(kbT && kbT.tagName === "TEXTAREA" ? "corner-down-left" : "arrow-right")}</button>`;
      const ch = kbShift ? k.toUpperCase() : k;
      return `<button type="button" class="dkb__k" data-k="${esc(ch)}">${esc(ch)}</button>`;
    }).join("")}</div>`).join("");
    icons();
  };
  const showKb = (el) => { if (!S.kb) return; kbT = el; kbSym = false; kb.hidden = false; scr.classList.add("has-kb"); drawKb(); };
  function hideKb() { if (!kb) return; kb.hidden = true; scr.classList.remove("has-kb"); kbT = null; }
  const kbType = (ch) => {
    const el = kbT; if (!el) return;
    const s0 = el.selectionStart ?? el.value.length, e0 = el.selectionEnd ?? s0;
    try { el.setRangeText(ch, s0, e0, "end"); } catch (er) { el.value += ch; }
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  kb.addEventListener("mousedown", (e) => e.preventDefault()); // keep focus in the text box
  kb.addEventListener("pointerdown", (e) => {
    const b = e.target.closest("[data-k]"); e.preventDefault(); if (!b || !kbT) return;
    const k = b.dataset.k; buzz(5); beep(0, 0, 0);
    b.classList.add("is-down"); setTimeout(() => b.classList.remove("is-down"), 120);
    if (k === "SHIFT") { kbShift = !kbShift; drawKb(); return; }
    if (k === "SYM" || k === "ABC") { kbSym = k === "SYM"; drawKb(); return; }
    if (k === "BK") {
      const el = kbT, s0 = el.selectionStart ?? el.value.length, e0 = el.selectionEnd ?? s0;
      try { if (s0 !== e0) el.setRangeText("", s0, e0, "end"); else if (s0 > 0) el.setRangeText("", s0 - 1, s0, "end"); } catch (er) { el.value = el.value.slice(0, -1); }
      el.dispatchEvent(new Event("input", { bubbles: true })); return;
    }
    if (k === "ENTER") {
      const el = kbT;
      if (el.tagName === "TEXTAREA") { kbType("\n"); return; }
      const f = el.form; hideKb(); el.blur();
      if (f) { if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }
      return;
    }
    kbType(k);
    if (kbShift) { kbShift = false; drawKb(); }
  });
  scr.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t.matches || !t.matches('input:not([type="range"]):not([type="checkbox"]), textarea')) return;
    if (S.kb && coarse) t.setAttribute("inputmode", "none");
    showKb(t);
  });
  scr.addEventListener("focusout", () => { setTimeout(() => { const a = document.activeElement; if (!a || !scr.contains(a) || !a.matches("input, textarea")) hideKb(); }, 60); });

  /* ---------- now playing (lock screen + quick settings) ---------- */
  let media = null;
  function setMedia(m) {
    media = m;
    ["#dLockMedia", "#dShadeMedia"].forEach((sel) => {
      const box = qs(sel); if (!box) return;
      if (!m) { box.hidden = true; box.innerHTML = ""; return; }
      box.hidden = false;
      box.innerHTML = `<span class="dmedia__art" style="--c:${m.color || "#d81b60"}">${ic(m.icon || "music")}</span><span class="dmedia__tx"><b>${esc(m.title)}</b><small>${esc(m.sub || "")}</small></span>${m.prev ? `<button type="button" data-media="prev" aria-label="Previous">${ic("skip-back")}</button>` : ""}<button type="button" data-media="toggle" aria-label="${m.playing ? "Pause" : "Play"}">${ic(m.playing ? "pause" : "play")}</button>${m.next ? `<button type="button" data-media="next" aria-label="Next">${ic("skip-forward")}</button>` : ""}`;
    });
    icons();
  }

  /* ---------- public API for the extra apps (android-apps.js) ---------- */
  window.AKPhone = {
    APPS, RUN, SITES, S, save, openApp, notify, toast, beep, buzz, ic, icons, esc, qs, qsa, bar, offline, online,
    swipeDir, keyDirs, battery, drawHome, setMedia, isRunning: (id) => running.has(id), current: () => cur, hideKb,
    photos, TILES, screen: scr, closeApp,
  };

  /* ---------- buttons outside the phone ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-droid-open],[data-droid-search],[data-droid-app]");
    if (!t || phone.contains(t)) return;
    if (state === "off") { state = "lock"; setVis(); }
    if (t.dataset.droidOpen) openApp("browser", { site: t.dataset.droidOpen });
    else if (t.dataset.droidSearch) openApp("browser", { search: t.dataset.droidSearch });
    else if (t.dataset.droidApp) openApp(t.dataset.droidApp);
    const r = phone.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) phone.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });

  /* ---------- boot ---------- */
  drawHome();
  applyState();
  drawNotes();
  setVis();
  booted = true;
  if (battery.charging) setTimeout(chargeAnim, 600);
  setTimeout(lowCheck, 1500);
})();
