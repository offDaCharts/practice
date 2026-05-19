# Agent Kit — Take-Home Drop-In Files

Four small files designed to be dropped into any take-home repo to keep an AI coding agent on the rails.

## The files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Auto-loaded by Claude Code. Defines workflow, code style, and "must understand every line" guardrails. |
| `PLAN.md` | Template the agent fills in **before writing code**. Forces plan-first workflow. |
| `DECISIONS.md` | Running log of non-obvious choices + the why. Becomes the code-review cheat sheet. |
| `START_PROMPT.md` | Exact opening message to paste into Claude Code. |

## On interview day — drop-in procedure

1. Clone Mechanize repo, `cd` into it.
2. `cp ~/Documents/GitHub/practice/mechanize-prep/agent-kit/*.md .`
3. Open `CLAUDE.md`, fill in the **banned libraries** section from their README.
4. Open `START_PROMPT.md`, fill in placeholders, copy the prompt body.
5. Launch Claude Code, paste prompt, hit go.
6. Agent reads their README → fills `PLAN.md` → stops. **You review the plan.** Iterate if wrong direction.
7. Approve plan, build. Watch `DECISIONS.md` grow.
8. At the end: scan `DECISIONS.md` — that's your verbal walkthrough for the review hour.

## Design principles behind the kit

- **<300 lines total across all files.** Agent compliance drops sharply with bloated CLAUDE.md.
- **One job per file.** CLAUDE.md = rules, PLAN.md = strategy, DECISIONS.md = log, START_PROMPT = ignition.
- **Plan-first is non-negotiable.** Skipping this is how candidates "lose to AI" — agent ships something they can't defend.
- **The decisions log is the secret weapon.** It converts the agent's silent choices into your spoken talking points.

## What's intentionally NOT here

- No hooks / settings.json — no time to debug those during the interview.
- No test scaffolding — out of scope for 3hrs; add only if the prompt asks for it.
- No linter / formatter config — agent should follow conventions of whatever scaffold their repo ships with.
