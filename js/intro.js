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

  // The intro plays once per visit (per browser session). On later loads the
  // overlay is already hidden by the inline script in <head>; just put the
  // visitor back where they were.
  const SEEN = 'rg-intro-seen';
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN) === '1';
    sessionStorage.setItem(SEEN, '1');
  } catch (_) {}

  if (seen) {
    overlay.remove();
    window.scrollTo(0, savedScroll);
    return;
  }

  // Reset scroll to top so the intro covers fresh viewport
  window.scrollTo(0, 0);
  document.body.classList.add('intro-active');

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
    }, 550);
  }

  // 42s animation + 0.5s start delay = total ~42.5s
  const autoEnd = setTimeout(endIntro, 42500);

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
