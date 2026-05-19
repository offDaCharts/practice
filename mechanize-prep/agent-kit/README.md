# Agent Kit

Four small drop-in files to keep an AI coding agent on a plan-first workflow with auditable decisions. Built originally for take-home interviews but useful for any greenfield or feature work.

## The files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Auto-loaded by Claude Code. Generic project guardrails — fill in stack/commands/banned-libs per project. |
| `PLAN.md` | Template the agent fills in before writing code. Forces a plan-first habit. |
| `DECISIONS.md` | Running log of non-obvious choices and the *why* behind each. |
| `START_PROMPT.md` | Opening message to paste into Claude Code. |

## Drop-in procedure for any new project

1. `cd` into the project directory (cloned repo, fresh scaffold, whatever).
2. Copy the four files in:
   ```sh
   cp <path-to>/agent-kit/*.md .
   ```
3. Open `CLAUDE.md`, fill in **Stack**, **Commands**, and **Banned libraries**.
4. Open `START_PROMPT.md`, fill in the `<...>` placeholders.
5. Launch Claude Code, paste the START_PROMPT contents, run it.
6. Agent reads the task, writes `PLAN.md`, stops. Review the plan, iterate, approve.
7. Build. `DECISIONS.md` accumulates as the agent makes non-obvious choices.

## Design principles

- **Keep CLAUDE.md short.** Compliance drops sharply past ~60-80 lines. Use it for universal rules; put project specifics in the stack/commands/banned sections; put deep details in linked docs.
- **One job per file.** CLAUDE.md = rules, PLAN.md = strategy, DECISIONS.md = log, START_PROMPT = ignition.
- **Plan-first beats vibe-coding.** A 5-minute plan review prevents 30 minutes of going the wrong direction.
- **The decisions log is the secret weapon.** Silent agent choices become visible, auditable, and (in a review setting) explainable.

## What's intentionally NOT here

- No hooks / settings.json. Worth adding for long-lived projects; overkill for short-lived ones.
- No test scaffolding. Add per-project if the task calls for it.
- No code style rules. That's a linter's job; CLAUDE.md isn't the place to spend the instruction budget.
