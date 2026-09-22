/* ============================================
   CASE STUDY
   The section index says which section is being read, and a board that
   slides sideways can be panned from the keyboard.
   ============================================ */

(function () {
  'use strict';

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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const byId = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const onScreen = new Set();

  const mark = () => {
    // the first indexed section still on screen, in document order
    const current = sections.find((section) => onScreen.has(section));
    links.forEach((link) => link.removeAttribute('aria-current'));
    if (!current) return;
    const link = byId.get(current.id);
    link.setAttribute('aria-current', 'true');
    // on narrow screens the index is a sideways row: keep the current link in view
    const row = link.parentElement;
    if (row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: link.offsetLeft - 20, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  };

  const watcher = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) onScreen.add(target);
      else onScreen.delete(target);
    });
    mark();
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach((section) => watcher.observe(section));
})();
