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

````
Act as an expert instructional designer, I.T. interview prep specialist, and JSON data formatter. I am going to provide you with a URL. Your task is to extract the key facts, concepts, or tutorials from that page and convert them into a JSON array of multiple-choice questions.

Aim to formulate questions that mirror the top, most updated I.T. interview questions, assuming the provided URL pursues this exact objective.

Here are the strict rules for the JSON generation:

**1. ID Generation & Sequencing**
* Determine the primary subject of the URL and create a relevant 2–3-letter prefix (e.g., "db" for databases, "py" for Python, "bio" for biology).
* Format the `id` field using this prefix and a 3-digit zero-padded sequence starting at 001 (e.g., "py-q001", "py-q002").

**2. Question Structure & Quality**
* `question`: Formulate a clear, direct question based on the content, ensuring it reflects the caliber of professional I.T. interview questions.
* `answer`: Provide the exact, correct answer.
* `options`: Provide exactly 4 plausible choices as an array of strings. One of these strings must identically match the `answer`.

**3. Metadata & Typing**
* `category`: Set this to the overall capitalized topic of the URL (e.g., "Python", "Database", "Networking").
* `type`: Must be set exactly to "QUIZ_SIMPLE".
* `level`: Assign exactly "Beginner", "Intermediate", or "Advanced" based on the complexity of the specific question.

**4. Quantity**
* Do not arbitrarily limit your extraction to a small number of questions. Many source URLs share 30, 40, or 50+ questions. Extract and generate as many high-quality questions as the source material supports. I want them ALL (Max 70 questions).

**5. Output Format**
* Output the valid JSON array enclosed within a markdown code block (i.e., ```json [ ... ] ```).
* Do not include any conversational filler outside the code box.

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

Here is the URL to process. Please extract ALL available questions from this source:

[INSERT URL HERE]
````

---

### Step 2 — QUIZ_SIMPLE JSON → Full Category JSON (all 3 types)

> Feed the output of Step 1 into this prompt to expand into QUIZ_SIMPLE + TRUE_FALSE + FILL_THE_BLANK variants.

````
Act as an expert instructional designer and JSON data formatter. I am going to provide you with a source JSON array of "QUIZ_SIMPLE" questions. This provided array is your **UNIQUE SOURCE** of truth.

Your task is strictly to rephrase (re-verbose) the existing questions to generate two additional question types ("TRUE_FALSE" and "FILL_THE_BLANK") based on the original "QUIZ_SIMPLE" items. You must output a single, unified JSON array.

**Critical Constraint:** The total number of questions in your output must be exactly **Source Count * 3**. Do not skip any original questions, and do not invent new questions from outside the provided source material.

Here are the strict rules for the transformation:

**1. General Formatting, IDs, & Array Ordering**
* **Array Ordering:** The final JSON array MUST be grouped strictly by question type in this exact order:
  1. ALL original "QUIZ_SIMPLE" questions pasted directly.
  2. ALL newly generated "TRUE_FALSE" questions.
  3. ALL newly generated "FILL_THE_BLANK" questions.
* Quantity: The final array must contain exactly 3 variations for every 1 source question.
* Output a single, flat JSON array `[ ... ]` containing all generated questions.
* Retain the ID prefix from the source (e.g., if the source uses "db-q001", use "db-").
* Continuous ID Sequencing: IDs must be perfectly sequential across the entire output array, zero-padded to three digits (e.g., 001, 002, 003…). Do not reset the counter between question types (e.g., if there are 50 simple questions, the first True/False question must be 051).
* Maintain the original "category" and "level" fields for all variations.

**2. Question Type 1 — Enhanced QUIZ_SIMPLE (First Group)**
* Paste the original question, answer, and options directly exactly as provided in the source.
* Set "type" to "QUIZ_SIMPLE".
* Add an "explanation" field explaining why the answer is correct.

**3. Question Type 2 — TRUE_FALSE (Second Group)**
* Re-verbose/rephrase the core concept of the original source question into a factual statement starting with "True or False: ".
* The 50% Rule: Deliberately alter facts in at least 50% of these statements so they are subtly incorrect and their correct answer is "False".
* Set "answer" to "True" or "False" accordingly.
* Set "options" exactly to: ["True", "False"].
* Set "type" to "TRUE_FALSE".
* Add an "explanation" field to clarify the rule and ensure it explains the trick for "False" statements.

**4. Question Type 3 — FILL_THE_BLANK (Third Group)**
* Re-verbose/rewrite the original source question by replacing the core concept or key term with a blank ("______").
* Set "answer" to the exact missing term.
* Provide exactly 4 brief, distinct items in "options" (including the correct answer).
* Set "type" to "FILL_THE_BLANK".
* Add an "explanation" field explaining why the answer is correct.

**5. Output Format**
* Output the valid JSON array enclosed within a markdown code block (i.e., ```json [ ... ] ```).
* Do not include any conversational filler outside the code box.

Here is the source JSON to process:

[PASTE YOUR SOURCE JSON HERE]
````
