/* ============================================
   rajatg.in
   Pencil marks, the contact strip (slate, wheel, drag, arrows), GIF-like
   videos, the Sound and Lights switches, the game's cheer, and the footer's
   film quote.
   ============================================ */

(function () {
  'use strict';

  const root = document.documentElement;
  const roll = document.querySelector('.roll');
  const introActive = () => document.body.classList.contains('intro-active');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

    const activate = (frame) => {
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
      go.querySelector('.under').textContent = frame.querySelector('.go').textContent;
      go.href = link.href;
      go.target = link.target;
      go.rel = link.rel;
      go.dataset.track = link.dataset.track || '';
      // restart the settle animation so the words arrive with the mark
      slate.classList.remove('swap');
      void slate.offsetWidth;
      slate.classList.add('swap');
    };

    // Hover intent: a pointer that is only passing over a frame on its way to
    // the slate must not swap the slate's link out from under the click. A
    // frame activates when the pointer slows down on it, or rests on it.
    let lastMove = null;
    let dwell = 0;

    roll.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
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

    frames.forEach((frame) => frame.addEventListener('focusin', () => activate(frame)));

    // On touch (or any scroll with no pointer resting on a frame) the mark
    // follows the frame that has come to rest at the strip's leading edge
    let settle = 0;
    roll.addEventListener('scroll', () => {
      if (hovering) return;
      cancelAnimationFrame(settle);
      settle = requestAnimationFrame(() => {
        const edge = roll.getBoundingClientRect().left + parseFloat(getComputedStyle(roll).paddingLeft);
        let best = null, bestGap = Infinity;
        frames.forEach((frame) => {
          const gap = Math.abs(frame.getBoundingClientRect().left - edge);
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

    activate(roll.querySelector('.frame.is-active') || frames[0]);
    if (slate) slate.hidden = false;

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

  if (lights) {
    renderLights();
    systemDark.addEventListener('change', renderLights);
    lights.addEventListener('click', () => {
      root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('rg-theme', root.dataset.theme); } catch (_) {}
      renderLights();
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

  document.addEventListener('pointerdown', (e) => {
    // any press wakes the audio while a gesture is in hand: Safari will not
    // start it later from a timer, which is when the game's cheer is due
    if (soundOn) audio();
    const el = e.target.closest('a, button');
    if (el && el !== sound) click(0.5, 0.06, 1800);
  });

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
  const cheers = document.getElementById('cheers-lottie');
  if (cheers) {
    const replay = () => {
      if (typeof cheers.stop !== 'function') return;
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
})();
