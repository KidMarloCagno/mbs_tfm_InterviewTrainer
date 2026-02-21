# InterviewTrainer aka QuizView🎯

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

QuizView is a gamified IT interview practice app that blends active recall with spaced repetition. It exists to help learners drill core topics in short, high-focus sessions while tracking performance across categories. The project provides a polished quiz flow today and a Prisma-backed path for long-term progress tracking.

## 🌟 Features

- **Multiple Question Types**: Quiz Simple, True/False, and Fill the Blank
- **Spaced Repetition**: SM-2 algorithm — per-user per-question progress persisted to PostgreSQL; sessions prioritise overdue reviews, then new questions, then scheduled ones automatically
- **Remix Mode**: A cross-topic virtual session that mixes only the questions you have already studied, ordered by SM-2 priority; includes a topic selector so you can focus on a subset of your studied sets
- **Session Configuration**: Choose question count (10 / 20 / 30) and type filter (Mixed, Multiple Choice, True/False, Fill the Blank) before every session
- **Theme Customization**: Switch between Neon and Summer themes
- **Progress Tracking**: Track your performance across different categories
- **Authentication**: Secure login with NextAuth.js and credential-based registration
- **Live Registration Validation**: Real-time password strength and email format checklists; debounced username/email availability checks
- **Brute-Force Protection**: Per-IP rate limiting on both login (10 attempts/15 min) and registration (5 attempts/15 min)
- **Responsive Design**: Clean UI with semantic CSS design tokens and dark/neon themes

## Tech Stack

- Frontend: ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
- State: ![Zustand](https://img.shields.io/badge/Zustand-4-654FF0) ![Hookstate](https://img.shields.io/badge/Hookstate-4-1E90FF)
- Data: ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/KidMarloCagno/mbs_tfm_InterviewTrainer.git
   cd mbs_tfm_InterviewTrainer
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Update `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as needed.

4. Apply Prisma migrations and seed:

   ```bash
   pnpm prisma:migrate:deploy
   pnpm prisma:seed
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo Credentials:**

- Username: `QuizView`
- Password: `Teletubbie`

> ⚠️ **Security Note**: These are demo credentials only. See [SECURITY.md](SECURITY.md) for production deployment guidelines.

## Project Structure

```text
mbs_tfm_InterviewTrainer/
	pages/                 # Next.js routes
		index.tsx            # Topic selection screen
		quiz/[category].tsx  # Quiz session flow
	components/            # UI and game components
		game/                # Core game engine components
		ui/                  # Reusable UI primitives
	lib/                   # Domain logic utilities
		questions-data.ts    # Loads question sets per topic
		sm2.ts               # Spaced repetition algorithm
	store/                 # Global state
		useGameStore.ts      # Quiz session state and scoring
	prisma/                # Data models and seed utilities
		schema.prisma        # Prisma data model
		data/sets/           # JSON question sets
	public/                # Static assets
	styles/                # Global styles
	.env.example           # Sample environment variables
	package.json           # Scripts and dependencies
```

## Main Functionalities

- Topic-based quiz sessions with dynamic routing per category.
- Pre-session configuration modal: choose question count (10 / 20 / 30) and type filter before starting.
- SM-2 spaced repetition: sessions ordered as overdue → new → scheduled; progress persisted to `UserProgress` after every session.
- **Remix mode**: cross-topic session scoped to the user's already-studied questions; configurable topic selector per session.
- Manual "Next Question →" button required after every answer (correct and wrong), giving the user time to read explanations.
- Score tracking and session completion summary.
- Exit Session button with warning (amber) styling.
- Toggle between Neon and Summer themes.
- Auth.js credentials login gate before dashboard access.
- User registration with OWASP-compliant validation (Zod, bcrypt cost 12, server-side schema mirroring).
- Live password strength checklist and email format checklist shown as the user types.
- Debounced real-time username/email availability check (400 ms) via `GET /api/auth/check-availability`.
- Per-IP rate limiting on login (10 attempts / 15 min) and registration (5 attempts / 15 min).
- Personalised dashboard greeting ("Welcome back, {username}") from JWT session.
- Fixed-position logout button on the dashboard.
- JSON-driven question sets for rapid content iteration.
- Prisma schema for user progress and question metadata.

## 📜 Available Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the production bundle
- `pnpm start`: Run the production server
- `pnpm test:db:prepare`: Create/prepare `quizview_test` and apply Prisma migrations
- `pnpm test`: Run unit tests with Vitest
- `pnpm test:e2e`: Run end-to-end tests with Playwright
- `pnpm lint`: Run ESLint for code quality
- `pnpm prisma:studio`: Explore data with Prisma Studio
- `pnpm prisma:push`: Push Prisma schema to the database

### Recommended Test Workflow

For local integration reliability with PostgreSQL:

```bash
pnpm test:db:prepare
pnpm test
```

- `pnpm test:db:prepare` creates `quizview_test` (if missing) and applies Prisma migrations.
- `pnpm test` runs the test suite after the test database is ready.

## ▲ Vercel Deployment Notes

## 🔐 Snyk Integration Options

This repository supports Snyk as a GitHub Actions workflow (`.github/workflows/snyk.yml`) so scans can run automatically after pushes and on pull requests.

You can choose one of these rollout options:

1. **PR-only scans** (recommended first step): run Snyk on `pull_request` and gate merges.
2. **Push + PR scans**: run on both `push` and `pull_request` for faster feedback on branch work.
3. **Scheduled baseline scans**: add a weekly cron so new CVEs are detected even without new commits.
4. **Manual scans**: use `workflow_dispatch` to run on-demand from the Actions tab.

### Required secret

Set `SNYK_TOKEN` in repository secrets:

- GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

### Optional hardening

- Enable GitHub code scanning upload (SARIF) for Snyk Code findings.
- Start with `--severity-threshold=high` and later tighten to `medium`.
- Add `snyk monitor` in a separate scheduled workflow to track project history in Snyk dashboard.

- This project pins pnpm via `packageManager` in `package.json` to ensure CI and local environments use the same package manager version.
- Vercel installs with a frozen lockfile by default (`pnpm install --frozen-lockfile`).
- If deployment fails with `ERR_PNPM_OUTDATED_LOCKFILE`, run this locally from project root:

  ```bash
  pnpm install
  pnpm install --frozen-lockfile
  ```

- Commit and push both `package.json` and `pnpm-lock.yaml` if either changes.
- In Vercel Project Settings, ensure the Root Directory points to this app folder.

### Pre-deploy Checklist

- **Root directory**: `mbs_tfm_InterviewTrainer`
- **Install command**: `pnpm install`
- **Build command**: `pnpm build`
- **Required environment variables**:
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`
  - `NEXTAUTH_SECRET`
  - `AUTH_SECRET`
  - `NEXTAUTH_URL`
  - Template files: `.env.vercel.example`, `.env.production.example`
  - Scope rules:
    - `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEXTAUTH_SECRET`, `AUTH_SECRET`: set for Development, Preview, and Production.
    - `NEXTAUTH_URL`: set for Production only.
- **Lockfile validation**:
  - `pnpm install --frozen-lockfile`
- **Quality gate (recommended)**:
  - `pnpm test`
  - `pnpm lint`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to set up your development environment
- Our coding standards and conventions
- How to submit pull requests
- How to add new question sets

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🔒 Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Question data inspired by common IT interview topics

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
