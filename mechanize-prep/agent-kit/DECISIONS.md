# Decisions Log

> Agent: append a 1-line entry every time you make a non-obvious choice. Format:
>
> `**[HH:MM] <decision>** — <why, one sentence>`
>
> This file is my code-review cheat sheet. Keep entries crisp.

## Examples (delete before final)

- `**[00:23] Using WebSocket over SSE** — bidirectional, simpler for echoing client updates back to all peers.`
- `**[00:47] State stored in-memory on backend (dict keyed by room_id)** — no DB needed for 3hr scope; persistence is a stretch goal.`
- `**[01:30] Last-write-wins on conflicting edits** — simplest correct policy; CRDT/OT is out of scope, called out in PLAN.md deferred list.`

## Decisions

_(start here)_
