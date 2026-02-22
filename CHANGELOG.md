# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.2] - 2026-02-21

### Added

- 8 new question sets registered in `lib/questions-data.ts` and seeded to DB (1 503 total questions):
  - **Angular** (120 questions, `ang-` prefix)
  - **Backend** (150 questions, `be-` prefix)
  - **Django** (45 questions, `dj-` prefix)
  - **Frontend** (180 questions, `fe-` prefix)
  - **Java** (90 questions, `jv-` prefix)
  - **Python** (120 questions, `py-` prefix)
  - **React** (150 questions, `re-` prefix)
  - **Spring** (111 questions, `sp-` prefix)
- Refactored `lib/questions-data.ts`: extracted `mapSet()` helper to eliminate per-topic boilerplate

## [1.3.1] - 2026-02-21

### Added

- Added GitHub Actions workflow `.github/workflows/snyk.yml` to run Snyk Open Source and Snyk Code scans on push, pull request, schedule, and manual dispatch
- Added SARIF upload step so Snyk Code findings can appear in GitHub code scanning
- Documented Snyk setup options and `SNYK_TOKEN` repository secret requirements in README

## [1.3.0] - 2026-02-21

### Added

- **Remix mode** — virtual topic that pools all questions the user has already studied, mixed across every topic, ordered by SM-2 spaced repetition priority
- `RemixCard` component: placed in the left sidebar (below the logo/greeting card) with a purple→cyan gradient title, shuffle icon, and question count; dimmed and disabled for users with no study history
- **Topic selector in Remix Configure Session modal**: checkboxes (pill style) let the user include or exclude individual studied sets; type-count pills and Start button update live as selections change
- `StudiedTopic` interface exported from `SessionConfigModal` — carries per-set `TypeCounts` for type-aware filtering
- Exit Session button in quiz now uses the "warning" (orange/amber) visual variant to distinguish it from the navigation action
- `components/ui/button.tsx` — added `'warning'` variant mapped to `.ui-button-warning` CSS class
- `.ui-button-warning` CSS rule using `--warning` design token

### Changed

- Login page tagline updated to: "Your prep for IT interviews. / Do not just hoot, execute." (two lines, glow retained on "IT")
- Correct-answer auto-advance removed — "Next Question →" button is now always required, for both correct and wrong answers, giving the user time to read the explanation
- Remix question pool is now scoped to questions with an existing `UserProgress` record per user; `GET /api/quiz/questions/Remix` accepts a `?topics=A,B,C` param to further narrow the pool to selected topic keys
- Dashboard page now queries `UserProgress` to compute per-user studied counts for the Remix card (previously all questions were counted)
- `SessionConfigModal` question count options changed to 10 / 20 / 30 (expanded upper bound for Remix sessions)
- `createPortal` used in `RemixCard` to render the configure-session modal at `document.body` level, escaping the sticky stacking context of the sidebar

### Fixed

- Remix configure-session modal was appearing behind topic cards because `position: sticky` on the parent trapped `position: fixed` descendants; fixed by rendering the modal via `ReactDOM.createPortal` outside the stacking context

## [1.2.0] - 2026-02-20

### Added

- `SessionConfigModal` — pre-session configuration modal triggered by "Start Practice"; lets user choose question count (5 / 7 / 10) and question type (Mixed, Multiple Choice, True/False, Fill the Blank)
- `TopicGrid` client component wraps the dashboard topic cards and owns modal open/close state
- Per-type question counts shown on each type pill in the modal (e.g. "Multiple Choice (18)")
- Type pills are disabled when no questions of that type exist for the topic
- Warning line in modal when requested count exceeds available questions for the chosen filter
- `GET /api/quiz/questions/[topic]` now accepts `?count=N&type=QUIZ_SIMPLE|TRUE_FALSE|FILL_THE_BLANK|mixed` query params

### Changed

- Dashboard "Start Practice" is now a `<button>` that opens the config modal instead of a direct `<Link>`
- Quiz page reads `count` and `type` from URL search params and forwards them to the questions API
- "No questions available" message now clarifies that filters may be the cause

## [1.1.0] - 2026-02-20

### Added

- SM-2 spaced repetition end-to-end wiring: session results are now persisted to `UserProgress` after every practice session
- `GET /api/quiz/questions/[topic]`: returns up to 10 questions ordered by SM-2 review priority (overdue → new → scheduled)
- `POST /api/quiz/session`: accepts `{ results: [{questionId, quality}] }`, runs `calculateSM2()` per question, upserts `UserProgress`, and updates `User.lastActivity`
- `answeredResults` state in `useGameStore` — tracks `{questionId, quality}` for each answered question within a session
- "Progress saved · Questions scheduled for spaced repetition review" status line on the session complete screen

### Changed

- Quiz page now loads questions from `/api/quiz/questions/[topic]` (SM-2 ordered) instead of static JSON
- `useGameStore.answerQuestion` now accepts `(questionId, isCorrect, quality)` to record the SM-2 quality grade per answer
- Removed the last-question auto-advance guard that prevented the session from finishing on a correct final answer
- `Next Question` button now shows for any wrong answer (including the last question), so every session reaches completion
- Fixed question ID mapping for Database questions in `lib/questions-data.ts` — now uses the JSON `id` field (`db-q001`, etc.) so IDs match the seeded `Question` table

### Fixed

- `GET /api/quiz/questions/[topic]` and `POST /api/quiz/session` now pass `authOptions` to `getServerSession` so the session resolves correctly in API routes
- Removed `any[]` type annotations from both new routes (TypeScript strict compliance)

- `test:db:prepare` command to automatically create `quizview_test` and apply Prisma migrations before integration tests
- `scripts/prepare-test-db.ts` utility to bootstrap the test database in local Docker/PostgreSQL environments
- User registration: Sign Up modal with OWASP A03/A07-compliant validation (Zod client+server schema, bcrypt cost 12, server-side rate limiting)
- `GET /api/auth/check-availability`: real-time username and email availability endpoint with Zod validation before any DB query
- Debounced availability checks (400 ms) in SignUpModal with green/red status indicators for username and email fields
- Live password strength checklist: minimum 12 characters, uppercase, lowercase, digit, and special character — shown as user types
- Live email format checklist: `@` placement, valid domain, no spaces, no injection characters, max 254 characters (RFC 5321)
- Login brute-force protection: in-process sliding-window rate limiter — 10 attempts per 15 minutes per IP (`lib/loginRateLimit.ts`)
- Descriptive lock-out error in the login form: "Too many sign-in attempts. Please wait 15 minutes before trying again."
- Login page redesigned as a two-column split layout with 280 px logo, cyberpunk scanlines, and white-glowing brand title
- Dashboard greeting personalised to the authenticated user: "Welcome back, {username}" sourced from JWT session
- Global version badge fixed at the bottom-left corner of every page (`app/layout.tsx`)

### Changed

- Normalized `id` fields in `prisma/data/sets/database.json` so all question records are seedable and uniquely addressable
- Updated `.env.test.example` with local Docker PostgreSQL defaults and optional Prisma URL aliases
- Updated `SECURITY.md` to reflect current database-backed bcrypt authentication flow (removed outdated hardcoded-credentials example)
- Updated `AGENTS.md` testing guidance with mandatory test DB preparation step

### Security

- Added per-IP sliding-window rate limiter (10 attempts / 15 min) to the NextAuth `authorize` callback to prevent credential brute-force attacks (OWASP A07)
- Registration endpoint rate-limited (5 attempts / 15 min per IP) via `lib/registerRateLimit.ts`
- `/api/auth/check-availability` performs Zod input validation before any database query

## [1.0.0] - 2026-02-17

### Added

- Credentials authentication backed by Prisma user records and bcrypt password verification
- Prisma singleton client helper for stable DB connections in Next.js runtime
- Seeded default `QuizView` user with hashed password
- Prisma seed configuration using `tsx`

### Changed

- Migrated Prisma datasource to Vercel Postgres standard variables: `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
- Extended `User` model with `username` and `passwordHash` for credential-based auth
- Updated build script to run `prisma migrate deploy` before `next build`
- Updated `.env.example` and `.env.vercel.example` to Postgres-based configuration

### Security

- Replaced hardcoded plain-text credential check with hashed password comparison

## [0.3.0] - 2026-02-17

### Added

- LICENSE file (MIT License)
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md for community guidelines
- SECURITY.md with security policy and vulnerability reporting
- Repository metadata in package.json (repository, bugs, homepage URLs)

### Changed

- Updated README.md with enhanced documentation for public repository
- Added badges and improved formatting in README
- Removed "private": true from package.json to allow public npm publishing
- Bumped version to 0.3.0 for public release

### Security

- Documented hardcoded demo credentials security concern in SECURITY.md
- Added security best practices for production deployment

## [0.2.4] - 2026-02-15

### Fixed

- Added App Router quiz route to avoid 404s from the dashboard

## [0.2.3] - 2026-02-15

### Added

- Logout confirmation prompt with neon styling

## [0.2.2] - 2026-02-15

### Added

- Fixed-position logout button on the dashboard

## [0.2.1] - 2026-02-15

### Fixed

- Switched Auth.js setup to stable NextAuth v4 and Pages API route

## [0.2.0] - 2026-02-15

### Added

- Auth.js credentials login gate with App Router entry flow
- Cyberpunk login screen with animated logo and neon styling
- Summer/Neon/Autumn theme selection in the dashboard

## [0.1.1] - 2026-02-15

### Fixed

- Removed invalid `explanation` field access from question set mapping to fix strict TypeScript builds
- Added explicit typing for JSON question sets to preserve strict type safety
- Excluded seed scripts from app type-check scope to prevent Prisma client generation issues from breaking CI builds
- Disabled build-time ESLint execution in Next.js config so builds are not blocked when ESLint is unavailable in CI

## [0.1.0] - 2026-02-14

### Added

- Initial project setup with Next.js 14.2.35 and TypeScript
- Pages Router architecture with dynamic category routing
- Three question types implementation:
  - Quiz Simple: Multiple choice questions with 4 options
  - True/False: Binary answer questions
  - Fill the Blank: Code completion questions
- Game components with visual feedback:
  - `GameEngine.tsx`: Main router for question type dispatch
  - `QuizSimple.tsx`: Multiple choice UI with immediate feedback
  - `TrueFalse.tsx`: Binary choice component with Spanish labels
- Zustand state management for game sessions
  - Session state tracking (score, current question index, completion status)
  - Question interleaving by category
  - Session reset functionality
- Question data sets:
  - Database questions (30+ questions covering SQL, DBMS, normalization)
  - JavaScript questions (closures, event loop, async patterns)
- UI component library based on shadcn/ui patterns:
  - Card, Button, Badge, Progress components
  - Type-safe React component interfaces
  - Tailwind CSS styling with dark mode support
- Smart auto-advance logic:
  - Correct answers: Auto-advance after 3.5 seconds
  - Wrong answers: Manual "Next Question" button required
- Category selection interface on home page
- Quiz completion screen with score percentage and retry options
- Session management with automatic reset on category change

### Fixed

- Component state reset between questions using Next.js `key` pattern
- Category switching bug that kept old session data
- Removed unused state variables and imports for cleaner codebase
- Optimized React imports to type-only where applicable

### Technical Details

- **Framework**: Next.js 14.2.35 (Pages Router)
- **State Management**: Zustand 4.5.7
- **Database**: Prisma 5.22.0 with SQLite (development)
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled

### Known Limitations

- No user authentication yet
- No spaced repetition algorithm implementation (SM-2 pending)
- No progress tracking persistence
- Static question loading (no API layer)
- No streak/gamification system yet
