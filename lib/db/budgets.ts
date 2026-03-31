import { getDatabase } from './client';
import type { ExpenseCategory } from '../../types/models';

export interface Budget {
  id: number;
  category: ExpenseCategory;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

function toBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as number,
    category: row.category as ExpenseCategory,
    monthlyLimit: row.monthly_limit as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getBudgets(): Budget[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>('SELECT * FROM budgets ORDER BY category ASC');
  return rows.map(toBudget);
}

export function getBudgetByCategory(category: string): Budget | null {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM budgets WHERE category = ?', [category]);
  return row ? toBudget(row) : null;
}

export function upsertBudget(category: string, monthlyLimit: number): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO budgets (category, monthly_limit, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit, updated_at = excluded.updated_at`,
    [category, monthlyLimit, now, now]
  );
}

export function deleteBudget(category: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM budgets WHERE category = ?', [category]);
}
