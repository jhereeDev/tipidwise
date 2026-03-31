import { getDatabase } from './client';
import type { Expense, ExpenseCategory } from '../../types/models';
import type { ExpenseFormState } from '../../types/forms';

function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as number,
    title: row.title as string,
    amount: row.amount as number,
    category: row.category as ExpenseCategory,
    date: row.date as string,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getExpenses(filters?: { month?: string; category?: ExpenseCategory; limit?: number }): Expense[] {
  const db = getDatabase();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.month) {
    conditions.push("strftime('%Y-%m', date) = ?");
    params.push(filters.month);
  }
  if (filters?.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters?.limit ? `LIMIT ${filters.limit}` : '';
  const sql = `SELECT * FROM expenses ${where} ORDER BY date DESC, created_at DESC ${limit}`;

  const rows = db.getAllSync<Record<string, unknown>>(sql, params);
  return rows.map(toExpense);
}

export function getExpenseById(id: number): Expense | null {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM expenses WHERE id = ?', [id]);
  return row ? toExpense(row) : null;
}

export function insertExpense(form: ExpenseFormState): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO expenses (title, amount, category, date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [form.title.trim(), parseFloat(form.amount), form.category, form.date, form.notes.trim() || null, now, now]
  );
  return result.lastInsertRowId;
}

export function updateExpense(id: number, form: ExpenseFormState): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE expenses SET title=?, amount=?, category=?, date=?, notes=?, updated_at=? WHERE id=?`,
    [form.title.trim(), parseFloat(form.amount), form.category, form.date, form.notes.trim() || null, now, id]
  );
}

export function deleteExpense(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
}

export function getTotalExpensesByMonth(month: string): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ?",
    [month]
  );
  return row?.total ?? 0;
}
