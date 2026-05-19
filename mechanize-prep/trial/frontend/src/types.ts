export type ColumnId = 'backlog' | 'in_progress' | 'done';

export type Card = { id: string; text: string };

export type Board = { columns: Record<ColumnId, Card[]> };

export type Action =
  | { type: 'add_card'; column: ColumnId; text: string }
  | { type: 'edit_card'; id: string; text: string }
  | { type: 'delete_card'; id: string }
  | { type: 'move_card'; id: string; to_column: ColumnId; to_index: number };
