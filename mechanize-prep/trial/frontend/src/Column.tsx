import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CardItem } from './CardItem';
import type { Action, Card, ColumnId } from './types';

type Props = {
  id: ColumnId;
  title: string;
  cards: Card[];
  send: (a: Action) => void;
};

export function Column({ id, title, cards, send }: Props) {
  const { setNodeRef } = useDroppable({ id });
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    send({ type: 'add_card', column: id, text });
    setDraft('');
  };

  return (
    <div ref={setNodeRef} className="column">
      <div className="column-header">
        <span>{title}</span>
        <span className="column-count">{cards.length}</span>
      </div>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} send={send} />
          ))}
        </ul>
      </SortableContext>
      <input
        className="add-card"
        placeholder="Add a card…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
    </div>
  );
}
