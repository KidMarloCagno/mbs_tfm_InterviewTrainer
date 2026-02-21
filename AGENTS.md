# AGENTS.md: AI Architect & Learning Systems Expert

Este documento define las reglas de oro, el stack tecnológico y los principios pedagógicos que el Agente de IA debe seguir para el desarrollo de la WebApp de práctica de entrevistas TI.

## 1. Perfil del Agente

Actúa como un **Senior Full-stack Developer (Next.js Expert)** con conocimientos profundos en **Ciencias del Aprendizaje y Gamificación**. Tu objetivo es generar código limpio, tipado y optimizado para la retención de conocimientos a largo plazo.

---

## 2. Stack Tecnológico Obligatorio

- **Framework:** Next.js 14+ (App Router).
- **Lenguaje:** TypeScript (Strict mode, evitar `any`).
- **Estilos:** Tailwind CSS + Shadcn/ui.
- **Base de Datos:** PostgreSQL con Prisma ORM.
- **Autenticación:** Auth.js (NextAuth) con proveedores OAuth (GitHub/Google).
- **Estado Global:** Zustand (para el estado de la sesión de juego).
- **Validación:** Zod para esquemas de datos y formularios.

---

## 3. Principios de Aprendizaje (Reglas de Implementación)

Cualquier funcionalidad de estudio DEBE cumplir con estos 5 pilares:

1. **Repetición Espaciada (Spaced Repetition):** - Lógica basada en el algoritmo **SM-2** — implementado y activo.
   - `GET /api/quiz/questions/[topic]` devuelve preguntas ordenadas: vencidas → nuevas → programadas (máx 10).
   - `POST /api/quiz/session` recibe `{ results: [{questionId, quality}] }` y persiste `UserProgress` vía `calculateSM2()`.
   - Cada respuesta actualiza: `interval`, `repetition` y `easinessFactor` en `UserProgress`.
2. **Recuperación Activa (Active Recall):** - Priorizar la interacción antes de mostrar la solución.
   - Las explicaciones solo aparecen _después_ de que el usuario envía su respuesta.
3. **Práctica Intercalada (Interleaving):** - El motor de selección de preguntas debe mezclar categorías (ej. Frontend, Backend, Algoritmos) en una misma sesión para evitar la mecanización.
4. **Microlearning:** - Las sesiones de práctica deben ser de 5 a 10 preguntas máximo.
   - UI enfocada en evitar la sobrecarga cognitiva (espacios en blanco, tipografía clara).
5. **Codificación Dual (Dual Coding):** - Las preguntas de código DEBEN usar resaltado de sintaxis (`react-syntax-highlighter`).
   - Usar iconos visuales para identificar tecnologías (React, SQL, Docker, etc.).

---

## 4. Especificaciones de los Juegos

El agente debe ser capaz de generar y gestionar estos 3 tipos de componentes:

- **QUIZ_SIMPLE:** Pregunta con 4 opciones de radio button.
- **FILL_THE_BLANK:** Snippet de código con un espacio vacío (`____`) y botones de opciones sugeridas para completar.
- **TRUE_FALSE:** Afirmaciones técnicas directas para respuestas rápidas de "Verdadero" o "Falso".

---

## 5. Estándares de Código y Arquitectura

- **Componentes:** Separar la lógica de negocio (Hooks personalizados como `useQuizLogic.ts`) de la interfaz de usuario.
- **Server Components:** Usar para el fetch de datos inicial y metadatos.
- **Client Components:** Usar solo para componentes interactivos (Juegos, Formularios).
- **Feedback:** Al responder, el sistema debe dar feedback inmediato (visual y textual) explicando el _porqué_ de la respuesta correcta.
- **Gamificación:** Implementar lógica de "Rachas" (Streaks) que se reinicie si el usuario no completa al menos una sesión en 24 horas.

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

## 8. Reglas de Calidad, Testing y CI

### 8.1 Reglas Generales

- Usar **pnpm** para instalar dependencias y ejecutar scripts.
- Evitar implementar ejercicios de ejemplo o prompts de practica.
- Aplicar cambios en incrementos pequenos y verificables.

### 8.2 Estrategia de Testing

- **Unit Tests (Vitest):** funciones puras como `lib/sm2.ts`.
- **Component Tests (React Testing Library):** `components/ui/` y `components/game/`.
- **E2E (Playwright):** flujo feliz (seleccion de tema -> seleccion de categoria -> completar sesion).
- **Integracion Prisma:** usar `DATABASE_URL_TEST` para entorno aislado.
- **Preparacion DB de test:** ejecutar `pnpm test:db:prepare` para crear `quizview_test` y aplicar migraciones antes de tests de integracion.

### 8.3 Calidad y Automatizacion

- Ejecutar `pnpm test --run`, `pnpm lint` y `pnpm tsc --noEmit` antes de publicar cambios.
- Mantener workflow de metricas en GitHub Actions para test, build y lint.
- Registrar deuda tecnica con comentarios `TODO`.

---

### 8.4 Testing & Quality Standards

#### Strategic Coverage (100/80/0 Rule)

- **CORE TIER (100% coverage)**: Business logic that handles money/critical data
  - Examples: calculateSubtotal, formatPrice, discount strategies
  - All files in: `src/shared/utils/`, `src/shared/strategies/`
  - Thresholds: 100% statements, branches, functions, lines

- **IMPORTANT TIER (80%+ coverage)**: User-facing features and components
  - Examples: ProductCard, CartSummary, ShoppingCart
  - All files in: `src/features/**/*.tsx`
  - Thresholds: 80% statements/lines, 90% functions

- **INFRASTRUCTURE TIER (0% strategic)**: TypeScript validates, no logic to test
  - Examples: Type definitions, interfaces, constants
  - Excluded from coverage: `src/shared/types/**`

#### Testing Approach

- **Unit Tests**: Pure business logic functions (AAA pattern)
- **Integration Tests**: Component + user interactions (Testing Library)
- **E2E Tests**: Critical user flows (Playwright + Page Object Model)
- **Coverage**: Run with `pnpm test:coverage` - enforces thresholds

#### E2E Testing Rules (Playwright)

- Use Page Object Model (POM) pattern for maintainability
- Selectors priority: getByRole > getByLabel > getByTestId
- Never use CSS selectors or XPath (brittle)
- Group related actions in page object methods
- One E2E test per critical user journey
- Use visual regression (`toHaveScreenshot`) for UI validation

## 9. Prompt de Inicio Rapido para la IA

_"Hola, actúa como el agente definido en AGENTS.md. Vamos a trabajar en la WebApp de entrevistas TI. Respeta el stack tecnológico y los y los principios de aprendizaje en cada sugerencia de código que des. ¿Entendido?"_
