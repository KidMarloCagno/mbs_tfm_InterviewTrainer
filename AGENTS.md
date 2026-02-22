# AGENTS.md: AI Architect & Learning Systems Expert

This document defines the golden rules, the technology stack, and the pedagogical principles that the AI Agent must follow when developing the IT interview practice WebApp.

## 1. Agent Profile

Act as a **Senior Full-stack Developer (Next.js Expert)** with deep knowledge in **Learning Sciences and Gamification**. Your goal is to generate clean, typed, and optimized code for long-term knowledge retention.

---

## 2. Required Technology Stack

- **Framework:** Next.js 14+ (App Router).
- **Language:** TypeScript (Strict mode, avoid `any`).
- **Styles:** Tailwind CSS + Shadcn/ui.
- **Database:** PostgreSQL with Prisma ORM.
- **Authentication:** Auth.js (NextAuth) with OAuth providers (GitHub/Google).
- **Global State:** Zustand (for game session state).
- **Validation:** Zod for data schemas and forms.

---

## 3. Learning Principles (Implementation Rules)

Any study feature MUST comply with these 5 pillars:

1. **Spaced Repetition:** Logic based on the **SM-2** algorithm — implemented and active.
   - `GET /api/quiz/questions/[topic]` returns questions ordered: overdue → new → scheduled (max 10).
   - `POST /api/quiz/session` receives `{ results: [{questionId, quality}] }` and persists `UserProgress` via `calculateSM2()`.
   - Each answer updates: `interval`, `repetition`, and `easinessFactor` in `UserProgress`.
2. **Active Recall:** Prioritize interaction before showing the solution.
   - Explanations only appear _after_ the user submits their answer.
3. **Interleaving:** The question selection engine must mix categories (e.g. Frontend, Backend, Algorithms) within the same session to avoid mechanical repetition.
4. **Microlearning:** Practice sessions must be 5 to 10 questions maximum.
   - UI focused on avoiding cognitive overload (whitespace, clear typography).
5. **Dual Coding:** Code questions MUST use syntax highlighting (`react-syntax-highlighter`).
   - Use visual icons to identify technologies (React, SQL, Docker, etc.).

---

## 4. Game Type Specifications

The agent must be able to generate and manage these 3 component types:

- **QUIZ_SIMPLE:** Question with 4 radio button options.
- **FILL_THE_BLANK:** Code snippet with a blank space (`____`) and suggested option buttons to complete it.
- **TRUE_FALSE:** Direct technical statements for quick "True" or "False" answers.

---

## 5. Code & Architecture Standards

- **Components:** Separate business logic (custom hooks like `useQuizLogic.ts`) from the user interface.
- **Server Components:** Use for initial data fetching and metadata.
- **Client Components:** Use only for interactive components (Games, Forms).
- **Feedback:** When answering, the system must give immediate feedback (visual and textual) explaining the _why_ of the correct answer.
- **Gamification:** Implement "Streaks" logic that resets if the user does not complete at least one session in 24 hours.

---

## 6. Data Architecture & Question Sets

To ensure modularity, question sets are organized by **Base Topic** in a dedicated directory structure. The AI must follow these rules when managing or generating new data:

### Directory Structure

All question sets must reside in: `prisma/data/sets/[topic].json`

Example:

- `prisma/data/sets/database.json`
- `prisma/data/sets/javascript.json`
- `prisma/data/sets/react.json`

### JSON Schema Standard

Every object in the JSON arrays must strictly follow this TypeScript interface:

````typescript
interface QuestionSetItem {
  id: string;          // Format: topic-unique-slug (e.g., "db-acid-props")
  question: string;    // Clear, concise technical question
  answer: string;      // The correct answer string
  options: string[];   // Array of 4 strings (1 correct, 3 distractors)
  category: string;    // Sub-topic (e.g., "Normalization", "Indexing")
  type: "QUIZ_SIMPLE" | "FILL_THE_BLANK" | "TRUE_FALSE";
  level: "Beginner" | "Intermediate" | "Advanced";
}

### 6.2 Question Sources & Prompts

All sourcing documentation is maintained in:

- **[`QuestionsKitchen/SOURCES.md`](QuestionsKitchen/SOURCES.md)** — source URLs and AI prompts used to generate each question set
- **[`prisma/data/sets/`](prisma/data/sets/)** — the actual JSON files consumed by the seeder and the app

---


### 6.3 Adding a New Question Set — Auto-Verify Checklist

When a new `.json` file is dropped into `prisma/data/sets/`, or new questions are appended to an existing file, the agent MUST run through this checklist **before seeding the DB**:

- [ ] **1. JSON schema valid** — every object has the required structural fields: `id`, `question`, `answer`, `options`, `type`, `level`. Content quality (`explanation` text, answer correctness, distractor quality) is the author's responsibility and is **out of scope** for this checklist.
- [ ] **2. ID sequence integrity** — the agent MUST auto-correct any ID that violates the sequence rules. **Do not flag or touch question content — IDs only.**
   - Format: `{prefix}-q{NNN}` zero-padded 3-digit counter (e.g., `db-q001`, `db-q059`)
   - **No duplicates** — IDs must be unique across the entire `prisma/data/sets/` directory
   - **No gaps** — sequence must be continuous within each file (q001 → q002 → q003…)
   - **Continuation rule** — questions appended to an existing file must continue from the last existing ID (e.g., last is `db-q089` → next is `db-q090`)
   - **Auto-fix:** renumber out-of-sequence or duplicate IDs to restore continuity; report what was changed
- [ ] **3. Register in app** — add an import and a new key to `lib/questions-data.ts`:
   ```ts
   import <topic>Questions from "@/prisma/data/sets/<topic>.json";
   // inside questionsData:
   <TopicName>: (<topic>Questions as QuestionSetItem[]).map((q, idx) => ({ ... })),
   ```
- [ ] **3.1. Automation: Update questions-data.ts** — The agent MUST automatically scan `prisma/data/sets/` for all `.json` files and update `lib/questions-data.ts` to:
   - Add import statements for each new or updated topic file.
   - Add or update the corresponding entry in the `questionsData` object.
   - Ensure `getAvailableTopics()` and Dashboard reflect all available sets.
   - This step removes the need for manual edits when new sets are added.
- [ ] **4. Seed DB** — run the following sequence automatically after steps 1–3 pass. Do not wait for the user to request it.

  ```bash
  # 1. Ensure the local Docker DB container is running
  docker compose up -d

  # 2. Re-seed (upserts existing rows, inserts new ones)
  pnpm prisma:seed
  ```

  **Expected output:** `Seeded QuizView user and N questions from .../prisma/data/sets`
  Verify that `N` equals the total question count across **all** JSON files in `prisma/data/sets/`.

  > **Why re-run?** `seed.ts` auto-discovers every `.json` in `prisma/data/sets/`, but it only writes to the DB when executed. Dropping a file into the directory does **not** automatically update the DB — the seed must be re-run explicitly after each addition.
  >
  > After seeding, refresh Prisma Studio (`pnpm prisma:studio`) to confirm the new rows are visible in the `Question` table.
- [ ] **5. TypeScript clean** — run `npx tsc --noEmit`, fix any errors
- [ ] **6. Document** — add a row for the new topic in `QuestionsKitchen/SOURCES.md`
- [ ] **7. Version bump** — follow Section 7 (patch bump for new question set, minor bump for new category)

> `seed.ts` auto-discovers every `.json` in `prisma/data/sets/` — no changes to the seeder are needed. Only `lib/questions-data.ts` requires a manual import.

---

### 6.4 DB Schema (Quick Reference)

> Full canonical source: [`prisma/schema.prisma`](prisma/schema.prisma)

| Model | Key fields |
|-------|------------|
| `User` | `id` (cuid), `username` (unique), `email` (unique), `passwordHash`, `streakCount`, `lastActivity` |
| `Question` | `id` (string), `question`, `answer`, `options[]`, `category`, `type` (enum), `level` (enum) |
| `UserProgress` | `id` (cuid), `userId→User`, `questionId` (plain string, no FK), `repetition`, `interval`, `easinessFactor`, `nextReview` |

Enums: `QuestionType` (QUIZ_SIMPLE, FILL_THE_BLANK, TRUE_FALSE) · `DifficultyLevel` (Beginner, Intermediate, Advanced)

Constraints: `UserProgress` has `@@unique([userId, questionId])` and `@@index([nextReview])`. `questionId` is intentionally a plain string (no FK to `Question`) so new question sets work without re-seeding the DB.

---

## 7. Version Control & Changelog Management

### 7.1 Package Version Updates
When implementing new features, fixing bugs, or making significant changes:

1. **Update `package.json` version** following [Semantic Versioning](https://semver.org/):
   - **MAJOR** (X.0.0): Breaking changes that affect existing functionality
   - **MINOR** (0.X.0): New features added in a backward-compatible manner
   - **PATCH** (0.0.X): Backward-compatible bug fixes

2. **Version Update Rules**:
   - New game types or learning algorithms → MINOR version bump
   - UI improvements or new question sets → PATCH version bump
   - Database schema changes or API breaking changes → MAJOR version bump

### 7.2 CHANGELOG.md Creation & Maintenance
The AI agent MUST create and maintain a `CHANGELOG.md` file in the project root following the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - YYYY-MM-DD
### Added
- Initial release with Quiz Simple, True/False, and Fill the Blank game modes
- SM-2 algorithm implementation for spaced repetition
- Database and JavaScript question sets
- Zustand state management for game sessions

### Changed
- [List any changes to existing functionality]

### Deprecated
- [List soon-to-be removed features]

### Removed
- [List removed features]

### Fixed
- [List bug fixes]

### Security
- [List security improvements]
````

### 7.3 Update Workflow

When making changes, the AI MUST:

1. **Before coding**: Review current version in `package.json`
2. **After implementation**:
   - Update `package.json` version number
   - Add entry to `CHANGELOG.md` under appropriate section (Added/Changed/Fixed)
   - Include date in ISO format (YYYY-MM-DD)
   - Reference issue/PR numbers if applicable
   - Update `README.md` only when new functionalities are added (not for fixes or changes that do not introduce new functionality)

### 7.4 In-App Version Display (MANDATORY)

The version string displayed inside the application MUST stay in sync with `package.json` and `CHANGELOG.md`.

**Files to update on every version bump:**

| File             | Location                      | Example                   |
| ---------------- | ----------------------------- | ------------------------- |
| `package.json`   | `"version"` field             | `"version": "1.3.0"`      |
| `CHANGELOG.md`   | New `## [X.Y.Z]` section      | `## [1.3.0] - 2026-02-20` |
| `app/layout.tsx` | `<p className="app-version">` | `v1.3.0`                  |

> **Rule:** Never close a feature without verifying all three files show the same version. Stale in-app versions (e.g., showing v1.0.0 while CHANGELOG says v1.2.0) erode trust in the UI.

---

### 7.5 Example Entry Format

```markdown
## [1.2.0] - 2026-02-14

### Added

- New React question set with 30 advanced hooks questions
- Progress visualization component with completion percentage
- Dark mode toggle in user settings

### Fixed

- Quiz state reset bug when switching categories
- Auto-advance timer not clearing on incorrect answers (#42)
```

---

## 8. Quality, Testing & CI Rules

### 8.1 General Rules

- Use **pnpm** to install dependencies and run scripts.
- Avoid implementing example exercises or practice prompts.
- Apply changes in small, verifiable increments.

### 8.2 Testing Strategy

- **Unit Tests (Vitest):** Pure functions such as `lib/sm2.ts`.
- **Component Tests (React Testing Library):** `components/ui/` and `components/game/`.
- **E2E (Playwright):** Happy path (topic selection → category selection → complete session).
- **Prisma Integration:** Use `DATABASE_URL_TEST` for an isolated environment.
- **Test DB preparation:** Run `pnpm test:db:prepare` to create `quizview_test` and apply migrations before integration tests.

### 8.3 Quality & Automation

- Run `pnpm test --run`, `pnpm lint`, and `pnpm tsc --noEmit` before publishing changes.
- Maintain a metrics workflow in GitHub Actions for test, build, and lint.
- Record technical debt with `TODO` comments.

---

### 8.4 Testing & Quality Standards

#### Strategic Coverage (100/80/0 Rule)

- **CORE TIER (100% coverage)**: Business logic that handles critical data or happy path, for a new user, and for a user with some questions answered.
  - Examples: Remix Card disabled (New User), Remix Card (User with passed sets)
  - All files related to functions flow.
  - Thresholds: 100% statements, branches, functions, lines

- **IMPORTANT TIER (80%+ coverage)**: User-facing features and components
  - Examples: Login, Dashboard, etc
  - Thresholds: 80% statements/lines, 90% functions

- **INFRASTRUCTURE TIER (0% strategic)**: TypeScript validates, no logic to test
  - Examples: Type definitions, interfaces, constants
  - Excluded from coverage: `src/shared/types/**`

### Testing Approach

- **Unit Tests**: Pure business logic functions (AAA pattern)
- **Integration Tests**: Component + user interactions (Testing Library)
- **E2E Tests**: Critical user flows (Playwright + Page Object Model)
- **Coverage**: Run with `pnpm test:coverage` - enforces thresholds

### E2E Testing Rules (Playwright)

- Use Page Object Model (POM) pattern for maintainability
- Selectors priority: getByRole > getByLabel > getByTestId
- Never use CSS selectors or XPath (brittle)
- Group related actions in page object methods
- One E2E test per critical user journey
- Use visual regression (`toHaveScreenshot`) for UI validation

## 9. AI Quick-Start Prompt

_"Hi, act as the agent defined in AGENTS.md. We are going to work on the IT interview WebApp. Respect the technology stack and the learning principles in every code suggestion you give. Understood?"_
