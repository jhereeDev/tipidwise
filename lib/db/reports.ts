import { getDatabase } from './client';

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlyTotal {
  month: string; // 'YYYY-MM'
  income: number;
  expenses: number;
  net: number;
}

export function getExpensesByCategory(month: string): CategoryTotal[] {
  const db = getDatabase();
  return db.getAllSync<CategoryTotal>(
    `SELECT category, SUM(amount) as total
     FROM expenses
     WHERE strftime('%Y-%m', date) = ?
     GROUP BY category
     ORDER BY total DESC`,
    [month]
  );
}

export function getIncomeByCategory(month: string): CategoryTotal[] {
  const db = getDatabase();
  return db.getAllSync<CategoryTotal>(
    `SELECT category, SUM(amount) as total
     FROM income
     WHERE strftime('%Y-%m', date) = ?
     GROUP BY category
     ORDER BY total DESC`,
    [month]
  );
}

export function getMonthlyTrends(monthsBack = 6): MonthlyTotal[] {
  const db = getDatabase();

  const months: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  return months.map((month) => {
    const expRow = db.getFirstSync<{ total: number | null }>(
      `SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ?`,
      [month]
    );
    const incRow = db.getFirstSync<{ total: number | null }>(
      `SELECT SUM(amount) as total FROM income WHERE strftime('%Y-%m', date) = ?`,
      [month]
    );
    const expenses = expRow?.total ?? 0;
    const income = incRow?.total ?? 0;
    return { month, income, expenses, net: income - expenses };
  });
}

export function getAllTimeBalance(): { totalIncome: number; totalExpenses: number; net: number } {
  const db = getDatabase();
  const incRow = db.getFirstSync<{ total: number | null }>('SELECT SUM(amount) as total FROM income');
  const expRow = db.getFirstSync<{ total: number | null }>('SELECT SUM(amount) as total FROM expenses');
  const totalIncome = incRow?.total ?? 0;
  const totalExpenses = expRow?.total ?? 0;
  return { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
}

export function getTopExpenseCategories(month: string, limit = 3): CategoryTotal[] {
  return getExpensesByCategory(month).slice(0, limit);
}
