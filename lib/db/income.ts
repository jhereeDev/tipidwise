import { getDatabase } from './client';
import type { Income, IncomeCategory, RecurrenceInterval } from '../../types/models';
import type { IncomeFormState } from '../../types/forms';

function toIncome(row: Record<string, unknown>): Income {
  return {
    id: row.id as number,
    title: row.title as string,
    amount: row.amount as number,
    category: row.category as IncomeCategory,
    date: row.date as string,
    isRecurring: Boolean(row.is_recurring),
    recurrenceInterval: (row.recurrence_interval as RecurrenceInterval | null) ?? null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getIncome(filters?: { month?: string; category?: IncomeCategory; limit?: number }): Income[] {
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
  const sql = `SELECT * FROM income ${where} ORDER BY date DESC, created_at DESC ${limit}`;

  const rows = db.getAllSync<Record<string, unknown>>(sql, params);
  return rows.map(toIncome);
}

export function getIncomeById(id: number): Income | null {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM income WHERE id = ?', [id]);
  return row ? toIncome(row) : null;
}

export function insertIncome(form: IncomeFormState): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO income (title, amount, category, date, is_recurring, recurrence_interval, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      form.title.trim(),
      parseFloat(form.amount),
      form.category,
      form.date,
      form.isRecurring ? 1 : 0,
      form.isRecurring && form.recurrenceInterval ? form.recurrenceInterval : null,
      form.notes.trim() || null,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateIncome(id: number, form: IncomeFormState): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE income SET title=?, amount=?, category=?, date=?, is_recurring=?, recurrence_interval=?, notes=?, updated_at=? WHERE id=?`,
    [
      form.title.trim(),
      parseFloat(form.amount),
      form.category,
      form.date,
      form.isRecurring ? 1 : 0,
      form.isRecurring && form.recurrenceInterval ? form.recurrenceInterval : null,
      form.notes.trim() || null,
      now,
      id,
    ]
  );
}

export function deleteIncome(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM income WHERE id = ?', [id]);
}

export function getTotalIncomeByMonth(month: string): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM income WHERE strftime('%Y-%m', date) = ?",
    [month]
  );
  return row?.total ?? 0;
}
