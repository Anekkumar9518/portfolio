(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IMG = "assets/img/projects/";

  /* ---------- project data (all from the live sites) ---------- */
  var PROJECTS = {
    matrix: {
      name: "Matrix Acres", meta: "Real estate · Noida NCR", color: "#1e2b3c", icon: "building-2",
      url: "https://www.matrixacres.in", host: "matrixacres.in", d: "matrixacres.webp", m: "matrixacres-m.webp",
      desc: "The company website for a Noida real estate firm, with property listings for M3M, Godrej and Dasnac projects, site-visit booking, lead forms, a blog and careers pages. While working there (Sep 2024 – Mar 2026) I also built the in-house CRM behind it (300+ modules) and ran its Meta and Google lead campaigns.",
      role: "Design, development, SEO, ads, CRM", stack: "PHP, MySQL, Bootstrap, Meta Ads, Google Ads"
    },
    shubh: {
      name: "Shubharambh Infra Advisors", meta: "RERA-registered property advisory", color: "#b8913d", icon: "landmark",
      url: "https://shubharambhinfraadvisors.com", host: "shubharambhinfraadvisors.com", d: "shubharambh.webp", m: "shubharambh-m.webp",
      desc: "A property advisory site for Noida, Greater Noida, Delhi NCR, Haridwar and Ramnagar. It has project search by type, city and budget, WhatsApp enquiry on every listing, an EMI calculator and land-area converters. Google impressions went from 3.43k to 1.22M in six months, and Meta lead campaigns brought 1,149 property leads at ₹288 each.",
      role: "Development, SEO and Meta Ads", stack: "PHP, MySQL, SEO, converter tools, Meta lead forms", results: true
    },
    vision: {
      name: "Visionwave Technology", meta: "Digital marketing agency", color: "#3d42d6", icon: "rocket",
      url: "https://visionwavetechnology.com", host: "visionwavetechnology.com", d: "visionwave.webp", m: "visionwave-m.webp",
      desc: "An agency website with service and pricing pages, a blog, a free-audit lead funnel and WhatsApp chat. It includes 29 free browser tools, such as an image compressor, PDF to JPG, a signature resizer and a sitemap generator, that bring in search traffic.",
      role: "Design, development, SEO", stack: "PHP, JavaScript, SEO, lead funnels"
    },
    lmc: {
      name: "LMC Healthcare Store", meta: "E-commerce · Ayurvedic wellness", color: "#b3202b", icon: "leaf",
      url: "https://lmcstore.in/", host: "lmcstore.in", d: "lmc.webp", m: "lmc-m.webp",
      desc: "A full online store with categories, cart and wishlist, accounts, order tracking, checkout with COD, UPI and card payments, reviews, WhatsApp support and a Hindi language toggle.",
      role: "Development", stack: "PHP, MySQL, payments"
    },
    sabzi: {
      name: "Hari Sabzi Wala", meta: "Grocery delivery · Website + rider app", color: "#1f7a43", icon: "carrot",
      url: "https://harisabziwala.com", host: "harisabziwala.com", d: "harisabzi.webp", m: "harisabzi-m.webp",
      desc: "Vegetable delivery for Aligarh, with morning and evening delivery slots, a weekly subscription, promo codes, WhatsApp ordering and an installable app. It also has an admin panel and a separate Android app for delivery riders.",
      role: "Development", stack: "PHP, MySQL, PWA, Android"
    },
    ezzy: {
      name: "EzzyCommerce Store", meta: "E-commerce · Streetwear", color: "#e3262e", icon: "shirt",
      url: "https://ezzycommerce.store/", host: "ezzycommerce.store", d: "ezzy.webp", m: "ezzy-m.webp",
      desc: "A fashion store for an Indian streetwear brand, with men's and women's catalogues, sale pricing, bag and wishlist, accounts, a size guide, order tracking and returns.",
      role: "Development", stack: "PHP, MySQL, e-commerce"
    },
    allfiles: {
      name: "AllFiles", meta: "SaaS · Cloud storage", color: "#6d5dfc", icon: "cloud",
      url: "https://allfiles.space", host: "allfiles.space", d: "allfiles.webp", m: "allfiles-m.webp",
      desc: "A private cloud where people upload, organize and share files from any device, signing up instantly with just a name and a secret code. It also has free tools for photos, PDF, MP3 and QR codes.",
      role: "Design and development", stack: "PHP, JavaScript, file storage"
    },
    devtab: {
      name: "DevTab", meta: "Open source · Chrome extension", color: "#7c9cff", icon: "app-window",
      url: "https://anekkumar9518.github.io/devtab/", host: "github.com/Anekkumar9518/devtab", d: "devtab.webp", m: "devtab-m.webp",
      desc: "An open-source Chrome extension that turns every new tab into a developer dashboard, with a Developer and a Hacker look: a live sky with your city's real weather, a particle clock and your GitHub year as a 3D city. Its page tools work on any website: Website X-ray shows any element's HTML and CSS and copies it as a clean, standalone component; a price and change tracker watches prices or text and sends a notification when they change, with price graphs; plus a tech stack detector, full-page screenshots with an editor, a website time machine and an image and video downloader. It also has focus mode with site blocking, a tab sleeper, news, ambient sounds and a pet that eats ads and evolves.",
      role: "Design and development", stack: "JavaScript, Chrome Manifest V3, Canvas, Web Audio"
    }
  };

  function icons(root) { if (window.lucide) window.lucide.createIcons(root ? { root: root } : undefined); }
  icons();

  /* ---------- dock: active section ---------- */
  var dockItems = Array.prototype.slice.call(document.querySelectorAll(".dock__item"));
  var map = { home: "home", about: "home", work: "work", results: "results", ads: "results", resume: "resume", contact: "contact" };
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = map[en.target.id];
        dockItems.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + key;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- hero stage: devices settle as you scroll ---------- */
  var stage = document.getElementById("stage");
  if (stage && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = stage.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh - r.top) / (vh * 0.75);
      p = Math.max(0, Math.min(1, p));
      stage.style.setProperty("--p", p.toFixed(3));
    };
    update();
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- gallery arrows ---------- */
  var gal = document.getElementById("gallery");
  var prev = document.getElementById("galPrev");
  var next = document.getElementById("galNext");
  function step() { var c = gal.querySelector(".card"); return c ? c.getBoundingClientRect().width + 20 : 400; }
  function galState() {
    prev.disabled = gal.scrollLeft < 8;
    next.disabled = gal.scrollLeft + gal.clientWidth > gal.scrollWidth - 8;
  }
  if (gal) {
    prev.addEventListener("click", function () { gal.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { gal.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    gal.addEventListener("scroll", galState, { passive: true });
    gal.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
    });
    galState();
  }

  /* ---------- project sheet ---------- */
  var sheet = document.getElementById("sheet");
  var body = document.getElementById("sheetBody");
  var lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function openProject(id, trigger) {
    var p = PROJECTS[id];
    if (!p || typeof sheet.showModal !== "function") { if (p) window.open(p.url, "_blank", "noopener"); return; }
    lastFocus = trigger || document.activeElement;
    body.innerHTML =
      '<div class="sh__head"><span class="app__icon" style="--c:' + p.color + '"><i data-lucide="' + p.icon + '"></i></span>' +
      '<div><h2 id="sheetTitle">' + esc(p.name) + '</h2><p>' + esc(p.meta) + '</p></div></div>' +
      '<div class="sh__shots"><img src="' + IMG + p.d + '" alt="' + esc(p.name) + ' on desktop" width="1200" height="675" data-zoom>' +
      '<img class="sh__m" src="' + IMG + p.m + '" alt="' + esc(p.name) + ' on mobile" width="390" height="844" data-zoom></div>' +
      '<p class="sh__desc">' + esc(p.desc) + '</p>' +
      '<dl class="sh__rows"><div><dt>My role</dt><dd>' + esc(p.role) + '</dd></div><div><dt>Built with</dt><dd>' + esc(p.stack) + '</dd></div><div><dt>Live at</dt><dd>' + esc(p.host) + '</dd></div></dl>' +
      '<div class="sh__cta"><a class="btn btn--blue" href="' + p.url + '" target="_blank" rel="noopener">Visit live site<i data-lucide="arrow-up-right"></i></a>' +
      (p.results ? '<a class="btn btn--gray" href="#results" data-close>SEO results</a><a class="btn btn--gray" href="#ads" data-close>Meta Ads results</a>' : '') + '</div>';
    icons(sheet);
    body.scrollTop = 0;
    sheet.style.transform = "";
    sheet.showModal();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open]");
    if (t) { e.preventDefault(); openProject(t.getAttribute("data-open"), t); }
  });
  function closeSheet() { if (sheet.open) sheet.close(); }
  document.getElementById("sheetClose").addEventListener("click", closeSheet);
  sheet.addEventListener("click", function (e) {
    if (e.target === sheet) closeSheet();
    if (e.target.closest("[data-close]")) closeSheet();
  });
  sheet.addEventListener("close", function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });

  /* swipe down to dismiss (mobile) */
  var grab = document.getElementById("sheetGrab");
  var startY = null, dy = 0;
  grab.addEventListener("pointerdown", function (e) { startY = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId); sheet.style.transition = "none"; });
  grab.addEventListener("pointermove", function (e) { if (startY === null) return; dy = Math.max(0, e.clientY - startY); sheet.style.transform = "translateY(" + dy + "px)"; });
  grab.addEventListener("pointerup", function () {
    if (startY === null) return;
    sheet.style.transition = "transform .25s ease";
    if (dy > 120) { closeSheet(); } else { sheet.style.transform = ""; }
    startY = null;
  });

  /* ---------- screenshot tabs (Search Console + Ads Manager) ----------
     Only the newest click wins, failed loads retry once, and the other
     tabs are preloaded as soon as the screenshot is near the screen. */
  function shotTabs(tabs, target) {
    if (!target || !tabs.length) return;
    var ticket = 0;
    var load = function (src, done, fail, retried) {
      var img = new Image();
      img.onload = function () { done(img); };
      img.onerror = function () { if (!retried) setTimeout(function () { load(src + (src.indexOf("?") < 0 ? "?r=" : "&r=") + Date.now(), done, fail, true); }, 1200); else fail(); };
      img.src = src;
    };
    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.classList.contains("is-active")) return;
        tabs.forEach(function (x) { var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
        var mine = ++ticket;
        target.classList.add("is-loading");
        load(b.getAttribute("data-img"), function (img) {
          if (mine !== ticket) return;
          target.classList.add("is-swapping");
          setTimeout(function () {
            if (mine !== ticket) return;
            target.src = img.src; target.alt = b.getAttribute("data-alt");
            target.width = +b.getAttribute("data-w"); target.height = +b.getAttribute("data-h");
            target.classList.remove("is-swapping", "is-loading");
          }, 150);
        }, function () { if (mine === ticket) target.classList.remove("is-loading"); });
      });
    });
    // retry the visible screenshot once if it failed
    target.addEventListener("error", function onErr() { target.removeEventListener("error", onErr); setTimeout(function () { target.src = target.getAttribute("src").split("?")[0] + "?r=" + Date.now(); }, 1200); });
    // warm up the other tabs before anyone clicks
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; io.disconnect();
        tabs.forEach(function (b) { var i = new Image(); i.src = b.getAttribute("data-img"); });
      }, { rootMargin: "600px 0px" });
      io.observe(target);
    }
  }
  shotTabs(Array.prototype.slice.call(document.querySelectorAll("#display .seg__btn")), document.getElementById("proofImg"));
  shotTabs(Array.prototype.slice.call(document.querySelectorAll("#authDisplay .seg__btn")), document.getElementById("authImg"));
  shotTabs(Array.prototype.slice.call(document.querySelectorAll(".ads-tab")), document.getElementById("adsImg"));

  /* ---------- Google rankings: filters + typing search bar ---------- */
  var rkTabs = document.querySelectorAll(".rk-tab");
  var rkRows = document.querySelectorAll("#rkList .rk");
  rkTabs.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      rkTabs.forEach(function (x) { var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
      rkRows.forEach(function (r) { r.classList.toggle("is-hidden", f !== "all" && r.getAttribute("data-cat") !== f); });
    });
  });

  var gs = document.querySelector(".gsearch");
  var gq = document.getElementById("gq");
  var gres = document.getElementById("gres");
  if (gs && gq && !reduce) {
    var qs = [];
    try { qs = JSON.parse(gs.getAttribute("data-q")); } catch (err) { qs = []; }
    var gsVisible = false;
    onVisible(gs, function (v) { gsVisible = v; });
    var qi = 0;
    var typeNext = function () {
      if (!qs.length) return;
      if (!gsVisible || document.hidden) { setTimeout(typeNext, 800); return; }
      var text = qs[qi % qs.length]; qi++;
      var n = 0;
      gres.classList.add("is-out");
      gq.textContent = "";
      var t = setInterval(function () {
        n++;
        gq.textContent = text.slice(0, n);
        if (n >= text.length) {
          clearInterval(t);
          setTimeout(function () { gres.classList.remove("is-out"); }, 250);
          setTimeout(typeNext, 3200);
        }
      }, 38);
    };
    setTimeout(typeNext, 2500);
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  document.addEventListener("click", function (e) {
    var img = e.target.closest("img[data-zoom]");
    var proof = e.target.closest(".rk__proof");
    if (!img && proof) img = proof.querySelector("img");
    if (!img || typeof lb.showModal !== "function") return;
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lb.showModal();
  });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", function () { lbImg.removeAttribute("src"); });

  /* =========================================================
     Motion layer. Everything below is skipped or reduced when
     the visitor prefers reduced motion.
     ========================================================= */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function onVisible(el, cb) {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    new IntersectionObserver(function (en) { cb(en[0].isIntersecting); }, { threshold: 0.05 }).observe(el);
  }

  /* stagger index for the phone's app icons */
  document.querySelectorAll(".apps .app, .phone__dock a").forEach(function (a, i) { a.style.setProperty("--i", i); });

  /* title words light up as you scroll past */
  var hls = Array.prototype.map.call(document.querySelectorAll("[data-hl]"), function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "hw"; s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return { el: el, words: el.querySelectorAll(".hw") };
  });

  /* scroll-driven: progress bar, display tilt, title highlight, gallery scale */
  var bar = document.getElementById("progressBar");
  var display = document.getElementById("display");
  var sTick = false;
  function onScrollFx() {
    sTick = false;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ")";
    if (reduce) return;
    if (display) {
      var r = display.getBoundingClientRect();
      display.style.setProperty("--q", clamp((vh - r.top) / (vh * 0.7)).toFixed(3));
    }
    hls.forEach(function (h) {
      var rr = h.el.getBoundingClientRect();
      var prog = clamp((vh * 0.85 - rr.top) / (vh * 0.45));
      var n = Math.round(prog * h.words.length);
      h.words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    });
  }
  window.addEventListener("scroll", function () { if (!sTick) { sTick = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  window.addEventListener("resize", onScrollFx);
  onScrollFx();
  if (reduce) hls.forEach(function (h) { h.words.forEach(function (w) { w.classList.add("on"); }); });

  /* laptop slideshow of real screenshots */
  var slides = document.querySelectorAll("#slides .slide");
  var hostEl = document.getElementById("slideHost");
  var stageVisible = true;
  if (stage) onVisible(stage, function (v) { stageVisible = v; });
  if (slides.length > 1 && !reduce) {
    var si = 0;
    setInterval(function () {
      if (!stageVisible || document.hidden) return;
      slides[si].classList.remove("is-on");
      si = (si + 1) % slides.length;
      slides[si].classList.add("is-on");
      if (hostEl) {
        hostEl.style.opacity = 0;
        setTimeout(function () { hostEl.textContent = slides[si].getAttribute("data-host"); hostEl.style.opacity = 1; }, 250);
      }
    }, 3400);
  }

  /* phone notifications, one at a time */
  var notifs = document.querySelectorAll("#notifs .notif");
  if (notifs.length && !reduce) {
    /* each banner shows for a moment, then slides away so the apps stay tappable */
    var ni = -1;
    var showNext = function () {
      if (!stageVisible || document.hidden) return;
      ni = (ni + 1) % notifs.length;
      var n = notifs[ni];
      n.classList.add("is-on");
      setTimeout(function () { n.classList.remove("is-on"); }, 2800);
    };
    setTimeout(function () { showNext(); setInterval(showNext, 4600); }, 2000);
  }

  /* count-up numbers */
  var counters = document.querySelectorAll("[data-to]");
  if (!reduce && "IntersectionObserver" in window) {
    var runCount = function (el) {
      var to = parseFloat(el.getAttribute("data-to"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
      var sep = el.hasAttribute("data-sep");
      // An invisible copy of the final number holds its width while the
      // visible one counts, so the headline never re-wraps mid-count.
      var final = el.textContent;
      var box = document.createElement("span"), ghost = document.createElement("span"), live = document.createElement("span");
      box.className = "cnt"; ghost.className = "cnt__ghost"; live.className = "cnt__live";
      ghost.setAttribute("aria-hidden", "true");
      ghost.textContent = final;
      box.appendChild(ghost); box.appendChild(live);
      el.textContent = ""; el.appendChild(box);
      var t0 = null, dur = 1400, last = "";
      var frame = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        if (k === 1) { el.textContent = final; return; }
        var v = to * (1 - Math.pow(1 - k, 4));
        var s = pre + (sep ? Math.round(v).toLocaleString("en-IN") : v.toFixed(dec)) + suf;
        if (s !== last) { live.textContent = s; last = s; }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* gallery: cards ease in toward the center, and mouse drag to scroll */
  if (gal) {
    var cards = gal.querySelectorAll(".card");
    var gTick = false;
    var scaleCards = function () {
      gTick = false;
      var gr = gal.getBoundingClientRect();
      var mid = gr.left + gr.width / 2;
      cards.forEach(function (c) {
        var r = c.getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - mid) / gr.width;
        c.style.setProperty("--s", (1 - Math.min(d, 1) * 0.07).toFixed(3));
      });
    };
    if (!reduce) {
      gal.addEventListener("scroll", function () { if (!gTick) { gTick = true; requestAnimationFrame(scaleCards); } }, { passive: true });
      window.addEventListener("resize", scaleCards);
      scaleCards();
    }
    if (finePointer) {
      var down = false, moved = false, sx = 0, sl = 0;
      gal.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("a, button")) return;
        down = true; moved = false; sx = e.clientX; sl = gal.scrollLeft;
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 6) { moved = true; gal.classList.add("is-drag"); }
        if (moved) gal.scrollLeft = sl - dx;
      });
      window.addEventListener("pointerup", function () {
        if (!down) return;
        down = false;
        if (moved) {
          gal.classList.remove("is-drag");
          var w = step();
          gal.scrollTo({ left: Math.round(gal.scrollLeft / w) * w, behavior: reduce ? "auto" : "smooth" });
        }
      });
    }
  }

  /* =========================================================
     Live phone: real clock, date, wallpaper by time of day,
     battery and network from the visitor's own device.
     ========================================================= */
  var pScreen = document.getElementById("phoneScreen");
  if (pScreen) {
    var pTime = document.getElementById("pTime");
    var pDay = document.getElementById("pDay");
    var pDate = document.getElementById("pDate");

    var tickClock = function () {
      var now = new Date();
      var h = now.getHours(), m = now.getMinutes();
      pTime.textContent = ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m;
      pDay.textContent = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      pDate.textContent = now.getDate();
      var tod = h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 20 ? "evening" : "night";
      if (pScreen.getAttribute("data-tod") !== tod) pScreen.setAttribute("data-tod", tod);
      setTimeout(tickClock, (60 - now.getSeconds()) * 1000 + 50);
    };
    tickClock();

    /* battery: real level and charging state where the browser shares it */
    var bat = document.getElementById("pBat");
    var batPct = document.getElementById("pBatPct");
    var batFill = document.getElementById("pBatFill");
    var showBattery = function (b) {
      var pct = Math.round(b.level * 100);
      batPct.textContent = pct;
      bat.classList.add("has-pct");
      batFill.style.setProperty("--lvl", Math.max(pct, 6) + "%");
      bat.classList.toggle("is-charging", b.charging);
      bat.classList.toggle("is-low", !b.charging && pct <= 20);
    };
    if (navigator.getBattery) {
      navigator.getBattery().then(function (b) {
        showBattery(b);
        b.addEventListener("levelchange", function () { showBattery(b); });
        b.addEventListener("chargingchange", function () { showBattery(b); });
      }).catch(function () {});
    }

    /* network: real connection type and strength where available */
    var sigBars = document.querySelectorAll("#pSig i");
    var net = document.getElementById("pNet");
    var wifiIcon = net.innerHTML;
    var showNetwork = function () {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      var bars = 4, label = null;
      if (!navigator.onLine) { bars = 0; label = ""; }
      else if (c) {
        var eff = c.effectiveType || "4g";
        bars = { "slow-2g": 1, "2g": 2, "3g": 3, "4g": 4 }[eff] || 4;
        if (c.type === "cellular") label = eff === "4g" ? "4G" : eff.replace("slow-", "").toUpperCase();
      }
      sigBars.forEach(function (b, i) { b.classList.toggle("on", i < bars); });
      if (label === null) { if (net.getAttribute("data-mode") !== "wifi") { net.innerHTML = wifiIcon; net.setAttribute("data-mode", "wifi"); } }
      else { net.textContent = label; net.setAttribute("data-mode", "cell"); }
    };
    showNetwork();
    window.addEventListener("online", showNetwork);
    window.addEventListener("offline", showNetwork);
    var conn = navigator.connection;
    if (conn && conn.addEventListener) conn.addEventListener("change", showNetwork);

    if (!reduce) {
      /* Dynamic Island live activities */
      var island = document.getElementById("island");
      var acts = island.querySelectorAll(".island__act");
      var ai = 0;
      var islandCycle = function () {
        if (stageVisible && !document.hidden) {
          acts.forEach(function (a, i) { a.classList.toggle("is-on", i === ai % acts.length); });
          ai++;
          island.classList.add("is-open");
          setTimeout(function () { island.classList.remove("is-open"); }, 3400);
        }
      };
      setTimeout(function () { islandCycle(); setInterval(islandCycle, 9000); }, 4200);

      /* rankings widget rotates through #1 keywords */
      var kwEl = document.getElementById("pKw");
      var gsData = document.querySelector(".gsearch");
      var kwList = [];
      try { kwList = JSON.parse(gsData.getAttribute("data-q")); } catch (err) { kwList = []; }
      if (kwEl && kwList.length > 1) {
        var ki = 0;
        setInterval(function () {
          if (!stageVisible || document.hidden) return;
          ki = (ki + 1) % kwList.length;
          kwEl.style.opacity = 0;
          setTimeout(function () { kwEl.textContent = kwList[ki]; kwEl.style.opacity = 1; }, 300);
        }, 3000);
      }
    }
  }

  /* ---------- contact form -> WhatsApp ---------- */
  var form = document.getElementById("waForm");
  var err = document.getElementById("formError");
  var composed = function () {
    var name = form.name.value.trim();
    if (!name) { err.textContent = "Add your name so I know who's writing."; form.name.focus(); return null; }
    err.textContent = "";
    var msg = form.msg.value.trim();
    return { name: name, text: "Hi Anek, I'm " + name + ". I need: " + form.need.value + "." + (msg ? "\n\n" + msg : "") };
  };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var c = composed();
    if (c) window.open("https://wa.me/919518848804?text=" + encodeURIComponent(c.text), "_blank", "noopener");
  });
  var mailBtn = document.getElementById("mailSend");
  if (mailBtn) mailBtn.addEventListener("click", function () {
    var c = composed();
    if (c) location.href = "mailto:anekkumar9518@gmail.com?subject=" + encodeURIComponent(form.need.value + " - from " + c.name) + "&body=" + encodeURIComponent(c.text);
  });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
