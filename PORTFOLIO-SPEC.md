# Portfolio Website — Complete Spec

## Owner
Rajat Garg · Product Designer · B2B SaaS · rajatgarg1809@gmail.com

---

## PART 1: FINALIZED DECISIONS

---

### 1. Global Design Language

- **Theme:** Pure dark (#0a0a0a or similar near-black backgrounds)
- **Accent color:** Soft white/silver for links, highlights, hover states
- **Body font:** Geist (sans-serif)
- **Heading font:** [PENDING — Cormorant Garamond or Bebas Neue, see font-comparison.html]
- **Positioning:** B2B SaaS product designer. The entire site — tone, vocabulary, project framing — should resonate with senior design managers at B2B SaaS companies
- **Portfolio is hand-coded.** Not Framer, not Webflow. Mention this subtly in the footer

---

### 2. Star Wars Crawl Intro

- **Background:** Cosmos/starry animated background with subtle drifting particles
- **Animation:** Star Wars opening crawl style — text in 3D perspective tilt scrolling upward into the starfield
- **Duration:** 2–3 seconds max
- **Skip option:** Small "Skip Intro" link in bottom-right corner (Netflix-style nod)
- **Works on mobile too:** Keep 3D perspective tilt on mobile. Increase font size / reduce line count so text stays readable on 375px screens
- **Crawl text (draft, will be updated later):**
  - Line 1 (large): Rajat Garg
  - Line 2: Product Designer · B2B SaaS
  - Line 3: 6 years of turning complex workflows into business outcomes.
- **Post-animation behavior:** The crawl text settles/transitions into the hero section of the homepage. The intro IS the hero — no separate hero needed
- **Starry background after intro:** Persists throughout the homepage but heavily diminished — very faint ambient texture, almost like noise. On mobile, reduce particle count by 60–70% for performance/battery

---

### 3. Custom Figma Cursor (Desktop Only)

- **Appearance:** Resembles the Figma multiplayer cursor with a colored pointer and a name pill/label
- **Default label text:** "Guest"
- **Interaction:** Pressing the forward slash `/` key on keyboard makes the pill text editable (exactly like Figma's rename behavior). Viewer can type anything up to 10 characters. The custom name persists during the session
- **Mobile:** Remove entirely. No cursor, no `/` interaction, no touch equivalent. Desktop-only Easter egg

---

### 4. Homepage Sections (in order)

#### 4a. Top Bar / Navigation
- **Top-left:** "Rajat says 👋" (with an animated waving hello emoji) — links to homepage
- **Center nav (desktop):** Director's Cut, Character Arc, Craft, Interrogation, Gossip (anchor links to sections)
- **Top-right CTA:** "Make me an offer" (Godfather reference) — on click, opens a popover/dropdown with 3 options:
  1. "Email me" with subtle mail icon → opens mailto:rajatgarg1809@gmail.com
  2. "LinkedIn" with subtle LinkedIn icon → opens linkedin.com/in/gragtajar in new tab
  3. "Download resume" with subtle download icon → triggers PDF download
- Popover: clean, minimal, dark elevated card with subtle border. Appears on click (not hover). On mobile, same popover works as dropdown or bottom sheet
- **Mobile nav:** Hamburger menu with same section links + "Make me an offer" as a CTA

#### 4b. Star Wars Crawl Intro → Hero
- See section 2 above. Crawl becomes the hero

#### 4c. Director's Cut (Featured Work)
- Film quote divider before this section (see section 7 for quote system)
- **Project 1: Lenskart — Reduce Eye Test Wait Time at Stores**
  - Tags: Lenskart · iPad · 2023
  - Ribbon/badge: "With Impact"
  - Description: Led designs of iPad, mobile & TV apps for customers & staff that reduced eye test wait time by 38% in 1600+ Lenskart stores
  - Metric callout: Sales up by 2.7% in 3 weeks (Q2 2023)
  - Links to: lenskart-eye-test.html case study page
- **Project 2: dox2U — Upload, Verify and Tag Documents**
  - Tags: dox2U · Desktop Web · B2B SaaS · 2021
  - Badge: "Case study coming soon"
  - Description: Spearheaded the zero-to-one design of dox2U, a B2B SaaS document management system that helped people reduce dependency on paper documents
  - Launched beta and first-stable versions
  - Does NOT link to a case study page (no page exists yet)

#### 4d. Currently Working On
- **LambdaTest / TestMu AI** (joined Oct 6, 2025)
- Teaser section — enough to intrigue, not enough to break NDA
- Content: [PENDING — Rajat to provide problem space description, user impact, and approach summary]
- Visual treatment: Blurred or abstracted preview, or a stylized placeholder
- **Token-resolve animation:** Certain text in this section appears to "generate" or "resolve" token-by-token as user scrolls to it, like LLM output. Use sparingly — 1–2 moments, not the whole section
- Also use the resolve animation subtly in the crawl intro (e.g., the subtitle resolving token by token)

#### 4e. Side Roles (Other Work)
- **Project 1: Lenskart Product Data — Figma Plugin**
  - Independently designed and developed using Cursor
  - Batch-updates Figma layers with real product info: names, IDs, images (as fills)
  - Includes General Data tab for Indian names, phone numbers, store/customer addresses, staff IDs
  - Show in a modal/expandable on click (like current site)
- **Project 2: Flags Library SVG**
  - Figma community file
  - Links to: https://www.figma.com/community/file/1516171459035590514/flags-library-svg
- Only 2 projects for now. May add more later

#### 4f. Character Arc (About)
- Personal narrative: Product designer with 6+ years experience, mixes strategy with creativity, detail-oriented, collaborated with PMs/engineers/QA across healthcare, logistics, POS
- Career arc to highlight: Apporio (foundations) → dox2U (zero-to-one ownership) → Lenskart (scale and impact) → LambdaTest (AI frontier)
- MBTI: INFJ-T (with a popover/tooltip: "Personality type known for being thoughtful, idealistic, emotionally deep and driven by a strong sense of purpose")
- Industries worked across: healthcare, logistics, POS, B2B SaaS
- Location: Gurugram, India. Open to relocate anywhere
- **35mm Film Negative Reel:**
  - 4–5 personal photos displayed inside film strip frames (rectangular with sprocket holes, slight orange/brown film strip color)
  - Auto-scrolls horizontally with slow auto-drift mimicking a film reel being pulled through a projector
  - On mobile: swipeable horizontal strip (auto-drift + manual swipe)
  - Photos: [PENDING — Rajat to provide 4–5 photos: personal life, travel, office, teams]
  - Use placeholder images for initial build

#### 4g. Experience
- **Structure:** [PENDING — Rajat is thinking of creative ways to present this]
- **Roles to include (3 roles, WordPress Developer role dropped):**
  1. LambdaTest / TestMu AI — Product Designer (Oct 2025 – Present)
  2. Lenskart — Product Designer (Sep 2022 – Sep 2025)
  3. dox2U — Product Designer (Jun 2020 – Aug 2022)
  4. Apporio Infolabs — UI/UX Designer (Mar 2019 – May 2020)
- Summary: Led design at fast-growing companies, driving features that boosted conversions and user delight

#### 4h. Craft (Skills)
- Reframed for B2B SaaS positioning. 6 skills, each with a Nintendo-style pixel-art icon (subtle animation):
  1. UX Research & Empathy — Deeply understanding user needs, pain points to translate insights into solutions that solve real problems and align with business goals
  2. Complex Interface Design (renamed from "Digital Design") — Crafting visually appealing and user-friendly interfaces for complex workflows, dashboards, and data-heavy products
  3. Design System & Tokens — Maintaining scalable design systems and managing tokens for consistent, efficient UI development
  4. Design Tooling & Automation (renamed from "Figma Expert") — Building plugins, automating workflows, and leveraging Figma as the most efficient platform from research to dev-handoff
  5. Documentation & Dev-Handoff — Delivering clear, organized specs and prototypes that ensure smooth collaboration with engineering
  6. UX Audits & Testing — Running structured audits and tests to validate design effectiveness and continuously improve UX
- **Pixel icons:** Nintendo 8-bit style, one per skill, with subtle looping animation (e.g., gentle bob, slight glow pulse, or frame-by-frame pixel animation)
- Icons appear ONLY in Craft section, not as section markers elsewhere

#### 4i. Screening Room (Movie Game)
- See separate spec: `SCREENING-ROOM-SPEC.md`
- Interactive "This or That" movie bracket game
- 15 genres, 50 movies each, 20 rounds per genre
- Has its own distinct UI flavor — CSS noise overlay, film grain, warmer dark tones (#111 / #0d0d0d)
- Physical movie poster cards, subtle sounds, confetti on win
- Section placement: [PENDING — Rajat to decide position relative to other sections]
- Detailed spec covers: game mechanics, interactions, data architecture, API handling, mobile behavior, edge cases

#### 4j. Gossip (Testimonials)
- Styled as film critic quotes — short, punchy, italic text with reviewer name and "publication" (their title/company) underneath. Like blurbs on a movie poster
- **Testimonial 1:**
  - Keshav Goyal, Co-founder & CEO, Shipmozo
  - Key quote about bringing design thinking to client projects, methodical approach
  - Link to LinkedIn recommendations
- **Testimonial 2:**
  - Vikash Marwal, VP Engineering, dox2U
  - Key quote about work going above and beyond expectations, incredible job on dox2U, asset to any team
  - Link to LinkedIn recommendations
- [PENDING — Rajat working on getting recommendations from Lenskart colleagues]

#### 4k. Interrogation (FAQs)
- Accordion/expandable format. Questions:
  1. "Are you using AI tools in your design process?" → "Yes — Claude, Cursor, and Lovable. I also design AI-native products at LambdaTest, so AI isn't just in my toolkit, it's in my problem space."
  2. "How come design after B.Tech?" → "Started off as a WordPress dev, but design stole my heart (and brain). Never looked back."
  3. "Do you use any social media for designers?" → "Not really — just LinkedIn for now."
  4. "Have you created anything using vibe coding tools?" → [PENDING — Rajat to provide answer. Should reference Figma plugin built with Cursor, this portfolio site built with Claude Code, and any other vibe-coded projects]
  5. "Do you code?" → "Enough to build my own Figma plugins, prototype ideas, and have informed conversations with engineers. Not enough to steal their jobs."

#### 4l. Footer
- **Style:** "Post-Credits Scene" (Direction 2)
- A small hidden interaction or Easter egg — a one-liner that changes on each visit. Existing splash messages can be repurposed here: "I am the one who knocks and designs," "May the Force be with you," "Bazinga!" etc.
- **Functional links:** Email (rajatgarg1809@gmail.com), LinkedIn (linkedin.com/in/gragtajar), Download Resume (PDF)
- Resume: Downloadable PDF link (opens download, not a new page)
- Footer note: "Designed & developed with ♥ by Rajat Garg" and subtle note "This is not a Framer or Webflow template"
- [PENDING — Rajat still brainstorming footer ideas, may evolve beyond direction 2]

---

### 5. Film Quote Dividers

- Placed between major homepage sections as transitional moments
- Single quote line, styled as a blockquote with subtle left border or em-dash styling
- Quote visible by default. On hover (desktop), the film title and year fades in beneath
- Languages: English, Hindi, and Korean only
- Themes should match what comes next (work = craft/dedication, character arc = introspection, etc.)
- Quote selection informed by Rajat's taste: Star Wars, Godfather series, Ghibli, The Usual Suspects, Sicilian/Italian mafia films, Wolf of Wall Street, military films, murder mystery films
- Curate quotes that avoid overused obvious lines — dig for the personal, resonant ones

---

### 6. Page Transitions

- **Homepage → Case Study:** Fade through black. Screen fades to black (~0.3s), case study fades in (~0.3s). Clean, cinematic, reliable on all devices
- **Case Study → Homepage:** Standard navigation via logo click in header. Same fade-through-black transition
- No horizontal wipes, no zoom morphs

---

### 7. Mobile Behavior Summary

| Feature | Mobile Treatment |
|---|---|
| Star Wars crawl | Keep 3D perspective tilt. Larger font, fewer lines for readability |
| Starry background | Reduce particle count by 60–70% |
| Figma cursor | Remove entirely |
| `/` key interaction | Remove entirely |
| Film strip (35mm) | Auto-drift + swipeable horizontal scroll |
| Pixel-art icons | Scale down naturally, no changes needed |
| Token-resolve animation | Works as-is (CSS/JS, viewport-independent) |
| Film quote dividers | Same as desktop (just text) |
| Page transitions | Fade through black (same as desktop) |
| Accordion FAQs | Standard touch accordion behavior |

---

### 8. Lenskart Case Study Page

#### 8a. Design Language
- **Tone:** Serious document feel, clean editorial article style (like Linear's blog posts or Stripe's annual letters)
- **Typography:** Same fonts as homepage (Geist body + chosen heading font)
- **Theme:** Pure dark, consistent with homepage
- **White space:** Tasteful, generous. Let content breathe
- **No cinematic personality elements** — no film quotes, no pixel icons, no starry background. This page is pure substance

#### 8b. Structure: S.T.A.R. + RISE Hybrid Framework
- **Situation (S.T.A.R.):** Business context, problem at stores (34-min wait, no visibility, staff chaos during rush hours)
- **Task (S.T.A.R.):** What Rajat owned — led design of iPad, mobile & TV apps across 3 user types
- **Action (S.T.A.R.):** Research (store visits, CCTV analysis, benchmarking at McD/KFC/airports, affinity mapping), design (wireframe explorations, design system updates, UI iterations), key decisions (visit purpose before phone number, customer profiling, prescription automation)
  - **Superation (RISE)** woven into Action: Challenges overcome, pushback on decisions, competing solutions evaluated, trade-offs made
- **Result (S.T.A.R.):** Hard metrics — 38% wait time reduction, 2.7% sales conversion increase, 0.25 rating increase, 72.34% tests under 10 mins, current 8.16 min average
- **Evolution (RISE):** Reflections, what would be done differently, what came next

#### 8c. Case Study Title
- **Primary:** "From 34 Minutes to 8: Redesigning Lenskart's In-Store Eye Test Experience"
- (4 alternate titles available for A/B consideration)

#### 8d. Content to Include
- Read time indicator (12 mins)
- Sticky navigation bar (About, User Flow, Impact, Research, Wireframes & UI, Decisions)
- **About Project:** Problems at store (customer + staff), impact results, users (customers, optometrists, sales associates), optometrist explainer with photo, timelines
- **User Flow:** End-to-end flow diagram (customer walk-in → token → eye test → prescription automation → results)
- **Impact:** Metrics with graphs, insight boxes explaining how token system led to sales conversion, customer vs business benefit callout, Store ATV: ₹2,040
- **Why to Design:** Major research insights (sticky notes), user call-outs including Hindi quote ("Pata nahi kitna time aur lagega" with translation)
- **Research:**
  - UX Audit of old flows (3 heuristic principles, pain points as sticky notes)
  - Benchmarking at Lenskart stores (store visits, impromptu interviews, CCTV footage via Tango AI) with observations (positive + things to avoid)
  - Benchmarking at other brands (McDonald's kiosk, KFC tokens, airport flight status displays) with observations
  - Affinity mapping and feature matrix creation with PM
  - Design system updates (Title XL, xl Button, lg Checkbox/Radio, Modal popup)
- **Wireframe Explorations:**
  1. Purpose of Visit Screen — 4 wireframe options explored, identified elements, screen divisions, final mockup, snapshot from store
  2. Token Screen — inspiration from physical receipts, identified elements, final mockup (animated), snapshot from store
  3. Customer List for Eye Test — old version issues, identified elements, wireframe, final mockup (grid layout with "Next Customer" highlighted)
  4. Automatic Prescription Retrieval — evolution from Old Version → v1.0 → v2.0 → Final (4-digit code mapping). Prescription entry went from 5–7 mins to 10–15 seconds
- **Important Decisions:**
  1. Get visit purpose before mobile number (clear intent builds trust)
  2. Customer profile selection (primary & secondary profiles — Rajat's original suggestion)
  3. Prescription syncing desktop app (patent pending) — Wi-Fi adapters, Windows desktop app designed by Rajat, developed in-house
- **Closing:** "Let's Talk" minimal CTA — name, one-liner, email, LinkedIn. No warm personal note, just clean and direct

#### 8e. Images for Case Study
- All images from current case study to be reused (already uploaded):
  - Hero image, user flow diagram, graphs (wait time P90, Mumbai Sat weekly), store photos, CCTV screenshot, McDonald's kiosk, KFC tokens, airport display, affinity mapping whiteboard, feature matrix, wireframe explorations, mockups, store snapshots, AR slip, prescription desktop app, Wi-Fi adapters, optometrist photo
- Case study images should render well on dark background (may need subtle borders or container cards)

---

### 9. Technical Notes

- **Hosting:** Direct deployment to rajatg.in (no staging)
- **Framework:** Static HTML/CSS/JS (no React/Next.js unless needed for specific interactions)
- **Animations:** AOS (already in use) or GSAP for scroll-triggered animations, CSS keyframes for pixel icon animations, custom JS for Star Wars crawl and token-resolve effect
- **Responsive:** Mobile-first, graceful degradation as specified in section 7
- **Performance:** Lazy-load images, optimize starry background particle count on mobile, keep total page weight reasonable
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## PART 2: PENDING ON RAJAT

| # | Decision | Context | Priority |
|---|---|---|---|
| 1 | **Choose heading font** | Cormorant Garamond or Bebas Neue — see font-comparison.html in your folder | 🔴 Blocks build |
| 2 | **LambdaTest/TestMu AI teaser copy** | Provide 2–3 sentences: problem space, user impact, your approach. For the "Currently Working On" section | 🔴 Blocks build |
| 3 | **Experience section format** | You're thinking of creative ways to present it. Current options discussed: filmography style, timeline, or table | 🔴 Blocks build |
| 4 | **"Vibe coding" FAQ answer** | Write the answer for "Have you created anything using vibe coding tools?" — reference Figma plugin (Cursor), this portfolio (Claude Code), others | 🟡 Can use placeholder |
| 5 | **Personal photos for film strip** | 4–5 photos: personal life, travel, office, teams. Placeholder used until provided | 🟡 Can use placeholder |
| 6 | **Profile photo** | For Character Arc section. Placeholder until provided | 🟡 Can use placeholder |
| 7 | **Footer evolution** | You're still brainstorming beyond Direction 2 (post-credits Easter egg). Current spec is workable but may change | 🟢 Current spec works |
| 8 | **Lenskart testimonial** | Working on getting recommendations from Lenskart colleagues to add to Gossip section | 🟢 Can launch without |
| 9 | **Resume PDF** | Will update to match portfolio story once site is built. Use existing PDF link for now | 🟢 Can launch without |
| 10 | **Additional side projects** | You mentioned my suggestions weren't at your level — thinking of better ones. Section has space for 2 currently | 🟢 Current 2 work |
| 11 | **Film quotes curation** | I'll draft these, but you'll want to approve/swap them since they're deeply personal. Will provide options when building | 🟡 I'll draft, you approve |
| 12 | **Mark rajatApproved movies** | Review the compiled movies.json (750 entries) and mark which movies you approve for the Screening Room game | 🟡 Game works without, but loses personality |
| 13 | **Screening Room section placement** | Decide where Screening Room sits in the homepage section order | 🟡 Can use suggested default |
| 14 | **Confirm Instagram @gragtajar is public** | The "Impressive" end state in Screening Room links to your Instagram | 🟢 Can launch without |

---

## Reference: All Spec Documents

| File | Contents |
|---|---|
| `PORTFOLIO-SPEC.md` | This file — complete homepage + case study spec |
| `SCREENING-ROOM-SPEC.md` | Detailed Screening Room movie game spec |
| `font-comparison.html` | Interactive font comparison (Cormorant Garamond vs Bebas Neue) |

---

*Spec version: 2.0 · Last updated: April 16, 2026*
