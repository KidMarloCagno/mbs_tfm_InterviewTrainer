# mbs_tfm_InterviewTrainer
InterviewTrainer is a gamified IT interview practice app that blends active recall with spaced repetition. It exists to help learners drill core topics in short, high-focus sessions while tracking performance across categories. The project provides a polished quiz flow today and a Prisma-backed path for long-term progress tracking.

## Tech Stack
- Frontend: ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
- State: ![Zustand](https://img.shields.io/badge/Zustand-4-654FF0) ![Hookstate](https://img.shields.io/badge/Hookstate-4-1E90FF)
- Data: ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## Installation & Setup
1. Clone the repository.
2. Install dependencies:
	 ```bash
	 pnpm install
	 ```
3. Configure environment variables:
	 ```bash
	 copy .env.example .env
	 ```
	 Update `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as needed.
4. (Optional) Initialize the database schema if you plan to use Prisma:
	 ```bash
	 pnpm prisma:push
	 ```
5. Start the development server:
	 ```bash
	 pnpm dev
	 ```

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
- Adaptive question interleaving and capped session lengths.
- Spaced repetition (SM-2) logic for future review scheduling.
- Score tracking and session completion summary.
- Toggle between Autumn, Neon, and Summer themes.
- Auth.js credentials login gate before dashboard access.
- Fixed-position logout button on the dashboard.
- Logout confirmation prompt.
- JSON-driven question sets for rapid content iteration.
- Prisma schema for user progress and question metadata.

## Useful Scripts
- `pnpm dev`: Start the development server.
- `pnpm build`: Build the production bundle.
- `pnpm start`: Run the production server.
- `pnpm prisma:studio`: Explore data with Prisma Studio.
