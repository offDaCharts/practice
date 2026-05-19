/// <reference types="vite/client" />

import React, { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Pencil, Plus, Trash2, Wifi, WifiOff, X } from "lucide-react";
import "./styles.css";

type ColumnId = "backlog" | "in_progress" | "done";

type Card = {
  id: string;
  text: string;
};

type Column = {
  id: ColumnId;
  title: string;
};

type Board = {
  columns: Column[];
  cardsByColumn: Record<ColumnId, Card[]>;
};

type DropTarget = {
  columnId: ColumnId;
  index: number;
};

type ClientMessage =
  | { type: "add_card"; payload: { columnId: ColumnId; text: string } }
  | { type: "edit_card"; payload: { cardId: string; text: string } }
  | { type: "delete_card"; payload: { cardId: string } }
  | { type: "move_card"; payload: { cardId: string; toColumnId: ColumnId; toIndex: number } };

const emptyBoard: Board = {
  columns: [
    { id: "backlog", title: "Backlog" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ],
  cardsByColumn: {
    backlog: [],
    in_progress: [],
    done: [],
  },
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const wsUrl = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws";

function App() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [drafts, setDrafts] = useState<Record<ColumnId, string>>({
    backlog: "",
    in_progress: "",
    done: "",
  });
  const [editing, setEditing] = useState<{ cardId: string; text: string } | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let retryTimer: number | undefined;
    let active = true;

    const connect = () => {
      setStatus("connecting");
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => setStatus("live");
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "board") {
          setBoard(message.board);
        }
      };
      socket.onclose = () => {
        if (!active) return;
        setStatus("offline");
        retryTimer = window.setTimeout(connect, 1000);
      };
      socket.onerror = () => socket.close();
    };

    fetch(`${apiUrl}/board`)
      .then((response) => response.json())
      .then(setBoard)
      .catch(() => undefined)
      .finally(connect);

    return () => {
      active = false;
      window.clearTimeout(retryTimer);
      socketRef.current?.close();
    };
  }, []);

  const cardCounts = useMemo(
    () => board.columns.reduce((total, column) => total + board.cardsByColumn[column.id].length, 0),
    [board],
  );

  const send = (message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const addCard = (event: FormEvent<HTMLFormElement>, columnId: ColumnId) => {
    event.preventDefault();
    const text = drafts[columnId].trim();
    if (!text) return;
    send({ type: "add_card", payload: { columnId, text } });
    setDrafts((current) => ({ ...current, [columnId]: "" }));
  };

  const saveEdit = () => {
    if (!editing) return;
    const text = editing.text.trim();
    if (text) {
      send({ type: "edit_card", payload: { cardId: editing.cardId, text } });
    }
    setEditing(null);
  };

  const handleEditKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") saveEdit();
    if (event.key === "Escape") setEditing(null);
  };

  const moveCard = (toColumnId: ColumnId, toIndex: number) => {
    if (!draggedCardId) return;
    send({ type: "move_card", payload: { cardId: draggedCardId, toColumnId, toIndex } });
    setDraggedCardId(null);
    setDropTarget(null);
  };

  const markColumnEnd = (event: React.DragEvent<HTMLElement>, columnId: ColumnId) => {
    event.preventDefault();
    if (!draggedCardId) return;
    setDropTarget({ columnId, index: board.cardsByColumn[columnId].length });
  };

  const markCardDrop = (
    event: React.DragEvent<HTMLElement>,
    columnId: ColumnId,
    cardIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedCardId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const afterCard = event.clientY > bounds.top + bounds.height / 2;
    setDropTarget({ columnId, index: cardIndex + (afterCard ? 1 : 0) });
  };

  const dropOnTarget = (event: React.DragEvent<HTMLElement>, fallback: DropTarget) => {
    event.preventDefault();
    event.stopPropagation();
    const target = dropTarget ?? fallback;
    moveCard(target.columnId, target.index);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Collaborative Kanban</h1>
          <p>{cardCounts} cards across one shared board</p>
        </div>
        <div className={`connection connection-${status}`} aria-live="polite">
          {status === "live" ? <Wifi size={18} /> : <WifiOff size={18} />}
          <span>{status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}</span>
        </div>
      </header>

      <section className="board" aria-label="Kanban board">
        {board.columns.map((column) => (
          <div
            className="column"
            key={column.id}
            onDragOver={(event) => markColumnEnd(event, column.id)}
            onDrop={(event) =>
              dropOnTarget(event, { columnId: column.id, index: board.cardsByColumn[column.id].length })
            }
          >
            <div className="column-header">
              <h2>{column.title}</h2>
              <span>{board.cardsByColumn[column.id].length}</span>
            </div>

            <form className="add-form" onSubmit={(event) => addCard(event, column.id)}>
              <input
                aria-label={`Add card to ${column.title}`}
                value={drafts[column.id]}
                maxLength={200}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [column.id]: event.target.value }))
                }
                placeholder="Add a card"
              />
              <button type="submit" aria-label={`Add card to ${column.title}`}>
                <Plus size={18} />
              </button>
            </form>

            <div className="card-list">
              {board.cardsByColumn[column.id].map((card, index) => (
                <React.Fragment key={card.id}>
                  <DropLine
                    active={dropTarget?.columnId === column.id && dropTarget.index === index}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDropTarget({ columnId: column.id, index });
                    }}
                    onDrop={(event) => dropOnTarget(event, { columnId: column.id, index })}
                  />
                  <article
                    className={`card ${draggedCardId === card.id ? "card-dragging" : ""}`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", card.id);
                      setDraggedCardId(card.id);
                    }}
                    onDragOver={(event) => markCardDrop(event, column.id, index)}
                    onDrop={(event) => dropOnTarget(event, { columnId: column.id, index })}
                    onDragEnd={() => {
                      setDraggedCardId(null);
                      setDropTarget(null);
                    }}
                  >
                    {editing?.cardId === card.id ? (
                      <input
                        className="edit-input"
                        value={editing.text}
                        maxLength={200}
                        autoFocus
                        onChange={(event) =>
                          setEditing({ cardId: card.id, text: event.target.value })
                        }
                        onBlur={saveEdit}
                        onKeyDown={handleEditKey}
                      />
                    ) : (
                      <button
                        className="card-text"
                        type="button"
                        onClick={() => setEditing({ cardId: card.id, text: card.text })}
                      >
                        {card.text}
                      </button>
                    )}

                    <div className="card-actions">
                      {editing?.cardId === card.id ? (
                        <>
                          <button type="button" aria-label="Save edit" onMouseDown={saveEdit}>
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label="Cancel edit"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setEditing(null);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            aria-label="Edit card"
                            onClick={() => setEditing({ cardId: card.id, text: card.text })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete card"
                            onClick={() => send({ type: "delete_card", payload: { cardId: card.id } })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                </React.Fragment>
              ))}
              <DropLine
                active={
                  dropTarget?.columnId === column.id &&
                  dropTarget.index === board.cardsByColumn[column.id].length
                }
                grow
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDropTarget({ columnId: column.id, index: board.cardsByColumn[column.id].length });
                }}
                onDrop={(event) =>
                  dropOnTarget(event, {
                    columnId: column.id,
                    index: board.cardsByColumn[column.id].length,
                  })
                }
              />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function DropLine({
  active = false,
  grow = false,
  onDragOver,
  onDrop,
}: {
  active?: boolean;
  grow?: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`drop-line ${grow ? "drop-line-grow" : ""} ${active ? "drop-line-active" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}

createRoot(document.getElementById("root")!).render(<App />);
