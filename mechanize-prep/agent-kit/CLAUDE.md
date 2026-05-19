# Project

> One sentence on what this project does and who uses it.

## Stack

> Language(s), framework(s), data store, deploy target.

## Commands

> Fill in once known.

- Dev: `...`
- Test: `...`
- Build: `...`
- Lint / format: `...`

## How to work here

- **Plan before non-trivial work.** For anything beyond a small change, sketch the approach in `PLAN.md` (or in chat) and confirm direction before writing code. Skip this for obvious one-liners.
- **Log non-obvious decisions** as you make them — library choice, data model, conflict policy, an explicit tradeoff. Append a one-line entry to `DECISIONS.md` with the **why**.
- **Make tradeoffs explicit.** "Option A is faster to ship but doesn't handle X; Option B is more correct but adds time." Surface the choice; don't silently pick.
- **Boring beats clever.** Prefer the most direct solution that works. Introduce abstractions when there's real repetition, not in anticipation.
- **Verify before declaring done.** Run the project, exercise the happy path end-to-end, and confirm the README still reflects how to run it.

## Don't

- Don't reach for a library that solves the core problem for you when the point is to build it. See the banned list below.
- Don't silently expand scope. If you notice unrelated issues, mention them; don't quietly fix them in the same change.
- Don't swallow errors in empty `try`/`except` (or `catch`) blocks. Let them bubble, or log them where someone will see them.
- Don't introduce a heavyweight state library (Redux, Zustand, etc.) unless the project already uses one or it's clearly justified.

### Banned / discouraged libraries

> Fill in per project. Examples: `tldraw`, `yjs`, or anything that would do the core assignment for you.
