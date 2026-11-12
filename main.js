/* ==========================================================================
   Site behaviour: theme, nav, reveals, case studies, thoughts,
   command palette (⌘K), GitHub stats, copy-to-clipboard.
   ========================================================================== */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var ROOT = root.getAttribute('data-root') || './';
  var GITHUB = 'https://github.com/Mohamed200303';
  var isHome = !!d.getElementById('work');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function icon(id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

  /* ---------- Platform key label ---------- */
  var isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
  $$('[data-mod]').forEach(function (el) { el.textContent = isMac ? '⌘' : 'Ctrl '; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  /* ---------- Clipboard ---------- */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var t = d.createElement('textarea');
      t.value = text; t.setAttribute('readonly', '');
      t.style.position = 'fixed'; t.style.opacity = '0';
      d.body.appendChild(t); t.select();
      try { d.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      t.remove();
    });
  }

  /* ---------- Email (assembled here to keep it away from simple scrapers) ---------- */
  var email = 'muhammadshehawi' + '@' + 'gmail.com';
  $$('[data-email]').forEach(function (a) {
    email = a.getAttribute('data-user') + '@' + a.getAttribute('data-domain');
    a.href = 'mailto:' + email;
    if (!a.hasAttribute('data-keep-label')) a.textContent = email;
  });
  function copyEmail() {
    copy(email).then(function () { toast('Email copied'); }, function () { location.href = 'mailto:' + email; });
  }
  $$('[data-copy-email]').forEach(function (b) { b.addEventListener('click', copyEmail); });

  /* ---------- Theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    storeSet('theme', t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#fafafc' : '#06060a');
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  function toggleTheme() { setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }
  $$('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', toggleTheme); });
  var meta = $('meta[name="theme-color"]');
  if (meta && root.getAttribute('data-theme') === 'light') meta.setAttribute('content', '#fafafc');

  /* ---------- Hero load-in ---------- */
  function loaded() { root.classList.add('is-loaded'); }
  if (d.fonts && d.fonts.ready) {
    Promise.race([d.fonts.ready, new Promise(function (r) { setTimeout(r, 700); })]).then(loaded);
  } else {
    setTimeout(loaded, 80);
  }

  /* ---------- Nav state + scroll progress ---------- */
  var nav = $('#nav'), prog = $('.progress'), ticking = false;
  var navLinks = $$('.nav-links a[href^="#"]');
  var spySections = navLinks.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = root.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (prog) prog.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : '0');

    // Highlight the section whose top has passed 35% of the screen
    var mark = window.innerHeight * 0.35, current = -1;
    spySections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= mark) current = i; });
    if (h > 0 && y >= h - 2) current = spySections.length - 1;
    navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Projects (the list lives in projects.js) ---------- */
  var PROJECTS = (Array.isArray(window.PROJECTS) ? window.PROJECTS : []).filter(function (p) { return p && p.id && p.title; });
  var STAGES = ['Plan', 'Build', 'Launch'];
  var STATUS = {
    live: { label: 'Live', cls: 'is-live' },
    building: { label: 'Now building', cls: 'is-building' },
    finished: { label: 'Finished', cls: 'is-finished' },
    draft: { label: 'Draft', cls: 'is-draft' }
  };
  var VISUALS = {
    browser:
      '<svg viewBox="0 0 320 200"><rect class="viz-frame" x="40" y="26" width="240" height="150" rx="10"/><path class="viz-edge" d="M40 48h240"/>' +
      '<circle class="viz-dot" cx="54" cy="37" r="3"/><circle class="viz-dot" cx="64" cy="37" r="3"/><circle class="viz-dot" cx="74" cy="37" r="3"/>' +
      '<path class="viz-edge" opacity=".9" d="M150 82 190 72M150 82l40 30M150 82l40 58M150 112l40-40M150 112h40M150 112l40 28M150 142l40-70M150 142l40-30M150 142h40M190 72l40 34M190 112l40-6M190 140l40-34"/>' +
      '<path class="viz-flow" stroke="url(#viz-grad-a)" d="M150 112h40l40-6"/>' +
      '<g class="viz-dot"><circle cx="150" cy="82" r="5"/><circle cx="150" cy="112" r="5"/><circle cx="150" cy="142" r="5"/><circle cx="190" cy="72" r="5"/><circle cx="190" cy="112" r="5"/><circle cx="190" cy="140" r="5"/></g>' +
      '<circle class="viz-node-accent viz-pulse" cx="230" cy="106" r="6"/>' +
      '<rect x="62" y="70" width="58" height="8" rx="4" fill="var(--border-strong)"/><rect x="62" y="86" width="40" height="6" rx="3" fill="var(--border)"/>' +
      '<rect x="62" y="126" width="38" height="18" rx="9" fill="url(#viz-grad-a)"/><rect class="viz-frame" x="228" y="146" width="40" height="20" rx="6"/>' +
      '<text class="viz-text-dim" x="248" y="160" text-anchor="middle">⌘K</text></svg>',
    modules:
      '<svg viewBox="0 0 320 200"><rect class="viz-frame" x="52" y="20" width="216" height="160" rx="14"/>' +
      '<rect x="70" y="38" width="74" height="8" rx="4" fill="var(--border-strong)"/><circle class="viz-node-accent viz-pulse" cx="248" cy="42" r="5"/>' +
      '<rect class="viz-node-accent" x="70" y="60" width="56" height="54" rx="10"/><rect class="viz-node-accent" x="132" y="60" width="56" height="54" rx="10"/><rect class="viz-node-accent" x="194" y="60" width="56" height="54" rx="10"/>' +
      '<path class="viz-edge" d="M86 76h24M86 83h24M86 90h16"/>' +
      '<rect class="viz-edge" x="148" y="72" width="24" height="20" rx="3"/><path class="viz-edge" d="M148 78h24M154 69v6M166 69v6"/>' +
      '<circle class="viz-edge" cx="222" cy="81" r="10"/><text class="viz-text-dim" x="222" y="85" text-anchor="middle">£</text>' +
      '<text class="viz-text-dim" x="98" y="107" text-anchor="middle">study</text><text class="viz-text-dim" x="160" y="107" text-anchor="middle">plan</text><text class="viz-text-dim" x="222" y="107" text-anchor="middle">money</text>' +
      '<rect class="viz-ghost" x="70" y="122" width="56" height="42" rx="10"/><rect class="viz-ghost" x="132" y="122" width="56" height="42" rx="10"/><rect class="viz-ghost" x="194" y="122" width="56" height="42" rx="10"/>' +
      '<path class="viz-ghost" d="M98 137v12M92 143h12M160 137v12M154 143h12M222 137v12M216 143h12"/></svg>'
  };

  function el(tag, cls, text) {
    var n = d.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function slug(id) { return String(id).toLowerCase().replace(/[^a-z0-9-]+/g, '-'); }
  function findProject(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (slug(PROJECTS[i].id) === id) return PROJECTS[i];
    return null;
  }
  // Seeded randomness: the same project name always draws the same picture
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function autoVisual(name) {
    var r = seeded(hashStr(name));
    var layers = 3 + Math.floor(r() * 3), cols = [], l, i;
    for (l = 0; l < layers; l++) {
      var n = 2 + Math.floor(r() * 4), x = 70 + 180 * (l / (layers - 1)), col = [];
      for (i = 0; i < n; i++) col.push([Math.round(x), Math.round(100 + (i - (n - 1) / 2) * 30 + (r() - 0.5) * 8)]);
      cols.push(col);
    }
    var edges = '', dots = '', path = '', end = null;
    for (l = 0; l < layers - 1; l++) {
      cols[l].forEach(function (a) {
        cols[l + 1].forEach(function (b) { if (r() < 0.75) edges += 'M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1]; });
      });
    }
    cols.forEach(function (c, k) {
      var p = c[Math.floor(r() * c.length)];
      path += (k ? 'L' : 'M') + p[0] + ' ' + p[1];
      end = p;
      c.forEach(function (q) { dots += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="5"/>'; });
    });
    return '<svg viewBox="0 0 320 200"><path class="viz-edge" opacity=".85" d="' + edges + '"/>' +
      '<path class="viz-flow" stroke="url(#viz-grad-a)" d="' + path + '"/><g class="viz-dot">' + dots + '</g>' +
      '<circle class="viz-node-accent viz-pulse" cx="' + end[0] + '" cy="' + end[1] + '" r="6"/></svg>';
  }
  function statusChip(p) {
    var st = STATUS[p.status] || STATUS.finished;
    return el('span', 'status ' + st.cls, st.label);
  }
  function stagesList(stage) {
    var cur = Math.max(0, STAGES.indexOf(stage));
    var ol = el('ol', 'stages');
    ol.setAttribute('aria-label', 'Progress: ' + STAGES[cur]);
    STAGES.forEach(function (s, i) { ol.appendChild(el('li', i < cur ? 'is-done' : i === cur ? 'is-current' : '', s)); });
    return ol;
  }
  function projectCard(p, index, wide) {
    var a = el('article', 'card project reveal' +
      (p.featured ? ' project--featured' : wide ? ' project--wide' : '') +
      (p.status === 'building' ? ' project--building' : ''));
    a.setAttribute('data-case', slug(p.id));
    a.style.setProperty('--d', ((index % 2) * 0.06) + 's');

    var vis = el('div', 'project-visual');
    vis.setAttribute('aria-hidden', 'true');
    if (p.image) {
      var img = el('img');
      img.src = p.image; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      vis.classList.add('has-image');
      vis.appendChild(img);
    } else {
      vis.innerHTML = VISUALS[p.visual] || autoVisual(slug(p.id));
    }

    var body = el('div', 'project-body');
    var meta = el('div', 'project-meta');
    meta.appendChild(statusChip(p));
    var info = [p.type, p.role, p.year].filter(Boolean).join(' · ');
    if (info) meta.appendChild(el('span', null, info));
    body.appendChild(meta);
    body.appendChild(el('h3', null, p.title));
    if (p.summary) body.appendChild(el('p', null, p.summary));
    if (p.status === 'building') body.appendChild(stagesList(p.stage));
    if (p.tags && p.tags.length) {
      var ul = el('ul', 'tags');
      p.tags.forEach(function (t) { ul.appendChild(el('li', null, t)); });
      body.appendChild(ul);
    }
    var btn = el('button', 'project-open');
    btn.type = 'button';
    btn.innerHTML = esc(p.status === 'building' ? 'See the plan' : 'Read the case study') + icon('i-arrow-ur');
    body.appendChild(btn);

    a.appendChild(vis);
    a.appendChild(body);
    return a;
  }
  function caseContent(p) {
    var frag = d.createDocumentFragment(), cs = p.caseStudy || {};
    var kicker = el('p', 'case-kicker');
    kicker.appendChild(statusChip(p));
    kicker.appendChild(d.createTextNode([p.status === 'building' ? 'Project plan' : 'Case study', p.type, p.role, p.year].filter(Boolean).join(' · ')));
    frag.appendChild(kicker);
    var h = el('h2', null, p.title);
    h.id = 'case-title';
    frag.appendChild(h);
    if (cs.intro || p.summary) frag.appendChild(el('p', 'case-lede', cs.intro || p.summary));
    if (p.status === 'building') frag.appendChild(stagesList(p.stage));
    if (p.image) {
      var fig = el('figure', 'case-shot'), img = el('img');
      img.src = p.image; img.alt = 'Screenshot of ' + p.title; img.loading = 'lazy';
      fig.appendChild(img);
      frag.appendChild(fig);
    }
    if (cs.facts && cs.facts.length) {
      var dl = el('dl', 'case-facts');
      cs.facts.forEach(function (f) {
        var row = el('div');
        row.appendChild(el('dt', null, f[0]));
        row.appendChild(el('dd', null, f[1]));
        dl.appendChild(row);
      });
      frag.appendChild(dl);
    }
    (cs.sections || []).forEach(function (s) {
      if (s.heading) frag.appendChild(el('h3', null, s.heading));
      if (s.text) frag.appendChild(el('p', null, s.text));
      if (s.points && s.points.length) {
        var ul = el('ul');
        s.points.forEach(function (pt) { ul.appendChild(el('li', null, pt)); });
        frag.appendChild(ul);
      }
    });
    var links = (p.links || []).filter(function (l) { return l && l.url && /^(https?:\/\/|\.?\/|[a-z0-9])/i.test(l.url) && !/^javascript:/i.test(l.url); });
    if (links.length) {
      var wrap = el('div', 'case-links');
      links.forEach(function (l) {
        var a = el('a', 'btn btn-ghost btn-sm');
        a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = icon(/github\.com/i.test(l.url) ? 'i-github' : 'i-arrow-ur') + esc(l.label || 'Open');
        wrap.appendChild(a);
      });
      frag.appendChild(wrap);
    }
    return frag;
  }

  var projectGrid = $('#projects');
  if (projectGrid && PROJECTS.length) {
    var featured = PROJECTS.filter(function (p) { return p.featured; }).slice(0, 1);
    var others = PROJECTS.filter(function (p) { return featured.indexOf(p) < 0; });
    featured.concat(others).forEach(function (p, i) {
      // An odd project out at the end gets the full width so nothing sits alone in a row
      var wide = others.length % 2 === 1 && p === others[others.length - 1];
      projectGrid.appendChild(projectCard(p, i, wide));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  $$('.thought').forEach(function (t, i) { t.style.setProperty('--d', ((i % 3) * 0.07) + 's'); });
  if ('IntersectionObserver' in window && !reduced) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Spotlight + tilt on cards, magnetic buttons ---------- */
  if (finePointer) {
    $$('.card').forEach(function (card) {
      var tilt = !reduced && card.classList.contains('project');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        if (tilt) {
          var rx = (y / r.height - 0.5) * -3.2, ry = (x / r.width - 0.5) * 3.2;
          card.style.transition = 'transform .18s ease-out, border-color .35s';
          card.style.transform = 'perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
        }
      });
      card.addEventListener('pointerleave', function () {
        if (!tilt) return;
        card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1), border-color .35s';
        card.style.transform = '';
      });
    });

    if (!reduced) {
      $$('.magnetic').forEach(function (b) {
        b.addEventListener('pointermove', function (e) {
          var r = b.getBoundingClientRect();
          var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
          b.style.transform = 'translate(' + (x * 0.16).toFixed(1) + 'px,' + (y * 0.26).toFixed(1) + 'px)';
        });
        b.addEventListener('pointerleave', function () { b.style.transform = ''; });
      });
    }
  }

  /* ---------- Model card (fed by network.js) ---------- */
  var mcEpoch = $('#mc-epoch'), mcLoss = $('#mc-loss'), mcLine = $('#mc-line'),
      mcStatus = $('#mc-status'), mcWrap = $('#mc-status-wrap'), lossHist = [], HIST = 48;
  window.addEventListener('net:train', function (ev) {
    var x = ev.detail;
    if (mcEpoch) mcEpoch.textContent = x.epoch;
    if (mcLoss) mcLoss.textContent = x.loss.toFixed(3);
    if (mcStatus) mcStatus.textContent = x.done ? 'converged' : 'training';
    if (mcWrap) mcWrap.classList.toggle('is-done', !!x.done);
    if (!mcLine) return;
    if (x.done && !lossHist.length) {
      // Arrived already trained (reduced motion): draw the curve it would have taken
      for (var k = 0; k < HIST - 1; k++) lossHist.push(0.014 + 2.29 * Math.exp(-k / 6));
    }
    lossHist.push(x.loss);
    if (lossHist.length > HIST) lossHist.shift();
    var max = Math.max.apply(null, lossHist.concat([0.05]));
    var pts = lossHist.map(function (v, i) {
      var px = lossHist.length < 2 ? 0 : (i / (HIST - 1)) * 100;
      var py = 2 + (1 - Math.sqrt(v / max)) * 18;
      return px.toFixed(1) + ',' + py.toFixed(1);
    });
    if (pts.length === 1) pts.push('0.5,' + pts[0].split(',')[1]);
    mcLine.setAttribute('points', pts.join(' '));
  });
  var hint = $('#hero-hint');
  if (hint && !finePointer) hint.textContent = 'tap anywhere to perturb the weights';

  /* ---------- Case studies ---------- */
  var dlg = $('#case-dialog'), dlgContent = $('#case-content'), lastFocus = null;
  function openCase(id) {
    var p = findProject(id);
    if (!p || !dlg) return;
    dlgContent.innerHTML = '';
    dlgContent.appendChild(caseContent(p));
    lastFocus = d.activeElement;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    var sc = dlg.querySelector('.case-scroll'); if (sc) sc.scrollTop = 0;
    root.style.overflow = 'hidden';
    try { history.replaceState(null, '', '#project-' + id); } catch (e) {}
  }
  function closeCase() {
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close();
    else { dlg.removeAttribute('open'); onClose(); }
  }
  function onClose() {
    root.style.overflow = '';
    if (location.hash.indexOf('#project-') === 0) {
      try { history.replaceState(null, '', location.pathname + location.search + '#work'); } catch (e) {}
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  if (dlg) {
    dlg.addEventListener('close', onClose);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCase(); });
    $$('[data-close-case]').forEach(function (b) { b.addEventListener('click', closeCase); });
  }
  $$('[data-case]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      openCase(card.getAttribute('data-case'));
    });
  });

  /* ---------- Thoughts ---------- */
  var thoughts = $$('.thought');
  var pageBase = location.href.split('#')[0];
  thoughts.forEach(function (t) {
    var text = t.querySelector('blockquote').textContent.trim();
    var link = pageBase + '#' + t.id;
    var acts = t.querySelector('.thought-actions');
    if (!acts) return;
    acts.innerHTML =
      '<button type="button" aria-label="Copy a link to this thought">' + icon('i-link') + '</button>' +
      '<a target="_blank" rel="noopener" aria-label="Share this thought on X">' + icon('i-x') + '</a>';
    acts.querySelector('button').addEventListener('click', function () {
      copy(link).then(function () { toast('Link copied'); }, function () { toast('Couldn’t copy. Try again.'); });
    });
    acts.querySelector('a').href = 'https://x.com/intent/post?text=' +
      encodeURIComponent('“' + text + '” — Mohamed Salem') + '&url=' + encodeURIComponent(link);
  });

  var filters = $$('[data-filter]');
  function applyFilter(f) {
    filters.forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    thoughts.forEach(function (t) {
      t.classList.toggle('is-hidden', f !== 'all' && t.getAttribute('data-topic') !== f);
      t.classList.add('is-in');
    });
  }
  filters.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });

  function flash(el) { el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); }
  var lastRandom = -1;
  function randomThought() {
    if (!thoughts.length) { location.href = ROOT + '#thoughts'; return; }
    applyFilter('all');
    var i;
    do { i = Math.floor(Math.random() * thoughts.length); } while (i === lastRandom && thoughts.length > 1);
    lastRandom = i;
    var t = thoughts[i];
    t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    setTimeout(function () { flash(t); }, reduced ? 0 : 500);
  }
  $$('[data-random-thought]').forEach(function (b) { b.addEventListener('click', randomThought); });

  /* ---------- Deep links ---------- */
  function handleHash() {
    var h = location.hash;
    if (!h) return;
    if (h.indexOf('#project-') === 0) { openCase(h.slice(9)); return; }
    if (h.indexOf('#t-') === 0) {
      var t = d.getElementById(h.slice(1));
      if (t) { t.classList.add('is-in'); setTimeout(function () { t.scrollIntoView({ block: 'center' }); flash(t); }, 300); }
    }
  }
  if (isHome) handleHash();

  /* ---------- GitHub (public API, cached for 30 minutes) ---------- */
  var LANG_COLORS = {
    Python: '#3572A5', C: '#8a8a8a', 'C++': '#f34b7d', JavaScript: '#f1e05a', TypeScript: '#3178c6',
    Java: '#b07219', HTML: '#e34c26', CSS: '#663399', 'Jupyter Notebook': '#DA5B0B', Shell: '#89e051',
    Rust: '#dea584', Go: '#00ADD8', 'C#': '#178600', Kotlin: '#A97BFF', Swift: '#F05138'
  };
  var gh = $('[data-gh-user]');
  if (gh) loadGitHub(gh);

  function loadGitHub(card) {
    var user = card.getAttribute('data-gh-user');
    var body = card.querySelector('[data-gh-body]');
    // Cache in localStorage: fresh for 30 minutes, and kept as a fallback if GitHub is unreachable
    // (the public API allows 60 requests per hour per visitor).
    var key = 'gh:' + user, cached = null;
    try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { cached = null; }
    if (cached && Date.now() - cached.t < 30 * 60 * 1000) { render(cached.u, cached.r); return; }

    function ok(res) { if (!res.ok) throw new Error('GitHub ' + res.status); return res.json(); }
    Promise.all([
      fetch('https://api.github.com/users/' + encodeURIComponent(user)).then(ok),
      fetch('https://api.github.com/users/' + encodeURIComponent(user) + '/repos?per_page=100&sort=pushed').then(ok)
    ]).then(function (res) {
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), u: res[0], r: res[1] })); } catch (e) {}
      render(res[0], res[1]);
    }).catch(function () {
      if (cached) { render(cached.u, cached.r); return; }
      body.innerHTML = '<div class="gh-empty"><p>Code, experiments and works in progress.</p>' +
        '<p><a href="' + GITHUB + '" target="_blank" rel="noopener">See everything on GitHub</a></p></div>';
    });

    function render(u, repos) {
      repos = (repos || []).filter(function (r) { return !r.fork; });
      if (!repos.length) {
        body.innerHTML = '<div class="gh-empty"><p>New account. First public repos are on the way.</p>' +
          '<p>This card fills in by itself as code lands. <a href="' + GITHUB + '" target="_blank" rel="noopener">Follow along on GitHub</a></p></div>';
        return;
      }
      var stars = repos.reduce(function (s, r) { return s + (r.stargazers_count || 0); }, 0);
      var langs = {};
      repos.forEach(function (r) { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
      var ranked = Object.keys(langs).map(function (k) { return [k, langs[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
      var total = ranked.reduce(function (s, x) { return s + x[1]; }, 0) || 1;
      var top = ranked.length ? ranked[0][0] : '—';

      var html = '<div class="gh-stats">' +
        stat(u.public_repos != null ? u.public_repos : repos.length, 'repos') +
        stat(stars, 'stars') +
        stat(u.followers || 0, 'followers') +
        stat(top, 'top language') + '</div>';

      if (ranked.length) {
        html += '<div class="lang-bar" role="img" aria-label="Languages used across public repos">' +
          ranked.slice(0, 6).map(function (x) {
            return '<span style="width:' + (x[1] / total * 100).toFixed(2) + '%;background:' + (LANG_COLORS[x[0]] || 'var(--accent)') + '"></span>';
          }).join('') + '</div><ul class="lang-legend">' +
          ranked.slice(0, 6).map(function (x) {
            return '<li><i style="background:' + (LANG_COLORS[x[0]] || 'var(--accent)') + '"></i>' + esc(x[0]) + ' ' + Math.round(x[1] / total * 100) + '%</li>';
          }).join('') + '</ul>';
      }

      html += '<ul class="repo-list">' + repos.slice(0, 3).map(function (r) {
        return '<li><a href="' + esc(r.html_url) + '" target="_blank" rel="noopener"><strong>' + esc(r.name) + '</strong><span>' +
          esc(r.language || '') + (r.stargazers_count ? ' ★ ' + r.stargazers_count : '') + '</span></a></li>';
      }).join('') + '</ul>';
      body.innerHTML = html;
    }
    function stat(v, label) { return '<div class="stat"><b>' + esc(v) + '</b><span>' + esc(label) + '</span></div>'; }
  }

  /* ---------- Command palette ---------- */
  function goTo(hash) {
    if (!isHome) { location.href = ROOT + 'index.html' + hash; return; }
    var el = d.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', hash); } catch (e) {}
  }
  function goCase(id) {
    if (!isHome) { location.href = ROOT + 'index.html#project-' + id; return; }
    openCase(id);
  }

  // One menu entry per project in projects.js, so new projects appear here by themselves
  var projectCommands = PROJECTS.map(function (p) {
    return {
      g: 'Projects', label: p.title, icon: 'i-box',
      hint: p.status === 'building' ? 'now building' : 'case study',
      k: [p.type, p.summary, (p.tags || []).join(' ')].join(' ').toLowerCase(),
      run: function () { goCase(slug(p.id)); }
    };
  });

  var commands = [
    { g: 'Navigate', label: 'Home', icon: 'i-home', k: 'top start hero', run: function () { goTo('#top'); } },
    { g: 'Navigate', label: 'Work', icon: 'i-box', k: 'projects portfolio case studies', run: function () { goTo('#work'); } },
    { g: 'Navigate', label: 'Thoughts', icon: 'i-quote', k: 'aphorisms ideas beliefs quotes', run: function () { goTo('#thoughts'); } },
    { g: 'Navigate', label: 'Writing', icon: 'i-pen', k: 'blog essays posts', run: function () { goTo('#writing'); } },
    { g: 'Navigate', label: 'Toolbox', icon: 'i-tool', k: 'skills stack languages github', run: function () { goTo('#toolbox'); } },
    { g: 'Navigate', label: 'About', icon: 'i-user', k: 'bio story nottingham', run: function () { goTo('#about'); } },
    { g: 'Navigate', label: 'Contact', icon: 'i-mail', k: 'email reach hire internship', run: function () { goTo('#contact'); } }
  ].concat(projectCommands, [
    { g: 'Writing', label: 'What my first year of CS is teaching me', hint: 'essay', icon: 'i-pen', k: 'blog first year cs50 c math', run: function () { location.href = ROOT + 'first-year-of-cs.html'; } },
    { g: 'Actions', label: 'Copy email address', icon: 'i-copy', k: 'contact mail clipboard', run: copyEmail },
    { g: 'Actions', label: 'Send an email', icon: 'i-mail', k: 'contact mail write', run: function () { location.href = 'mailto:' + email; } },
    { g: 'Actions', label: 'Open GitHub', icon: 'i-github', k: 'code repos source', run: function () { window.open(GITHUB, '_blank', 'noopener'); } },
    { g: 'Actions', label: function () { return root.getAttribute('data-theme') === 'light' ? 'Switch to dark mode' : 'Switch to light mode'; }, icon: 'i-sun', k: 'theme dark light appearance toggle', run: toggleTheme },
    { g: 'Actions', label: 'Show me a random thought', icon: 'i-shuffle', k: 'quote idea surprise', run: function () { if (isHome) randomThought(); else location.href = ROOT + 'index.html#thoughts'; } }
  ]);
  function labelOf(c) { return typeof c.label === 'function' ? c.label() : c.label; }

  var pal = d.createElement('div');
  pal.className = 'palette';
  pal.setAttribute('role', 'dialog');
  pal.setAttribute('aria-modal', 'true');
  pal.setAttribute('aria-label', 'Command menu');
  pal.innerHTML =
    '<div class="palette-backdrop" data-pal-close></div>' +
    '<div class="palette-panel">' +
      '<div class="palette-input">' + icon('i-search') +
        '<input type="text" placeholder="Search or jump to…" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" autocomplete="off" spellcheck="false">' +
        '<span class="kbd">esc</span></div>' +
      '<ul class="palette-list" id="pal-list" role="listbox" aria-label="Commands"></ul>' +
      '<div class="palette-foot"><span><span class="kbd">↑↓</span>navigate</span><span><span class="kbd">↵</span>select</span><span><span class="kbd">esc</span>close</span></div>' +
    '</div>';
  d.body.appendChild(pal);

  var palInput = $('input', pal), palList = $('.palette-list', pal), shown = [], sel = 0, palFocus = null;

  function score(c, q) {
    if (!q) return 1;
    var label = labelOf(c).toLowerCase();
    var hay = label + ' ' + (c.k || '') + ' ' + c.g.toLowerCase();
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) < 0) return 0;
    return label.indexOf(words[0]) === 0 ? 3 : label.indexOf(words[0]) > -1 ? 2 : 1;
  }

  function renderPalette() {
    var q = palInput.value.trim();
    var res = commands.map(function (c, i) { return { c: c, s: score(c, q), i: i }; }).filter(function (x) { return x.s > 0; });
    if (q) res.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    shown = res.map(function (x) { return x.c; });
    if (sel >= shown.length) sel = 0;

    if (!shown.length) {
      palList.innerHTML = '<li class="palette-empty">Nothing matches “' + esc(q) + '”</li>';
      palInput.removeAttribute('aria-activedescendant');
      return;
    }
    var html = '', group = null;
    shown.forEach(function (c, i) {
      if (!q && c.g !== group) { group = c.g; html += '<li class="palette-group" role="presentation">' + esc(group) + '</li>'; }
      html += '<li class="palette-item" role="option" id="pal-opt-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
        icon(c.icon) + '<span>' + esc(labelOf(c)) + '</span>' + (c.hint ? '<span class="hint">' + esc(c.hint) + '</span>' : '') + '</li>';
    });
    palList.innerHTML = html;
    palInput.setAttribute('aria-activedescendant', 'pal-opt-' + sel);
  }

  function setSel(i) {
    if (!shown.length) return;
    sel = (i + shown.length) % shown.length;
    $$('.palette-item', palList).forEach(function (el) {
      el.setAttribute('aria-selected', String(+el.getAttribute('data-i') === sel));
    });
    var cur = $('#pal-opt-' + sel, palList);
    if (cur) cur.scrollIntoView({ block: 'nearest' });
    palInput.setAttribute('aria-activedescendant', 'pal-opt-' + sel);
  }

  function openPalette() {
    if (pal.classList.contains('is-open')) return;
    palFocus = d.activeElement;
    pal.classList.add('is-open');
    palInput.value = ''; sel = 0;
    renderPalette();
    root.style.overflow = 'hidden';
    setTimeout(function () { palInput.focus(); }, 10);
  }
  function closePalette(restoreFocus) {
    if (!pal.classList.contains('is-open')) return;
    pal.classList.remove('is-open');
    if (!(dlg && dlg.open)) root.style.overflow = '';
    if (restoreFocus !== false && palFocus && palFocus.focus) palFocus.focus({ preventScroll: true });
  }
  function runSel(i) {
    var c = shown[i];
    if (!c) return;
    closePalette(false);
    setTimeout(c.run, 30);
  }

  palInput.addEventListener('input', function () { sel = 0; renderPalette(); });
  palInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(sel - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    else if (e.key === 'Tab') { e.preventDefault(); setSel(sel + (e.shiftKey ? -1 : 1)); }
  });
  palList.addEventListener('pointermove', function (e) {
    var it = e.target.closest('.palette-item');
    if (it && +it.getAttribute('data-i') !== sel) setSel(+it.getAttribute('data-i'));
  });
  palList.addEventListener('click', function (e) {
    var it = e.target.closest('.palette-item');
    if (it) runSel(+it.getAttribute('data-i'));
  });
  $('[data-pal-close]', pal).addEventListener('click', function () { closePalette(); });
  $$('[data-palette-open]').forEach(function (b) { b.addEventListener('click', openPalette); });

  d.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      if (pal.classList.contains('is-open')) closePalette(); else openPalette();
      return;
    }
    var typing = /input|textarea|select/i.test((d.activeElement || {}).tagName || '') || (d.activeElement && d.activeElement.isContentEditable);
    if (k === '/' && !typing && !pal.classList.contains('is-open') && !(dlg && dlg.open)) {
      e.preventDefault(); openPalette();
    }
  });
})();
