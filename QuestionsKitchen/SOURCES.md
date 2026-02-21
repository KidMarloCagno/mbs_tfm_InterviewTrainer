# Questions Kitchen — Sources & Prompts

Question sets live in: `prisma/data/sets/<topic>.json`

---

## Sources

| Topic      | Source URL                                                        | Date Accessed | Notes |
| ---------- | ----------------------------------------------------------------- | ------------- | ----- |
| Database   | https://www.softwaretestinghelp.com/database-interview-questions/ | 2026-02-10    |       |
| JavaScript |                                                                   |               |       |

---

## Generation Prompts

Two-step pipeline to produce a complete question set from a single source URL.

---

### Step 1 — URL → QUIZ_SIMPLE JSON

> Copy this prompt into your AI assistant. Replace the placeholders before sending.

```
Act as an expert instructional designer and JSON data formatter. I am going to provide you
with a URL. Your task is to extract the key facts, concepts, or tutorials from that page
and convert them into a JSON array of multiple-choice questions.

Here are the strict rules for the JSON generation:

**1. ID Generation & Sequencing**
* Determine the primary subject of the URL and create a relevant 2–3-letter prefix
  (e.g., "db" for databases, "py" for Python, "bio" for biology).
* Format the `id` field using this prefix and a 3-digit zero-padded sequence starting
  at 001 (e.g., "py-q001", "py-q002").

**2. Question Structure**
* `question`: Formulate a clear, direct question based on the content.
* `answer`: Provide the exact, correct answer.
* `options`: Provide exactly 4 plausible choices as an array of strings.
  One of these strings must identically match the `answer`.

**3. Metadata & Typing**
* `category`: Set this to the overall capitalized topic of the URL
  (e.g., "Python", "Biology", "Networking").
* `type`: Must be set exactly to "QUIZ_SIMPLE".
* `level`: Assign exactly "Beginner", "Intermediate", or "Advanced"
  based on the complexity of the specific question.

**4. Output Format**
Output ONLY the raw, valid JSON array [ ... ] without any markdown code fences,
so it can be copied and saved directly.

Expected object structure:
{
  "id": "xx-q001",
  "question": "What is the primary function of...?",
  "answer": "The correct concept.",
  "options": [
    "A plausible distractor.",
    "The correct concept.",
    "Another distractor.",
    "A final distractor."
  ],
  "category": "Subject Name",
  "type": "QUIZ_SIMPLE",
  "level": "Intermediate"
}

Here is the URL to process. Please generate [NUMBER] questions from this source:

[URL]
```

---

### Step 2 — QUIZ_SIMPLE JSON → Full Category JSON (all 3 types)

> Feed the output of Step 1 into this prompt to expand into QUIZ_SIMPLE + TRUE_FALSE + FILL_THE_BLANK variants.

```
Act as an expert instructional designer and JSON data formatter. I am going to provide you
with a source JSON array of "QUIZ_SIMPLE" questions. Your task is to transform it into a
single, unified JSON array that contains three variations of EVERY original question.

Here are the strict rules for the transformation:

**1. General Formatting & IDs**
* Output a single, flat JSON array [ ... ] containing all generated questions.
* Retain the ID prefix from the source (e.g., if the source uses "db-q001", use "db-").
* Continuous ID Sequencing: IDs must be perfectly sequential across the entire output
  array, zero-padded to three digits (001, 002, 003…). Do not reset between types.
* Add an "explanation" field to EVERY question explaining why the answer is correct
  (or why a statement is false).
* Maintain the original "category" and "level" fields for all variations.

**2. Question Type 1 — Enhanced QUIZ_SIMPLE**
* Replicate the original question, answer, and options.
* Set "type" to "QUIZ_SIMPLE".
* Add the "explanation" field.

**3. Question Type 2 — TRUE_FALSE**
* Convert the core concept into a factual statement starting with "True or False: ".
* The 50% Rule: Deliberately alter facts in at least 50% of statements so they are
  subtly incorrect and their correct answer is "False".
* Set "answer" to "True" or "False" accordingly.
* Set "options" exactly to: ["True", "False"].
* Set "type" to "TRUE_FALSE".
* Ensure the "explanation" clarifies the trick for "False" statements.

**4. Question Type 3 — FILL_THE_BLANK**
* Rewrite the question replacing the core concept or key term with "______".
* Set "answer" to the exact missing term.
* Provide exactly 4 brief, distinct items in "options" (including the correct answer).
* Set "type" to "FILL_THE_BLANK".

Output ONLY the raw, valid JSON array without any markdown code fences,
so it can be copied and saved directly.

Here is the source JSON to process:

[PASTE STEP 1 OUTPUT HERE]
```
