# rajatg.in — Production Readiness Checklist

**Source:** Adapted from learncivicsense.in Production Readiness Spec v1 + v2 Addendum.
**Context:** This is a static HTML/CSS/JS portfolio site. No build system (no Astro, no bundler). No backend. No database. Deployed via GitHub Actions FTP to cPanel. Solo developer using Claude Code.
**Principle:** Quality over speed. Every item below is included because it solves a real problem for THIS site, not because it existed in the source spec.

---

## What does NOT apply (and why)

These items from the source specs were evaluated and deliberately excluded. Documenting this prevents wasted effort.

| Source Item | Why it doesn't apply to rajatg.in |
|---|---|
| TypeScript strict mode (v1 §3.1) | No TypeScript in the project. Pure vanilla JS. The overhead of adding TS to a static portfolio with 3 JS files is not justified. |
| ESLint + expanded plugins (v1 §3.2, v2 T2) | No build pipeline to integrate linting. The codebase is 3 JS files (~900 lines total). Manual code review is sufficient at this scale. If the codebase grows past 5 files or 2000 lines, revisit. |
| Prettier (v1 §3.3) | Same reasoning. Format manually or use editor settings. |
| Husky + lint-staged + commitlint (v1 §3.4, §3.5) | Over-engineering for a solo-developer static site. Git discipline is manual. |
| Stylelint (v1 §3.6, v2 T3) | 3 CSS files. Manual review is faster than tooling setup. |
| CSS three-tier token refactor (v2 T3) | The site already uses CSS custom properties in `:root`. A three-tier primitive/semantic/theme split adds complexity without benefit — the site has ONE theme (pure dark). No theme switching exists. |
| Unit tests / Vitest (v1 §4.2) | No testable logic units. The JS is DOM manipulation, animations, and a game. These are better tested visually and via smoke tests, not unit tests. |
| Playwright E2E tests (v1 §4.3) | Valuable in theory, but the overhead of maintaining a test suite for a portfolio site that changes infrequently is not justified at launch. Revisit if the site gains dynamic features beyond the Screening Room. |
| Visual regression tests (v1 §4.6) | Same reasoning. The site is hand-reviewed after each deploy. |
| Lighthouse CI in GitHub Actions (v1 §5.1) | The deploy goes via FTP to cPanel — no preview deployments exist. Run Lighthouse manually before each major push instead. |
| Bundle size budgets / size-limit (v1 §5.2) | No bundler. Files are served as-is. Monitor file sizes manually. |
| Sentry error monitoring (v1 §5.4, v2 T1) | The site has no backend and minimal client-side JS. Console errors are caught during manual testing. The Screening Room game has graceful fallbacks built in. Sentry's value doesn't justify the 5KB+ SDK for a portfolio. |
| Logger module (v2 T1) | No Sentry, no build system, no TypeScript. Console.log/warn/error is appropriate for 3 JS files. |
| Custom error types + Zod (v2 T5) | No TypeScript, no build-time validation, no external data parsing beyond a single movies.json that's pre-validated. |
| Resource cleanup / AbortController patterns (v2 T6) | The site doesn't have SPAs with persistent state, no fetch-heavy islands, no cleanup lifecycle. The Screening Room game manages its own state in-memory and resets on page reload. |
| Dependency Injection (v2 T9) | No TypeScript classes, no testable service layer. Over-engineering. |
| Image pipeline with AVIF/WebP (v2 T10) | No build system to transform images. Images are served as-is (PNG/JPEG/WebP). Manual optimization is appropriate. |
| Preview deployments (v1 §6.3) | FTP deploy to cPanel has no preview environment. Test locally. |
| Atomic deploys + rollback (v1 §6.4) | FTP deploys are not atomic. Rollback = re-push the previous commit. Document this, don't build tooling around it. |
| Branch protection (v1 §6.2) | Solo developer pushing to main. The overhead of PR-based workflow for one person is not justified. |
| ADRs (v1 §8) | Good practice but overhead. Key decisions are documented in PORTFOLIO-SPEC.md and SCREENING-ROOM-SPEC.md already. |
| CONTRIBUTING.md (v1 §9.3) | Solo project. No contributors expected. |
| Privacy policy page (v1 §10.3) | Portfolio site with no data collection, no cookies, no analytics (yet). Not legally required. |
| RSS (v1 §11.5) | Not a content site with regular updates. |
| Structured data / JSON-LD (v1 §11.4) | Could be beneficial for the case study page but low priority. Can add later. |
| Multilingual scaffolding (v1 §13) | English-only site. |
| knip dead-code detection (v2 T4.3) | 3 JS files. Unused code is visible by reading the files. |
| CSP nonce migration (v2 T7.2) | The site uses inline scripts and styles. Nonce migration requires a server-side middleware (cPanel doesn't support this easily). Accept `unsafe-inline` and document the trade-off. |
| View transitions / ClientRouter (v2 T8.2) | Not an Astro site. Page transitions are already implemented with a custom CSS fade-through-black overlay. |
| Prefetch (v2 T8.3) | Only 2 pages (homepage + case study). The case study link on the homepage could benefit from `<link rel="prefetch">` but it's a micro-optimization. |

---

## What DOES apply — organized by priority

### Phase 1: Before launch (blocks go-live)

---

#### P1.1 — Performance: Image optimization

**Why:** The site will have case study images (screenshots, mockups, graphs, store photos), movie posters (fetched from TMDB), and personal photos. Unoptimized images are the #1 performance killer for portfolio sites. Hiring managers on slow connections or mobile will bounce if images load slowly.

**Tasks:**

- [ ] **P1.1a** Audit all placeholder images in the codebase and list every image that needs to be added before launch
- [ ] **P1.1b** For each case study image: compress to WebP format, set maximum width to 1200px for full-width images, 800px for inline images
- [ ] **P1.1c** Add `width` and `height` attributes to every `<img>` tag to prevent layout shift (CLS)
- [ ] **P1.1d** Add `loading="lazy"` to all images below the fold. Hero images and first-visible images should NOT be lazy-loaded
- [ ] **P1.1e** Add `decoding="async"` to all non-critical images
- [ ] **P1.1f** For the film strip photos: compress to max 400px width (they're displayed small), WebP format
- [ ] **P1.1g** Movie posters from TMDB: already using `w342` size which is appropriate. Verify the fallback text cards render correctly when TMDB is down

---

#### P1.2 — Performance: Font loading strategy

**Why:** The site loads Bebas Neue and Geist from Google Fonts. These are render-blocking by default. A FOUT (flash of unstyled text) on a portfolio site looks unprofessional. But blocking renders for fonts is worse — it creates a blank white screen.

**Tasks:**

- [ ] **P1.2a** The current `<link rel="preload" as="style">` pattern is correct. Verify it actually works by checking the Network tab waterfall — the font CSS should start loading before the HTML is fully parsed
- [ ] **P1.2b** Add `font-display: swap` to the Google Fonts URL if not already included (check: `&display=swap` should be in the URL — it is currently present, verified)
- [ ] **P1.2c** Consider self-hosting Bebas Neue and Geist WOFF2 files to eliminate the Google Fonts dependency. This removes 2 DNS lookups + 2 connection setups + the render-blocking CSS file. Self-hosted fonts load from the same origin = faster. This is a meaningful optimization for a pure-dark site where font flash is very visible
- [ ] **P1.2d** If self-hosting: subset the fonts to Latin characters only (no Cyrillic, no extended Latin). Geist Regular (400), Medium (500), SemiBold (600). Bebas Neue Regular (400) only

---

#### P1.3 — SEO: Meta tags and Open Graph

**Why:** When a hiring manager shares your portfolio link on Slack, LinkedIn, or Twitter, the preview card is often the first impression. Missing or broken OG tags mean an ugly link with no preview image.

**Tasks:**

- [ ] **P1.3a** Homepage (`index.html`): verify `<meta name="description">` is present and compelling (currently: "Portfolio of Rajat Garg, a B2B SaaS Product Designer with 6+ years..." — this is good)
- [ ] **P1.3b** Homepage: add Open Graph tags: `og:title`, `og:description`, `og:image` (needs a dedicated OG image — 1200×630px, dark theme with your name and title), `og:url`, `og:type=website`
- [ ] **P1.3c** Homepage: add `<meta name="twitter:card" content="summary_large_image">` and `twitter:image`
- [ ] **P1.3d** Case study page (`lenskart-eye-test.html`): same OG tags but with case-study-specific title, description, and image
- [ ] **P1.3e** Add `<link rel="canonical" href="https://rajatg.in/">` to homepage and `<link rel="canonical" href="https://rajatg.in/lenskart-eye-test.html">` to case study page
- [ ] **P1.3f** Create the OG images (1200×630px) for both pages — dark background, clean typography, your name/title

---

#### P1.4 — SEO: Sitemap and robots.txt

**Why:** Google needs to discover and index your pages. A sitemap tells crawlers exactly what pages exist. Without it, discovery depends on following links, which is slower and less reliable.

**Tasks:**

- [ ] **P1.4a** Create `sitemap.xml` at the root with both pages listed, including `<lastmod>` dates
- [ ] **P1.4b** Create `robots.txt` allowing all crawlers and pointing to the sitemap
- [ ] **P1.4c** After deploy, submit the sitemap to Google Search Console

---

#### P1.5 — Security: HTTP headers

**Why:** Security headers protect visitors from XSS, clickjacking, and MIME-type sniffing attacks. They also affect your site's security rating (securityheaders.com), which technically-minded hiring managers sometimes check.

**Tasks:**

- [ ] **P1.5a** Check if cPanel supports `.htaccess` for setting headers (most cPanel Apache setups do)
- [ ] **P1.5b** Add these headers via `.htaccess`:
  - `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing
  - `X-Frame-Options: DENY` — prevents clickjacking via iframes
  - `Referrer-Policy: strict-origin-when-cross-origin` — controls what info is sent in the Referer header
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` — disables unused browser APIs
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` — forces HTTPS (only if SSL is confirmed working)
- [ ] **P1.5c** For CSP: use a permissive policy that allows the external resources the site actually uses (Google Fonts, TMDB images, Lottie player, canvas-confetti CDN). Don't block legitimate resources
- [ ] **P1.5d** Test all headers after deploy using `securityheaders.com`. Target: A grade minimum

---

#### P1.6 — Performance: Cache headers

**Why:** Without cache headers, every return visit re-downloads all CSS, JS, and images. This is wasteful and slow. CSS/JS files on a portfolio site rarely change — they should be cached aggressively.

**Tasks:**

- [ ] **P1.6a** Via `.htaccess`, set cache headers:
  - CSS files: `Cache-Control: public, max-age=2592000` (30 days) — these change infrequently
  - JS files: `Cache-Control: public, max-age=2592000` (30 days)
  - Images (PNG, JPG, WebP, SVG, ICO): `Cache-Control: public, max-age=31536000` (1 year) — images almost never change
  - Fonts (WOFF2): `Cache-Control: public, max-age=31536000, immutable` (1 year)
  - HTML files: `Cache-Control: public, max-age=300, must-revalidate` (5 minutes) — allows quick updates after deploy
  - JSON data files (movies.json): `Cache-Control: public, max-age=86400` (1 day)
- [ ] **P1.6b** After deploy, verify cache headers in DevTools Network tab for each file type

---

#### P1.7 — Accessibility: Core checks

**Why:** Accessibility matters for all users, including hiring managers using screen readers, keyboard-only navigation, or high-contrast modes. An inaccessible portfolio from a UX designer is a red flag.

**Tasks:**

- [ ] **P1.7a** Verify all images have meaningful `alt` text (currently many have empty `alt=""`)
- [ ] **P1.7b** Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text). The soft white/silver (#e8e8e8) on dark (#0a0a0a) is 17.5:1 — excellent. Check the muted colors (#666, #555) against the dark background — #666 on #0a0a0a is 4.2:1, which FAILS AA for body text. #999 on #0a0a0a is 7.0:1 — passes
- [ ] **P1.7c** Verify all interactive elements are keyboard-accessible: the FAQ accordion, the contact popover, the mobile nav, the Screening Room game buttons, modal open/close
- [ ] **P1.7d** Add `aria-label` or `aria-labelledby` to landmark regions: `<nav>`, `<main>`, `<footer>`, the Screening Room `<section>`
- [ ] **P1.7e** Verify the Screening Room game is playable via keyboard (Tab to select cards, Enter to confirm, etc.)
- [ ] **P1.7f** Add `prefers-reduced-motion` media query to disable: Star Wars crawl animation, starfield particles, film strip auto-scroll, card transition animations, confetti. Users who have set this OS preference should see static equivalents
- [ ] **P1.7g** Run a manual Lighthouse accessibility audit on both pages. Target: 95+ score

---

#### P1.8 — Performance: Render-blocking resources

**Why:** The homepage loads 3 CSS files, 3 JS files, a Lottie player, and a CDN confetti library. The order and loading strategy matters. Render-blocking resources delay First Contentful Paint.

**Tasks:**

- [ ] **P1.8a** Verify all JS files use `defer` attribute (currently they do — `intro.js`, `main.js`, `screening-room.js` all have `defer`)
- [ ] **P1.8b** The Lottie player (`dotlottie-player.mjs`) is loaded as `type="module"` which is non-blocking. Good. But verify it doesn't cause a layout shift when the emoji loads late — if it does, set a fixed `width`/`height` on the container (currently `28px` × `28px` — verify this is respected before the module loads)
- [ ] **P1.8c** The `canvas-confetti` CDN script is loaded with `defer`. It's only used in the Screening Room game. Consider moving it to a dynamic `import()` inside `screening-room.js` that loads only when the game's winner state is triggered — this removes it from the initial page load entirely
- [ ] **P1.8d** Consider inlining critical CSS (above-the-fold styles) into `<style>` in `<head>` and loading the full CSS files asynchronously. For a portfolio with a Star Wars crawl intro, the "above the fold" is just the intro overlay — that CSS is already in `intro.css`. If `intro.css` is small enough (<5KB), inline it

---

#### P1.9 — Favicon and Apple Touch Icon

**Why:** Missing favicons look unprofessional in browser tabs and bookmarks. Missing touch icons mean an ugly default when someone saves your site to their phone's home screen.

**Tasks:**

- [ ] **P1.9a** Verify `favicon.ico` exists and is the correct design (currently exists)
- [ ] **P1.9b** Add a `favicon.svg` for modern browsers (SVG favicons scale better and can adapt to dark/light mode)
- [ ] **P1.9c** Add `<link rel="apple-touch-icon" href="apple-touch-icon.png">` (180×180px PNG)
- [ ] **P1.9d** Consider adding a basic `manifest.webmanifest` for PWA-like behavior (allows "Add to Home Screen" with correct name and icon)

---

### Phase 2: First week post-launch (important but not blocking)

---

#### P2.1 — Analytics

**Why:** You need to know if anyone is visiting your portfolio, which pages they view, and where they come from (LinkedIn, direct, referral). Without this, you can't tell if your job applications are driving traffic.

**Tasks:**

- [ ] **P2.1a** Choose an analytics provider: Cloudflare Web Analytics (free, no cookies, GDPR-friendly) or Plausible (self-hosted, also cookie-free) or simple Google Analytics
- [ ] **P2.1b** Add the analytics beacon/script to both pages
- [ ] **P2.1c** Verify data is flowing by checking the dashboard after 24 hours

---

#### P2.2 — Uptime monitoring

**Why:** If your site goes down while a hiring manager is reviewing your portfolio, that's a missed opportunity you'll never know about.

**Tasks:**

- [ ] **P2.2a** Set up a free uptime monitor (BetterStack free tier, or UptimeRobot) for `https://rajatg.in/`
- [ ] **P2.2b** Configure email alerts on downtime
- [ ] **P2.2c** Optionally monitor `https://rajatg.in/lenskart-eye-test.html` as a second endpoint

---

#### P2.3 — Performance: Manual Lighthouse audit

**Why:** Lighthouse is the industry-standard performance audit. A senior design manager may run it on your portfolio out of curiosity. A low score undermines your credibility.

**Tasks:**

- [ ] **P2.3a** Run Lighthouse on homepage (desktop + mobile). Target: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+
- [ ] **P2.3b** Run Lighthouse on case study page (same targets)
- [ ] **P2.3c** Document the scores and fix any flagged issues
- [ ] **P2.3d** Re-run after fixes and save the reports

---

#### P2.4 — Link integrity

**Why:** Broken links on a portfolio are embarrassing. The LinkedIn link, resume download, IMDB links in the Screening Room, and Figma community link all need to work.

**Tasks:**

- [ ] **P2.4a** Manually verify every external link on both pages: LinkedIn profile, email mailto, resume PDF download, Figma community file, IMDB movie links (spot-check 5-10), Instagram profile
- [ ] **P2.4b** Verify the resume PDF download actually works (the current `href="#"` is a placeholder — this needs a real file path)
- [ ] **P2.4c** Verify all anchor links (section scrolling) work correctly on both desktop and mobile

---

#### P2.5 — Error handling in the Screening Room

**Why:** The game fetches `movies.json` at runtime and loads poster images from TMDB CDN. Both can fail. A broken game on your portfolio is worse than no game at all.

**Tasks:**

- [ ] **P2.5a** Test with `movies.json` returning a 404 — the game should hide gracefully, not show a broken UI
- [ ] **P2.5b** Test with TMDB CDN unreachable (block `image.tmdb.org` in DevTools) — poster fallback text cards should render
- [ ] **P2.5c** Test with slow network (DevTools throttle to Slow 3G) — verify the game is still usable, posters load eventually, and the UI doesn't flash broken states
- [ ] **P2.5d** Test the "all genres exhausted" state by manually modifying the genre count — verify the Instagram deep link works on mobile (try `instagram://user?username=gragtajar`)

---

#### P2.6 — Mobile-specific testing

**Why:** Hiring managers often do a first-pass review on their phone (in transit, at dinner, etc.). Mobile experience must be solid, not just "it works."

**Tasks:**

- [ ] **P2.6a** Test on a real iPhone (Safari) and a real Android phone (Chrome). Not just DevTools responsive mode
- [ ] **P2.6b** Verify the Star Wars crawl is readable on a 375px screen with 3D perspective
- [ ] **P2.6c** Verify the film strip swipe interaction works smoothly
- [ ] **P2.6d** Verify the Screening Room card swipe (left-card swipes left, right-card swipes right) works intuitively
- [ ] **P2.6e** Verify the mobile nav opens/closes correctly, and all anchor links scroll to the right section
- [ ] **P2.6f** Verify the contact popover works as a dropdown/bottom sheet on mobile
- [ ] **P2.6g** Verify no horizontal overflow on any section (common bug with wide images, code blocks, or the film strip)
- [ ] **P2.6h** Test the page transitions (homepage → case study → back) on mobile Safari and Chrome

---

### Phase 3: Post-launch hardening (when time permits)

---

#### P3.1 — Dependency security

**Why:** The site has npm dependencies (`@hackernoon/pixel-icon-library`, `canvas-confetti` from CDN). Even though they're dev dependencies and CDN scripts, keeping them updated prevents supply-chain attacks.

**Tasks:**

- [ ] **P3.1a** Run `npm audit` and fix any high/critical vulnerabilities
- [ ] **P3.1b** Verify the CDN scripts (canvas-confetti, dotlottie-player) use specific version pins, not `latest`
- [ ] **P3.1c** Periodically check if these CDN scripts have known vulnerabilities

---

#### P3.2 — Content freshness

**Why:** A portfolio with a "last updated 2025" footer in 2026 signals neglect.

**Tasks:**

- [ ] **P3.2a** Add a dynamic or semi-dynamic "last updated" indicator somewhere subtle (footer or meta)
- [ ] **P3.2b** Set a calendar reminder to review the portfolio quarterly: update experience dates, add new work, refresh the resume PDF

---

#### P3.3 — Structured data (JSON-LD)

**Why:** Helps search engines understand the case study as an "Article" and your homepage as a "ProfilePage." Improves search result appearance.

**Tasks:**

- [ ] **P3.3a** Add `Article` schema to the Lenskart case study page
- [ ] **P3.3b** Add `ProfilePage` or `Person` schema to the homepage
- [ ] **P3.3c** Validate with Google's Rich Results Test tool

---

#### P3.4 — Print stylesheet

**Why:** Some hiring managers print case studies for review in meetings. A print stylesheet that hides the navigation, starfield, game, and other interactive elements and presents content cleanly is a nice touch.

**Tasks:**

- [ ] **P3.4a** Create a `@media print` section in the CSS
- [ ] **P3.4b** Hide: header, starfield, film quotes, Screening Room, footer easter egg, mobile nav, page transition overlay
- [ ] **P3.4c** Show: all content in black text on white background, full URLs next to links

---

## Summary by priority

| Priority | Item count | Estimated effort |
|---|---|---|
| Phase 1 (blocks launch) | 9 areas, ~35 tasks | 4-6 hours of focused work |
| Phase 2 (first week post-launch) | 6 areas, ~20 tasks | 2-3 hours |
| Phase 3 (post-launch hardening) | 4 areas, ~10 tasks | 1-2 hours |

---

*Spec version: 1.0 · Adapted for rajatg.in · Last updated: June 4, 2026*
