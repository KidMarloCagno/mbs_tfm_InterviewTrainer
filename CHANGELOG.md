# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
