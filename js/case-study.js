/* ============================================
   CASE STUDY
   The section index says which section is being read and glides to the
   section it is asked for; a board that slides sideways can be panned from
   the keyboard; and a picture that carries a blurred copy of itself is
   covered by the copy until it has loaded and been reached.
   ============================================ */

(function () {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ─── Pictures: a blurred copy until each one is in, and reached ────
  // A figure that carries a blurred copy of its picture (.blur-up: its
  // --blurred, drawn by the page's stylesheet) is covered by that copy until
  // the picture has loaded and the reader has scrolled to it; then the copy
  // fades and the picture is there, as on Medium. The cover is put on here,
  // so a page whose script never runs simply shows its pictures. A picture
  // already in and on screen when this runs may have been seen: it is not
  // covered. With reduced motion a picture is uncovered as soon as it is in,
  // without waiting to be reached (and without the fade: the stylesheet).
  const covered = [...document.querySelectorAll('.blur-up')];
  if (covered.length) {
    const sharpen = (figure) => figure.classList.add('is-sharp');
    const reach = 'IntersectionObserver' in window && !reducedMotion.matches;
    const waiting = new Map();           // picture -> what to do once it is reached
    const reader = reach && new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      reader.unobserve(target);
      waiting.get(target)();
      waiting.delete(target);
    }), { rootMargin: '0px 0px -10% 0px' }); // a little way up the screen, not at its very edge

    covered.forEach((figure) => {
      const img = figure.querySelector('img');
      if (!img) {
        sharpen(figure);
        return;
      }
      if (img.complete && img.naturalWidth) {
        const box = img.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) {
          sharpen(figure);
          return;
        }
      }
      // in: loaded and decoded, or failed (its alt text is better than a cover)
      const loaded = new Promise((resolve) => {
        if (img.complete) {
          resolve();
          return;
        }
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }).then(() => (img.decode ? img.decode().catch(() => {}) : null));
      const reached = reach && new Promise((resolve) => {
        waiting.set(img, resolve);
        reader.observe(img);
      });
      Promise.all([loaded, reached]).then(() => sharpen(figure));
    });
    root.classList.add('has-blur-up');
  }

  // ─── Boards: focusable only while they have somewhere to slide ─────
  const boards = document.querySelectorAll('.board');
  const fit = (board) => {
    if (board.scrollWidth > board.clientWidth) board.tabIndex = 0;
    else board.removeAttribute('tabindex');
  };
  // once now (a page opened in a background tab gets no resize notices until
  // it is shown), then whenever a board's box changes
  boards.forEach(fit);
  if (boards.length && 'ResizeObserver' in window) {
    const resized = new ResizeObserver((entries) => entries.forEach(({ target }) => fit(target)));
    boards.forEach((board) => resized.observe(board));
  }

  // ─── The section index ─────────────────────────────────────────────
  const links = [...document.querySelectorAll('.cs-index a')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const onScreen = new Set();
  let gliding = false;                   // on the way to a section the index was asked for

  const show = (link) => {
    links.forEach((other) => other.removeAttribute('aria-current'));
    if (!link) return;
    link.setAttribute('aria-current', 'true');
    // on narrow screens the index is a sideways row: keep the current link in view
    const row = link.parentElement;
    if (row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: link.offsetLeft - 20, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  };

  // the first indexed section still on screen, in document order
  const mark = () => {
    if (gliding) return;
    const current = sections.find((section) => onScreen.has(section));
    show(current ? byId.get(current.id) : null);
  };

  // A click in the index glides to its section instead of jumping there. The
  // browser's own jump to the #section still does the work (the address, the
  // history entry, where Tab goes next), with smooth scrolling switched on for
  // that jump alone: a link shared to a section still opens straight at it,
  // and back and forward still put the page back at once. The index marks
  // where the page is going from the start, not each section it passes.
  let quiet = 0;
  let glides = 0;
  // The glide is over once the page stops: at scrollend where the browser
  // has it, otherwise after a moment with no scrolling. A page that only
  // looked still because it was busy (the glide carries on without it) is
  // still on its way, so the page must also hold still for a frame.
  const wait = () => {
    clearTimeout(quiet);
    quiet = setTimeout(land, 150);
  };
  const land = () => {
    clearTimeout(quiet);
    const y = window.scrollY;
    const mine = glides;
    requestAnimationFrame(() => {
      if (mine !== glides) return;       // another click has the index now
      if (window.scrollY !== y) {
        wait();
        return;
      }
      document.removeEventListener('scroll', wait);
      document.removeEventListener('scrollend', land);
      root.style.scrollBehavior = '';
      // The observer reports a little late while the page is busy: the index
      // follows the reading again with everything the observer saw up to the
      // page's resting place, not from a list a moment old
      note(watcher.takeRecords());
      gliding = false;
      mark();
    });
  };

  links.forEach((link) => link.addEventListener('click', (e) => {
    if (reducedMotion.matches || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    glides++;
    gliding = true;
    show(link);
    root.style.scrollBehavior = 'smooth';
    document.addEventListener('scroll', wait, { passive: true });
    document.addEventListener('scrollend', land);
    wait();
  }));

  const note = (entries) => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) onScreen.add(target);
    else onScreen.delete(target);
  });

  const watcher = new IntersectionObserver((entries) => {
    note(entries);
    mark();
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach((section) => watcher.observe(section));
})();
