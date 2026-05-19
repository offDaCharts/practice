# Run the Trial

Simulate the Mechanize take-home in a compressed 2-hour timer, then a code-review hour.

## Setup (before starting the timer)

1. Read [`trial/README.md`](trial/README.md) once, top to bottom — this is the task spec.
2. Copy the agent kit (including the `.gitignore`) into the trial directory:
   ```sh
   cd mechanize-prep/trial
   cp -R ../agent-kit/. .
   ```
   The trailing `/.` is intentional — it copies hidden files like `.gitignore` too.
3. Open `trial/CLAUDE.md` and fill in the **Banned / discouraged libraries** section using the list from the task README.
4. Open `trial/START_PROMPT.md` and replace the `<...>` placeholders.

## Run the trial

5. `cd mechanize-prep/trial` and start a fresh Claude Code session there.
6. **Start your timer (2 hours).**
7. Paste the filled-in `START_PROMPT.md` contents.
8. Agent reads the task README → fills `PLAN.md` → stops for approval.
9. Iterate on the plan until it's good, then approve and let it build.
10. **At 2:00 elapsed**, stop. Commit whatever's there.

## After the timer

Come back to your original Claude session (the one we've been chatting in) and say: **"trial done"**.

We'll do the review hour:
- Open the running app together
- You walk through the architecture
- I ask hard questions and request live changes
- Blunt feedback on what would land in the real review

## Layout during the trial

When you start the trial, `trial/` will contain:

```
trial/
├── README.md         ← the task spec (mimics a real cloned project repo)
├── CLAUDE.md         ← agent guardrails (auto-loaded)
├── PLAN.md           ← agent writes plan here first
├── DECISIONS.md      ← agent appends why-decisions here
├── START_PROMPT.md   ← the ignition prompt (already pasted)
├── .gitignore        ← project junk + kit working files
└── <agent-built code lives here at the trial dir root>
```

The agent builds the project at the `trial/` root — no separate build dir.

## What you'll learn

- Whether 2 hours is enough for a working slice (foreshadows whether 3h on the real task is comfortable or tight)
- Where your AI-direction skills break down
- What the agent will silently do that you can't defend later
- Whether `DECISIONS.md` is actually useful or just noise
