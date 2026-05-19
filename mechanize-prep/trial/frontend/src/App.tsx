import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { useBoard } from './useBoard';
import type { Board, ColumnId } from './types';

const COLUMN_TITLES: Record<ColumnId, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  done: 'Done',
};

const COLUMN_ORDER: ColumnId[] = ['backlog', 'in_progress', 'done'];
const COLUMN_IDS = new Set<string>(COLUMN_ORDER);

function isColumnId(id: string): id is ColumnId {
  return COLUMN_IDS.has(id);
}

function findCard(board: Board, cardId: string): { col: ColumnId; idx: number } | null {
  for (const col of COLUMN_ORDER) {
    const idx = board.columns[col].findIndex((c) => c.id === cardId);
    if (idx !== -1) return { col, idx };
  }
  return null;
}

export default function App() {
  const { board, connected, send, pause, resume } = useBoard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (!board) return <div className="loading">Connecting…</div>;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    pause();
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) {
      resume();
      return;
    }
    const draggedId = String(active.id);
    const overId = String(over.id);
    const from = findCard(board, draggedId);
    if (!from) {
      resume();
      return;
    }
    let toCol: ColumnId;
    let toIdx: number;
    if (isColumnId(overId)) {
      toCol = overId;
      toIdx = board.columns[toCol].length;
    } else {
      const overLoc = findCard(board, overId);
      if (!overLoc) {
        resume();
        return;
      }
      toCol = overLoc.col;
      toIdx = overLoc.idx;
    }
    if (from.col !== toCol || from.idx !== toIdx) {
      send({ type: 'move_card', id: draggedId, to_column: toCol, to_index: toIdx });
    }
    resume();
  };

  const onDragCancel = () => {
    setActiveId(null);
    resume();
  };

  const activeLoc = activeId ? findCard(board, activeId) : null;
  const activeCard = activeLoc ? board.columns[activeLoc.col][activeLoc.idx] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="app">
        {!connected && <div className="banner">Reconnecting…</div>}
        <h1>Kanban</h1>
        <div className="columns">
          {COLUMN_ORDER.map((col) => (
            <Column
              key={col}
              id={col}
              title={COLUMN_TITLES[col]}
              cards={board.columns[col]}
              send={send}
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="card card-overlay">
            <span className="card-text">{activeCard.text}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
