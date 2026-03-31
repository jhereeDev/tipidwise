import { getDatabase } from './db/client';
import { getStreak } from './streaks';

export interface AchievementDefinition {
  type: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
}

export interface Achievement {
  id: number;
  achievement_type: string;
  unlocked_at: string;
  metadata: string | null;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    type: 'first_expense',
    title: 'First Step',
    description: 'Log your first expense',
    icon: '📝',
    condition: 'Log at least 1 expense',
  },
  {
    type: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '🔥',
    condition: 'Log expenses for 7 consecutive days',
  },
  {
    type: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day logging streak',
    icon: '⚡',
    condition: 'Log expenses for 30 consecutive days',
  },
  {
    type: 'under_budget',
    title: 'Budget Boss',
    description: 'Stay under budget for all categories in a month',
    icon: '🎯',
    condition: 'All categories under budget for one month',
  },
  {
    type: 'first_goal',
    title: 'Goal Setter',
    description: 'Create your first savings goal',
    icon: '🎯',
    condition: 'Create at least 1 savings goal',
  },
  {
    type: 'goal_completed',
    title: 'Goal Crusher',
    description: 'Complete a savings goal',
    icon: '🏆',
    condition: 'Reach the target amount of a savings goal',
  },
  {
    type: 'group_created',
    title: 'Team Player',
    description: 'Create or join a group',
    icon: '👥',
    condition: 'Create or join at least 1 group',
  },
  {
    type: 'century_club',
    title: 'Century Club',
    description: 'Log 100 transactions',
    icon: '💯',
    condition: 'Log at least 100 total transactions',
  },
];

export function getUnlockedAchievements(): Achievement[] {
  const db = getDatabase();
  return db.getAllSync<Achievement>(
    `SELECT * FROM achievements ORDER BY unlocked_at DESC`
  );
}

export function unlockAchievement(type: string): boolean {
  const db = getDatabase();

  const existing = db.getFirstSync<Achievement>(
    `SELECT * FROM achievements WHERE achievement_type = ?`,
    [type]
  );

  if (existing) return false;

  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO achievements (achievement_type, unlocked_at) VALUES (?, ?)`,
    [type, now]
  );
  return true;
}

export function checkAchievements(): string[] {
  const db = getDatabase();
  const newlyUnlocked: string[] = [];

  // Check first_expense
  const expenseCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM expenses`
  );
  if (expenseCount && expenseCount.count >= 1) {
    if (unlockAchievement('first_expense')) {
      newlyUnlocked.push('first_expense');
    }
  }

  // Check century_club
  if (expenseCount && expenseCount.count >= 100) {
    if (unlockAchievement('century_club')) {
      newlyUnlocked.push('century_club');
    }
  }

  // Check streak_7 and streak_30
  const streak = getStreak('expense_logging');
  if (streak) {
    if (streak.longest_count >= 7) {
      if (unlockAchievement('streak_7')) {
        newlyUnlocked.push('streak_7');
      }
    }
    if (streak.longest_count >= 30) {
      if (unlockAchievement('streak_30')) {
        newlyUnlocked.push('streak_30');
      }
    }
  }

  // Check first_goal
  const goalCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM savings_goals`
  );
  if (goalCount && goalCount.count >= 1) {
    if (unlockAchievement('first_goal')) {
      newlyUnlocked.push('first_goal');
    }
  }

  // Check goal_completed
  const completedGoals = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM savings_goals WHERE is_completed = 1`
  );
  if (completedGoals && completedGoals.count >= 1) {
    if (unlockAchievement('goal_completed')) {
      newlyUnlocked.push('goal_completed');
    }
  }

  // Check under_budget: all budget categories are under budget for current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const budgets = db.getAllSync<{ id: number; category: string; monthly_limit: number }>(
    `SELECT id, category, monthly_limit FROM budgets`
  );

  if (budgets.length > 0) {
    let allUnderBudget = true;
    for (const budget of budgets) {
      const spent = db.getFirstSync<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses
         WHERE category = ? AND strftime('%Y-%m', date) = ?`,
        [budget.category, currentMonth]
      );
      if (spent && spent.total > budget.monthly_limit) {
        allUnderBudget = false;
        break;
      }
    }
    if (allUnderBudget) {
      if (unlockAchievement('under_budget')) {
        newlyUnlocked.push('under_budget');
      }
    }
  }

  return newlyUnlocked;
}
