# Collaborative Kanban Implementation

A real-time shared kanban board with React, TypeScript, FastAPI, and raw WebSockets.

## Run

```sh
docker compose up --build
```

Then open [http://localhost:5174](http://localhost:5174). Open it in two browser tabs to see add, edit, delete, and drag changes sync live.

The backend API is available at [http://localhost:8001](http://localhost:8001), with `/health`, `/board`, and `/ws`. To use different host ports, run for example `BACKEND_PORT=8000 FRONTEND_PORT=5173 docker compose up --build`.

## Architecture

FastAPI owns the single shared board in memory and exposes a WebSocket endpoint. Every client mutation is sent as a small typed action, the backend applies it under an async lock, then broadcasts the full board snapshot to all connected clients so new tabs and mid-session joiners converge quickly.

The frontend is a Vite React app. It fetches the current snapshot on load, keeps a WebSocket open for live updates, and uses native HTML drag-and-drop to move cards without introducing a kanban library.

## With More Time

I would add persisted storage, richer conflict handling for simultaneous edits, focused unit tests around backend mutations, and Playwright coverage for the two-tab collaboration demo.
