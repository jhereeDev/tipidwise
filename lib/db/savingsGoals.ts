import { getDatabase } from './client';

export interface SavingsGoal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  icon: string | null;
  is_completed: number;
  created_at: string;
  updated_at: string;
}

export function getAllSavingsGoals(): SavingsGoal[] {
  const db = getDatabase();
  return db.getAllSync<SavingsGoal>(
    `SELECT * FROM savings_goals ORDER BY is_completed ASC, deadline ASC`
  );
}

export function getSavingsGoalById(id: number): SavingsGoal | null {
  const db = getDatabase();
  return db.getFirstSync<SavingsGoal>(
    `SELECT * FROM savings_goals WHERE id = ?`,
    [id]
  ) ?? null;
}

export function createSavingsGoal(goal: {
  title: string;
  targetAmount: number;
  deadline?: string;
  category?: string;
  icon?: string;
}): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO savings_goals (title, target_amount, current_amount, deadline, category, icon, is_completed, created_at, updated_at)
     VALUES (?, ?, 0, ?, ?, ?, 0, ?, ?)`,
    [
      goal.title,
      goal.targetAmount,
      goal.deadline ?? null,
      goal.category ?? null,
      goal.icon ?? '🎯',
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateSavingsGoalProgress(id: number, amount: number): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const goal = getSavingsGoalById(id);
  if (!goal) return;

  const newAmount = goal.current_amount + amount;
  const isCompleted = newAmount >= goal.target_amount ? 1 : 0;

  db.runSync(
    `UPDATE savings_goals SET current_amount = ?, is_completed = ?, updated_at = ? WHERE id = ?`,
    [newAmount, isCompleted, now, id]
  );
}

export function deleteSavingsGoal(id: number): void {
  const db = getDatabase();
  db.runSync(`DELETE FROM savings_goals WHERE id = ?`, [id]);
}
