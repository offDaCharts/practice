from __future__ import annotations

import asyncio
import uuid
from typing import Literal

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


ColumnId = Literal["backlog", "in_progress", "done"]
COLUMNS: list[dict[str, str]] = [
    {"id": "backlog", "title": "Backlog"},
    {"id": "in_progress", "title": "In Progress"},
    {"id": "done", "title": "Done"},
]


class Card(BaseModel):
    id: str
    text: str


class BoardState(BaseModel):
    columns: dict[ColumnId, list[Card]]


class AddCardPayload(BaseModel):
    columnId: ColumnId
    text: str = Field(min_length=1, max_length=200)


class EditCardPayload(BaseModel):
    cardId: str
    text: str = Field(min_length=1, max_length=200)


class DeleteCardPayload(BaseModel):
    cardId: str


class MoveCardPayload(BaseModel):
    cardId: str
    toColumnId: ColumnId
    toIndex: int = Field(ge=0)


class ClientMessage(BaseModel):
    type: Literal["add_card", "edit_card", "delete_card", "move_card"]
    payload: AddCardPayload | EditCardPayload | DeleteCardPayload | MoveCardPayload


def initial_state() -> BoardState:
    return BoardState(
        columns={
            "backlog": [
                Card(id=str(uuid.uuid4()), text="Draft project outline"),
                Card(id=str(uuid.uuid4()), text="Invite another tab to collaborate"),
            ],
            "in_progress": [Card(id=str(uuid.uuid4()), text="Build live board")],
            "done": [Card(id=str(uuid.uuid4()), text="Read the brief")],
        }
    )


class BoardStore:
    def __init__(self) -> None:
        self._state = initial_state()
        self._lock = asyncio.Lock()

    def snapshot(self) -> dict:
        return {
            "columns": COLUMNS,
            "cardsByColumn": {
                column_id: [card.model_dump() for card in cards]
                for column_id, cards in self._state.columns.items()
            },
        }

    async def apply(self, message: ClientMessage) -> dict:
        async with self._lock:
            if message.type == "add_card":
                payload = AddCardPayload.model_validate(message.payload)
                text = payload.text.strip()
                if not text:
                    return self.snapshot()
                card = Card(id=str(uuid.uuid4()), text=text)
                self._state.columns[payload.columnId].append(card)
            elif message.type == "edit_card":
                payload = EditCardPayload.model_validate(message.payload)
                text = payload.text.strip()
                if not text:
                    return self.snapshot()
                for cards in self._state.columns.values():
                    for card in cards:
                        if card.id == payload.cardId:
                            card.text = text
                            break
            elif message.type == "delete_card":
                payload = DeleteCardPayload.model_validate(message.payload)
                for column_id, cards in self._state.columns.items():
                    self._state.columns[column_id] = [
                        card for card in cards if card.id != payload.cardId
                    ]
            elif message.type == "move_card":
                payload = MoveCardPayload.model_validate(message.payload)
                moved_card: Card | None = None
                source_column_id: ColumnId | None = None
                source_index: int | None = None
                for column_id, cards in self._state.columns.items():
                    for index, card in enumerate(cards):
                        if card.id == payload.cardId:
                            moved_card = cards.pop(index)
                            source_column_id = column_id
                            source_index = index
                            break
                    if moved_card:
                        break

                if moved_card:
                    destination = self._state.columns[payload.toColumnId]
                    insert_at = payload.toIndex
                    if source_column_id == payload.toColumnId and source_index is not None:
                        if source_index < insert_at:
                            insert_at -= 1
                    insert_at = min(max(insert_at, 0), len(destination))
                    destination.insert(insert_at, moved_card)

            return self.snapshot()


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, message: dict) -> None:
        stale: list[WebSocket] = []
        for websocket in self._connections:
            try:
                await websocket.send_json(message)
            except RuntimeError:
                stale.append(websocket)

        for websocket in stale:
            self.disconnect(websocket)


app = FastAPI(title="Collaborative Kanban API")
store = BoardStore()
connections = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/board")
async def board() -> dict:
    return store.snapshot()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await connections.connect(websocket)
    await websocket.send_json({"type": "board", "board": store.snapshot()})
    try:
        while True:
            data = await websocket.receive_json()
            message = ClientMessage.model_validate(data)
            board_state = await store.apply(message)
            await connections.broadcast({"type": "board", "board": board_state})
    except WebSocketDisconnect:
        connections.disconnect(websocket)
