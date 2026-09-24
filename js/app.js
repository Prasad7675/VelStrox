(function () {
  'use strict';

  /* ============================================================
     SITE SETTINGS — edit these values to make the site yours
     ============================================================ */
  var CONFIG = {
    EMAIL: 'velstrox4@gmail.com',   // shown across the site and used by the contact form
    PHONE: '',                        // e.g. '+91 98765 43210'  (row is hidden until you add one)
    LINKEDIN: '',                     // e.g. 'https://www.linkedin.com/in/your-profile' (row hidden until set)
    SCHEDULE_URL: ''                  // optional Calendly / Cal.com link; if empty, "Schedule a Call" opens the brief form
  };
  /* ============================================================ */

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- Settings applied to the page ---------- */
  function gmailComposeUrl(opts) {
    opts = opts || {};
    var params = ['view=cm', 'fs=1', 'to=' + encodeURIComponent(CONFIG.EMAIL)];
    if (opts.subject) params.push('su=' + encodeURIComponent(opts.subject));
    if (opts.body) params.push('body=' + encodeURIComponent(opts.body));
    return 'https://mail.google.com/mail/?' + params.join('&');
  }
  $$('[data-email]').forEach(function (a) { a.setAttribute('href', gmailComposeUrl()); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); if (!a.querySelector('span,svg')) a.textContent = CONFIG.EMAIL; });
  $$('[data-email-text]').forEach(function (s) { s.textContent = CONFIG.EMAIL; });
  $$('.nav-contact a').forEach(function (a) { a.textContent = CONFIG.EMAIL; });
  if (CONFIG.PHONE) { var pr = $('#row-phone'); pr.hidden = false; var pl = $('#phone-link'); pl.textContent = CONFIG.PHONE; pl.href = 'tel:' + CONFIG.PHONE.replace(/[^+\d]/g, ''); }
  if (CONFIG.LINKEDIN) { $('#row-link').hidden = false; $('#linkedin-link').href = CONFIG.LINKEDIN; }
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Split headings into words ---------- */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach(function (word, i) {
      var o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      var n = document.createElement('span'); n.className = 'wi'; n.style.setProperty('--i', i); n.textContent = word;
      o.appendChild(n); el.appendChild(o); el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Numbers ---------- */
  function fmt(el, v) {
    var dec = +el.getAttribute('data-decimals') || 0;
    el.textContent = (el.getAttribute('data-prefix') || '') + v.toFixed(dec) + (el.getAttribute('data-suffix') || '');
  }
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || 0);
    var g = el.closest('.gauge');
    var delay = g ? parseInt(getComputedStyle(g).getPropertyValue('--gd'), 10) || 0 : 0;
    var dur = 1700;
    setTimeout(function () {
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        fmt(el, from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, delay);
  }
  if (!reduce) $$('.count').forEach(function (el) { fmt(el, parseFloat(el.getAttribute('data-from') || 0)); });

  /* ---------- Typewriter ---------- */
  var typers = $$('.typer');
  typers.forEach(function (p) {
    var full = p.getAttribute('data-text');
    var sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = full;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); vis.textContent = reduce ? full : '';
    p.textContent = ''; p.appendChild(sr); p.appendChild(vis); p._vis = vis; p._full = full;
  });
  function runTyper(p) {
    if (reduce) return;
    var i = 0, vis = p._vis, full = p._full;
    vis.classList.add('caret');
    (function step() {
      i += 1; vis.textContent = full.slice(0, i);
      if (i < full.length) setTimeout(step, 24); else setTimeout(function () { vis.classList.remove('caret'); }, 1400);
    })();
  }

  /* ---------- Rocket on the flight path ---------- */
  function startRocket() {
    var a = document.getElementById('rocket-anim');
    if (a && a.beginElement) { try { a.beginElement(); } catch (e) {} }
  }

  /* ---------- Reveal on scroll ---------- */
  var heroEls = $$('#top [data-reveal], #top [data-split]');
  var watch = $$('[data-reveal],[data-split],[data-inview],.gauge').filter(function (el) { return heroEls.indexOf(el) === -1; });
  var counters = $$('.count');
  if (reduce || !('IntersectionObserver' in window)) {
    watch.concat(heroEls).forEach(function (el) { el.classList.add('in'); });
    if (!reduce) startRocket();
    typers.forEach(function (p) { p._vis.textContent = p._full; });
    if (!reduce) counters.forEach(function (el) { fmt(el, parseFloat(el.getAttribute('data-count'))); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in'); io.unobserve(e.target);
          if (e.target.classList.contains('flight')) startRocket();
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    watch.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; io2.unobserve(t);
        if (t.classList.contains('typer')) runTyper(t); else runCount(t);
      });
    }, { threshold: 0.7 });
    counters.forEach(function (el) { io2.observe(el); });
    typers.forEach(function (el) { io2.observe(el); });
  }

  /* ---------- Intro, then hero ---------- */
  var intro = $('#intro');
  var seen = false;
  try { seen = sessionStorage.getItem('es-intro') === '1'; } catch (e) {}
  function startHero() { heroEls.forEach(function (el) { el.classList.add('in'); }); }
  if (reduce || seen || !intro) {
    if (intro) intro.remove();
    startHero();
  } else {
    setTimeout(function () {
      intro.classList.add('out');
      setTimeout(startHero, 380);
      setTimeout(function () { intro.remove(); }, 1100);
      try { sessionStorage.setItem('es-intro', '1'); } catch (e) {}
    }, 1250);
  }

  /* ---------- Marquees ---------- */
  $$('[data-marquee]').forEach(function (mq) {
    var track = $('.mq-track', mq);
    for (var i = 0; i < 2; i++) { var c = track.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c); }
  });

  /* ---------- Scroll: progress bar, nav state, scroll-spy ---------- */
  var nav = $('#nav'), bar = $('#progress');
  var ticking = false;
  function onScroll() {
    var h = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    nav.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var links = $$('#navlinks a'), ind = $('#navind'), navWrap = ind.parentNode;
  function setActive(id) {
    var active = null;
    links.forEach(function (a) { var on = a.getAttribute('href') === '#' + id; a.classList.toggle('active', on); if (on) active = a; });
    if (!active) { ind.style.opacity = 0; return; }
    var r = active.getBoundingClientRect(), w = navWrap.getBoundingClientRect();
    ind.style.width = (r.width - 28) + 'px';
    ind.style.transform = 'translateX(' + (r.left - w.left + 14) + 'px)';
    ind.style.opacity = 1;
  }
  if ('IntersectionObserver' in window) {
    var current = '';
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { current = e.target.id; setActive(current); }
        else if (current === e.target.id && e.boundingClientRect.top > 0) { current = ''; setActive(''); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spy.observe(s); });
    window.addEventListener('resize', function () { setActive(current); });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger'), mmenu = $('#mmenu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mmenu.classList.toggle('open', open); mmenu.setAttribute('aria-hidden', !open);
    root.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a.m, #mmenu .btn').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mmenu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1060) setMenu(false); });

  /* ---------- FAQ accordion ---------- */
  var qas = $$('.qa');
  qas.forEach(function (qa) {
    var btn = $('button', qa);
    btn.addEventListener('click', function () {
      var open = !qa.classList.contains('open');
      qas.forEach(function (o) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (open) { qa.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Video timeline scrubber width ---------- */
  var tl = $('#tl');
  function sizeTl() { if (tl) tl.style.setProperty('--tlw', (tl.clientWidth - 2) + 'px'); }
  sizeTl(); window.addEventListener('resize', sizeTl);

  /* ---------- Pointer effects (fine pointers only) ---------- */
  if (finePointer && !reduce) {
    // magnetic buttons
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.22, y = (e.clientY - (r.top + r.height / 2)) * 0.32;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    // spotlight on dark cards
    $$('.ai-card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    // gentle tilt on the hero diagram
    var art = $('.hero-art'), stage = $('#stage'), raf = 0;
    if (art && stage) {
      art.addEventListener('pointermove', function (e) {
        var r = art.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { stage.style.transform = 'rotateY(' + (px * 5) + 'deg) rotateX(' + (-py * 5) + 'deg)'; });
      });
      art.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); stage.style.transform = ''; });
    }
  }

  /* ---------- Project brief modal ---------- */
  var dlg = $('#brief'), form = $('#brief-form'), status = $('#brief-status'), lastFocus = null, mode = 'project';
  var COPY = {
    project: { eyebrow: 'Start your project', title: 'Tell us what you\u2019re building.', sub: 'Share a few details and we will reply within 24 operational hours with questions or an honest estimate.', ph: 'What are you making, who is it for, and when do you need it?', subject: 'New project enquiry', send: 'Send brief' },
    call: { eyebrow: 'Schedule a call', title: 'Let\u2019s set up your project call.', sub: 'Tell us what you want to discuss and a couple of times that suit you. We reply within 24 operational hours.', ph: 'What would you like to talk about, and which days or times work for you?', subject: 'Project call request', send: 'Request a call' }
  };
  function openBrief(m) {
    if (m === 'call' && CONFIG.SCHEDULE_URL) { window.open(CONFIG.SCHEDULE_URL, '_blank', 'noopener'); return; }
    mode = m === 'call' ? 'call' : 'project';
    var c = COPY[mode];
    $('#brief-eyebrow').textContent = c.eyebrow; $('#brief-title').textContent = c.title; $('#brief-sub').textContent = c.sub;
    $('#f-msg').placeholder = c.ph; $('button[type=submit]', form).firstChild.nodeValue = c.send + ' ';
    status.textContent = '';
    lastFocus = document.activeElement;
    dlg.classList.remove('closing');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    root.style.overflow = 'hidden';
    setTimeout(function () { $('#f-name').focus(); }, 80);
  }
  function closeBrief() {
    if (!dlg.hasAttribute('open')) return;
    dlg.classList.add('closing');
    setTimeout(function () {
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
      dlg.classList.remove('closing'); root.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, reduce ? 0 : 320);
  }
  $$('[data-open-brief]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); if (mmenu.classList.contains('open')) setMenu(false); openBrief(b.getAttribute('data-open-brief')); });
  });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeBrief); });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeBrief(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeBrief(); });

  function setBad(input, bad) { input.closest('.field').classList.toggle('bad', bad); input.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#f-name'), email = $('#f-email'), msg = $('#f-msg');
    var okName = name.value.trim().length > 1, okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), okMsg = msg.value.trim().length > 4;
    setBad(name, !okName); setBad(email, !okEmail); setBad(msg, !okMsg);
    if (!(okName && okEmail && okMsg)) { (!okName ? name : !okEmail ? email : msg).focus(); status.textContent = 'Please fix the highlighted fields.'; return; }
    var service = $('#f-service').value;
    var subject = COPY[mode].subject + ': ' + service;
    var body = 'Name: ' + name.value.trim() + '\nEmail: ' + email.value.trim() + '\nService: ' + service + '\n\n' + msg.value.trim();
    window.open(gmailComposeUrl({ subject: subject, body: body }), '_blank', 'noopener');
    status.textContent = 'Gmail should open in a new tab with this message ready to send. If it doesn\u2019t, write to ' + CONFIG.EMAIL + ' directly.';
  });
  $$('input, textarea', form).forEach(function (i) { i.addEventListener('input', function () { if (i.value.trim()) setBad(i, false); }); });
})();
