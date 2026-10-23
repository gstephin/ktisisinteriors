/* Ktisis Interiors — interactions
   GSAP + ScrollTrigger drive the scroll-linked pieces; Lenis smooths the scroll.
   Everything degrades: no JS → static page; reduced motion → final states. */

(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ */
  /* Smooth scroll                                                       */
  /* ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Anchor links go through Lenis so pinned sections are accounted for.
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Split headlines into words → inner spans for masked reveals         */
  /* ------------------------------------------------------------------ */
  const splitChars = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        // Words stay unbreakable; characters inside animate individually.
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'wd';
          for (const ch of tok) {
            const sp = document.createElement('span');
            sp.className = 'ch';
            sp.textContent = ch;
            w.appendChild(sp);
          }
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (n.matches('.pill, .orb, .star')) n.classList.add('ch');
        else splitChars(n);
      }
    });
  };
  $$('[data-chars] .line').forEach(splitChars);
  $$('[data-chars]').forEach((el) => gsap.set($$('.ch', el), { yPercent: 115, opacity: 0, filter: 'blur(6px)' }));
  $$('[data-wipe]').forEach((f) => { gsap.set(f, { clipPath: 'inset(0 100% 0 0)' }); gsap.set($('img', f), { scale: 1.18 }); });
  $$('[data-pill]').forEach((p) => gsap.set(p, { width: 0 }));
  const charsIn = (el, delay = 0) => gsap.to($$('.ch', typeof el === 'string' ? $(el) : el), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power4.out', stagger: 0.014, delay });
  const wipeIn = (f, delay = 0) => gsap.timeline({ delay })
    .to(f, { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'power4.inOut' })
    .to($('img', f), { scale: 1, duration: 1.6, ease: 'power3.out' }, 0.1);

  /* ------------------------------------------------------------------ */
  /* Preloader → hero intro                                              */
  /* ------------------------------------------------------------------ */
  const hero = $('#hero');
  const intro = gsap.timeline({ paused: true });
  intro
    .add(charsIn('.hero__title'), 0)
    .to('#hero .reveal-up', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0.5);
  $$('#hero [data-wipe]').forEach((f, i) => intro.add(wipeIn(f), 0.2 + i * 0.15));
  intro.to('.wa', { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 1.2);

  const pre = $('#preloader');
  if (reduce || !pre) {
    pre?.remove();
    intro.progress(1);
  } else {
    document.body.style.overflow = 'hidden';
    gsap
      .timeline({
        onComplete() {
          document.body.style.overflow = '';
          pre.remove();
          intro.play();
        },
      })
      .to('.preloader__word span', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 })
      .to('.preloader__line i', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.2)
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.15');
  }

  // Hero visual follows the pointer a little
  const pv = $('[data-parallax]');
  if (pv && finePointer && !reduce) {
    const px = gsap.quickTo(pv, 'x', { duration: 0.8, ease: 'power3' });
    const py = gsap.quickTo(pv, 'y', { duration: 0.8, ease: 'power3' });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      px(((e.clientX - r.left) / r.width - 0.5) * -18);
      py(((e.clientY - r.top) / r.height - 0.5) * -14);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nav                                                                 */
  /* ------------------------------------------------------------------ */
  const nav = $('#nav');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => nav.classList.toggle('is-solid', self.scroll() > 80),
  });
  const burger = $('#burger');
  const menu = $('#menu');
  $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i));
  function closeMenu() {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ------------------------------------------------------------------ */
  /* Section headline reveals                                            */
  /* ------------------------------------------------------------------ */
  $$('[data-chars]').forEach((el) => {
    if (el.closest('#hero')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => charsIn(el) });
  });
  $$('[data-wipe]').forEach((f) => {
    if (f.closest('#hero')) return;
    ScrollTrigger.create({ trigger: f, start: 'top 85%', once: true, onEnter: () => wipeIn(f) });
  });
  $$('[data-pill]').forEach((p) => {
    ScrollTrigger.create({ trigger: p, start: 'top 85%', once: true, onEnter: () => gsap.to(p, { width: '1.7em', duration: 0.9, ease: 'power4.out', delay: 0.4 }) });
  });
  if (!reduce) {
    $$('[data-drift]').forEach((el) => gsap.fromTo(el, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }
  // Hover-expand gallery
  const gallery = $('#gallery');
  if (gallery) {
    $$('.gcard', gallery).forEach((c) => c.addEventListener('pointerenter', () => $$('.gcard', gallery).forEach((x) => x.classList.toggle('is-open', x === c))));
  }
  $$('.lead, .steps, .finishes, .contact__meta, .split__copy > p, .ticks, .collab__meta').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ------------------------------------------------------------------ */
  /* Service cards — reveal + 3D tilt                                    */
  /* ------------------------------------------------------------------ */
  gsap.from('.card', {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.cards', start: 'top 80%', once: true },
  });
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach((card) => {
      const qx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      const qy = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        qx(-py * 10);
        qy(px * 12);
      });
      card.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render vs reality slider                                            */
  /* ------------------------------------------------------------------ */
  const ba = $('#ba');
  if (ba) {
    const range = $('#baRange');
    const set = (v) => ba.style.setProperty('--x', `${v}%`);
    range.addEventListener('input', () => set(range.value));
    // Nudge on first view so people notice it's draggable
    ScrollTrigger.create({
      trigger: ba,
      start: 'top 70%',
      once: true,
      onEnter() {
        if (reduce) return;
        const o = { v: 50 };
        gsap.timeline()
          .to(o, { v: 64, duration: 0.9, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 42, duration: 0.9, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 50, duration: 0.7, ease: 'power2.inOut', onUpdate: () => { set(o.v); range.value = o.v; } });
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Process timeline — line draws, steps light up                       */
  /* ------------------------------------------------------------------ */
  const draw = $('#timelineDraw');
  if (draw) {
    gsap.to(draw, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
    $$('.tstep').forEach((s) => {
      gsap.from(s, { opacity: 0, x: -20, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
      ScrollTrigger.create({ trigger: s, start: 'top 65%', end: 'bottom 40%', toggleClass: { targets: s, className: 'is-on' } });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Counters                                                            */
  /* ------------------------------------------------------------------ */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const plain = 'plain' in el.dataset; // years: no thousands separator
    const fmt = (n) => (plain ? String(Math.round(n)) : Math.round(n).toLocaleString('en-IN')) + suffix;
    if (reduce) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: end,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  /* ------------------------------------------------------------------ */
  /* Portfolio — pinned horizontal scroll (desktop)                      */
  /* ------------------------------------------------------------------ */
  const hs = $('#hscroll');
  if (hs && !window.matchMedia('(max-width: 900px)').matches && !reduce) {
    const dist = () => hs.scrollWidth - window.innerWidth;
    const tween = gsap.to(hs, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#portfolio',
        start: 'top top',
        end: () => `+=${dist()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    // Inner image parallax, opposite to travel direction
    $$('.work img').forEach((img) => {
      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img.closest('.work'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Testimonials                                                        */
  /* ------------------------------------------------------------------ */
  const quotes = $$('.quote');
  const dots = $$('#quotesDots button');
  let qi = 0, qt;
  const showQuote = (i) => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === qi));
  };
  const autoQuotes = () => { clearInterval(qt); qt = setInterval(() => showQuote(qi + 1), 6000); };
  dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); autoQuotes(); }));
  if (!reduce) autoQuotes();

  /* ------------------------------------------------------------------ */
  /* Contact → WhatsApp (no backend)                                     */
  /* ------------------------------------------------------------------ */
  const form = $('#form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim();
        f.closest('.field').classList.toggle('is-error', bad);
        if (bad) ok = false;
      });
      if (!ok) { gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' }); return; }
      const v = (id) => $(id, form).value.trim();
      const msg =
        `Hi Ktisis, I'd like a free site visit.\n` +
        `Name: ${v('#fname')}\nPhone: ${v('#fphone')}\n` +
        (v('#fcity') ? `Location: ${v('#fcity')}\n` : '') +
        `Project: ${v('#fscope')}`;
      window.open(`https://wa.me/919947386281?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      form.classList.add('is-done');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor + magnetic buttons (fine pointers only)                      */
  /* ------------------------------------------------------------------ */
  if (finePointer && !reduce) {
    const cur = $('#cursor');
    const dot = $('.cursor__dot', cur);
    const ring = $('.cursor__ring', cur);
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$('a, button, .ba__range').forEach((el) => {
      el.addEventListener('pointerenter', () => cur.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cur.classList.remove('is-hover'));
    });
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.25);
        my((e.clientY - (r.top + r.height / 2)) * 0.25);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  } else {
    $('#cursor')?.remove();
  }

  // Images/fonts loading can shift pin distances
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
