# Contributing to InterviewTrainer

Thank you for your interest in contributing to InterviewTrainer! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contribution Guidelines](#contribution-guidelines)
- [Question Sets](#question-sets)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mbs_tfm_InterviewTrainer.git
   cd mbs_tfm_InterviewTrainer
   ```

2. **Install dependencies** using pnpm:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your local configuration.

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- Create a new branch for each feature or bug fix
- Use descriptive branch names: `feature/add-python-questions`, `fix/quiz-timer-bug`
- Keep branches focused on a single issue

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions or modifications
- `refactor:` for code refactoring
- `style:` for formatting changes
- `chore:` for maintenance tasks

Example:
```
feat: add Python question set with 25 questions
```

## Contribution Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any` types
- **Components**: Separate logic from UI (use custom hooks)
- **Naming**: Use clear, descriptive names for variables and functions
- **Comments**: Add comments for complex logic, but prefer self-documenting code

### Architecture Principles

Please read `AGENTS.md` to understand:
- The stack technology requirements (Next.js, TypeScript, Tailwind CSS, etc.)
- Learning science principles (Spaced Repetition, Active Recall, etc.)
- Code standards and architecture patterns

### What to Contribute

We welcome contributions in these areas:

1. **Question Sets**: Add new technical topics (Python, Docker, Kubernetes, etc.)
2. **Features**: Implement new game modes or learning features
3. **Bug Fixes**: Fix existing issues
4. **Documentation**: Improve README, add tutorials, or translate content
5. **Tests**: Add unit, integration, or E2E tests
6. **UI/UX**: Improve the user interface and experience

## Question Sets

Question sets are stored in `prisma/data/sets/[topic].json`.

### Adding a New Question Set

1. Create a new JSON file in `prisma/data/sets/` (e.g., `python.json`)
2. Follow the schema defined in `AGENTS.md` section 6:

```typescript
interface QuestionSetItem {
  id: string;          // Format: topic-unique-slug (e.g., "py-list-comprehension")
  question: string;    // Clear, concise technical question
  answer: string;      // The correct answer string
  options: string[];   // Array of 4 strings (1 correct, 3 distractors)
  category: string;    // Sub-topic (e.g., "Data Structures", "Functions")
  type: "QUIZ_SIMPLE" | "FILL_THE_BLANK" | "TRUE_FALSE";
  level: "Beginner" | "Intermediate" | "Advanced";
}
```

3. Ensure questions are:
   - Technically accurate
   - Clear and unambiguous
   - Appropriate for the difficulty level
   - Include practical, real-world examples

4. Add at least 20-30 questions for a new topic

### Example Question

```json
{
  "id": "py-list-comprehension",
  "question": "What is the output of: [x**2 for x in range(3)]?",
  "answer": "[0, 1, 4]",
  "options": ["[0, 1, 4]", "[1, 4, 9]", "[0, 1, 2]", "[0, 2, 4]"],
  "category": "List Comprehensions",
  "type": "QUIZ_SIMPLE",
  "level": "Beginner"
}
```

## Testing

### Running Tests

```bash
# Unit tests
pnpm vitest run

# E2E tests
pnpm test:e2e

# Type checking
pnpm tsc --noEmit

# All checks
pnpm vitest run && pnpm tsc --noEmit
```

### Writing Tests

- Add unit tests for utility functions (`lib/` directory)
- Add component tests for UI components (`components/` directory)
- Follow existing test patterns in `__tests__/`

## Pull Request Process

1. **Before submitting**:
   - Run all tests and ensure they pass
   - Run TypeScript type checking
   - Update documentation if needed
   - Update CHANGELOG.md (see [Keep a Changelog](https://keepachangelog.com/))

2. **PR Description**:
   - Clearly describe what changes you made and why
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**:
   - A maintainer will review your PR
   - Address any requested changes
   - Once approved, a maintainer will merge your PR

4. **After Merge**:
   - Delete your branch
   - Pull the latest changes from main

## Questions?

If you have questions or need help:
- Open an issue with the `question` label
- Check existing issues and discussions
- Review the README.md and AGENTS.md documentation

Thank you for contributing to InterviewTrainer! 🎉
