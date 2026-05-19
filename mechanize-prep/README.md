# Mechanize Take-Home Prep

**Interview:** Wednesday, May 20, 2026
- 12:00 PM PDT — Solo work block (3 hours, repo access auto-revoked at end)
- 3:30 PM PDT — 1-hour code review call (30 min break in between)

**Stack:** React (frontend) + FastAPI (backend) + Docker

**GitHub username on file:** `offDaCharts`

---

## What the test is really measuring

Mechanize's own pitch: *"Most engineers lose to AI on our take-home. We're hiring the ones who don't."*

The grading is essentially:
- Can you direct an AI coding agent fast enough to ship in 3 hours?
- Do you actually understand the code you ship?
- The **1-hour follow-up call is the real interview** — they will ask "why this?", "explain line 47", and "change behavior X live." Anyone who let the agent drive blind gets caught here.

Hard-removal of repo access at 3h sharp = budget needs ~15 min slack for final commit/push.

---

## The big tell from the email: tldraw + yjs

They explicitly banned **tldraw** (canvas/whiteboard) and **yjs** (CRDT real-time collab).

That points hard at the project being one of:
- Collaborative whiteboard / canvas (most likely)
- Multi-user document or notes editor
- Real-time diagramming or sticky-notes board

Expect: canvas/SVG rendering + WebSocket-based multi-user sync + persistence.
Docker requirement suggests multi-service local setup (frontend + backend + maybe db/redis), tested with two browser tabs.

---

## 4-day prep plan

### Sat–Sun (May 16–17) — stack fluency
Build a tiny throwaway React + FastAPI + Docker Compose project end-to-end so I'm never debugging *setup* on Wednesday.

Specifically practice:
- FastAPI WebSocket endpoints (`websockets`, broadcasting to connected clients, room/session concept)
- React + canvas/SVG — mouse events, drawing shapes, pan/zoom
- React state for collaborative state (just `useState`/`useReducer` + WebSocket messages — no Redux)
- `docker-compose.yml` running both services with hot reload

### Monday (May 18) — timed practice run
Do a **timed 3-hour mock** of building a minimal collab whiteboard:
- Two users connect, draw rectangles, see each other's strokes in real time
- State persists on refresh

### Tuesday (May 19) — AI workflow + interview prep
- Pick AI tool (Cursor or Claude Code), pre-configure model/settings
- Practice habit: read every line before committing, pause agent to ask "explain this"
- Prep verbal answers for likely review questions (see below)

---

## Tactical execution — the 3 hours

Finish a working slice early, then improve.

| Time | Goal |
|---|---|
| 0:00–0:15 | Read README **twice**. Write 5-line plan in scratch file. Must-have vs stretch. |
| 0:15–0:45 | Project scaffold: docker-compose up runs both services, hello-world endpoint hits, websocket connects. |
| 0:45–1:45 | Core feature happy-path end-to-end (even if ugly). |
| 1:45–2:30 | Multi-user / real-time correctness. Test with 2 browser tabs. |
| 2:30–2:50 | Polish + edge cases + README on architectural choices. |
| 2:50–3:00 | Final commit + push. **Do not start something new in last 30 min.** |

**Hard rules:**
- Commit every 15–20 min so nothing is ever at risk
- A working ugly thing beats a broken elegant thing
- Note tradeoffs out loud (commits/comments) — those become interview talking points

---

## Code review hour — questions to expect

Prep an answer for each:

1. **"Walk me through the architecture."** ← Have a 2-min version ready.
2. **"Why WebSockets over polling/SSE?"**
3. **"What happens if two users edit the same thing at once?"** (last-write-wins is fine *if I can articulate the tradeoff*)
4. **"How would you scale this to 1,000 concurrent users?"**
5. **"There's a bug — when I do X, Y happens. Fix it live."** (Most stressful. Practice debugging while narrating.)
6. **"Show me code the AI wrote that you don't fully understand."** ← TRAP. Better answer: "I understand all of it — here's a part I rewrote because the AI's first attempt did X badly."
7. **"What would you do with another 3 hours?"**

Single best signal: **edit code live, confidently, in front of them.** Run it, break it, fix it. Don't be precious about AI-generated code.

---

## Practice plan with Claude

1. **Stack drill (today/tomorrow)** — walk through building a minimal React + FastAPI + WebSocket + Docker collab whiteboard so the patterns are in muscle memory.
2. **Mock take-home (Monday)** — Claude writes a Mechanize-style README for a similar (not identical) prompt, I build it in 3 hours timed, then brutal code review.
3. **Q&A drill (Tuesday)** — Claude throws likely review questions, I answer, gets pushback on weak answers.
