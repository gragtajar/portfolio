/* ============================================
   RAJAT GARG — PORTFOLIO JS
   Starfield · Crawl · Figma Cursor · Token Resolve · Scroll Animations
   ============================================ */

(function () {
  'use strict';

  // ─── Starfield ─────────────────────────────────────────
  const starfield = document.getElementById('starfield');
  if (starfield) {
    const ctx = starfield.getContext('2d');
    let stars = [];
    let animId;
    const isMobile = window.innerWidth < 769;
    const STAR_COUNT = isMobile ? 50 : 160;

    function resizeCanvas() {
      starfield.width = window.innerWidth;
      starfield.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * starfield.width,
          y: Math.random() * starfield.height,
          r: Math.random() * 1.4 + 0.3,
          dx: (Math.random() - 0.5) * 0.15,
          dy: (Math.random() - 0.5) * 0.1,
          alpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawStars(time) {
      ctx.clearRect(0, 0, starfield.width, starfield.height);
      for (const s of stars) {
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0) s.x = starfield.width;
        if (s.x > starfield.width) s.x = 0;
        if (s.y < 0) s.y = starfield.height;
        if (s.y > starfield.height) s.y = 0;
        const flicker = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * flicker})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    createStars();
    drawStars(0);

    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
    });
  }

  // ─── Intro removed — will be re-added from spec ────────

  // ─── Screening Room Banner ─────────────────────────────
  const srBanner = document.getElementById('sr-banner');
  const srBannerClose = document.getElementById('sr-banner-close');
  if (srBanner) {
    document.body.classList.add('has-banner');
    if (srBannerClose) {
      srBannerClose.addEventListener('click', () => {
        srBanner.classList.add('hidden');
        document.body.classList.remove('has-banner');
      });
    }
    // Close banner when user scrolls to or clicks "Play now"
    const bannerLink = srBanner.querySelector('.sr-banner-link');
    if (bannerLink) {
      bannerLink.addEventListener('click', () => {
        setTimeout(() => {
          srBanner.classList.add('hidden');
          document.body.classList.remove('has-banner');
        }, 300);
      });
    }
  }

  // ─── Token-Resolve Animation ───────────────────────────
  function initTokenResolve() {
    const elements = document.querySelectorAll('.token-resolve');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateTokens(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    elements.forEach((el) => {
      const text = el.textContent;
      el.textContent = '';
      el.dataset.fullText = text;
      observer.observe(el);
    });
  }

  function animateTokens(el) {
    const text = el.dataset.fullText;
    const chars = text.split('');
    el.innerHTML = '';
    chars.forEach((char, i) => {
      // Use a real (breaking) space for spaces so the text wraps normally on
      // mobile. A non-breaking space here was forcing the line to overflow.
      if (char === ' ') {
        el.appendChild(document.createTextNode(' '));
        return;
      }
      const span = document.createElement('span');
      span.classList.add('token');
      span.textContent = char;
      span.style.animationDelay = `${i * 30}ms`;
      el.appendChild(span);
    });
  }

  initTokenResolve();

  // ─── Figma Cursor (Desktop Only) ──────────────────────
  if (window.innerWidth >= 769) {
    const cursor = document.createElement('div');
    cursor.classList.add('figma-cursor');
    cursor.innerHTML = `
      <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
        <path d="M1 1L7 25L10.5 16L19 13L1 1Z" fill="#7B61FF" stroke="#fff" stroke-width="1.2"/>
      </svg>
      <div class="cursor-label"><span class="cursor-label-text">Guest</span></div>
    `;
    document.body.appendChild(cursor);

    const labelEl = cursor.querySelector('.cursor-label-text');
    let cursorName = 'Guest';
    let isEditing = false;

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
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
  }

  // ─── Scroll Animations ─────────────────────────────────
  function initScrollAnimations() {
    const animatedEls = document.querySelectorAll('[data-animate]');
    if (!animatedEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animatedEls.forEach((el) => observer.observe(el));
  }

  initScrollAnimations();

  // ─── Header Scroll State ───────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ─── Mobile Nav Toggle ─────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = mobileNav?.querySelector('.close-btn');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => mobileNav.classList.add('open'));
    closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // ─── FAQ Accordion (single item open at a time) ────────
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      // Close all items first
      document.querySelectorAll('.faq-item.open').forEach((i) => {
        if (i !== item) i.classList.remove('open');
      });
      // Toggle the clicked item
      item.classList.toggle('open', !wasOpen);
    });
  });

  // ─── Page Transitions (Fade Through Black) ────────────
  const transitionEl = document.querySelector('.page-transition');
  if (transitionEl) {
    document.querySelectorAll('a[data-transition]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        transitionEl.classList.add('active');
        setTimeout(() => {
          window.location.href = href;
        }, 350);
      });
    });

    // Fade in on page load
    window.addEventListener('pageshow', () => {
      if (transitionEl.classList.contains('active')) {
        transitionEl.classList.remove('active');
      }
    });
  }

  // ─── Side Role Modal ───────────────────────────────────
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.dataset.modal;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('open');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('open');
      }
    });
  });

  // ─── Footer Easter Egg ─────────────────────────────────
  const easterEggEl = document.querySelector('.footer-easter-egg');
  if (easterEggEl) {
    const messages = [
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
    easterEggEl.textContent = messages[Math.floor(Math.random() * messages.length)];
  }

  // ─── Case Study: Sticky Nav Active State ───────────────
  const csNavLinks = document.querySelectorAll('.cs-nav-links a');
  if (csNavLinks.length) {
    const sections = [];
    csNavLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) sections.push({ link, target });
    });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY + 140;
      let active = sections[0];
      for (const s of sections) {
        if (s.target.offsetTop <= scrollY) active = s;
      }
      csNavLinks.forEach((l) => l.classList.remove('active'));
      if (active) active.link.classList.add('active');
    });
  }

  // ─── Film Strip Touch Swipe (Mobile) ──────────────────
  const filmStrip = document.querySelector('.film-strip');
  if (filmStrip && 'ontouchstart' in window) {
    let startX, scrollStart;
    filmStrip.style.animationPlayState = 'running';

    filmStrip.addEventListener('touchstart', (e) => {
      filmStrip.style.animationPlayState = 'paused';
      startX = e.touches[0].clientX;
      scrollStart = filmStrip.parentElement.scrollLeft;
    });

    filmStrip.addEventListener('touchmove', (e) => {
      const diff = startX - e.touches[0].clientX;
      filmStrip.parentElement.scrollLeft = scrollStart + diff;
    });

    filmStrip.addEventListener('touchend', () => {
      setTimeout(() => {
        filmStrip.style.animationPlayState = 'running';
      }, 2000);
    });
  }

  // ─── Lottie Cheers: play once on load, replay on hover ─
  const cheersPlayer = document.getElementById('cheers-lottie');
  if (cheersPlayer) {
    const logoLink = cheersPlayer.closest('.site-logo');
    if (logoLink) {
      logoLink.addEventListener('mouseenter', () => {
        cheersPlayer.stop();
        cheersPlayer.play();
      });
    }
  }
})();
