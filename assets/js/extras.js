/* =========================================================
   Extras: boot loader, custom cursor, Lead Snake game
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(fn) { try { return fn(); } catch (e) { return null; } }

  /* ---------------------------------------------------------
     1. Boot loader: counts real loading progress, then a
        pixel dissolve reveals the page. First visit only.
     --------------------------------------------------------- */
  (function boot() {
    if (!html.classList.contains("booting")) return;
    var el = document.getElementById("boot");
    var numEl = document.getElementById("bootNum");
    var msgEl = document.getElementById("bootMsg");
    var barEl = document.getElementById("bootBar");
    var grid = document.getElementById("bootGrid");
    if (!el) { html.classList.remove("booting"); return; }

    // pixel tiles for the dissolve
    var size = window.innerWidth < 600 ? 56 : 84;
    var cols = Math.ceil(window.innerWidth / size), rows = Math.ceil(window.innerHeight / size);
    grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < cols * rows; i++) {
      var t = document.createElement("i");
      t.style.setProperty("--d", (Math.random() * 0.45).toFixed(3) + "s");
      frag.appendChild(t);
    }
    grid.appendChild(frag);

    // real progress: eager images + fonts + window load
    var imgs = Array.prototype.filter.call(document.images, function (im) { return im.loading !== "lazy"; });
    var total = imgs.length + 2, done = 0;
    function tick() { done = Math.min(total, done + 1); }
    imgs.forEach(function (im) {
      if (im.complete) tick();
      else { im.addEventListener("load", tick, { once: true }); im.addEventListener("error", tick, { once: true }); }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tick); else tick();
    if (document.readyState === "complete") tick(); else window.addEventListener("load", tick, { once: true });

    var start = performance.now(), shown = 0, finished = false;
    var MIN = 1300, MAX = 3500;
    var msgs = [[0, "Loading projects…"], [30, "Checking Google rankings…"], [60, "Counting Meta leads…"], [90, "Almost there…"]];

    function frame(now) {
      var elapsed = now - start;
      var target = elapsed > MAX ? 100 : (done / total) * 100;
      var timeCap = Math.min(100, (elapsed / MIN) * 100);
      var goal = Math.min(target, timeCap);
      shown += (goal - shown) * 0.18;
      if (goal - shown < 0.4) shown = goal;
      var v = Math.floor(shown);
      numEl.textContent = v;
      barEl.style.transform = "scaleX(" + (shown / 100).toFixed(3) + ")";
      for (var m = msgs.length - 1; m >= 0; m--) { if (v >= msgs[m][0]) { if (msgEl.textContent !== msgs[m][1]) msgEl.textContent = msgs[m][1]; break; } }
      if (v >= 100 && !finished) { finished = true; finish(); return; }
      requestAnimationFrame(frame);
    }
    function finish() {
      numEl.textContent = "100";
      msgEl.textContent = "Ready.";
      setTimeout(function () {
        el.classList.add("is-leaving");
        setTimeout(function () {
          html.classList.remove("booting");
          store(function () { sessionStorage.setItem("ak-booted", "1"); });
          grid.innerHTML = "";
        }, 950);
      }, 260);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------------------------------------------------------
     2. Custom cursor (mouse users only)
     --------------------------------------------------------- */
  (function cursor() {
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var c = document.getElementById("cursor");
    if (!c || !fine || reduce) return;
    html.classList.add("has-cursor");
    var dot = c.querySelector(".cursor__dot");
    var ring = c.querySelector(".cursor__ring");
    var label = document.getElementById("cursorLabel");
    var mx = -100, my = -100, rx = -100, ry = -100;
    var rules = [
      ["#snake", "Play"],
      ["[data-open]", "Open"],
      ["img[data-zoom], .rk__proof", "Zoom"],
      [".rk__kw", "Google"],
      ["a[target=_blank]", "Visit"],
      [".gallery", "Drag"]
    ];
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      c.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      if (t.closest("input, textarea, select")) { c.classList.add("is-hidden"); return; }
      var txt = "";
      for (var i = 0; i < rules.length; i++) { if (t.closest(rules[i][0])) { txt = rules[i][1]; break; } }
      // plain buttons/links inside the gallery should not say "Drag"
      if (txt === "Drag" && t.closest("a, button")) txt = "";
      label.textContent = txt;
      c.classList.toggle("has-label", !!txt);
      c.classList.toggle("is-link", !txt && !!t.closest("a, button, [role=tab], .app"));
    });
    document.addEventListener("mousedown", function () { c.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { c.classList.remove("is-down"); });
    document.documentElement.addEventListener("mouseleave", function () { c.classList.add("is-hidden"); });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      requestAnimationFrame(loop);
    })();
  })();

  /* hand-drawn circle around "#1" draws itself when it scrolls into view */
  (function scribbles() {
    var t = document.querySelector(".ranks__title");
    if (!t) return;
    if (reduce || !("IntersectionObserver" in window)) { t.classList.add("is-lit"); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { t.classList.add("is-lit"); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(t);
  })();

  /* ---------------------------------------------------------
     2b. Show-more controls (rankings list, older jobs)
     --------------------------------------------------------- */
  (function showMore() {
    var list = document.getElementById("rkList");
    var btn = document.getElementById("rkMore");
    if (list && btn) {
      var label = btn.querySelector("span");
      var allText = label.textContent;
      btn.addEventListener("click", function () {
        var open = !list.classList.contains("is-all");
        list.classList.toggle("is-all", open);
        btn.setAttribute("aria-expanded", String(open));
        label.textContent = open ? "Show fewer" : allText;
        if (!open) list.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
      // a category filter shows every match; "All" goes back to the short list
      document.querySelectorAll(".rk-tab").forEach(function (t) {
        t.addEventListener("click", function () {
          var all = t.getAttribute("data-f") === "all";
          list.classList.toggle("is-all", !all || btn.getAttribute("aria-expanded") === "true");
          btn.hidden = !all;
        });
      });
    }

    document.querySelectorAll(".job:not(.job--now)").forEach(function (job) {
      var items = job.querySelectorAll(".job__list li");
      if (items.length <= 2) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "job__toggle";
      b.setAttribute("aria-expanded", "false");
      b.innerHTML = '<span>Show ' + (items.length - 2) + ' more</span><svg class="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
      b.addEventListener("click", function () {
        var open = !job.classList.contains("is-open");
        job.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
        b.firstChild.textContent = open ? "Show less" : "Show " + (items.length - 2) + " more";
      });
      job.appendChild(b);
    });
  })();

  /* ---------------------------------------------------------
     3. Lead Snake
     --------------------------------------------------------- */
  (function snakeGame() {
    var cv = document.getElementById("snake");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var overlay = document.getElementById("gOverlay");
    var titleEl = document.getElementById("gTitle");
    var subEl = document.getElementById("gSub");
    var startBtn = document.getElementById("gStart");
    var scoreEl = document.getElementById("gScore");
    var bestEl = document.getElementById("gBest");
    var speedEl = document.getElementById("gSpeed");
    var valueEl = document.getElementById("gValue");
    var led = document.getElementById("gLed");
    var CPL = 288, N = 20;
    var px = 0, cell = 0;

    function resize() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.width * dpr);
      px = cv.width; cell = px / N;
      draw();
    }

    var best = +(store(function () { return localStorage.getItem("ak-snake-best"); }) || 0);
    bestEl.textContent = best;

    var snake, dir, nextDir, food, gold, score, running = false, paused = false, timer = null, step = 150, eaten = 0, t0 = 0;

    function rnd() { return Math.floor(Math.random() * N); }
    function free(p) { return !snake.some(function (s) { return s.x === p.x && s.y === p.y; }) && !(gold && gold.x === p.x && gold.y === p.y) && !(food && food.x === p.x && food.y === p.y); }
    function place() { var p; do { p = { x: rnd(), y: rnd() }; } while (!free(p)); return p; }

    function reset() {
      snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      dir = { x: 1, y: 0 }; nextDir = dir; score = 0; eaten = 0; step = 150; gold = null; food = null;
      food = place();
      updateHud();
    }
    function updateHud() {
      scoreEl.textContent = score;
      speedEl.textContent = 1 + Math.floor(eaten / 5);
      valueEl.textContent = "₹" + (score * CPL).toLocaleString("en-IN");
    }

    function start() {
      reset();
      running = true; paused = false;
      overlay.classList.add("is-hidden");
      led.classList.add("is-on");
      cv.focus({ preventScroll: true });
      loop();
    }
    function over() {
      running = false;
      clearTimeout(timer);
      led.classList.remove("is-on");
      if (score > best) { best = score; bestEl.textContent = best; store(function () { localStorage.setItem("ak-snake-best", String(best)); }); }
      titleEl.textContent = score > 0 ? score + (score === 1 ? " lead" : " leads") + "!" : "Game over";
      subEl.textContent = score > 0
        ? "At ₹288 per lead, that's ₹" + (score * CPL).toLocaleString("en-IN") + " of real ad spend. " + (score >= best ? "New best!" : "Best: " + best + ".")
        : "No leads this time. Try again.";
      startBtn.lastChild.textContent = "Play again";
      overlay.classList.remove("is-hidden");
    }

    function loop() {
      if (!running) return;
      if (!paused) tickGame();
      timer = setTimeout(loop, step);
    }
    function tickGame() {
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(function (s) { return s.x === head.x && s.y === head.y; })) { draw(); over(); return; }
      snake.unshift(head);
      var grew = false;
      if (food && head.x === food.x && head.y === food.y) {
        score += 1; eaten += 1; grew = true; food = place();
        if (eaten % 5 === 0) step = Math.max(70, step - 14);
        if (!gold && eaten % 4 === 0) { gold = place(); gold.until = Date.now() + 6000; }
      } else if (gold && head.x === gold.x && head.y === gold.y) {
        score += 5; grew = true; gold = null;
      }
      if (!grew) snake.pop();
      if (gold && Date.now() > gold.until) gold = null;
      updateHud();
      draw();
    }

    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    function draw() {
      if (!px) return;
      ctx.fillStyle = "#07120b"; ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = "rgba(48,209,88,.06)";
      for (var gx = 0; gx < N; gx++) for (var gy = 0; gy < N; gy++) if ((gx + gy) % 2 === 0) ctx.fillRect(gx * cell, gy * cell, cell, cell);
      if (!snake) return;
      var pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);
      if (food) {
        ctx.shadowColor = "#30d158"; ctx.shadowBlur = cell * (0.4 + pulse * 0.5);
        ctx.fillStyle = "#30d158";
        ctx.beginPath(); ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (gold) {
        var g = ctx.createLinearGradient(gold.x * cell, gold.y * cell, gold.x * cell + cell, gold.y * cell + cell);
        g.addColorStop(0, "#ffe17a"); g.addColorStop(0.5, "#f6b100"); g.addColorStop(1, "#e08a00");
        ctx.shadowColor = "#f6b100"; ctx.shadowBlur = cell * 0.8;
        ctx.fillStyle = g; roundRect(gold.x * cell + 1, gold.y * cell + 1, cell - 2, cell - 2, cell * 0.25); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#3d2a00"; ctx.font = "800 " + Math.floor(cell * 0.5) + "px Inter, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("#1", gold.x * cell + cell / 2, gold.y * cell + cell / 2 + 1);
      }
      for (var i = snake.length - 1; i >= 0; i--) {
        var s = snake[i], k = i / Math.max(1, snake.length - 1);
        ctx.fillStyle = "rgb(" + Math.round(10 + 84 * k) + "," + Math.round(132 - 40 * k) + "," + Math.round(255 - 25 * k) + ")";
        var pad = i === 0 ? 0.5 : 1.5;
        roundRect(s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.3); ctx.fill();
      }
      var h = snake[0];
      ctx.fillStyle = "#fff";
      var ex = dir.y !== 0 ? 0.22 : 0, ey = dir.x !== 0 ? 0.22 : 0;
      [[-1, -1], [1, 1]].forEach(function (o) {
        ctx.beginPath();
        ctx.arc(h.x * cell + cell / 2 + (ex * o[0] + dir.x * 0.15) * cell, h.y * cell + cell / 2 + (ey * o[1] + dir.y * 0.15) * cell, cell * 0.09, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function turn(d) {
      var map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      var n = map[d];
      if (!n || !running) return;
      if (n.x === -dir.x && n.y === -dir.y) return;
      nextDir = n;
    }

    startBtn.addEventListener("click", start);
    document.addEventListener("keydown", function (e) {
      var keys = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
      if (!running || !keys[e.code]) return;
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      e.preventDefault();
      turn(keys[e.code]);
    });
    document.querySelectorAll(".console__pad button").forEach(function (b) {
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); turn(b.getAttribute("data-dir")); });
    });
    var sx = 0, sy = 0;
    cv.addEventListener("touchstart", function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    cv.addEventListener("touchmove", function (e) { if (running) e.preventDefault(); }, { passive: false });
    cv.addEventListener("touchend", function (e) {
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    });

    // pause when the game scrolls out of view or the tab is hidden
    var inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; paused = !inView || document.hidden; }, { threshold: 0.3 }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () { paused = document.hidden || !inView; });

    // idle animation behind the start screen (food pulse), only while visible
    (function idle() { if (!running && inView && !document.hidden) draw(); requestAnimationFrame(idle); })();

    reset();
    resize();
    window.addEventListener("resize", resize);
  })();
})();

/* =========================================================
   Studio: Noida clock in the hero strip, and real-screenshot
   previews that follow the pointer over the hero proof list.
   ========================================================= */
(function () {
  "use strict";
  var ist = document.getElementById("istNow");
  if (ist && window.Intl) {
    var fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    var tick = function () { ist.textContent = fmt.format(new Date()).toUpperCase(); };
    tick();
    setInterval(tick, 10000);
  }

  var peek = document.getElementById("peek");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!peek || !fine || reduce) return;
  var links = document.querySelectorAll("[data-peek]");
  links.forEach(function (a) { var im = new Image(); im.src = a.getAttribute("data-peek"); });
  var x = 0, y = 0, cx = 0, cy = 0, on = false, raf = 0;
  var loop = function () {
    cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
    var w = peek.offsetWidth, h = peek.offsetHeight;
    var px = Math.min(cx + 28, innerWidth - w - 12), py = Math.min(Math.max(cy - h / 2, 12), innerHeight - h - 12);
    peek.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) rotate(" + ((x - cx) * 0.04).toFixed(2) + "deg)";
    raf = on || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  links.forEach(function (a) {
    a.addEventListener("pointerenter", function (e) {
      if (peek.getAttribute("src") !== a.getAttribute("data-peek")) peek.src = a.getAttribute("data-peek");
      if (!on) { cx = x = e.clientX; cy = y = e.clientY; }
      on = true; peek.classList.add("is-on");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    a.addEventListener("pointermove", function (e) { x = e.clientX; y = e.clientY; });
    a.addEventListener("pointerleave", function () { on = false; peek.classList.remove("is-on"); });
  });
  window.addEventListener("scroll", function () { if (on) { on = false; peek.classList.remove("is-on"); } }, { passive: true });
})();
/* Up / down jump control: one tap to the top or the bottom, with how far down you are */
(function () {
  "use strict";
  var up = document.getElementById("jumpUp"), down = document.getElementById("jumpDown"), pct = document.getElementById("jumpPct");
  if (!up || !down) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var go = function (y) { window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); };
  up.addEventListener("click", function () { go(0); });
  down.addEventListener("click", function () { go(document.documentElement.scrollHeight); });
  var ticking = false;
  var update = function () {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY;
    var p = max > 0 ? Math.round(Math.min(1, Math.max(0, y / max)) * 100) : 0;
    pct.textContent = p + "%";
    up.disabled = y < 40;
    down.disabled = y > max - 40;
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();