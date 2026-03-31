import { getDatabase } from '../db/client';
import { getStreak } from '../streaks';

export interface HealthScoreBreakdown {
  incomeExpenseRatio: number;
  budgetAdherence: number;
  savingsRate: number;
  consistency: number;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HealthScoreResult {
  score: number;
  breakdown: HealthScoreBreakdown;
  grade: Grade;
  tips: string[];
}

function getGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function calculateHealthScore(month: string): HealthScoreResult {
  const db = getDatabase();

  // Get total income for the month
  const incomeResult = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE strftime('%Y-%m', date) = ?`,
    [month]
  );
  const totalIncome = incomeResult?.total ?? 0;

  // Get total expenses for the month
  const expenseResult = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%Y-%m', date) = ?`,
    [month]
  );
  const totalExpenses = expenseResult?.total ?? 0;

  // Income/Expense Ratio score (40% weight)
  let incomeExpenseRatio = 0;
  if (totalIncome > 0 && totalExpenses > 0) {
    const ratio = totalIncome / totalExpenses;
    if (ratio >= 2) {
      incomeExpenseRatio = 100;
    } else if (ratio >= 1) {
      incomeExpenseRatio = ((ratio - 1) / 1) * 100;
    } else {
      incomeExpenseRatio = ratio * 50;
    }
  } else if (totalIncome > 0 && totalExpenses === 0) {
    incomeExpenseRatio = 100;
  }
  incomeExpenseRatio = Math.min(100, Math.max(0, incomeExpenseRatio));

  // Budget Adherence score (30% weight)
  const budgets = db.getAllSync<{ id: number; category: string; monthly_limit: number }>(
    `SELECT id, category, monthly_limit FROM budgets`
  );

  let budgetAdherence = 0;
  if (budgets.length > 0) {
    let underBudgetCount = 0;
    for (const budget of budgets) {
      const spent = db.getFirstSync<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses
         WHERE category = ? AND strftime('%Y-%m', date) = ?`,
        [budget.category, month]
      );
      if (!spent || spent.total <= budget.monthly_limit) {
        underBudgetCount++;
      }
    }
    budgetAdherence = (underBudgetCount / budgets.length) * 100;
  } else {
    // No budgets set, neutral score
    budgetAdherence = 50;
  }

  // Savings Rate score (20% weight)
  let savingsRate = 0;
  if (totalIncome > 0) {
    const rate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    savingsRate = Math.min(100, Math.max(0, rate));
  }

  // Consistency score (10% weight) based on streak
  let consistency = 0;
  const streak = getStreak('expense_logging');
  if (streak) {
    if (streak.current_count >= 30) {
      consistency = 100;
    } else if (streak.current_count >= 14) {
      consistency = 80;
    } else if (streak.current_count >= 7) {
      consistency = 60;
    } else if (streak.current_count >= 3) {
      consistency = 40;
    } else if (streak.current_count >= 1) {
      consistency = 20;
    }
  }

  const score = Math.round(
    incomeExpenseRatio * 0.4 +
    budgetAdherence * 0.3 +
    savingsRate * 0.2 +
    consistency * 0.1
  );

  const breakdown: HealthScoreBreakdown = {
    incomeExpenseRatio: Math.round(incomeExpenseRatio),
    budgetAdherence: Math.round(budgetAdherence),
    savingsRate: Math.round(savingsRate),
    consistency: Math.round(consistency),
  };

  const grade = getGrade(score);

  // Generate tips based on weakest areas
  const tips: string[] = [];
  const areas = [
    { name: 'incomeExpenseRatio', score: incomeExpenseRatio, label: 'income-to-expense ratio' },
    { name: 'budgetAdherence', score: budgetAdherence, label: 'budget adherence' },
    { name: 'savingsRate', score: savingsRate, label: 'savings rate' },
    { name: 'consistency', score: consistency, label: 'logging consistency' },
  ];

  areas.sort((a, b) => a.score - b.score);

  for (const area of areas.slice(0, 3)) {
    if (area.score >= 80) continue;

    switch (area.name) {
      case 'incomeExpenseRatio':
        tips.push('Try to reduce expenses or find additional income sources to improve your income-to-expense ratio.');
        break;
      case 'budgetAdherence':
        tips.push('Review your budget categories and adjust limits to stay within your planned spending.');
        break;
      case 'savingsRate':
        tips.push('Aim to save at least 20% of your income each month for a healthier financial cushion.');
        break;
      case 'consistency':
        tips.push('Log your expenses daily to maintain your streak and keep accurate records.');
        break;
    }

    if (tips.length >= 3) break;
  }

  if (tips.length === 0) {
    tips.push('Great job! Keep maintaining your healthy financial habits.');
  }

  return { score, breakdown, grade, tips };
}
