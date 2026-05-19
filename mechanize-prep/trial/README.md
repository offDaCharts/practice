# Collaborative Kanban Board

Real-time, multi-user kanban board. Three fixed columns (Backlog / In Progress / Done) shared by all connected clients; changes broadcast to every tab/machine within ~1s.

## Run

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000 (WebSocket at `/ws`)

Open the frontend in two tabs (or two machines) — edits in one appear in the other. State survives a page refresh; a backend restart wipes it (in-memory only).

## Architecture

The backend (FastAPI + uvicorn) holds a single in-memory `Board` object and accepts WebSocket connections at `/ws`. On any mutation (add / edit / delete / move), it broadcasts the full updated state to every connected client — one source of truth, no diffing. The frontend (React + TypeScript) opens one WS via a `useBoard` hook, mirrors server state, and renders three columns with `@dnd-kit/sortable`. Each column is a `useDroppable` wrapping a `SortableContext`; collision uses `closestCorners`; the dragged card follows the cursor via a portal-rendered `DragOverlay`. On disconnect the client reconnects with exponential backoff (1s → 10s cap) and shows a banner; the server's first `state` message on reconnect catches it back up. While a drag is active, incoming WS updates are buffered and applied on drag end so a co-editor's broadcast can't yank the card mid-gesture.

## Protocol

Single WebSocket, JSON messages.

- **Server → client:** `{ "type": "state", "board": { columns: { backlog, in_progress, done: Card[] } } }`
- **Client → server:**
  - `{ "type": "add_card", "column": "...", "text": "..." }`
  - `{ "type": "edit_card", "id": "...", "text": "..." }`
  - `{ "type": "delete_card", "id": "..." }`
  - `{ "type": "move_card", "id": "...", "to_column": "...", "to_index": N }`

The server applies the action and broadcasts the full new state. Stale ids (e.g. delete-after-delete) are no-ops; clients receive nothing in that case.

## What I'd do differently with more time

- **Real persistence.** Drop in SQLite via SQLAlchemy so a container restart doesn't wipe the board.
- **Diff-based sync.** Broadcasting the full board on every mutation is fine for tens of cards but won't scale. Send per-card patches or action echoes.
- **Optimistic UI for moves.** There's a ~50ms perceptual gap on drop while the WS roundtrip completes. Applying the move locally and reconciling on the next broadcast would feel instant.
- **Per-card edit awareness / soft locking.** A second user can clobber your edit mid-typing. A "X is editing" indicator and last-write-wins-with-warning would be a small but real polish.
- **Tests in CI.** I built with a Python WS smoke test that exercised add/edit/delete/move/reconnect/late-join. That belongs as a real test job.

## Stack

- Backend: Python 3.12, FastAPI, uvicorn (with `--reload` for dev)
- Frontend: React 18 + TypeScript, Vite, `@dnd-kit/core` + `@dnd-kit/sortable`
- Containers: Docker Compose; volumes mount source dirs so HMR works inside the containers
