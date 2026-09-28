/* ============================================
   FIGMA CURSOR (Desktop Only)
   Carried over from the old site's main.js so every page can share it.
   Press `/` to rename the cursor label.

   Over a link (or a button that reads as one) the arrow becomes a big
   white-glove hand, the size Figma's help center uses (about 28 px, a 2.25 px
   outline), and over the Screening Room's posters it becomes a film clapper. Both glyphs are
   Phosphor Icons (MIT licence, phosphoricons.com), "hand-pointing" and
   "film-slate" in the regular weight: the icon's own outline in black over
   its inner shape in white. A press on a poster claps the clapper: its
   stick comes down on the board and lifts again, and site.js gives the clap
   its sound when Sound is on.
   ============================================ */

(function () {
  'use strict';

  // A cursor for a mouse or a trackpad only: on a touch screen, however wide,
  // the browser's stand-in mouse events would leave it wherever a finger taps
  if (window.innerWidth < 769 || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // Phosphor's outline path, and the inner shape of that outline on its own for the white
  const HAND = 'M196,88a27.86,27.86,0,0,0-13.35,3.39A28,28,0,0,0,144,74.7V44a28,28,0,0,0-56,0v80l-3.82-6.13A28,28,0,0,0,35.73,146l4.67,8.23C74.81,214.89,89.05,240,136,240a88.1,88.1,0,0,0,88-88V116A28,28,0,0,0,196,88Zm12,64a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z';
  const HAND_INSIDE = 'M208,152a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z';
  // The clapper in its two parts, so that the stick can come down: Phosphor's
  // outline cut where the stick meets the board, the stick drawn on through
  // to its own lower corner (hidden in the board's frame) and the board given
  // the corner the stick covers. Together, at rest, they draw the icon to the
  // pixel.
  const STICK = 'M102.09,104L210,75.51a8,8,0,0,0,5.68-9.84l-8.16-30a15.93,15.93,0,0,0-19.42-11.13L35.81,64.74a15.75,15.75,0,0,0-9.7,7.4,15.51,15.51,0,0,0-1.55,12L34.77,121.77ZM192.16,40l6,22.07-22.62,6L147.42,51.83Zm-66.69,17.6,28.12,16.24-36.94,9.75L88.53,67.37Zm-79.4,44.62-6-22.08,26.5-7L94.69,89.4Z';
  const STICK_INSIDE = 'M192.16,40l6,22.07-22.62,6L147.42,51.83ZM125.47,57.6l28.12,16.24-36.94,9.75L88.53,67.37ZM46.07,102.22l-6-22.08,26.5-7L94.69,89.4Z';
  const BOARD = 'M40,104H216a8,8,0,0,1,8,8v88a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V112a8,8,0,0,1,8-8ZM208,200H48V120H208Z';
  const BOARD_INSIDE = 'M208,200H48V120H208Z';

  // The white is stroked a little wider than its shape so it runs under the
  // black outline and no background shows through the seam between them
  const cursor = document.createElement('div');
  cursor.classList.add('figma-cursor');
  cursor.innerHTML = `
      <svg class="cursor-arrow" width="20" height="26" viewBox="0 0 20 26" fill="none">
        <path d="M1 1L7 25L10.5 16L19 13L1 1Z" fill="#7B61FF" stroke="#fff" stroke-width="1.2"/>
      </svg>
      <svg class="cursor-hand" viewBox="31 15 194 226">
        <path d="${HAND_INSIDE}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
        <path d="${HAND}" fill="#000" fill-rule="evenodd"/>
      </svg>
      <span class="cursor-slate">
        <svg class="slate-board" viewBox="23 23 202 194">
          <path d="${BOARD_INSIDE}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
          <path d="${BOARD}" fill="#000" fill-rule="evenodd"/>
        </svg>
        <svg class="slate-stick" viewBox="23 23 202 194">
          <path d="${STICK_INSIDE}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
          <path d="${STICK}" fill="#000" fill-rule="evenodd"/>
        </svg>
      </span>
      <div class="cursor-label"><span class="cursor-label-text">Guest</span></div>
    `;
  document.body.appendChild(cursor);
  // The stylesheet hides the system pointer only once this class says the custom one is running
  const root = document.documentElement;
  root.classList.add('has-figma-cursor');

  let cursorName = 'Guest';
  let isEditing = false;

  // ─── Where the pointer is ───────────────────────────────
  let x = 0, y = 0, placed = false, shown = false;

  function place(nx, ny) {
    x = nx;
    y = ny;
    placed = true;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function show(on) {
    if (on === shown) return;
    shown = on;
    cursor.style.opacity = on ? '1' : '0';
  }

  // Hidden until the pointer's place is known, instead of waiting in a corner
  cursor.style.opacity = '0';

  // The place carries over a page change, so the cursor is under the mouse
  // when the next page appears rather than missing until the mouse moves.
  // Only a fresh one, and only if the pointer was on the page, not on the
  // browser's own buttons.
  const KEY = 'rg-cursor';
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved && Date.now() - saved.t < 10000 && saved.x < window.innerWidth && saved.y < window.innerHeight) {
      place(saved.x, saved.y);
      show(true);
    }
  } catch (_) { /* storage off: the cursor appears on the first move, as before */ }

  window.addEventListener('pagehide', () => {
    try {
      if (placed && shown) sessionStorage.setItem(KEY, JSON.stringify({ x, y, t: Date.now() }));
      else sessionStorage.removeItem(KEY);
    } catch (_) { /* nothing to carry */ }
  });

  // ─── What the pointer is over picks the glyph ───────────
  const SLATE_ON = '.sr-card .sr-still, .sr-play-btn';
  // The hand only on links, and on the buttons that read as links (Sound,
  // Lights, Restart, Skip Intro); the clapper only on the posters; the purple
  // arrow everywhere else, a game card's words and the beer page's form
  // fields included
  const HAND_ON = 'a[href], button:not(:disabled), [role="button"], [role="link"]';
  const strip = document.querySelector('.roll');
  let over = null;
  let state = 'arrow';

  function glyphFor(el) {
    // mid-pan the strip stays in hand, over the gaps between frames too
    if (strip && strip.classList.contains('dragging')) return 'hand';
    if (!el || !el.closest) return 'arrow';
    if (el.closest(SLATE_ON)) return 'slate';
    if (el.closest(HAND_ON)) return 'hand';
    return 'arrow';
  }

  function setState(next) {
    if (next === state) return;
    state = next;
    if (next === 'arrow') delete cursor.dataset.state;
    else cursor.dataset.state = next;
  }

  // During a view transition the page is a picture and every hit lands on
  // <html>, so the glyph holds until the transition is over
  function transitioning() {
    try { return root.matches(':active-view-transition'); } catch (_) { return false; }
  }

  document.addEventListener('mousemove', (e) => {
    place(e.clientX, e.clientY);
    show(true);
    if (e.target === over) return;
    over = e.target;
    if (!transitioning()) setState(glyphFor(over));
  });

  // The page can change under a still pointer: a scroll, the game dealing new
  // posters or ending, the intro lifting. Look again, once a frame at most.
  let queued = false;
  function recheck() {
    if (queued || !placed) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (transitioning()) {
        setTimeout(recheck, 100);
        return;
      }
      over = document.elementFromPoint(x, y);
      setState(glyphFor(over));
    });
  }

  document.addEventListener('scroll', recheck, { capture: true, passive: true });
  new MutationObserver((records) => {
    if (records.some((r) => !cursor.contains(r.target))) recheck();
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'disabled'] });
  recheck();

  // A press: the hand gives a little under the finger (the clapper claps
  // instead, below). It lasts at least the 100ms its dip takes, since a
  // trackpad's tap sends the press and the release together, and a native
  // drag, which swallows the release, ends it too.
  let pressedAt = 0;
  let letGo = 0;
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    clearTimeout(letGo);
    pressedAt = performance.now();
    cursor.classList.add('is-pressed');
  });
  const release = () => {
    clearTimeout(letGo);
    const left = 100 - (performance.now() - pressedAt);
    if (left > 0) letGo = setTimeout(() => cursor.classList.remove('is-pressed'), left);
    else cursor.classList.remove('is-pressed');
  };
  document.addEventListener('mouseup', () => {
    release();
    recheck();
  });
  window.addEventListener('blur', release);
  document.addEventListener('dragstart', release);
  document.addEventListener('pointercancel', release);

  // ─── A press on a poster claps the clapper ─────────────
  // The stick comes down onto the board at full speed, so that it lands
  // rather than settles, rests there a beat and lifts again, about a third
  // of a second in all. The whole clap plays however short the press (a
  // trackpad's tap sends the press and the release together), and another
  // press catches the stick wherever it is. With reduced motion the stick
  // does not travel: it is down for a moment, then up. site.js plays the
  // clap's sound for the moment the stick lands.
  const stick = cursor.querySelector('.slate-stick');
  const SHUT = 14.8;                     // degrees: the stick lies flat on the board
  const DOWN = 60, HOLD = 70, UP = 180;  // ms
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  // the lift is seen, not sprung: the stylesheet's gentler ease-out
  const lift = getComputedStyle(root).getPropertyValue('--ease-out-soft').trim() || 'ease-out';

  // returns how long until the stick lands, in ms
  function clap() {
    let from = 0;
    const running = stick.getAnimations();
    if (running.length) {
      const m = new DOMMatrixReadOnly(getComputedStyle(stick).transform);
      from = Math.min(Math.max(Math.atan2(m.b, m.a) * 180 / Math.PI, 0), SHUT);
      running.forEach((a) => a.cancel());
    }
    if (calm.matches) {
      stick.animate({ transform: [`rotate(${SHUT}deg)`, `rotate(${SHUT}deg)`] }, { duration: DOWN + HOLD });
      return 0;
    }
    // the rest of the way down, at the same speed
    const down = DOWN * (1 - from / SHUT);
    const total = down + HOLD + UP;
    stick.animate([
      { transform: `rotate(${from}deg)` },
      { transform: `rotate(${SHUT}deg)`, offset: down / total },
      { transform: `rotate(${SHUT}deg)`, offset: (down + HOLD) / total, easing: lift },
      { transform: 'rotate(0deg)' },
    ], { duration: total });
    return down;
  }

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || state !== 'slate') return;
    const lands = clap();
    document.dispatchEvent(new CustomEvent('rg:clap', { detail: { lands } }));
  });

  document.addEventListener('mouseenter', () => {
    if (placed) show(true);
  });
  document.addEventListener('mouseleave', () => {
    release();
    show(false);
  });

  // Press `/` to edit cursor name
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !isEditing) {
      e.preventDefault();
      isEditing = true;
      const labelContainer = cursor.querySelector('.cursor-label');
      labelContainer.innerHTML = `<input class="cursor-label-input" type="text" value="${cursorName}" maxlength="10" autofocus />`;
      const input = labelContainer.querySelector('input');
      input.style.pointerEvents = 'all';
      input.focus();
      input.select();

      const finish = () => {
        const val = input.value.trim() || 'Guest';
        cursorName = val;
        labelContainer.innerHTML = `<span class="cursor-label-text">${cursorName}</span>`;
        isEditing = false;
      };

      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === 'Escape') {
          ev.preventDefault();
          finish();
        }
        ev.stopPropagation();
      });
      input.addEventListener('blur', finish);
    }
  });
})();
