import asyncio
import json
import uuid
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

COLUMNS = ("backlog", "in_progress", "done")

SEED = {
    "backlog": [
        "Add user presence indicators",
        "Persist board across restarts (SQLite)",
        "Mobile-friendly layout",
    ],
    "in_progress": [
        "Build collaborative kanban",
        "Wire up real-time WebSocket sync",
    ],
    "done": [
        "Pick the stack (React + FastAPI)",
        "Sketch the architecture",
    ],
}

board: dict = {
    "columns": {
        col: [{"id": str(uuid.uuid4()), "text": t} for t in SEED[col]] for col in COLUMNS
    }
}
board_lock = asyncio.Lock()
clients: Set[WebSocket] = set()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}


def _find_card(card_id: str):
    for col, cards in board["columns"].items():
        for i, c in enumerate(cards):
            if c["id"] == card_id:
                return col, i, c
    return None, None, None


def _apply_action(msg: dict) -> bool:
    t = msg.get("type")
    if t == "add_card":
        col = msg.get("column")
        text = (msg.get("text") or "").strip()
        if col not in board["columns"]:
            return False
        board["columns"][col].append({"id": str(uuid.uuid4()), "text": text})
        return True
    if t == "edit_card":
        _, _, card = _find_card(msg.get("id"))
        if card is None:
            return False
        card["text"] = msg.get("text") or ""
        return True
    if t == "delete_card":
        col, idx, _ = _find_card(msg.get("id"))
        if col is None:
            return False
        board["columns"][col].pop(idx)
        return True
    if t == "move_card":
        to_col = msg.get("to_column")
        if to_col not in board["columns"]:
            return False
        col, idx, card = _find_card(msg.get("id"))
        if col is None:
            return False
        board["columns"][col].pop(idx)
        to_idx = msg.get("to_index", len(board["columns"][to_col]))
        target = board["columns"][to_col]
        to_idx = max(0, min(int(to_idx), len(target)))
        target.insert(to_idx, card)
        return True
    return False


async def _broadcast_state() -> None:
    payload = json.dumps({"type": "state", "board": board})
    for ws in list(clients):
        try:
            await ws.send_text(payload)
        except Exception:
            clients.discard(ws)


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)
    await websocket.send_text(json.dumps({"type": "state", "board": board}))
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                continue
            async with board_lock:
                changed = _apply_action(msg)
            if changed:
                await _broadcast_state()
    except WebSocketDisconnect:
        pass
    finally:
        clients.discard(websocket)
