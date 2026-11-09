/* ============================================================
   TIME:TAKERS event page — motion & interaction
   ------------------------------------------------------------
   Each effect is its own block (M1–M10, M8 removed) with a matching CSS block
   in style.css "9. Motion & interaction". To drop an effect,
   delete its block here and its CSS block there.

   M1. Count-up numbers (reward mileage)
   M2. HUD boot-in reveal (cards on scroll)
   M4. Scanline drift  → CSS only
   M5. Event countdown (hero)
   M6. Hover scan / button sheen
   M7. Key art intro + Ken Burns  → CSS only
   M9. Glitch (hero)
   M9b. Title glitch (hero title, own timing)
   M10. Tower beacon  → CSS only
   M11. Grid lightning (EVENT 01 background)
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  if (!reduceMotion) root.classList.add('has-motion');

  // Run cb once when el first scrolls into view
  function onceVisible(els, cb, threshold) {
    if (!('IntersectionObserver' in window)) {
      els.forEach(cb);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        cb(entry.target);
      });
    }, { threshold: threshold || 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }

  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---------- Floating buttons after hero (mobile share/TOP stay hidden over the hero) ---------- */
  // Also docks the countdown panel: on phones it moves to the bottom-left past the hero
  // so it stops covering section titles (CSS: .hero__timer.is-docked)
  (function fabAfterHero() {
    var fab = document.querySelector('.mobile-fab');
    var timer = document.querySelector('.hero__timer');
    var bar = document.querySelector('.hero__bar');
    function setPast(past) {
      if (fab) fab.classList.toggle('is-visible', past);
      if (timer) timer.classList.toggle('is-docked', past);
    }
    if (!bar || !('IntersectionObserver' in window)) {
      setPast(true);
      return;
    }
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      // past once the hero's bottom bar has scrolled up past the top
      setPast(!e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(bar);
  })();

  /* ---------- M1. Count-up numbers ---------- */
  (function countUp() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length || reduceMotion) return;

    els.forEach(function (el) {
      el.dataset.countTo = el.textContent.replace(/[^0-9]/g, '');
      el.textContent = '0';
    });

    onceVisible(els, function (el) {
      var to = parseInt(el.dataset.countTo, 10);
      var duration = 1400;
      var start = null;
      function tick(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(to * easeOut(p)).toLocaleString('ko-KR');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 0.6);
  })();

  /* ---------- M2. HUD boot-in reveal ---------- */
  (function hudBoot() {
    var groups = document.querySelectorAll('[data-boot-group]');
    if (!groups.length || reduceMotion) return;

    var items = [];
    groups.forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll('[data-boot]'), function (el, i) {
        el.style.setProperty('--boot-i', i);
        el.classList.add('is-boot-ready'); // hidden until booted (CSS keys on this, so no JS = always visible)
        items.push(el);
      });
    });

    onceVisible(items, function (el) { el.classList.add('is-booted'); }, 0.05);
  })();

  /* ---------- M5. Event countdown (hero top-left, 7-segment clock HH:MM:SS) ---------- */
  (function countdown() {
    var box = document.querySelector('[data-countdown]');
    if (!box) return;

    var startAt = new Date(box.dataset.start).getTime();
    var endAt = new Date(box.dataset.end).getTime();
    var label = box.querySelector('[data-countdown-label]');
    var tab = box.querySelector('[data-countdown-tab]');
    var clock = box.querySelector('[data-countdown-clock]');

    // Lit segments per digit (a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle)
    var MAP = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
    var digits = [];

    for (var i = 0; i < 6; i++) {
      if (i && i % 2 === 0) {
        var colon = document.createElement('span');
        colon.className = 'seg-colon';
        clock.appendChild(colon);
      }
      var digit = document.createElement('span');
      digit.className = 'seg-digit';
      'abcdefg'.split('').forEach(function (s) {
        var seg = document.createElement('i');
        seg.className = 'seg seg--' + s;
        seg.dataset.seg = s;
        digit.appendChild(seg);
      });
      clock.appendChild(digit);
      digits.push(digit);
    }

    function setDigit(el, n) {
      var on = MAP[n];
      Array.prototype.forEach.call(el.children, function (seg) {
        seg.classList.toggle('is-on', on.indexOf(seg.dataset.seg) > -1);
      });
    }

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var timer;

    function render() {
      var now = Date.now();
      var target;
      if (now < startAt) {
        label.textContent = '이벤트 시작까지';
        target = startAt;
      } else if (now < endAt) {
        label.textContent = '이벤트 종료까지';
        target = endAt;
      } else {
        box.classList.add('is-ended');
        label.textContent = '이벤트 종료';
        tab.textContent = 'END';
        digits.forEach(function (d) { setDigit(d, 0); });
        clearInterval(timer);
        return;
      }
      var sec = Math.floor((target - now) / 1000);
      var days = Math.floor(sec / 86400);
      var text = pad(Math.floor(sec % 86400 / 3600)) + pad(Math.floor(sec % 3600 / 60)) + pad(sec % 60);
      digits.forEach(function (d, i) { setDigit(d, +text[i]); });
      tab.textContent = now < startAt ? (days ? 'D-' + days : 'D-DAY') : 'LIVE';
      box.setAttribute('aria-label', label.textContent + ' ' + days + '일 ' + text.slice(0, 2) + '시간 ' + text.slice(2, 4) + '분');
    }

    box.hidden = false;
    render();
    timer = setInterval(render, 1000);
  })();

  /* ---------- M6. Hover scan / button sheen ---------- */
  (function hoverScan() {
    if (reduceMotion) return;
    // Cards' pseudo-elements are already used for shape/pattern, so the beam is a real span
    document.querySelectorAll('.day-card, .step-card, .use-card').forEach(function (card) {
      var beam = document.createElement('span');
      beam.className = 'fx-scan';
      beam.setAttribute('aria-hidden', 'true');
      card.appendChild(beam);
    });
    document.querySelectorAll('.btn--primary, .btn--hud:not(.btn--hud-plain)').forEach(function (btn) {
      var sheen = document.createElement('span');
      sheen.className = 'fx-sheen';
      sheen.setAttribute('aria-hidden', 'true');
      btn.appendChild(sheen);
    });
  })();

  /* ---------- M9. Glitch (hero) ---------- */
  (function heroGlitch() {
    var kv = document.querySelector('.hero__kv');
    var art = document.querySelector('.hero__art');
    var bg = document.querySelector('.hero__bg');
    if (!kv || !art || !bg || reduceMotion) return;

    ['r', 'b'].forEach(function (c) {
      var copy = document.createElement('img');
      copy.className = 'hero__glitch hero__glitch--' + c;
      copy.src = bg.currentSrc || bg.src;
      copy.alt = '';
      art.appendChild(copy);
    });

    function next(delay) {
      setTimeout(function () {
        if (!document.hidden) {
          kv.classList.add('is-glitch');
          setTimeout(function () { kv.classList.remove('is-glitch'); }, 320);
        }
        next(2500 + Math.random() * 1500);
      }, delay);
    }
    next(600); // first one right after the page opens
  })();

  /* ---------- M9b. Title glitch (own timing) ---------- */
  // Bursts of 1–2 short pulses; each ~45ms frame shows random thin slices of tinted
  // title copies shifted sideways, and now and then nudges the real title.
  (function titleGlitch() {
    var title = document.querySelector('.hero__title');
    if (!title || reduceMotion) return;

    var COLORS = ['r', 'c', 'w', 'r', 'c', 'r'];
    var FRAME = 45;
    var ghosts = [];

    // Copies are built once at load so their lines run the same rise-in animation
    // as the real title (CSS "Title rise-in") and line up even mid-rise
    function buildGhosts() {
      var html = title.innerHTML;
      ghosts = COLORS.map(function (c) {
        var g = document.createElement('span');
        g.className = 'hero__title-ghost hero__title-ghost--' + c;
        g.setAttribute('aria-hidden', 'true');
        g.innerHTML = html;
        title.appendChild(g);
        return g;
      });
    }

    var rand = function (a, b) { return a + Math.random() * (b - a); };

    function scramble() {
      ghosts.forEach(function (g) {
        if (Math.random() < 0.35) {
          g.style.opacity = '0';
          return;
        }
        var top = rand(0, 94);
        var bottom = Math.max(0, 100 - top - rand(2, 11));
        var shift = (Math.random() < 0.5 ? -1 : 1) * rand(3, 16);
        g.style.clipPath = 'inset(' + top.toFixed(1) + '% 0 ' + bottom.toFixed(1) + '% 0)';
        g.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
        g.style.opacity = rand(0.55, 1).toFixed(2);
      });
      var jitter = Math.random() < 0.35;
      title.classList.toggle('is-jitter', jitter);
      if (jitter) title.style.setProperty('--jx', ((Math.random() < 0.5 ? -1 : 1) * rand(1, 3)).toFixed(1) + 'px');
    }

    function clear() {
      ghosts.forEach(function (g) { g.style.opacity = '0'; });
      title.classList.remove('is-jitter');
    }

    function pulse(ms, done) {
      var timer = setInterval(scramble, FRAME);
      scramble();
      setTimeout(function () {
        clearInterval(timer);
        clear();
        done();
      }, ms);
    }

    function burst() {
      if (document.hidden) return schedule();
      var first = rand(180, 300);
      if (Math.random() < 0.6) {
        pulse(first, function () {
          setTimeout(function () { pulse(rand(90, 160), schedule); }, rand(70, 140));
        });
      } else {
        pulse(first, schedule);
      }
    }

    function schedule() {
      setTimeout(burst, rand(2800, 5500));
    }

    buildGhosts();
    setTimeout(burst, 450); // first burst while the title is still rising in
  })();

  /* ---------- M11. Grid lightning (EVENT 01 background) ---------- */
  // Bolts run down the 48px background grid, sometimes stepping one cell sideways at a crossing
  (function gridLightning() {
    var sec = document.querySelector('.reward');
    if (!sec || reduceMotion) return;

    var CELL = 48;     // must match the grid size in .reward background
    var SPEED = 0.35;  // px per ms
    var TRAIL = 300;   // tail length in px
    var TURN = 0.12;   // chance of a sideways step at each crossing
    var OPACITY = 0.15; // overall strength — lower = subtler

    var canvas = document.createElement('canvas');
    canvas.className = 'reward__bolts';
    canvas.setAttribute('aria-hidden', 'true');
    sec.insertBefore(canvas, sec.firstChild);
    var ctx = canvas.getContext('2d');

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, bolts = [], running = false, visible = false, last = 0, nextSpawn = 0;

    function resize() {
      w = sec.clientWidth;
      h = sec.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Horizontal grid lines are counted up from the bottom (repeating-linear-gradient 0deg)
    function nextRow(y) {
      return h - Math.floor((h - y - 1) / CELL) * CELL;
    }

    function spawn() {
      var cols = Math.floor(w / CELL);
      var x = (1 + Math.floor(Math.random() * (cols - 1))) * CELL + 0.5;
      bolts.push({ x: x, y: 0, dx: 0, tx: x, ty: nextRow(0), pts: [{ x: x, y: 0 }] });
    }

    function advance(b, dist) {
      while (dist > 0) {
        var rem = Math.abs(b.tx - b.x) + Math.abs(b.ty - b.y);
        var d = Math.min(dist, rem);
        if (b.dx) b.x += b.dx * d; else b.y += d;
        dist -= d;
        if (d < rem) break;
        // reached a crossing: keep the corner, then pick the next leg
        b.pts.push({ x: b.x, y: b.y });
        if (!b.dx && b.y < h && Math.random() < TURN) {
          var dir = Math.random() < 0.5 ? -1 : 1;
          if (b.x + dir * CELL < 0 || b.x + dir * CELL > w) dir = -dir;
          b.dx = dir;
          b.tx = b.x + dir * CELL;
        } else {
          b.dx = 0;
          b.ty = b.y >= h ? b.y + TRAIL : nextRow(b.y);
        }
      }
    }

    // Trail pieces from the head back along the corners, each with its fade (a0 → a1) over TRAIL px
    function trail(b) {
      var segs = [], hx = b.x, hy = b.y, done = 0;
      for (var i = b.pts.length - 1; i >= 0 && done < TRAIL; i--) {
        var p = b.pts[i];
        var len = Math.abs(hx - p.x) + Math.abs(hy - p.y);
        if (!len) continue;
        var cut = Math.min(len, TRAIL - done);
        segs.push({
          x0: hx, y0: hy,
          x1: hx + (p.x - hx) * (cut / len),
          y1: hy + (p.y - hy) * (cut / len),
          a0: 1 - done / TRAIL,
          a1: 1 - (done + cut) / TRAIL
        });
        done += cut;
        hx = p.x;
        hy = p.y;
      }
      if (b.pts.length > 12) b.pts.splice(0, b.pts.length - 12);
      return segs;
    }

    function stroke(segs, width, rgb, alpha) {
      ctx.lineWidth = width;
      segs.forEach(function (s) {
        var g = ctx.createLinearGradient(s.x0, s.y0, s.x1, s.y1);
        g.addColorStop(0, 'rgba(' + rgb + ',' + (s.a0 * alpha).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + rgb + ',' + (s.a1 * alpha).toFixed(3) + ')');
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x1, s.y1);
        ctx.stroke();
      });
    }

    // Glowing line: wide soft halo + mid glow + thin core that carries its own blur (no head dot)
    function draw(b) {
      var segs = trail(b);
      ctx.shadowBlur = 0;
      stroke(segs, 10, '62, 160, 255', 0.1);
      stroke(segs, 4, '62, 213, 255', 0.3);
      ctx.shadowColor = 'rgba(62, 213, 255, 1)';
      ctx.shadowBlur = 12;
      stroke(segs, 1.2, '200, 248, 255', 1);
    }

    function frame(now) {
      if (!running) return;
      var dt = Math.min(now - (last || now), 50);
      last = now;
      if (now >= nextSpawn && bolts.length < 4) {
        spawn();
        nextSpawn = now + 700 + Math.random() * 1500;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = OPACITY;
      bolts = bolts.filter(function (b) {
        advance(b, SPEED * dt);
        draw(b);
        return b.y < h + TRAIL;
      });
      requestAnimationFrame(frame);
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      last = 0;
      if (on) requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);

    // Only animate while the section is on screen and the tab is visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        setRunning(visible && !document.hidden);
      }).observe(sec);
    } else {
      visible = true;
      setRunning(true);
    }
    document.addEventListener('visibilitychange', function () {
      setRunning(visible && !document.hidden);
    });
  })();
})();
