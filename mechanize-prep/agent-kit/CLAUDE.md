# Project Context

This is a **3-hour timed take-home interview**. After 3 hours, the repo is locked. Immediately after, there is a **1-hour code review call** where I must:
- Demo the running app
- Walk through the architecture in 2 minutes
- Explain any line on demand
- Modify behavior live in the call

**Therefore: I must understand every line of code in this repo.** Code that I cannot explain on the spot is worse than no code at all.

---

## Workflow you (the agent) must follow

1. **Plan first.** Read `PLAN.md` — if empty, fill it in with a short plan and stop. Wait for my approval before writing code.
2. **Small steps.** After each meaningful change, stop and confirm with me. Do not chain 5 tasks in one go.
3. **Log decisions.** Every time you make a non-obvious choice (library pick, data model, conflict resolution strategy, etc.), add a 1-line entry to `DECISIONS.md` with the **why**. This is my review prep.
4. **Commit every 15–20 min.** Use clear messages. We cannot lose work to the timer.
5. **Pre-flight before declaring done:**
   - `docker compose up` works from a fresh clone
   - Happy path works in 2 browser tabs
   - README updated with run instructions + a short architecture note

---

## Code style rules

- **No unexplained magic.** If a line isn't obvious, write a one-line comment with WHY (not WHAT).
- **Boring beats clever.** Prefer the most straightforward solution that works. No premature abstractions.
- **Simple state.** Default to `useState` / `useReducer` + WebSocket messages. No Redux, Zustand, etc. unless I explicitly approve.
- **No try/except swallowing.** Let errors bubble; log them visibly.
- **Type hints in FastAPI, TypeScript everywhere in React.**

---

## Banned / discouraged libraries

> Fill this in from the take-home README before starting.

Examples we already know about: **tldraw**, **yjs**, anything that "trivializes" the core assignment.

If you're tempted to reach for a library that does the core task for us, **stop and ask**.

---

## When in doubt

- Ask me. A 30-second clarifying question beats 20 minutes building the wrong thing.
- Surface tradeoffs explicitly: "Option A is faster to ship but doesn't handle concurrent edits well; Option B is more correct but adds 30 min."
- Never silently change scope.
