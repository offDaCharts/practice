# Take-Home: Collaborative Kanban Board

Build a real-time, multi-user kanban board. Multiple users connected to the same board should see each other's changes live.

## Stack

- **Frontend:** React (TypeScript)
- **Backend:** FastAPI
- **Containerization:** Docker (must run with `docker compose up`)

## Functional requirements

A board has three fixed columns: **Backlog**, **In Progress**, **Done**.

A user can:
1. **Add a card** to any column. A card has text content (single line is fine).
2. **Edit a card's text** by clicking it.
3. **Delete a card.**
4. **Drag a card** from one column to another. Order within a column matters and persists.

The board is **shared and live**:
- Two browser tabs (or two machines) connected to the same board URL must see each other's changes within ~1 second.
- State must persist when the page is refreshed.
- A user joining mid-session should receive the current state of the board.

There is no auth, no accounts, no multiple boards required. Single shared board, all users on the same page.

## Constraints

- **Banned libraries** (these trivialize the assignment):
  - `yjs`, `automerge`, or any CRDT/OT library
  - `react-trello`, `react-kanban`, or any full kanban-as-a-library solution
  - `socket.io` is OK; raw WebSockets is fine too
  - Drag-and-drop primitives (e.g., `react-dnd`, `dnd-kit/core`) are OK — drag UX is not the test
- **No external database service required** — in-memory backend state is acceptable for this scope. If you want persistence-across-restart, SQLite via SQLAlchemy is fine, but not required.

## Deliverables

- A repo where `docker compose up` from the root brings up both frontend and backend.
- A short README with:
  - How to run it
  - 2–4 sentences on the architecture
  - Anything you'd do differently with more time

## Code review (follow-up call)

You will be asked to:
- Run and demo the app live (open two tabs, show real-time sync)
- Walk through the architecture in 2 minutes
- Explain any specific section on request
- Make a small change to behavior live in the call

---

## Time

You have **2 hours**. (The real Mechanize task is 3, but this practice run is compressed.)

When the timer hits 2:00, stop coding and commit.
