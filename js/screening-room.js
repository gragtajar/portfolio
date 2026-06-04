/* ============================================
   SCREENING ROOM — Movie Bracket Game
   Poster paths are baked into movies.json.
   ZERO API calls during gameplay.
   ============================================ */

(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────
  const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';
  const TMDB_IMG_FALLBACK = 'https://image.tmdb.org/t/p/w500';
  const ROUNDS = 20;

  // ─── State ─────────────────────────────────────────────
  let movies = [];
  let genres = [];
  let played = [];
  let genre = null;
  let pool = [];
  let poolIdx = 0;
  let round = 0;
  let left = null;
  let right = null;
  let active = false;
  let transitioning = false;
  let confettiLib = null;          // lazy-loaded canvas-confetti
  let confettiLoading = null;      // dedup load promise

  // Lazy-load canvas-confetti only when needed (saves ~12KB on initial page load)
  function loadConfetti() {
    if (confettiLib) return Promise.resolve(confettiLib);
    if (confettiLoading) return confettiLoading;
    confettiLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      s.async = true;
      s.onload = () => { confettiLib = window.confetti; resolve(confettiLib); };
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return confettiLoading;
  }

  function fireConfetti(opts) {
    loadConfetti().then((c) => { if (c) c(opts); });
  }

  // ─── DOM ───────────────────────────────────────────────
  const root = document.getElementById('screening-room');
  if (!root) return;
  const startEl = root.querySelector('.sr-start');
  const arenaEl = root.querySelector('.sr-arena');
  const winEl = root.querySelector('.sr-winner');
  const impEl = root.querySelector('.sr-impressive');
  const genreEl = root.querySelector('.sr-genre');
  const roundEl = root.querySelector('.sr-round');
  const restartEl = root.querySelector('.sr-restart');
  const playEl = root.querySelector('.sr-play-btn');
  const cardL = root.querySelector('.sr-card-left');
  const cardR = root.querySelector('.sr-card-right');

  // ─── Load Data ─────────────────────────────────────────
  fetch('data/movies.json')
    .then(r => r.json())
    .then(d => {
      movies = d;
      genres = [...new Set(d.map(m => m.genre))];
      // Warm the HTTP/image cache for common posters by preloading a few
      // (browsers will cache these for when the game starts)
      d.slice(0, 8).forEach(m => {
        if (m.poster) {
          const img = new Image();
          img.src = TMDB_IMG + m.poster;
        }
      });
    })
    .catch(() => console.warn('Could not load movies.json'));

  // ─── Helpers ───────────────────────────────────────────
  function shuffle(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  function fmtGenre(s) {
    return s.replace(/-/g, ' / ').replace(/\b\w/g, c => c.toUpperCase()).replace('Sci / Fi', 'Sci-Fi');
  }

  function roundText(r) {
    if (r >= ROUNDS) return 'Final round';
    if (r === ROUNDS - 1) return 'Round ' + r + ' \u2014 1 more, choose wisely';
    if (r === ROUNDS - 2) return 'Round ' + r + ' \u2014 2 more';
    if (r === ROUNDS - 3) return 'Round ' + r + ' \u2014 3 more to go';
    return 'Round ' + r;
  }

  // Preload upcoming posters into browser image cache
  function preloadUpcoming() {
    for (let i = 0; i < 6 && poolIdx + i < pool.length; i++) {
      const m = pool[poolIdx + i];
      if (m.poster) {
        const img = new Image();
        img.src = TMDB_IMG + m.poster;
      }
    }
  }

  // ─── Render Card ───────────────────────────────────────
  let cardVersion = { left: 0, right: 0 };

  function renderCard(cardEl, movie, side) {
    if (!movie || !cardEl) return;
    const v = side ? ++cardVersion[side] : -1;

    const posterEl = cardEl.querySelector('.sr-poster');
    const titleEl = cardEl.querySelector('.sr-card-title');
    const yearEl = cardEl.querySelector('.sr-card-year');
    const linkEl = cardEl.querySelector('.sr-imdb-link');

    titleEl.textContent = movie.title;
    yearEl.textContent = movie.year;
    linkEl.href = 'https://www.imdb.com/title/' + movie.id + '/';

    // If we have a baked poster_path, use it directly — NO API CALL
    if (movie.poster) {
      // Create image element with skeleton while it loads
      posterEl.innerHTML = '<div class="sr-poster-skeleton"></div>';
      const img = new Image();
      img.src = TMDB_IMG + movie.poster;
      img.alt = movie.title;
      img.decoding = 'async';
      img.onload = () => {
        if (side && cardVersion[side] !== v) return;
        posterEl.innerHTML = '';
        posterEl.appendChild(img);
      };
      img.onerror = () => {
        if (side && cardVersion[side] !== v) return;
        // Try fallback size
        const img2 = new Image();
        img2.src = TMDB_IMG_FALLBACK + movie.poster;
        img2.alt = movie.title;
        img2.onload = () => {
          if (side && cardVersion[side] !== v) return;
          posterEl.innerHTML = '';
          posterEl.appendChild(img2);
        };
        img2.onerror = () => {
          if (side && cardVersion[side] !== v) return;
          posterEl.innerHTML = '<div class="sr-poster-fallback">' + movie.title + '</div>';
        };
      };
    } else {
      // No poster baked — show text fallback immediately
      posterEl.innerHTML = '<div class="sr-poster-fallback">' + movie.title + '</div>';
    }
  }

  function cleanCard(c) {
    c.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right', 'winner-pulse');
  }

  // ─── Game Flow ─────────────────────────────────────────
  function start() {
    genre = (function pick() {
      const avail = genres.filter(g => !played.includes(g));
      return avail.length ? avail[Math.random() * avail.length | 0] : null;
    })();
    if (!genre) { showImpressive(); return; }

    played.push(genre);
    pool = shuffle(movies.filter(m => m.genre === genre));
    poolIdx = 2;
    round = 1;
    active = true;
    transitioning = false;

    genreEl.textContent = fmtGenre(genre);
    roundEl.textContent = roundText(round);

    left = pool[0];
    right = pool[1];

    startEl.style.display = 'none';
    winEl.classList.remove('active'); winEl.style.display = 'none';
    impEl.classList.remove('active'); impEl.style.display = 'none';
    arenaEl.classList.add('active');
    restartEl.style.display = 'block';

    cleanCard(cardL); cleanCard(cardR);
    renderCard(cardL, left, 'left');
    renderCard(cardR, right, 'right');
    preloadUpcoming();
  }

  function pick(side) {
    if (!active || transitioning) return;
    transitioning = true;

    const winCard = side === 'left' ? cardL : cardR;
    const loseCard = side === 'left' ? cardR : cardL;
    const loseSide = side === 'left' ? 'right' : 'left';

    winCard.classList.add('winner-pulse');
    loseCard.classList.add(loseSide === 'left' ? 'slide-out-left' : 'slide-out-right');

    if (round >= ROUNDS) {
      active = false;
      const winner = side === 'left' ? left : right;
      setTimeout(() => showWinner(winner), 400);
      return;
    }

    setTimeout(() => {
      round++;
      roundEl.textContent = roundText(round);

      const next = pool[poolIdx++];
      cleanCard(winCard);

      if (side === 'left') {
        right = next;
        cleanCard(cardR);
        renderCard(cardR, right, 'right');
        requestAnimationFrame(() => {
          cardR.classList.add('slide-in-right');
          setTimeout(() => { cleanCard(cardR); transitioning = false; }, 380);
        });
      } else {
        left = next;
        cleanCard(cardL);
        renderCard(cardL, left, 'left');
        requestAnimationFrame(() => {
          cardL.classList.add('slide-in-left');
          setTimeout(() => { cleanCard(cardL); transitioning = false; }, 380);
        });
      }

      preloadUpcoming();
    }, 370);
  }

  function showWinner(movie) {
    arenaEl.classList.remove('active');
    winEl.style.display = 'block';
    requestAnimationFrame(() => winEl.classList.add('active'));

    winEl.querySelector('.sr-winner-trophy').textContent = '\uD83C\uDFC6';
    renderCard(winEl.querySelector('.sr-winner-card'), movie);
    winEl.querySelector('.sr-imdb-cta').href = 'https://www.imdb.com/title/' + movie.id + '/';

    const badge = winEl.querySelector('.sr-badge');
    const rec = winEl.querySelector('.sr-recommendation');

    if (movie.rajatApproved) {
      badge.className = 'sr-badge approved';
      badge.textContent = 'Rajat approves \uD83D\uDC4A';
      rec.style.display = 'none';
    } else {
      badge.className = 'sr-badge disagree';
      badge.textContent = 'Rajat respectfully disagrees';
      const approved = movies.filter(m => m.genre === genre && m.rajatApproved);
      if (approved.length) {
        const pick = approved[Math.random() * approved.length | 0];
        rec.style.display = 'block';
        renderCard(rec.querySelector('.sr-rec-card'), pick);
      } else {
        rec.style.display = 'none';
      }
    }

    fireConfetti({ origin: { y: 0.6 }, zIndex: 9999, particleCount: movie.rajatApproved ? 100 : 40, spread: 70 });

    transitioning = false;
  }

  function showImpressive() {
    startEl.style.display = 'none';
    arenaEl.classList.remove('active');
    winEl.classList.remove('active'); winEl.style.display = 'none';
    impEl.style.display = 'block';
    requestAnimationFrame(() => impEl.classList.add('active'));
    fireConfetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, zIndex: 9999 });
  }

  function restart() {
    active = false;
    transitioning = false;
    cleanCard(cardL); cleanCard(cardR);
    start();
  }

  // ─── Events ────────────────────────────────────────────
  playEl?.addEventListener('click', start);
  restartEl?.addEventListener('click', restart);

  cardL?.addEventListener('click', e => { if (!e.target.closest('.sr-imdb-link')) pick('left'); });
  cardR?.addEventListener('click', e => { if (!e.target.closest('.sr-imdb-link')) pick('right'); });

  // Mobile swipe
  let tx = 0, tc = null;
  function ts(e, c) { tx = e.touches[0].clientX; tc = c; }
  function te(e) {
    if (!tc || !active) return;
    const d = e.changedTouches[0].clientX - tx;
    if (tc === cardL && d < -60) pick('right');
    else if (tc === cardR && d > 60) pick('left');
    tc = null;
  }
  cardL?.addEventListener('touchstart', e => ts(e, cardL), { passive: true });
  cardL?.addEventListener('touchend', te, { passive: true });
  cardR?.addEventListener('touchstart', e => ts(e, cardR), { passive: true });
  cardR?.addEventListener('touchend', te, { passive: true });

  // Instagram deep link (mobile)
  const ig = root.querySelector('.sr-instagram-cta');
  if (ig && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    ig.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = 'instagram://user?username=gragtajar';
      setTimeout(() => window.open(ig.href, '_blank'), 1500);
    });
  }
})();
