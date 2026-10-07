/* ============================================
   rajatg.in
   Pencil marks, the contact strip (slate, wheel, drag, arrows), GIF-like
   videos, the Sound and Lights switches, the game's cheer and the clapper's
   clap, and the footer's film quote.
   ============================================ */

(function () {
  'use strict';

  const root = document.documentElement;
  const roll = document.querySelector('.roll');
  const introActive = () => document.body.classList.contains('intro-active');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // a page's file name, the way the site links it: "index.html" for the root
  const fileOf = (url) => {
    try { return new URL(url, window.location.href).pathname.split('/').pop() || 'index.html'; } catch (_) { return ''; }
  };
  let strip = null;                      // set by the contact strip, used by the page transitions

  // Run done once every animation of the given names inside el has played:
  // looked for a frame after the class that starts them goes on, awaited in
  // the animations' own time (so a late first paint cannot cut one short),
  // with a long backstop in case one never gets to run.
  function afterAnimations(el, names, done) {
    let called = false;
    const once = () => { if (!called) { called = true; done(); } };
    setTimeout(once, 6000);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const running = el.getAnimations({ subtree: true }).filter((a) => names.includes(a.animationName));
      Promise.all(running.map((a) => a.finished.catch(() => {}))).then(once);
    }));
  }

  // ─── The pencil mark: one hand-drawn box per picture, in real pixels ──
  // Drawn from the picture's own size, so the stroke weight and the corners
  // never scale with it and the mark always clears its edge. Seeded per mark,
  // so every one is a little different but never jitters. Any svg.loop gets
  // one, sized to the box it sits in: a frame on the strip, a poster in the game.
  const SVG = 'http://www.w3.org/2000/svg';

  function pencilPath(w, h, seed) {
    let s = seed * 9301 + 49297;
    const rnd = (min, max) => {
      s = (s * 9301 + 49297) % 233280;
      return min + (s / 233280) * (max - min);
    };
    const gap = 10;                      // air between picture and pencil
    const x0 = -gap, y0 = -gap, x1 = w + gap, y1 = h + gap;
    const r = [rnd(8, 14), rnd(16, 26), rnd(7, 12), rnd(13, 22)]; // tl tr br bl, deliberately unequal
    const out = () => rnd(2.5, 6.5);     // sides bow outward, never into the picture
    const j = () => rnd(-2, 2);
    const f = (n) => n.toFixed(1);
    // The hand starts partway down the right side, in the gutter between two
    // pictures: nowhere near the edge print above or the caption below
    const startY = y0 + r[1] + h * rnd(0.1, 0.16);
    return [
      `M${f(x1 + rnd(-1, 1))} ${f(startY)}`,
      `Q${f(x1 + out())} ${f(h * rnd(0.5, 0.7))} ${f(x1 + j())} ${f(y1 - r[2])}`,
      `Q${f(x1 + rnd(0, 2))} ${f(y1 + rnd(0, 3))} ${f(x1 - r[2])} ${f(y1 + j())}`,
      `Q${f(w * rnd(0.35, 0.65))} ${f(y1 + out())} ${f(x0 + r[3])} ${f(y1 + j())}`,
      `Q${f(x0 - rnd(0, 3))} ${f(y1 + rnd(0, 2))} ${f(x0 + j())} ${f(y1 - r[3])}`,
      `Q${f(x0 - out())} ${f(h * rnd(0.35, 0.65))} ${f(x0 + j())} ${f(y0 + r[0])}`,
      `Q${f(x0 - rnd(0, 1.5))} ${f(y0 - rnd(0, 2))} ${f(x0 + r[0])} ${f(y0 + j())}`,
      `Q${f(w * rnd(0.35, 0.65))} ${f(y0 - out())} ${f(x1 - r[1])} ${f(y0 + j())}`,
      // round the last corner a little wide of the first stroke...
      `Q${f(x1 + rnd(2, 4))} ${f(y0 - rnd(0, 1.5))} ${f(x1 + rnd(3, 4.5))} ${f(y0 + r[1])}`,
      // ...then close the loop: cross the starting stroke at a shallow angle
      // and stop just inside it, still well clear of the picture
      `Q${f(x1 + rnd(2.5, 3.5))} ${f(startY + h * 0.02)} ${f(x1 - rnd(3, 4.5))} ${f(startY + h * rnd(0.14, 0.2))}`,
    ].join('');
  }

  const loops = [...document.querySelectorAll('svg.loop')];

  function drawMark(svg) {
    const { width, height } = svg.parentElement.getBoundingClientRect();
    if (!width || !height) return;         // not on screen yet: the observer calls again when it is
    let path = svg.querySelector('path');
    if (!path) {
      svg.textContent = '';                // drop the no-JS <use> fallback
      path = document.createElementNS(SVG, 'path');
      // Length normalised to 1, so the stylesheet can hide and draw the mark
      // with fixed dash values that never change when the picture resizes
      path.setAttribute('pathLength', '1');
      svg.appendChild(path);
    }
    path.setAttribute('d', pencilPath(width, height, loops.indexOf(svg) + 1));
  }

  // once now (a page opened in a background tab gets no resize notices until
  // it is shown), then whenever a picture's box changes
  loops.forEach(drawMark);
  if (loops.length && 'ResizeObserver' in window) {
    const sizes = new ResizeObserver((entries) => {
      entries.forEach(({ target }) => drawMark(target.querySelector(':scope > svg.loop')));
    });
    loops.forEach((svg) => sizes.observe(svg.parentElement));
  }

  // ─── Contact strip ─────────────────────────────────────
  if (roll) {
    const frames = [...roll.querySelectorAll('.frame')];

    // Stagger index for the pull-in once the intro ends
    frames.forEach((li, i) => li.style.setProperty('--i', i));

    // ── The slate shows the words of the active frame; the pencil marks that frame ──
    const slate = document.querySelector('.slate');
    let active = null;
    let hovering = false;

    // quiet: the words are put in place without their settle, for the page's
    // first picture and for a page transition, which bring their own motion,
    // and for a step along the strip from the keyboard
    let swappedAt = -Infinity;           // when the slate's words last changed
    const activate = (frame, quiet) => {
      if (!frame || frame === active) return;
      if (active) active.classList.remove('is-active');
      active = frame;
      frame.classList.add('is-active');
      if (!slate) return;
      const link = frame.querySelector('a');
      const go = slate.querySelector('.slate-go');
      // innerHTML, not textContent: the title may carry a no-wrap span (the page's own static markup)
      slate.querySelector('.slate-title').innerHTML = frame.querySelector('.title').innerHTML;
      slate.querySelector('.slate-desc').textContent = frame.querySelector('.desc').textContent;
      go.querySelector('.under').textContent = frame.querySelector('.go .under').textContent;
      // the frame's number key, shown after the action as it is under the frame
      const cap = go.querySelector('.key');
      if (cap) cap.textContent = link.getAttribute('aria-keyshortcuts') || '';
      go.href = link.href;
      go.target = link.target;
      go.rel = link.rel;
      go.dataset.track = link.dataset.track || '';
      // restart the settle animation so the words arrive with the mark, unless
      // the last words are still settling (the strip flung past several
      // frames): then these simply replace them, and nothing blinks
      slate.classList.remove('swap');
      const now = performance.now();
      const hurried = now - swappedAt < 320;
      swappedAt = now;
      if (quiet || hurried) return;
      void slate.offsetWidth;
      slate.classList.add('swap');
    };

    // Hover intent: a pointer that is only passing over a frame on its way to
    // the slate must not swap the slate's link out from under the click. A
    // frame activates when the pointer slows down on it, or rests on it.
    let lastMove = null;
    let dwell = 0;
    // While the wheel moves the strip, the scroll decides (below). And a
    // pointer event from where the pointer already was, which a browser may
    // send once the content has scrolled under a resting pointer, is not the
    // visitor pointing at anything, so it changes nothing either.
    let wheelAt = -Infinity;
    let at = null;                       // where the pointer last was, from any event
    const wheeling = () => performance.now() - wheelAt < 250;

    roll.addEventListener('wheel', (e) => {
      wheelAt = performance.now();
      at = { x: e.clientX, y: e.clientY };
      lastMove = null;
      clearTimeout(dwell);
    }, { passive: true });

    roll.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const moved = !at || e.clientX !== at.x || e.clientY !== at.y;
      at = { x: e.clientX, y: e.clientY };
      if (!moved || wheeling()) return;
      const frame = e.target.closest('.frame');
      if (!frame) return;
      const now = performance.now();
      if (lastMove) {
        const speed = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / Math.max(now - lastMove.t, 1);
        if (speed < 0.5) activate(frame);  // px per ms
      }
      lastMove = { x: e.clientX, y: e.clientY, t: now };
      clearTimeout(dwell);
      dwell = setTimeout(() => activate(frame), 160);
    });

    roll.addEventListener('pointerenter', () => { hovering = true; });
    roll.addEventListener('pointerleave', () => {
      hovering = false;
      lastMove = null;
      clearTimeout(dwell);
    });

    frames.forEach((frame) => frame.addEventListener('focusin', () => activate(frame, true)));

    // With no hover to point with (a touch screen), the pencil marks the frame
    // tapped last, not the one the strip's scroll comes to (css/site.css). A
    // frame that opens a page of this site lets the pencil draw first, a beat
    // before the page changes; one that opens a new tab keeps its mark for
    // when the visitor comes back.
    const noHover = window.matchMedia('(hover: none)');
    let tappedAt = 0;
    const markTapped = (frame) => frames.forEach((f) => f.classList.toggle('is-tapped', f === frame));

    roll.addEventListener('click', (e) => {
      if (!noHover.matches || e.defaultPrevented) return;
      const frame = e.target.closest('.frame');
      if (!frame) return;
      markTapped(frame);
      const link = frame.querySelector('a');
      if (link.target === '_blank' || reducedMotion.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (Date.now() - tappedAt < 1000) return;   // a second tap on the way out
      tappedAt = Date.now();
      followed = { href: link.href, t: tappedAt };  // for the page transition (see there)
      setTimeout(() => window.location.assign(link.href), 180);
    });

    // When the strip scrolls on its own account (a swipe, or the wheel moving
    // it under a resting pointer) the mark follows the scroll. Its anchor
    // slides from the strip's leading edge at the start to its trailing edge
    // at the end, so the last frame, which can never reach the leading edge,
    // is marked once the strip reaches its end. A pointer that is moving over
    // the frames keeps the say: hover intent above decides then.
    let settle = 0;
    let placing = false;                 // the strip is being scrolled to a frame on purpose (bringIn)
    roll.addEventListener('scroll', () => {
      if (placing) return;
      if (hovering && !wheeling()) return;
      cancelAnimationFrame(settle);
      settle = requestAnimationFrame(() => {
        const box = roll.getBoundingClientRect();
        const style = getComputedStyle(roll);
        const lead = box.left + parseFloat(style.paddingLeft);
        const trail = box.right - parseFloat(style.paddingRight);
        const max = roll.scrollWidth - roll.clientWidth;
        const t = max > 0 ? Math.min(Math.max(roll.scrollLeft / max, 0), 1) : 0;
        const anchor = lead + (trail - lead) * t;
        let best = null, bestGap = Infinity;
        frames.forEach((frame) => {
          const r = frame.getBoundingClientRect();
          const gap = Math.abs(r.left + r.width * t - anchor);
          if (gap < bestGap) { bestGap = gap; best = frame; }
        });
        activate(best);
      });
    }, { passive: true });

    // The slate's edge shows only while frames have slid under it
    const bandBody = roll.closest('.band-body');
    if (bandBody) {
      const under = () => bandBody.classList.toggle('is-under', roll.scrollLeft > 1);
      roll.addEventListener('scroll', under, { passive: true });
      under();
    }

    // Arrow keys walk along the strip while focus is inside it
    roll.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const links = frames.map((frame) => frame.querySelector('a'));
      const at = links.indexOf(document.activeElement);
      if (at < 0) return;
      const next = links[at + (e.key === 'ArrowRight' ? 1 : -1)];
      if (!next) return;
      e.preventDefault();
      next.focus();
    });

    // Quiet: the homepage's entrance (css/site.css) is what brings the slate in
    activate(roll.querySelector('.frame.is-active') || frames[0], true);
    if (slate) slate.hidden = false;

    // For page transitions (below): the frame of a given page, and a way to
    // make a frame the active one and bring it to the strip's leading edge
    // before the page is first drawn
    strip = {
      slate,
      frameFor: (file) => frames.find((frame) => fileOf(frame.querySelector('a').href) === file) || null,
      activateQuietly: (frame) => activate(frame, true),
      bringIn(frame) {
        activate(frame, true);
        // on a touch screen the frame came back from is the one tapped last
        if (noHover.matches) markTapped(frame);
        const box = roll.getBoundingClientRect();
        const lead = box.left + parseFloat(getComputedStyle(roll).paddingLeft);
        const r = frame.getBoundingClientRect();
        if (r.left >= lead - 1 && r.right <= box.right + 1) return;
        // the scroll this causes must not hand the mark to another frame
        placing = true;
        roll.scrollLeft += r.left - lead;
        requestAnimationFrame(() => requestAnimationFrame(() => { placing = false; }));
      },
    };

    // When the page itself has nowhere to scroll, the wheel moves the strip
    window.addEventListener('wheel', (e) => {
      if (introActive() || e.ctrlKey) return;
      const pageScrolls = root.scrollHeight > window.innerHeight + 1;
      if (pageScrolls || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      roll.scrollLeft += e.deltaY;
    }, { passive: false });

    // Drag to pan with a mouse; touch already scrolls natively
    let startX = 0, startLeft = 0, dragging = false, moved = false;

    roll.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = roll.scrollLeft;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 5) return;
      moved = true;
      roll.classList.add('dragging');
      roll.scrollLeft = startLeft - dx;
    });

    const endDrag = () => {
      dragging = false;
      roll.classList.remove('dragging');
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Links and images are draggable by default; a native drag would cancel
    // the pointer mid-pan and leave the strip stuck in its dragging state
    roll.addEventListener('dragstart', (e) => e.preventDefault());

    // A drag that ends on a frame must not open it
    roll.addEventListener('click', (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }, true);

    roll.querySelectorAll('img').forEach((img) => { img.draggable = false; });
  }

  // ─── Where I've worked: a name over each mark ───────────────────────
  // The stylesheet shows a mark's name under a mouse (after a beat) and on
  // keyboard focus. Once one name has shown, the row is warm and the next
  // mark along answers at once, until the pointer has been off the row for a
  // moment. With no hover (a touch screen) a tap shows a name, and a tap on
  // it again or anywhere else puts it away.
  const companies = document.querySelector('.companies');
  if (companies) {
    let warming = 0;
    let cooling = 0;
    companies.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse' || !e.target.closest('.company')) return;
      clearTimeout(cooling);
      if (companies.classList.contains('is-warm')) return;
      clearTimeout(warming);
      // as the first name finishes its beat (css/site.css, 300ms)
      warming = setTimeout(() => companies.classList.add('is-warm'), 300);
    });
    companies.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse' || companies.contains(e.relatedTarget)) return;
      clearTimeout(warming);
      cooling = setTimeout(() => companies.classList.remove('is-warm'), 300);
    });

    const tapped = window.matchMedia('(hover: none)');
    const openOnly = (company) => companies.querySelectorAll('.company').forEach((c) => c.classList.toggle('is-open', c === company));
    companies.addEventListener('click', (e) => {
      if (!tapped.matches) return;
      const company = e.target.closest('.company');
      openOnly(company && !company.classList.contains('is-open') ? company : null);
    });
    // (a press, not a click: iOS sends no click for a tap on plain words)
    document.addEventListener('pointerdown', (e) => {
      if (!companies.contains(e.target)) openOnly(null);
    });
  }

  // ─── Clips: a <video class="clip"> behaves like a GIF ──────────────
  // Muted loop, playing only while it is on screen, and never on its own for
  // visitors who prefer less motion (they get the browser's own controls).
  const clips = [...document.querySelectorAll('video.clip')];
  if (clips.length && 'IntersectionObserver' in window) {
    const watcher = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting && !reducedMotion.matches) target.play().catch(() => {});
        else target.pause();
      });
    }, { threshold: 0.5 });
    // A poster is never lazy in HTML and can weigh more than its clip, so it
    // waits in data-poster until the clip is within a screen of view
    const posters = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.poster = target.dataset.poster;
        observer.unobserve(target);
      });
    }, { rootMargin: '100% 0px' });
    clips.forEach((clip) => {
      clip.muted = true;
      clip.loop = true;
      clip.playsInline = true;
      watcher.observe(clip);
      if (clip.dataset.poster) posters.observe(clip);
    });
  } else {
    clips.forEach((clip) => { if (clip.dataset.poster) clip.poster = clip.dataset.poster; });
  }

  // ─── Analytics: any element with data-track reports its event name ──
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el && el.dataset.track && window.trackEvent) window.trackEvent(el.dataset.track);
  });

  // ─── Lights: light or dark, following the system until the visitor chooses ──
  const lights = document.querySelector('.theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

  function renderLights() {
    const dark = currentTheme() === 'dark';
    if (lights) {
      lights.querySelector('.state').textContent = dark ? 'off' : 'on';
      lights.setAttribute('aria-pressed', String(!dark));
    }
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      if (root.dataset.theme) meta.content = dark ? '#18191a' : '#f4f5f5';
    });
  }

  // Turning the lights on, the new light spreads from the switch in a widening
  // circle; turning them off, the old light drains back into the switch. With
  // reduced motion it is a short crossfade instead, and a browser without view
  // transitions switches at once, as it always did.
  let shifts = 0;
  let current = null;                    // the transition on screen, if any
  const SHIFT_CLASSES = ['lights-shift', 'lights-up', 'lights-down', 'lights-fade'];

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('rg-theme', theme); } catch (_) {}
    renderLights();
  }

  // The circle's size now, read from the picture it clips
  function radiusNow(sweep) {
    const clip = getComputedStyle(root, sweep.pseudo).clipPath;
    const m = /circle\(\s*([\d.]+)px/.exec(clip || '');
    return m ? parseFloat(m[1]) : null;
  }

  // Draw the circle from where it is to one end: the far one finishes the
  // sweep, the near one brings the old light back as it was
  function steer(sweep, home) {
    const r = radiusNow(sweep);
    const from = r === null ? (sweep.on ? 0 : sweep.reach) : Math.min(Math.max(r, 0), sweep.reach);
    const to = sweep.on === home ? 0 : sweep.reach;
    const circle = (size) => `circle(${size}px at ${sweep.x}px ${sweep.y}px)`;
    if (sweep.circle) sweep.circle.cancel();
    sweep.circle = root.animate({ clipPath: [circle(from), circle(to)] }, {
      duration: 700 * Math.abs(to - from) / sweep.reach,
      easing: getComputedStyle(root).getPropertyValue('--ease-out-soft').trim() || 'ease-out',
      fill: 'both',
      pseudoElement: sweep.pseudo,
    });
    // Heading home, the transition must outlast the circle (a still hold on
    // its root), so the old light is put back under it before it lifts
    if (home && !sweep.hold) {
      sweep.hold = root.animate({ opacity: [1, 1] }, { duration: Infinity, pseudoElement: '::view-transition' });
    }
    if (!home && sweep.hold) {
      sweep.hold.cancel();
      sweep.hold = null;
    }
    const circleNow = sweep.circle;
    circleNow.finished.then(() => {
      if (!home || sweep.circle !== circleNow) return;
      setTheme(sweep.from);
      sweep.shift.skipTransition();
    }).catch(() => {});
  }

  function switchLights(next) {
    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }
    const calm = reducedMotion.matches;
    // A click while the lights are still changing never starts a second
    // change over the first (the browser would picture a blank page). A sweep
    // turns round from where its circle has got to; the page under it is
    // already in the new light and goes back only once the circle is home.
    // A crossfade simply ends where the click wants it.
    if (current) {
      if (!calm && current.pseudo) {
        // each click turns it round: home, then on again, and so on
        const sweep = current;
        const home = !sweep.home;
        sweep.home = home;
        sweep.shift.ready.then(() => steer(sweep, home)).catch(() => {});
        return;
      }
      current.shift.skipTransition();
      setTheme(next);
      return;
    }
    const mine = ++shifts;
    const from = currentTheme();
    const on = next === 'light';
    const box = lights.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    // far enough to reach the corner of the screen furthest from the switch
    const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    root.classList.remove(...SHIFT_CLASSES);
    root.classList.add('lights-shift', calm ? 'lights-fade' : on ? 'lights-up' : 'lights-down');
    const shift = document.startViewTransition(() => setTheme(next));
    const sweep = { shift, from, on, x, y, reach, home: false, circle: null, hold: null, pseudo: calm ? null : on ? '::view-transition-new(root)' : '::view-transition-old(root)' };
    current = sweep;
    shift.ready.then(() => {
      if (!calm && !sweep.circle) steer(sweep, false);
    }).catch(() => {});
    shift.finished.finally(() => {
      if (current === sweep) current = null;
      if (mine === shifts) root.classList.remove(...SHIFT_CLASSES);
    });
  }

  if (lights) {
    renderLights();
    systemDark.addEventListener('change', renderLights);
    const flip = () => switchLights(currentTheme() === 'dark' ? 'light' : 'dark');
    lights.addEventListener('click', flip);
    // While the lights change, the browser shows pictures of the page and
    // hands every click to <html>. The page under them is the same page in
    // the same place, so a click where the switch is counts as the switch's.
    document.addEventListener('click', (e) => {
      if (!current || e.target !== root) return;
      const box = lights.getBoundingClientRect();
      if (e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom) flip();
    });
  }

  // ─── UI sound: synthesized, off until the visitor turns it on ─────
  const sound = document.querySelector('.sound-toggle');
  let ctx = null;
  let soundOn = false;
  try { soundOn = localStorage.getItem('rg-sound') === '1'; } catch (_) {}

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A short filtered noise burst: the dry click of a shutter
  function click(peak, duration, cutoff) {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const length = Math.ceil(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    src.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    gain.gain.value = peak;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  }

  // A small cheer: three soft bell notes climbing a major triad over a breath
  // of air, like a far-off crowd. About a second, and quiet. Like every sound
  // here it is synthesized, and it is silent unless the visitor turned Sound on.
  function cheer() {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t0 = ac.currentTime + 0.03;
    // the one place to turn it up or down. At 1 it peaks near -16 dBFS, a
    // little under a press click (about -12), so it never jumps out
    const out = ac.createGain();
    out.gain.value = 1;
    out.connect(ac.destination);

    // the breath: band-passed noise that swells quickly and falls slowly
    const length = Math.ceil(ac.sampleRate * 1.1);
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const air = ac.createBufferSource();
    const band = ac.createBiquadFilter();
    const airGain = ac.createGain();
    air.buffer = buffer;
    band.type = 'bandpass';
    band.frequency.value = 1600;
    band.Q.value = 0.7;
    airGain.gain.setValueAtTime(0.0001, t0);
    airGain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.16);
    airGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);
    air.connect(band).connect(airGain).connect(out);
    air.start(t0);
    air.stop(t0 + 1.1);

    // the notes: G5, B5, D6, each a sine with one quiet high partial for a bell's edge
    [783.99, 987.77, 1174.66].forEach((freq, i) => {
      const at = t0 + i * 0.09;
      [[1, 0.1, 0.7], [2.76, 0.02, 0.22]].forEach(([ratio, level, ring]) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.frequency.value = freq * ratio;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(level, at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + ring);
        osc.connect(gain).connect(out);
        osc.start(at);
        osc.stop(at + ring + 0.05);
      });
    });
  }

  // The clapper's clap (cursor.js brings the stick down on a press over a
  // poster, and says when it will land): the crack of the two sticks meeting
  // over a short knock of the wood, a few hundredths of a second in all.
  // Light and low, about as loud as the hover tick and well under a press
  // click, and like every sound here silent unless Sound is on.
  function clack(delay) {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    // the one place to turn it up or down. At 0.5 it peaks near -18 dBFS
    const out = ac.createGain();
    out.gain.value = 0.5;
    out.connect(ac.destination);

    // the crack: noise gone within a few hundredths of a second, band-passed high
    const length = Math.ceil(ac.sampleRate * 0.06);
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.005));
    const noise = ac.createBufferSource();
    const crack = ac.createBiquadFilter();
    const crackGain = ac.createGain();
    noise.buffer = buffer;
    crack.type = 'bandpass';
    crack.frequency.value = 3000;
    crack.Q.value = 1.1;
    crackGain.gain.value = 0.5;
    noise.connect(crack).connect(crackGain).connect(out);
    noise.start(t0);

    // the knock: the wood's own note, struck and damped
    const tone = ac.createOscillator();
    const knock = ac.createGain();
    tone.frequency.value = 1150;
    knock.gain.setValueAtTime(0, t0);
    knock.gain.linearRampToValueAtTime(0.08, t0 + 0.001);
    knock.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);
    tone.connect(knock).connect(out);
    tone.start(t0);
    tone.stop(t0 + 0.045);
  }

  document.addEventListener('rg:clap', (e) => clack(((e.detail && e.detail.lands) || 0) / 1000));

  function renderSound() {
    if (!sound) return;
    sound.querySelector('.state').textContent = soundOn ? 'on' : 'off';
    sound.setAttribute('aria-pressed', String(soundOn));
  }

  if (sound) {
    renderSound();
    sound.addEventListener('click', () => {
      soundOn = !soundOn;
      try { localStorage.setItem('rg-sound', soundOn ? '1' : '0'); } catch (_) {}
      renderSound();
      click(0.5, 0.06, 1800);
    });
  }

  let lastHover = null;
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('a, button');
    if (el === lastHover) return;
    lastHover = el;
    if (el) click(0.18, 0.025, 3200);
  });

  const mouseCursor = document.querySelector('.figma-cursor');
  document.addEventListener('pointerdown', (e) => {
    // any press wakes the audio while a gesture is in hand: Safari will not
    // start it later from a timer, which is when the game's cheer is due
    if (soundOn) audio();
    const el = e.target.closest('a, button');
    // a mouse press under the clapper claps it (cursor.js): the clap is its sound
    const clapping = e.pointerType === 'mouse' && e.button === 0 && mouseCursor && mouseCursor.dataset.state === 'slate';
    if (el && el !== sound && !clapping) click(0.5, 0.06, 1800);
  });

  // ─── Keys ──────────────────────────────────────────────
  // A page names its keys in its markup (aria-keyshortcuts), and a key does
  // what a click on its element would: S flips Sound and L the Lights (on
  // the homepage, the case studies and the game); on the homepage 1 to 7 open
  // the works in the order of their edge print; in the game ← and → keep the
  // poster on that side (its script hears a click on the card, as from a
  // mouse), and Enter starts a game from rest (Play, or Restart on the
  // winner's screen). Never while typing (the cursor's name), with a
  // modifier held (the browser's own shortcuts are those), under the intro,
  // or for an element not on screen: the posters are keys only while a game
  // is on. A key held down counts once, and its keycap stays down with it.
  const keyed = () => [...document.querySelectorAll('[aria-keyshortcuts]')];
  if (keyed().length) {
    const nameOf = (e) => (e.key.length === 1 ? e.key.toUpperCase() : e.key);
    const keysOf = (el) => el.getAttribute('aria-keyshortcuts').split(' ');
    let held = null;                     // the key that is down, and its keycaps
    const letGo = () => {
      if (held) held.caps.forEach((cap) => cap.classList.remove('is-down'));
      held = null;
    };

    // Which control the keyboard moved focus to (Tab), as opposed to one a
    // click left focused. Chrome counts a clicked button as keyboard-focused
    // (:focus-visible) as soon as any key is pressed, so this is kept here.
    let pressedLast = false;             // was the last input a pointer press?
    let keyboardFocus = null;
    document.addEventListener('pointerdown', () => { pressedLast = true; }, true);
    document.addEventListener('keydown', () => { pressedLast = false; }, true);
    document.addEventListener('focusin', (e) => { keyboardFocus = pressedLast ? null : e.target; });

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (typing || introActive()) return;
      const key = nameOf(e);
      // Enter on a link or a button the keyboard has moved to is that
      // control's own (an IMDB link opens, a focused Restart restarts)
      if (key === 'Enter' && e.target !== document.body && e.target === keyboardFocus) return;
      const all = keyed();
      const el = all.find((k) => keysOf(k).includes(key) && k.getClientRects().length);
      if (!el) {
        // With a game on, Enter starts nothing, and is not a press of the
        // button a mouse click last left focused (Restart, mid-game)
        if (key === 'Enter' && all.some((k) => keysOf(k).includes('Enter'))) e.preventDefault();
        return;
      }
      e.preventDefault();
      if (e.repeat) return;
      // a key is a gesture too: wake the audio for sounds due later (see pointerdown)
      if (soundOn) audio();
      const caps = [...el.querySelectorAll('.key')];
      // a frame opened by its key takes the mark, and the slate speaks for it
      const frame = el.closest('.frame');
      if (frame && strip) {
        strip.bringIn(frame);
        if (strip.slate) caps.push(strip.slate.querySelector('.key'));
      }
      letGo();
      held = { key, caps: caps.filter(Boolean) };
      held.caps.forEach((cap) => cap.classList.add('is-down'));
      el.click();
    });

    document.addEventListener('keyup', (e) => {
      if (held && held.key === nameOf(e)) letGo();
    });
    window.addEventListener('blur', letGo);
  }

  // Enter on the winner's screen restarts the game (a new genre, round 1),
  // so Restart names the key only while that screen is up: during a game it
  // is still a button, but Enter does not press it (css/screening-room.css
  // shows its keycap by the same name). The game's script is untouched: this
  // watches the .active it puts on the winner.
  const winnerScreen = document.querySelector('.sr-winner');
  const restartButton = document.querySelector('.sr-restart');
  if (winnerScreen && restartButton && 'MutationObserver' in window) {
    const atRest = () => {
      if (winnerScreen.classList.contains('active')) restartButton.setAttribute('aria-keyshortcuts', 'Enter');
      else restartButton.removeAttribute('aria-keyshortcuts');
    };
    new MutationObserver(atRest).observe(winnerScreen, { attributes: true, attributeFilter: ['class'] });
    atRest();
  }

  // ─── The game: a small cheer when the confetti goes up ──────────────
  // The game's own script is not ours to change, so this only watches for what
  // it does on a win: it adds .active to the winner, or to "every genre played".
  const wins = document.querySelectorAll('.sr-winner, .sr-impressive');
  if (wins.length && 'MutationObserver' in window) {
    const watcher = new MutationObserver((records) => {
      records.forEach(({ target, oldValue }) => {
        const was = (oldValue || '').split(/\s+/).includes('active');
        if (!was && target.classList.contains('active')) cheer();
      });
    });
    wins.forEach((el) => watcher.observe(el, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }));
  }

  // ─── The game's slate: the title card, and the round rolling over ──
  // As a game starts, and at every restart, the genre and the round come up
  // word by word from under an unseen edge (the masked reveal), and the two
  // posters rise into their frames. Each round after that, the round rolls
  // over like the number on a slate: the words that changed leave upward
  // through a mask as the new ones come up from below (css/screening-room.css).
  // The game's own script is not ours to change, so this watches the lines it
  // writes.
  const genreLine = document.querySelector('.sr-genre');
  const stage = genreLine && genreLine.closest('.sr-stage');
  if (stage) {
    const roundLine = stage.querySelector('.sr-round');
    let shownGenre = '';
    let shownRound = '';
    let reveals = 0;
    let rolls = 0;
    // words in masks, spaces kept between them, so the line reads as before
    const split = (line) => {
      const words = line.textContent.trim().split(/\s+/).filter(Boolean);
      line.textContent = '';
      words.forEach((word, i) => {
        if (i) line.append(' ');
        const mask = document.createElement('span');
        const inner = document.createElement('span');
        mask.className = 'word-mask';
        inner.className = 'word';
        inner.style.setProperty('--w', i);
        inner.textContent = word;
        mask.append(inner);
        line.append(mask);
      });
    };
    // Only the words that changed roll ("Round 3" to "Round 4": the number);
    // with nothing in common ("Final round") the whole line does
    const roll = (from, to) => {
      const was = from.split(/\s+/);
      const now = to.split(/\s+/);
      let same = 0;
      while (same < was.length - 1 && same < now.length - 1 && was[same] === now[same]) same++;
      roundLine.textContent = same ? now.slice(0, same).join(' ') + ' ' : '';
      const mask = document.createElement('span');
      const gone = document.createElement('span');
      const come = document.createElement('span');
      mask.className = 'word-mask sr-roll';
      gone.className = 'sr-roll-out';
      gone.setAttribute('aria-hidden', 'true');
      gone.textContent = was.slice(same).join(' ');
      come.className = 'sr-roll-in';
      come.textContent = now.slice(same).join(' ');
      mask.append(gone, come);
      roundLine.append(mask);
      const mine = ++rolls;
      afterAnimations(roundLine, ['sr-roll-out', 'sr-roll-in'], () => {
        if (mine !== rolls) return;
        roundLine.textContent = to;
        watcher.takeRecords();
      });
    };
    const watcher = new MutationObserver(() => {
      const genre = genreLine.textContent.trim();
      const round = roundLine ? roundLine.textContent.trim() : '';
      if (genre && genre !== shownGenre) {
        // a new game: the title card (and no roll left over from the last one)
        shownGenre = genre;
        shownRound = round;
        rolls++;
        split(genreLine);
        if (round) split(roundLine);
        stage.classList.remove('revealing');
        void stage.offsetWidth;
        stage.classList.add('revealing');
        const mine = ++reveals;
        afterAnimations(stage, ['sr-word-rise', 'sr-unmask', 'fade-in'], () => {
          if (mine === reveals) stage.classList.remove('revealing');
        });
      } else if (round && shownRound && round !== shownRound) {
        const from = shownRound;
        shownRound = round;
        if (!reducedMotion.matches) roll(from, round);
      }
      // what was just rearranged here is not news
      watcher.takeRecords();
    });
    const lines = { childList: true, characterData: true, subtree: true };
    watcher.observe(genreLine, lines);
    if (roundLine) watcher.observe(roundLine, lines);
  }

  // ─── The game on a touch screen: a poster follows the finger ──────
  // The game rejects a poster swiped 60px toward its own edge (its script
  // decides when the finger lifts), but the poster used to stand still under
  // the finger. Now it travels with the finger toward its edge, tilting as it
  // goes and fading a little, and resists the other way. Let go past the
  // game's mark and the game's own exit carries it on from where it is; let go
  // before, and it springs back. The game's script is untouched.
  //
  // Toward the other poster it gives a quarter of the finger's move at first
  // and never more than 24px (under half the gutter): friction rising to a
  // stop, not a wall. A poster caught while it springs back carries on from
  // where it is instead of jumping home under the finger.
  const RESIST = 24;
  const pull = (v) => Math.sign(v) * RESIST * (1 - Math.exp(-Math.abs(v) * 0.25 / RESIST));
  // the finger travel a given pull stands for (for a poster caught on its way back)
  const unpull = (d) => -Math.sign(d) * (RESIST / 0.25) * Math.log(1 - Math.min(Math.abs(d), RESIST * 0.999) / RESIST);

  document.querySelectorAll('.sr-card-left, .sr-card-right').forEach((card) => {
    const edge = card.classList.contains('sr-card-left') ? -1 : 1;
    const sliding = () => /\bslide-(out|in)-/.test(card.className);
    let startX = null;
    let startY = 0;
    let base = 0;                        // the finger travel the poster already stood for at touchdown
    let across = null;                   // decided on the first few pixels: across (ours) or down (a scroll)

    const settle = () => {
      card.style.transition = '';
      card.style.transform = '';
      card.style.opacity = '';
    };

    // the poster for a finger that has travelled v: free toward its edge, held the other way
    const place = (v) => {
      const dx = v * edge > 0 ? v : pull(v);
      card.style.transform = dx ? `translateX(${dx}px) rotate(${(dx * 0.04).toFixed(2)}deg)` : '';
      card.style.opacity = dx * edge > 0 ? String(Math.max(0.6, 1 - Math.abs(dx) / 300)) : '';
    };

    const springBack = () => {
      card.style.transition = reducedMotion.matches ? 'none' : 'transform 0.3s var(--ease-out), opacity 0.3s var(--ease-out)';
      card.style.transform = '';
      card.style.opacity = '';
    };

    card.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1 || sliding()) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      across = null;
      // where the poster is now (on its way back from the last drag, or home)
      const now = getComputedStyle(card).transform;
      const at = now && now !== 'none' ? new DOMMatrixReadOnly(now).m41 : 0;
      base = at * edge > 0 ? at : unpull(at);
      card.style.transition = 'none';
      place(base);
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      if (startX === null) return;
      const mx = e.touches[0].clientX - startX;
      const my = e.touches[0].clientY - startY;
      if (across === null) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        across = Math.abs(mx) > Math.abs(my);
      }
      if (!across) {
        startX = null;
        springBack();
        return;
      }
      place(base + mx);
    }, { passive: true });

    const release = () => {
      if (startX === null) return;
      startX = null;
      // the game's own handler has run by the next frame: rejected, or not
      requestAnimationFrame(() => {
        if (/\bslide-out-/.test(card.className)) return;
        springBack();
      });
    };
    card.addEventListener('touchend', release, { passive: true });
    card.addEventListener('touchcancel', release, { passive: true });

    // Once the exit is over (the game takes the class off to deal the next
    // film), the poster's place is its own again, before the next one slides in
    new MutationObserver(() => {
      if (startX === null && !/\bslide-out-/.test(card.className)) settle();
    }).observe(card, { attributes: true, attributeFilter: ['class'] });
  });

  // ─── Footer: a random film quote on every load ─────────
  const quote = document.querySelector('.quote');
  if (quote) {
    const lines = [
      'I am the one who knocks... and designs.',
      'May the Force be with your product.',
      'Bazinga!',
      'Say hello to my little pixel.',
      'I\'m gonna make him an interface he can\'t refuse.',
      'Here\'s looking at you, user.',
      'To infinity and beyond... the fold.',
      'You talking to me? About design systems?',
      'After all this time? Always. Designing.',
      'It\'s not a bug. It\'s a feature... I haven\'t built yet.',
    ];
    quote.textContent = lines[Math.floor(Math.random() * lines.length)];
  }

  // ─── Beer emoji: plays once when the page appears, again on hover ──
  // With reduced motion it keeps still: its player shows the two mugs at
  // rest (its first frame, the same as its last) once it is not told to
  // play. This runs before the player's own script, so taking away autoplay
  // is enough; stop() covers a player that is already running.
  const cheers = document.getElementById('cheers-lottie');
  if (cheers && reducedMotion.matches) {
    cheers.removeAttribute('autoplay');
    if (typeof cheers.stop === 'function') cheers.stop();
  } else if (cheers) {
    const replay = () => {
      if (typeof cheers.stop !== 'function') return;
      // a toast already under way plays on, rather than starting over
      const state = typeof cheers.getState === 'function' ? cheers.getState() : null;
      if (state && state.currentState === 'playing') return;
      cheers.stop();
      cheers.play();
    };
    const host = cheers.closest('h1, .way-home');
    if (host) host.addEventListener('mouseenter', replay);
    // The intro covers the first play; toast again once it lifts
    new MutationObserver((_, observer) => {
      if (!document.body.classList.contains('intro-finished')) return;
      observer.disconnect();
      replay();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // ─── Openings: the homepage and the game settle in every time they open ──
  // The class .entering on <html> runs the entrance (css/site.css and
  // css/screening-room.css). The page's head script sets it before the first
  // picture on a normal load; here it is set when the intro lifts, and again
  // when the page comes back from the browser's back-forward cache. It comes
  // off once the entrance is over, with the marks of anything a page
  // transition carried in (that already arrived, and does not enter twice).
  const opens = !!document.querySelector('.page-home, .page-game');
  const OPENING = ['rise', 'pull-soft', 'fade-in', 'sr-develop', 'sr-disc-in'];
  let openings = 0;

  function finishOpening() {
    const mine = ++openings;
    afterAnimations(document.body, OPENING, () => {
      if (mine !== openings) return;
      root.classList.remove('entering');
      document.querySelectorAll('.is-carried').forEach((el) => el.classList.remove('is-carried'));
    });
  }

  function open() {
    root.classList.remove('entering');
    void root.offsetWidth;               // a fresh start for animations that already ran
    root.classList.add('entering');
    finishOpening();
  }

  if (opens) {
    if (root.classList.contains('entering')) finishOpening();
    // The intro's own fade-in stays as it was; the words settle in with it
    if (introActive()) {
      new MutationObserver((_, observer) => {
        if (!document.body.classList.contains('intro-finished')) return;
        observer.disconnect();
        open();
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    window.addEventListener('pageshow', (e) => { if (e.persisted) open(); });
    // Past the intro, its finish has done its work: without it, a return to
    // this page opens like any other
    window.addEventListener('pagehide', () => document.body.classList.remove('intro-finished'));
  }

  // ─── Page transitions ───────────────────────────────────
  // Between the homepage and a work's own page the work's picture and title
  // carry over: the card's picture grows into the case study's cover (the
  // game's stage), the slate's title into the page's heading, and both come
  // back on the way home. The rest of the page crossfades (css/site.css).
  // Needs cross-document view transitions; skipped with reduced motion, where
  // the plain crossfade stays, and into the intro.
  const CASE_STUDIES = ['lenskart-eye-test.html', 'lambdatest-test-case-generator.html', 'lambdatest-design-to-production.html'];
  const WORKS = [...CASE_STUDIES, 'screening-room.html'];
  const HERE = fileOf(window.location.href);
  const isHome = HERE === 'index.html';
  let dressed = [];

  // The work shared by this page and the other one, if the pair is one of ours
  function workWith(url) {
    const other = fileOf(url);
    if (isHome) return WORKS.includes(other) ? other : null;
    return WORKS.includes(HERE) && other === 'index.html' ? HERE : null;
  }

  function targets(work) {
    if (isHome) {
      const frame = strip && strip.frameFor(work);
      if (!frame) return null;
      const slateShown = strip.slate && getComputedStyle(strip.slate).display !== 'none';
      return {
        frame,
        shot: frame.querySelector('.still img, .still video'),
        title: slateShown ? strip.slate.querySelector('.slate-title') : frame.querySelector('.title'),
      };
    }
    if (CASE_STUDIES.includes(HERE)) {
      return { shot: document.querySelector('.cs-hero img'), title: document.querySelector('.cs-head h1') };
    }
    return { shot: document.querySelector('.sr-stage'), title: document.querySelector('.sr-title') };
  }

  function undress() {
    dressed.forEach((el) => {
      el.style.viewTransitionName = '';
      el.style.translate = '';
    });
    dressed = [];
  }

  // Name an element for the transition. One that is out of sight (the case
  // study read far down, a caption below the fold) first moves to just past
  // the nearest edge of the screen, so it travels in from where it lies
  // instead of from far away.
  function dress(el, name) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = r.right < 0 ? -r.right : r.left > vw ? vw - r.left : 0;
    const dy = r.bottom < 0 ? -r.bottom : r.top > vh ? vh - r.top : 0;
    if (dx || dy) el.style.translate = `${dx}px ${dy}px`;
    el.style.viewTransitionName = name;
    dressed.push(el);
  }

  // A handshake between the two pages: the page that is left notes the work
  // it dressed, and the size of its title's letters; the page that opens
  // dresses only for that same work, fresh (a browser that names only one
  // side would leave the other side's picture waiting in an empty slot).
  const NOTE_KEY = 'rg-vt-note';

  // The measure of a title's words: the size of its letters, and, when it
  // sits on one line, the width the words take (their letter-spacing can
  // differ between the two places, so on one line the width matches better)
  function measure(title) {
    const range = document.createRange();
    range.selectNodeContents(title);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    const lines = new Set(rects.map((r) => Math.round(r.top))).size;
    return {
      size: parseFloat(getComputedStyle(title).fontSize),
      width: lines === 1 ? range.getBoundingClientRect().width : 0,
    };
  }

  function leaveNote(work, title) {
    try {
      const m = title && title.style.viewTransitionName ? measure(title) : { size: 0, width: 0 };
      sessionStorage.setItem(NOTE_KEY, JSON.stringify({ work, size: m.size, width: m.width, t: Date.now() }));
    } catch (_) { /* no note: the page that opens simply crossfades */ }
  }

  function takeNote() {
    try {
      const note = JSON.parse(sessionStorage.getItem(NOTE_KEY) || 'null');
      sessionStorage.removeItem(NOTE_KEY);
      return note && Date.now() - note.t < 10000 ? note : null;
    } catch (_) { return null; }
  }

  // The title's letters keep one size between the two pictures of it: both
  // pictures are scaled by the ratio of the two measures, anchored at their
  // top left corners, so only the line breaks crossfade
  function scaleTitles(title, before, transition) {
    if (!(before.size > 0)) return;
    const now = measure(title);
    const ratio = before.width > 0 && now.width > 0 ? now.width / before.width : now.size / before.size;
    if (!(ratio > 0)) return;
    root.classList.add('vt-scale-title');
    transition.ready.then(() => {
      const timing = {
        duration: 500,
        easing: getComputedStyle(root).getPropertyValue('--ease-in-out').trim() || 'ease-in-out',
        fill: 'both',
      };
      root.animate({ transform: ['scale(1)', `scale(${ratio})`] }, { ...timing, pseudoElement: '::view-transition-old(work-title)' });
      root.animate({ transform: [`scale(${1 / ratio})`, 'scale(1)'] }, { ...timing, pseudoElement: '::view-transition-new(work-title)' });
    }).catch(() => {});
  }

  function dressFor(work, arriving) {
    const t = targets(work);
    if (!t) return null;
    if (t.frame) {
      // the frame must be the active one, with the slate speaking for it, and
      // in view on the strip: done before the picture is taken
      if (arriving) strip.bringIn(t.frame);
      else strip.activateQuietly(t.frame);
    }
    dress(t.shot, 'work-shot');
    dress(t.title, 'work-title');
    if (!arriving) leaveNote(work, t.title);
    // what is carried in has arrived: it takes no part in the entrance
    if (arriving) {
      [t.frame, t.shot, t.title].forEach((el) => el && el.classList.add('is-carried'));
      if (t.frame) t.frame.classList.add('is-landing');
    }
    return t;
  }

  // Where a link just followed was going: a browser without the Navigation
  // API (Safari) does not say on the way out, so the click tells instead
  let followed = null;
  document.addEventListener('click', (e) => {
    const link = !e.defaultPrevented && e.target.closest && e.target.closest('a[href]');
    if (link) followed = { href: link.href, t: Date.now() };
  });

  window.addEventListener('pageswap', (e) => {
    undress();
    if (!e.viewTransition || reducedMotion.matches) return;
    const to = (e.activation && e.activation.entry && e.activation.entry.url)
      || (followed && Date.now() - followed.t < 3000 ? followed.href : null);
    const work = to && workWith(to);
    if (work) dressFor(work, false);
  });

  window.addEventListener('pagereveal', (e) => {
    undress();
    const note = takeNote();             // spent on every arrival, used or not
    if (!e.viewTransition || reducedMotion.matches) return;
    if (isHome && introActive()) return;
    const from = (window.navigation && navigation.activation && navigation.activation.from && navigation.activation.from.url) || document.referrer;
    const work = from && workWith(from);
    if (!work || !note || note.work !== work) return;
    const t = dressFor(work, true);
    if (t && t.title && t.title.style.viewTransitionName) scaleTitles(t.title, note, e.viewTransition);
    // which way the trip goes: the stylesheet times the shot's crossfade by it
    const way = isHome ? 'vt-to-home' : 'vt-to-work';
    root.classList.add(way);
    e.viewTransition.finished.finally(() => {
      undress();
      root.classList.remove(way, 'vt-scale-title');
      document.querySelectorAll('.is-landing').forEach((el) => el.classList.remove('is-landing'));
    });
  });
})();
