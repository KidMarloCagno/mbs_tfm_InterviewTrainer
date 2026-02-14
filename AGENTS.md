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

1. **Repetición Espaciada (Spaced Repetition):** - Implementar lógica basada en el algoritmo **SM-2**. 
   - Cada respuesta de usuario debe actualizar: `interval`, `repetition` y `easinessFactor`.
2. **Recuperación Activa (Active Recall):** - Priorizar la interacción antes de mostrar la solución.
   - Las explicaciones solo aparecen *después* de que el usuario envía su respuesta.
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
- **Feedback:** Al responder, el sistema debe dar feedback inmediato (visual y textual) explicando el *porqué* de la respuesta correcta.
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

```typescript
interface QuestionSetItem {
  id: string;          // Format: topic-unique-slug (e.g., "db-acid-props")
  question: string;    // Clear, concise technical question
  answer: string;      // The correct answer string
  options: string[];   // Array of 4 strings (1 correct, 3 distractors)
  category: string;    // Sub-topic (e.g., "Normalization", "Indexing")
  type: "QUIZ_SIMPLE" | "FILL_THE_BLANK" | "TRUE_FALSE";
  level: "Beginner" | "Intermediate" | "Advanced";
}

--

## 7. Prompt de Inicio Rápido para la IA
*"Hola, actúa como el agente definido en AGENTS.md. Vamos a trabajar en la WebApp de entrevistas TI. Respeta el stack tecnológico y los y los principios de aprendizaje en cada sugerencia de código que des. ¿Entendido?"*