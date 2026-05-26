# Screening Room — Movie Game Spec

## Overview

An interactive "This or That" movie bracket game embedded as a standalone section on the portfolio homepage. Two movie cards from a randomly selected genre are presented side by side. The user picks one, the loser is replaced with a new contender from the same genre, and this repeats for 20 rounds until a final winner emerges. The game reveals the portfolio owner's (Rajat Garg's) movie taste and gives visitors something genuinely fun and unique to interact with.

---

## Game Mechanics

### Core Loop

1. On first interaction (user clicks "Play" button), a genre is randomly selected from the pool of 15 genres
2. Two movie cards appear side by side, each showing: movie poster (medium real-world poster size, physical card feel), title, release year, and an IMDB link icon
3. User selects one movie (tap or swipe — see Interactions below)
4. The selected movie stays fixed on its current side (left stays left, right stays right)
5. The non-selected movie animates out and is replaced by a new random movie from the same genre
6. This repeats for 20 rounds per genre
7. After round 20, the final winner takes center stage with a celebration moment

### Round Counter

- Do NOT show "Round X of 20" or the max limit at any point
- Show only the current round number: "Round 1", "Round 7", "Round 14"
- At round 17: reveal "3 more to go"
- At round 18: "2 more"
- At round 19: "1 more — choose wisely"
- At round 20: final selection, then winner celebration

### Genre Selection

- Genre is randomly picked on game start
- The genre name is displayed at the top of the section in clean, minimal text (no decorative treatment — just clear typography)
- User CANNOT change the genre mid-session
- On restart, a new genre is randomly picked but it MUST NOT be the same as the previous genre
- If all 15 genres have been played through, show the "Impressive" end state (see below)

### Movie Pool Management

- Each genre has exactly 50 movies in the pool
- On genre start, the pool is shuffled randomly
- Movies are served sequentially from the shuffled pool — no repeats within a session
- The initial two cards use movies [0] and [1] from the shuffled pool
- Each subsequent round introduces the next movie from the pool
- After 20 rounds, only 21 unique movies have been shown (2 initial + 19 new challengers)

### Restart

- Restart button is always visible (top-right corner of the Screening Room section)
- No confirmation dialog — instant reset on click
- Restart picks a new random genre (different from the previous one)
- Round counter resets to 1
- Movie pool for the new genre is freshly shuffled

### Game State Persistence

- Game state persists in JavaScript memory during the session
- Scrolling away from the Screening Room and back preserves: current genre, current round, current champion, current challenger, pool position
- Game state resets ONLY on page reload / refresh
- Do NOT use localStorage or sessionStorage — in-memory JS variables only

---

## End States

### Genre Winner (after round 20)

- The winning movie card moves to center stage (centered in the section)
- Celebration: confetti burst animation that can overflow into adjacent sections for dramatic effect
- Trophy or crown icon above/beside the winning card
- Show the winning movie's poster (larger), title, year
- CTA button: "Watch on IMDB →" linking to `https://www.imdb.com/title/{imdbId}/`

**If the movie is Rajat-approved:**
- Show a badge/tag: "Rajat approves 👊"
- Confetti + trophy celebration as described

**If the movie is NOT Rajat-approved:**
- Show a badge/tag: "Rajat respectfully disagrees"
- Still show confetti (lighter) for the user's achievement
- Below the winner, show a recommendation: "Try this instead" with a randomly selected Rajat-approved movie from the SAME genre — show its poster, title, year, and IMDB link

### All Genres Exhausted ("Impressive" State)

- Triggered when user has played through all 15 genres
- Ultra-high celebration moment — full-section takeover, large confetti burst, dramatic animation
- Text: "You've watched the entire reel" (or similar cinematic line)
- Personal CTA: "Rajat thinks you have impeccable taste. Let's discuss over chai & movies."
- Link to Instagram: @gragtajar
  - On desktop: opens `https://www.instagram.com/gragtajar/` in new tab
  - On mobile: attempt to open Instagram app via deep link `instagram://user?username=gragtajar` — fall back to web URL if app is not installed
- This is the ONLY place on the entire site where Instagram is linked — it's an earned reward

---

## UI Design

### Section Flavor

- The Screening Room has a distinctly different visual flavor from the rest of the homepage
- Background: CSS noise overlay (no image file) with slightly warmer dark tones — use `#111` or `#0d0d0d` with a warm tint instead of the pure `#0a0a0a` used elsewhere
- Film grain feel achieved purely through CSS — subtle, not distracting
- The section should feel gamified but still tasteful and premium

### Layout — Desktop

```
┌─────────────────────────────────────────────────┐
│  Genre Name                          [Restart]  │
│                                                  │
│  Round 7                                        │
│                                                  │
│  ┌──────────┐       VS       ┌──────────┐      │
│  │          │                │          │      │
│  │  POSTER  │                │  POSTER  │      │
│  │          │                │          │      │
│  │          │                │          │      │
│  ├──────────┤                ├──────────┤      │
│  │ Title    │                │ Title    │      │
│  │ Year  ↗ │                │ Year  ↗ │      │
│  └──────────┘                └──────────┘      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Layout — Mobile

```
┌─────────────────────────┐
│ Genre Name    [Restart]  │
│ Round 7                  │
│                          │
│ ┌─────────┐ VS ┌─────────┐
│ │         │    │         │
│ │ POSTER  │    │ POSTER  │
│ │         │    │         │
│ ├─────────┤    ├─────────┤
│ │Title    │    │Title    │
│ │Year  ↗ │    │Year  ↗ │
│ └─────────┘    └─────────┘
│                          │
└─────────────────────────┘
```

- Cards stay side by side on mobile (horizontal layout)
- Each card gets roughly 45% screen width with a gap and VS in between

### Movie Cards

- Physical card feel: subtle drop shadow, very slight rounded corners (2-4px), faint border that catches light
- On hover (desktop): card lifts slightly with shadow expansion — like picking up a card off a table
- Poster fills most of the card (real-world medium-sized poster proportions — roughly 2:3 aspect ratio)
- Below the poster: title (in body font, medium weight), release year, small IMDB external link icon
- Do NOT show IMDB rating

### "VS" Element

- Clean and minimal — simple "VS" text in a subtle badge/circle between the two cards
- No retro effects, no gaming-style graphics — keep it typographic

### Start State

- Before the user clicks Play, show a resting state with a "Play" or "Start" button
- Optionally show two blurred/silhouetted placeholder cards to hint at the game
- Small tagline: "Pick your favorite, round by round" or similar

### Winner State — Center Stage

- Winning card animates to center of the section
- Card scales up slightly (1.1–1.2x)
- Trophy/crown icon above the card
- Confetti animation bursts from behind the card — can overflow into adjacent homepage sections
- "Rajat approves 👊" or "Rajat respectfully disagrees" badge below the card
- "Watch on IMDB →" CTA button
- If disapproved: "Try this instead" recommendation card appears below, smaller than the winner

---

## Interactions

### Desktop

- Click on a movie card to select it (primary interaction)
- Hover on a card to see the lift effect
- Click IMDB icon to open IMDB page in new tab

### Mobile

- **Tap** on a card to select it (primary interaction)
- **Swipe** to dismiss (secondary interaction):
  - Swipe LEFT on the LEFT card to remove it (card slides off-screen to the left)
  - Swipe RIGHT on the RIGHT card to remove it (card slides off-screen to the right)
  - The gesture is "pushing the card out of the device" in its respective direction
- Tap IMDB icon to open IMDB page

### Selection Animation

- Very light, very subtle
- Winner card: quick scale-up pulse (1.02x for 0.2s) to confirm choice
- Loser card: fades and slides out in its respective direction (0.3s)
- New card: slides in from the same side the loser exited (0.3s), slight fade-in

---

## Sound Design

- All sounds are very subtle, very light
- Respect the device's mute/silent state — do NOT play sounds if device is muted
- No sound on/off toggle button in the UI

### Sound Moments

| Moment | Sound | Notes |
|---|---|---|
| Movie removed (loser exits) | Soft whoosh / card-slide | Very brief, ~0.2s |
| New movie enters | Subtle pop / card-place | Very brief, ~0.2s |
| Genre winner crowned | Short triumphant chime | Plays with confetti, ~1s |
| Genre change (on restart) | Soft film-reel click / projector advance | ~0.3s |
| All genres exhausted | Extended celebratory sound | Bigger version of the winner chime |

---

## Data Architecture

### Single JSON File: `movies.json`

Located at the site root or an `/data/` directory. Contains all 750 movies.

```json
[
  {
    "id": "tt0068646",
    "tmdbId": 238,
    "title": "The Godfather",
    "year": 1972,
    "language": "en",
    "genre": "crime-mafia",
    "rajatApproved": false
  },
  {
    "id": "tt0482571",
    "tmdbId": 1018,
    "title": "The Prestige",
    "year": 2006,
    "language": "en",
    "genre": "thriller",
    "rajatApproved": false
  }
]
```

### Field Definitions

| Field | Type | Description |
|---|---|---|
| `id` | string | IMDB title ID (e.g., "tt0068646") |
| `tmdbId` | number | TMDB movie ID for poster fetching |
| `title` | string | Movie title in English (or transliterated for Hindi/Korean) |
| `year` | number | Release year |
| `language` | string | "en" (English), "hi" (Hindi), "ko" (Korean) |
| `genre` | string | Genre slug (see genre list below) |
| `rajatApproved` | boolean | `true` if Rajat has marked this as approved. Defaults to `false` — Rajat will review and update |

### Genre Slugs & Movie Language Distribution

| # | Genre | Slug | Language Split |
|---|---|---|---|
| 1 | Sci-Fi | `sci-fi` | 15 Hindi + 35 English |
| 2 | Crime / Mafia | `crime-mafia` | 15 Hindi + 35 English |
| 3 | Thriller | `thriller` | 15 Hindi + 35 English |
| 4 | Mystery / Whodunit | `mystery` | 15 Hindi + 35 English |
| 5 | War / Military | `war` | 15 Hindi + 35 English |
| 6 | Animation | `animation` | 15 Hindi + 35 English |
| 7 | Korean Cinema | `korean` | 50 Korean (English fallback if pool short) |
| 8 | Heist / Con | `heist` | 15 Hindi + 35 English |
| 9 | Courtroom / Legal | `courtroom` | 15 Hindi + 35 English |
| 10 | Espionage / Spy | `espionage` | 15 Hindi + 35 English |
| 11 | Psychological | `psychological` | 15 Hindi + 35 English |
| 12 | Epic / Historical | `epic` | 15 Hindi + 35 English |
| 13 | Dark Comedy | `dark-comedy` | 15 Hindi + 35 English |
| 14 | Survival | `survival` | 15 Hindi + 35 English |
| 15 | Noir / Neo-Noir | `noir` | 50 English (Hindi noir pool insufficient for quality) |

### Movie Selection Criteria

- Top-rated movies per IMDB within each genre
- Also include: cult classics, festival favorites, and critically acclaimed films that may have slightly lower IMDB scores (7.0+) but are genre-defining
- Hindi movies must be genuinely top-rated in their genre, not filler — quality over quantity
- Korean Cinema genre should showcase the depth of Korean filmmaking
- All 750 movies need to be compiled with correct IMDB IDs and TMDB IDs

### TMDB API Integration

- **API:** TMDB (The Movie Database) — free tier, non-commercial use
- **Poster URL format:** `https://image.tmdb.org/t/p/w500/{poster_path}`
- **API key handling:** Expose in front-end JavaScript but encode using a basic encoder/decoder
  - Encode the API key using Base64 or a simple character shift cipher at build time
  - Decode at runtime in JavaScript before making API calls
  - This is NOT cryptographic security — it's obfuscation to prevent casual scraping of the key from source code
  - Implementation: store the encoded key as a constant, decode with a small utility function before each fetch
- **Poster fetching:** Fetch poster URLs from TMDB using the `tmdbId` field
- **Preloading:** Preload the next 3 posters in advance so card swaps feel instant and butter-smooth. When a new movie is served, immediately begin fetching posters for the next 3 movies in the shuffled queue
- **Graceful fallback:** If TMDB API is down, slow (>3s timeout), or returns an error:
  - Show a styled text card instead of a poster: movie title in the heading font (large), centered on a dark card with a subtle film-grain overlay
  - The card should still look intentional and designed, not broken
  - Retry TMDB silently in the background for subsequent cards

---

## Responsive Behavior

| Feature | Desktop | Mobile |
|---|---|---|
| Card layout | Side by side with generous spacing | Side by side, ~45% width each |
| Primary interaction | Click to select | Tap to select |
| Secondary interaction | — | Swipe to dismiss (left-card swipes left, right-card swipes right) |
| Hover effect | Card lift + shadow | N/A |
| Confetti | Full burst, overflows sections | Scaled-down burst, still overflows |
| Sounds | Respects device mute state | Respects device mute state |
| VS element | Centered between cards | Smaller, centered between cards |
| Poster size | Medium-large | Fills ~45% viewport width |
| Instagram deep link | Opens web URL in new tab | Attempts `instagram://user?username=gragtajar` first, falls back to web URL |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User scrolls away mid-game | State preserved in JS memory, resumes on scroll back |
| Page reload/refresh | Game state fully resets, new genre on next Play |
| TMDB API down | Graceful fallback to styled text cards |
| All movies in genre pool used (shouldn't happen with 50 pool / 21 max used) | N/A — pool is always sufficient |
| All 15 genres exhausted | "Impressive" end state with Instagram CTA |
| User restarts on last genre | Cycles back to a random previously-played genre (all genres now available again) — OR show "Impressive" state. Decision: show Impressive state since they've completed all 15 |
| Slow network | Skeleton loader / pulse animation on poster area while loading |
| User tries to restart during winner celebration | Allowed — instant reset |

---

## Files to Create

| File | Purpose |
|---|---|
| `movies.json` | All 750 movies with metadata (Rajat to mark `rajatApproved` flags) |
| `screening-room.js` | Game logic, state management, TMDB integration, animation triggers |
| `screening-room.css` | Section-specific styles, card styles, CSS noise overlay, animations |
| Sound files (4-5 small .mp3/.ogg) | Whoosh, pop, chime, projector click, celebration |
| Confetti library or custom animation | Canvas-based confetti (use a lightweight lib like `canvas-confetti`) |

---

## Pending on Rajat

| # | Item |
|---|---|
| 1 | Review and mark `rajatApproved: true` for movies in the compiled `movies.json` |
| 2 | Confirm section placement on homepage (position relative to other sections) |
| 3 | Confirm Instagram handle @gragtajar is public |

---

*Spec version: 1.0 · Last updated: April 16, 2026*
