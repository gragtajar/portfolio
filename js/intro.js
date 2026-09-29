/* ============================================
   INTRO CRAWL — Scroll preservation & end handler
   ============================================ */

(function () {
  'use strict';

  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const skipBtn = document.getElementById('intro-skip');
  const content = document.getElementById('content');

  // Per-page scroll key (homepage and case study save separately)
  const KEY = 'scrollY_' + window.location.pathname;

  // Read previously saved scroll position (set before reload)
  const savedScroll = parseInt(sessionStorage.getItem(KEY) || '0', 10);

  // Save scroll position before any unload (reload, navigation)
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem(KEY, String(window.scrollY));
  });
  // Also save on pagehide (Safari/iOS fires this instead)
  window.addEventListener('pagehide', () => {
    sessionStorage.setItem(KEY, String(window.scrollY));
  });

  // The intro plays once per visit (per browser session), and never for a
  // visitor who asks for less motion. Otherwise the overlay is already hidden
  // by the inline script in <head>; just put the visitor back where they were.
  const SEEN = 'rg-intro-seen';
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN) === '1';
    sessionStorage.setItem(SEEN, '1');
  } catch (_) {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) seen = true;

  if (seen) {
    overlay.remove();
    window.scrollTo(0, savedScroll);
    return;
  }

  // Reset scroll to top so the intro covers fresh viewport
  window.scrollTo(0, 0);
  document.body.classList.add('intro-active');

  // ─── The night sky behind the crawl ─────────────────────
  // Drawn on a canvas in the screen's own pixels, as a real star field
  // looks: scattered at random with no pattern to repeat, most stars at the
  // edge of seeing and only a few bright (their count grows steeply toward
  // the faint end), colour only in the brighter ones, a soft glow only
  // around the brightest. Each 512px square of sky has its own seeded stars,
  // so the sky is the same on every visit and a resize only shows more of
  // it. Still, with no air in space to make a star twinkle.
  const TILE = 512;                      // css px of sky per seed
  const PER_TILE = 197;                  // 750 stars to a million css px²
  const FAINTEST = 0.09;                 // a star's light, in css px² of full white
  const SLOPE = 1.25;                    // how steeply the count grows toward the faint end
  const BRIGHTEST = 150;                 // times the faintest
  // blue white, white, pale yellow, pale orange, and how often each comes up
  const TINTS = [[205, 220, 255], [250, 250, 255], [255, 244, 228], [255, 222, 190]];
  const SHARES = [0.18, 0.32, 0.3, 0.2];

  // mulberry32: a small seeded random number generator
  const seeded = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // The eye sees no colour in a faint star: the tint comes in with the light
  function tint(light, pick) {
    let i = 0;
    let share = SHARES[0];
    while (pick > share && i < TINTS.length - 1) share += SHARES[++i];
    const k = Math.min(Math.max((light - 0.15) / 1.2, 0), 1);
    return TINTS[i].map((v) => Math.round(255 + (v - 255) * k));
  }

  function glow(ctx, x, y, radius, stops, rgb) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    stops.forEach(([at, alpha]) => g.addColorStop(at, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`));
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // One star, its light kept the same at any pixel density: a faint one is a
  // single device pixel, a brighter one a soft point that grows slowly with
  // its light, and the brightest carry a faint glow
  function star(ctx, x, y, light, d, pick) {
    const lit = light * d * d;           // its light in device pixels
    const rgb = tint(light, pick);
    if (lit <= 1) {
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${lit.toFixed(3)})`;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
      return;
    }
    const size = Math.max(0.75, 0.62 * Math.pow(lit, 0.42));
    const peak = Math.min(1, lit / (Math.PI * size * size * 0.5));
    glow(ctx, x, y, size * 1.6, [[0, peak], [0.3, peak * 0.72], [0.62, peak * 0.2], [1, 0]], rgb);
    if (light > 1.5) glow(ctx, x, y, size * 5, [[0, Math.min(0.1, 0.03 * (light - 1.5))], [1, 0]], rgb);
  }

  // w by h css px of sky, drawn dw by dh device pixels
  function drawSky(canvas, w, h, dw, dh) {
    canvas.width = dw;
    canvas.height = dh;
    const d = dw / w;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    for (let ty = 0; ty * TILE < h; ty++) {
      for (let tx = 0; tx * TILE < w; tx++) {
        const rand = seeded((tx * 73856093) ^ (ty * 19349663) ^ 1977);
        for (let i = 0; i < PER_TILE; i++) {
          const x = (tx + rand()) * TILE;
          const y = (ty + rand()) * TILE;
          // a power law: most stars near the faintest, a very few far brighter
          const light = FAINTEST * Math.min(Math.pow(1 - rand(), -1 / SLOPE), BRIGHTEST);
          const pick = rand();
          if (x < w + 8 && y < h + 8) star(ctx, x * d, y * d, light, d, pick);
        }
      }
    }
  }

  // Transparent where there are no stars, under the crawl's words: the
  // overlay's own black shows through
  const sky = document.createElement('canvas');
  sky.className = 'intro-sky';
  sky.setAttribute('aria-hidden', 'true');
  overlay.prepend(sky);

  // Drawn at the screen's density (at most three device pixels to a css px)
  // to the canvas's size, as a ResizeObserver reports it: once the page is
  // laid out, before its first picture, and again on a resize or a zoom.
  // Asking the canvas, or the window, for its size here would make the
  // browser lay out the whole page early and hold up that first picture.
  let watch = null;
  if ('ResizeObserver' in window) {        // without one the sky simply stays black
    watch = new ResizeObserver((entries) => {
      const { width, height } = entries[entries.length - 1].contentRect;
      if (!width || !height) return;
      const density = Math.min(window.devicePixelRatio || 1, 3);
      drawSky(sky, width, height, Math.round(width * density), Math.round(height * density));
    });
    watch.observe(sky);
  }

  let ended = false;
  function endIntro() {
    if (ended) return;
    ended = true;
    overlay.classList.add('fading-out');

    // Restore scroll BEFORE fade completes so the snap is hidden under the black overlay
    setTimeout(() => {
      window.scrollTo(0, savedScroll);
      // Reveal the real content with a fade-in
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-finished');
    }, 50);

    setTimeout(() => {
      overlay.style.display = 'none';
      // the sky's pixels are not needed again this visit
      if (watch) watch.disconnect();
      sky.width = 0;
      sky.height = 0;
      sky.remove();
    }, 550);
  }

  // The longest crawl (desktop, css/intro.css) is 38.13s after a 0.5s start
  // delay. The crawl's own animationend below normally ends it first; this is
  // the fallback.
  const autoEnd = setTimeout(endIntro, 38700);

  // Skip button
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(autoEnd);
      endIntro();
    });
  }

  // Listen for animation end as well (fallback)
  if (content) {
    content.addEventListener('animationend', () => {
      clearTimeout(autoEnd);
      endIntro();
    });
  }

  // Allow Esc/Space/Enter to skip
  document.addEventListener('keydown', (e) => {
    if (!ended && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      clearTimeout(autoEnd);
      endIntro();
    }
  });
})();
