import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Action, Card } from './types';

type Props = { card: Card; send: (a: Action) => void };

export function CardItem({ card, send }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (!editing) setDraft(card.text);
  }, [card.text, editing]);

  const commit = () => {
    const text = draft.trim();
    if (text && text !== card.text) {
      send({ type: 'edit_card', id: card.id, text });
    } else {
      setDraft(card.text);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(card.text);
    setEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="card"
      {...attributes}
      {...listeners}
    >
      {editing ? (
        <input
          className="card-edit"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
        />
      ) : (
        <span
          className="card-text"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {card.text}
        </span>
      )}
      <button
        className="card-delete"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          send({ type: 'delete_card', id: card.id });
        }}
        aria-label="Delete card"
      >
        ×
      </button>
    </li>
  );
}
