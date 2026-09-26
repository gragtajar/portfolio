/* ============================================
   FIGMA CURSOR (Desktop Only)
   Carried over from the old site's main.js so every page can share it.
   Press `/` to rename the cursor label.

   Over anything that takes a click the arrow becomes a big white-glove hand,
   the size Figma's help center uses (about 28 px, a 2.25 px outline), and over
   the Screening Room's posters it becomes a film clapper. Both glyphs are
   Phosphor Icons (MIT licence, phosphoricons.com), "hand-pointing" and
   "film-slate" in the regular weight: the icon's own outline in black over
   its inner shape in white.
   ============================================ */

(function () {
  'use strict';

  if (window.innerWidth < 769) return;

  // Phosphor's outline path, and the inner shape of that outline on its own for the white
  const HAND = 'M196,88a27.86,27.86,0,0,0-13.35,3.39A28,28,0,0,0,144,74.7V44a28,28,0,0,0-56,0v80l-3.82-6.13A28,28,0,0,0,35.73,146l4.67,8.23C74.81,214.89,89.05,240,136,240a88.1,88.1,0,0,0,88-88V116A28,28,0,0,0,196,88Zm12,64a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z';
  const HAND_INSIDE = 'M208,152a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z';
  const SLATE = 'M216,104H102.09L210,75.51a8,8,0,0,0,5.68-9.84l-8.16-30a15.93,15.93,0,0,0-19.42-11.13L35.81,64.74a15.75,15.75,0,0,0-9.7,7.4,15.51,15.51,0,0,0-1.55,12L32,111.56c0,.14,0,.29,0,.44v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V112A8,8,0,0,0,216,104ZM192.16,40l6,22.07-22.62,6L147.42,51.83Zm-66.69,17.6,28.12,16.24-36.94,9.75L88.53,67.37Zm-79.4,44.62-6-22.08,26.5-7L94.69,89.4ZM208,200H48V120H208v80Z';
  const SLATE_INSIDE = 'M192.16,40l6,22.07-22.62,6L147.42,51.83ZM125.47,57.6l28.12,16.24-36.94,9.75L88.53,67.37ZM46.07,102.22l-6-22.08,26.5-7L94.69,89.4ZM208,200H48V120H208v80Z';

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
      <svg class="cursor-slate" viewBox="23 23 202 194">
        <path d="${SLATE_INSIDE}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
        <path d="${SLATE}" fill="#000" fill-rule="evenodd"/>
      </svg>
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
  const HAND_ON = [
    'a[href]', 'button:not(:disabled)', 'summary', 'select', 'label[for]',
    '[role="button"]', '[role="link"]', '[role="tab"]',
    'input[type="checkbox"]', 'input[type="radio"]', 'input[type="range"]',
    'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]',
    '.sr-card', // the whole card picks the film, not only its poster
  ].join(', ');
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

  // A press: the hand and the clapper give a little under the finger
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) cursor.classList.add('is-pressed');
  });
  const release = () => cursor.classList.remove('is-pressed');
  document.addEventListener('mouseup', () => {
    release();
    recheck();
  });
  window.addEventListener('blur', release);

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
