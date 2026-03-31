import { getDatabase } from '../db/client';

export interface WeeklyAnalysisResult {
  thisWeek: number;
  lastWeek: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
  topCategory: { name: string; amount: number } | null;
}

export function getWeeklyAnalysis(): WeeklyAnalysisResult {
  const db = getDatabase();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 7 days ago
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // 14 days ago
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0];

  // This week's total
  const thisWeekResult = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?`,
    [sevenDaysAgoStr, todayStr]
  );
  const thisWeek = thisWeekResult?.total ?? 0;

  // Last week's total
  const lastWeekResult = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date < ?`,
    [fourteenDaysAgoStr, sevenDaysAgoStr]
  );
  const lastWeek = lastWeekResult?.total ?? 0;

  // Percent change
  let percentChange = 0;
  if (lastWeek > 0) {
    percentChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  } else if (thisWeek > 0) {
    percentChange = 100;
  }

  // Trend
  let trend: 'up' | 'down' | 'stable';
  if (percentChange > 5) {
    trend = 'up';
  } else if (percentChange < -5) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  // Top category this week
  const topCategoryResult = db.getFirstSync<{ category: string; total: number }>(
    `SELECT category, SUM(amount) as total FROM expenses
     WHERE date >= ? AND date <= ?
     GROUP BY category
     ORDER BY total DESC
     LIMIT 1`,
    [sevenDaysAgoStr, todayStr]
  );

  const topCategory = topCategoryResult
    ? { name: topCategoryResult.category, amount: topCategoryResult.total }
    : null;

  return {
    thisWeek,
    lastWeek,
    percentChange,
    trend,
    topCategory,
  };
}
