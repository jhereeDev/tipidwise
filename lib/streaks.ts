import { getDatabase } from './db/client';

export interface Streak {
  id: number;
  streak_type: string;
  current_count: number;
  longest_count: number;
  last_logged_date: string | null;
  created_at: string;
  updated_at: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getStreak(streakType: string): Streak | null {
  const db = getDatabase();
  return db.getFirstSync<Streak>(
    `SELECT * FROM user_streaks WHERE streak_type = ?`,
    [streakType]
  ) ?? null;
}

export function updateStreak(streakType: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  const existing = getStreak(streakType);

  if (!existing) {
    db.runSync(
      `INSERT INTO user_streaks (streak_type, current_count, longest_count, last_logged_date, created_at, updated_at)
       VALUES (?, 1, 1, ?, ?, ?)`,
      [streakType, today, now, now]
    );
    return;
  }

  if (existing.last_logged_date === today) return;

  const newCount = existing.last_logged_date === yesterday ? existing.current_count + 1 : 1;
  const newLongest = Math.max(existing.longest_count, newCount);

  db.runSync(
    `UPDATE user_streaks SET current_count = ?, longest_count = ?, last_logged_date = ?, updated_at = ? WHERE id = ?`,
    [newCount, newLongest, today, now, existing.id]
  );
}

export function getExpenseLoggingStreak(): Streak | null {
  return getStreak('expense_logging');
}

export function checkAndUpdateStreak(): void {
  const db = getDatabase();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const now = new Date().toISOString();

  const streaks = db.getAllSync<Streak>(`SELECT * FROM user_streaks`);

  for (const streak of streaks) {
    if (streak.last_logged_date !== today && streak.last_logged_date !== yesterday) {
      db.runSync(
        `UPDATE user_streaks SET current_count = 0, updated_at = ? WHERE id = ?`,
        [now, streak.id]
      );
    }
  }
}
