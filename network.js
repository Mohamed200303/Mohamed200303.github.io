/* ==========================================================================
   Hero neural network
   A small multilayer network (4-7-7-5-3) rendered in 3D on a 2D canvas.
   - On load the weights start random and the network "trains" into shape.
   - Signals travel forward through the layers; colour = sign of the weight.
   - Click (or tap) the hero to perturb the weights and watch it relearn.
   - Emits `net:train` events so the model card can show epoch and loss.
   No libraries. Pauses when off-screen. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('net');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero') || canvas.parentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LAYERS = [4, 7, 7, 5, 3];
  var FOV = 4.2;
  var TAU = Math.PI * 2;

  var nodes = [], edges = [], outEdges = [], dust = [], pulses = [], order = [];
  var W = 1, H = 1, DPR = 1, CX = 0, CY = 0, R = 1, A = 1;
  var roll = 0, yaw = 0, pitch = -0.18, spin = 1;
  var theme = {};
  var tmp = { px: 0, py: 0, ps: 1, pz: 0 };
  var mouse = { x: 0.5, y: 0.5, px: -9999, py: -9999 };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  /* ---------- Build the network ---------- */
  (function build() {
    var span = LAYERS.length - 1;
    var id = 0;
    LAYERS.forEach(function (n, li) {
      var x = (li / span - 0.5) * 2.8;
      var radius = 0.28 + Math.sqrt(n) * 0.3;
      for (var i = 0; i < n; i++) {
        // Golden-angle spiral on a disc: even spacing for any layer size
        var r = radius * Math.sqrt((i + 0.5) / n);
        var th = i * 2.39996 + li * 0.9;
        var node = {
          id: id++, layer: li,
          tx: x, ty: Math.cos(th) * r, tz: Math.sin(th) * r,
          x: 0, y: 0, z: 0, sx: 0, sy: 0, sz: 0,
          act: 0, px: -9999, py: -9999, ps: 1, pz: 0
        };
        nodes.push(node);
        order.push(node);
      }
    });

    var start = 0;
    for (var li = 0; li < span; li++) {
      var a0 = start, a1 = start + LAYERS[li], b1 = a1 + LAYERS[li + 1];
      for (var a = a0; a < a1; a++) {
        for (var b = a1; b < b1; b++) {
          var e = { a: nodes[a], b: nodes[b], w: rand(-1, 1) };
          edges.push(e);
          (outEdges[a] = outEdges[a] || []).push(e);
        }
      }
      start = a1;
    }

    for (var d = 0; d < 90; d++) {
      var u = rand(-1, 1), t = rand(0, TAU), rr = rand(1.7, 3.8), s = Math.sqrt(1 - u * u);
      dust.push({ x: rr * s * Math.cos(t), y: rr * u * 0.75, z: rr * s * Math.sin(t), r: rand(0.5, 1.3) });
    }
  })();

  /* ---------- Training simulation ---------- */
  var train = { t: 0, dur: 3.4, loss0: 2.303, loss: 2.303, epoch: 0, base: 0, done: false, first: true, p: 0, idle: 0 };

  function begin(perturb) {
    nodes.forEach(function (n) {
      if (perturb) {
        var k = 0.95;
        n.sx = n.x + rand(-1, 1) * k; n.sy = n.y + rand(-1, 1) * k; n.sz = n.z + rand(-1, 1) * k;
      } else {
        n.sx = rand(-2.4, 2.4); n.sy = rand(-1.7, 1.7); n.sz = rand(-1.7, 1.7);
        n.x = n.sx; n.y = n.sy; n.z = n.sz;
      }
    });
    if (perturb) {
      edges.forEach(function (e) { e.w = clamp(e.w + rand(-0.7, 0.7), -1, 1); });
      train.dur = 2.3;
      train.loss0 = rand(0.7, 1.3);
      train.first = false;
      spin = 3.2;
    }
    train.t = 0; train.done = false; train.base = train.epoch; train.p = 0;
  }

  function settle() {
    nodes.forEach(function (n) { n.x = n.tx; n.y = n.ty; n.z = n.tz; });
    train.done = true; train.p = 1; train.first = false; train.epoch = 128; train.loss = 0.014;
  }

  /* ---------- Signals ---------- */
  function fire(n) {
    n.act = 1;
    var outs = outEdges[n.id];
    if (!outs || pulses.length > 120) return;
    for (var i = 0; i < outs.length; i++) {
      var e = outs[i];
      if (Math.random() < Math.abs(e.w) * 0.55) pulses.push({ e: e, t: 0, speed: rand(1.4, 2.3) });
    }
  }
  function arrive(n) { if (n.act < 0.5) fire(n); else n.act = 1; }
  function forwardPass() {
    for (var i = 0; i < LAYERS[0]; i++) if (Math.random() < 0.8) fire(nodes[i]);
  }

  /* ---------- Theme ---------- */
  function readTheme() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    theme = light ? {
      comp: 'source-over', pos: '37,99,235', neg: '124,58,237', node: '70,56,190', ring: '124,58,237',
      core: '79,70,229', halo: '124,58,237', dust: '40,40,100', dustA: 0.28, edge: 0.34
    } : {
      comp: 'lighter', pos: '96,165,250', neg: '167,139,250', node: '214,206,255', ring: '167,139,250',
      core: '255,255,255', halo: '150,120,255', dust: '200,200,255', dustA: 0.5, edge: 0.42
    };
  }

  /* ---------- Layout ---------- */
  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    if (W >= 981) {
      CX = W * 0.67; CY = H * 0.43; R = Math.min(W * 0.185, H * 0.34); A = 1;
    } else {
      CX = W * 0.5; CY = H * 0.22; R = Math.min(W * 0.28, H * 0.17); A = 0.85;
    }
    if (reduced || !running) draw();
  }

  /* ---------- Update ---------- */
  var passTimer = 0.4;
  function update(dt, now) {
    if (!train.done) {
      train.t += dt;
      var p = Math.min(1, train.t / train.dur), e = easeOut(p);
      var jitter = (1 - e) * 0.09;
      nodes.forEach(function (n) {
        n.x = lerp(n.sx, n.tx, e) + Math.sin(now * 0.006 + n.id * 1.7) * jitter;
        n.y = lerp(n.sy, n.ty, e) + Math.cos(now * 0.005 + n.id * 2.3) * jitter;
        n.z = lerp(n.sz, n.tz, e);
      });
      train.loss = 0.014 + (train.loss0 - 0.014) * Math.exp(-4.4 * p) + (1 - p) * 0.05 * Math.random();
      train.epoch = train.base + Math.floor(p * (train.first ? 128 : 64));
      train.p = e;
      if (p >= 1) { train.done = true; train.idle = 0; }
    } else {
      train.idle += dt;
      if (train.idle > 0.6) {
        train.idle = 0; train.epoch += 1;
        train.loss = Math.max(0.006, train.loss * 0.985 + rand(-0.0015, 0.0015));
      }
      nodes.forEach(function (n) {
        n.x = n.tx + Math.sin(now * 0.0007 + n.id) * 0.018;
        n.y = n.ty + Math.cos(now * 0.0006 + n.id * 1.3) * 0.018;
        n.z = n.tz;
      });
    }

    spin += (1 - spin) * Math.min(1, dt * 1.2);
    roll += dt * 0.1 * spin;
    var yawT = Math.sin(now * 0.00012) * 0.42 + (mouse.x - 0.5) * 0.7;
    var pitchT = -0.18 + (mouse.y - 0.5) * 0.35;
    var k = Math.min(1, dt * 2.6);
    yaw += (yawT - yaw) * k;
    pitch += (pitchT - pitch) * k;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.act = Math.max(0, n.act - dt * 1.5);
      var dx = n.px - mouse.px, dy = n.py - mouse.py, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        n.act = Math.max(n.act, 0.75 * (1 - dist / 80));
        if (dist < 26 && Math.random() < dt * 4) fire(n);
      }
    }

    for (var j = pulses.length - 1; j >= 0; j--) {
      var pl = pulses[j];
      pl.t += dt * pl.speed;
      if (pl.t >= 1) { pulses.splice(j, 1); arrive(pl.e.b); }
    }

    passTimer -= dt;
    if (passTimer <= 0) { forwardPass(); passTimer = train.done ? rand(1.1, 1.9) : 0.5; }
  }

  /* ---------- Draw ---------- */
  var cr, sr, cyw, syw, cp, sp;
  function project(o, x, y, z) {
    var y1 = y * cr - z * sr, z1 = y * sr + z * cr;
    var x2 = x * cyw + z1 * syw, z2 = -x * syw + z1 * cyw;
    var y3 = y1 * cp - z2 * sp, z3 = y1 * sp + z2 * cp;
    var s = FOV / (FOV + z3);
    o.px = CX + x2 * s * R; o.py = CY + y3 * s * R; o.ps = s; o.pz = z3;
  }

  function draw() {
    cr = Math.cos(roll); sr = Math.sin(roll);
    cyw = Math.cos(yaw); syw = Math.sin(yaw);
    cp = Math.cos(pitch); sp = Math.sin(pitch);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = theme.comp;

    var i, n;
    for (i = 0; i < nodes.length; i++) { n = nodes[i]; project(n, n.x, n.y, n.z); }

    // Dust: depth cue
    for (i = 0; i < dust.length; i++) {
      var d = dust[i];
      project(tmp, d.x, d.y, d.z);
      var da = theme.dustA * clamp(tmp.ps - 0.45, 0, 1) * A;
      if (da < 0.01) continue;
      ctx.fillStyle = 'rgba(' + theme.dust + ',' + da.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(tmp.px, tmp.py, d.r * tmp.ps, 0, TAU); ctx.fill();
    }

    // Edges
    var vis = train.first ? train.p : 0.4 + 0.6 * train.p;
    if (train.done) vis = 1;
    ctx.lineWidth = 1;
    for (i = 0; i < edges.length; i++) {
      var e = edges[i];
      var depth = clamp(((e.a.ps + e.b.ps) * 0.5 - 0.6) * 1.7, 0.15, 1);
      var hi = Math.max(e.a.act, e.b.act);
      var ea = (theme.edge * Math.abs(e.w) * depth + hi * 0.22) * vis * A;
      if (ea < 0.012) continue;
      ctx.strokeStyle = 'rgba(' + (e.w > 0 ? theme.pos : theme.neg) + ',' + ea.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(e.a.px, e.a.py); ctx.lineTo(e.b.px, e.b.py); ctx.stroke();
    }

    // Signals
    for (i = 0; i < pulses.length; i++) {
      var p = pulses[i], a = p.e.a, b = p.e.b, t = p.t;
      var x = a.px + (b.px - a.px) * t, y = a.py + (b.py - a.py) * t, s = a.ps + (b.ps - a.ps) * t;
      ctx.fillStyle = 'rgba(' + (p.e.w > 0 ? theme.pos : theme.neg) + ',' + (0.2 * A).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(' + theme.core + ',' + (0.95 * A).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, 1.7 * s, 0, TAU); ctx.fill();
    }

    // Neurons, back to front
    order.sort(function (m, q) { return q.pz - m.pz; });
    for (i = 0; i < order.length; i++) {
      n = order[i];
      var sc = n.ps;
      var rad = 2.7 * sc + n.act * 2.4;
      var depthA = clamp((sc - 0.55) * 1.9, 0.28, 1);
      if (n.act > 0.03) {
        var hr = rad * 6.5;
        var g = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, hr);
        g.addColorStop(0, 'rgba(' + theme.halo + ',' + (0.38 * n.act * A).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + theme.halo + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.px, n.py, hr, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = 'rgba(' + theme.node + ',' + (depthA * (0.6 + 0.4 * n.act) * A).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(n.px, n.py, rad, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(' + theme.ring + ',' + (depthA * 0.45 * A).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(n.px, n.py, rad + 2.6 * sc, 0, TAU); ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- Model card events ---------- */
  var lastEmit = 0;
  function emit(now, force) {
    if (!force && now - lastEmit < 90) return;
    lastEmit = now;
    window.dispatchEvent(new CustomEvent('net:train', {
      detail: { epoch: train.epoch, loss: train.loss, done: train.done }
    }));
  }

  /* ---------- Loop ---------- */
  var running = false, raf = 0, last = 0, onScreen = true;
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    update(dt, now);
    draw();
    emit(now);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduced) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* ---------- Input ---------- */
  window.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.px = e.clientX - r.left; mouse.py = e.clientY - r.top;
    mouse.x = clamp(mouse.px / r.width, 0, 1);
    mouse.y = clamp(mouse.py / r.height, 0, 1);
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.px = mouse.py = -9999; });

  hero.addEventListener('click', function (e) {
    if (reduced) return;
    if (e.target.closest('a, button, input, textarea, .model-card, .eyebrow')) return;
    begin(true);
    // Fire the neuron nearest the click, then a full forward pass
    var r = canvas.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top, best = null, bd = 1e9;
    nodes.forEach(function (n) { var dd = (n.px - cx) * (n.px - cx) + (n.py - cy) * (n.py - cy); if (dd < bd) { bd = dd; best = n; } });
    if (best) fire(best);
    forwardPass();
  });

  /* ---------- Init ---------- */
  readTheme();
  if (reduced) {
    settle();
  } else {
    begin(false);
  }
  resize();
  // main.js loads after this file, so announce the settled state once the page is ready
  if (reduced) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { emit(0, true); });
    else setTimeout(function () { emit(0, true); }, 0);
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);

  window.addEventListener('themechange', function () { readTheme(); if (!running) draw(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen && !document.hidden) start(); else stop();
    }).observe(canvas);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (onScreen) start();
  });
})();
