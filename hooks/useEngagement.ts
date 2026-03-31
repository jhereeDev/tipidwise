import { useState, useEffect, useCallback } from 'react';
import { getExpenseLoggingStreak, checkAndUpdateStreak } from '../lib/streaks';
import { getUnlockedAchievements, checkAchievements, Achievement } from '../lib/achievements';
import { calculateHealthScore } from '../lib/insights/healthScore';
import { getWeeklyAnalysis } from '../lib/insights/weeklyAnalysis';

interface StreakData {
  current: number;
  longest: number;
}

interface HealthScoreData {
  score: number;
  grade: string;
  tips: string[];
}

interface WeeklyAnalysisData {
  thisWeek: number;
  lastWeek: number;
  percentChange: number;
  trend: string;
}

interface AchievementData {
  type: string;
  unlockedAt: string;
}

interface UseEngagementReturn {
  streak: StreakData;
  healthScore: HealthScoreData;
  weeklyAnalysis: WeeklyAnalysisData;
  achievements: AchievementData[];
  isLoading: boolean;
  refresh: () => void;
}

export function useEngagement(): UseEngagementReturn {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0 });
  const [healthScore, setHealthScore] = useState<HealthScoreData>({
    score: 0,
    grade: 'F',
    tips: [],
  });
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyAnalysisData>({
    thisWeek: 0,
    lastWeek: 0,
    percentChange: 0,
    trend: 'stable',
  });
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      setIsLoading(true);

      // Check and update streaks on load
      checkAndUpdateStreak();

      // Check for new achievements
      checkAchievements();

      // Load all data
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const streakData = getExpenseLoggingStreak();
      const healthData = calculateHealthScore(currentMonth);
      const weeklyData = getWeeklyAnalysis();
      const achievementData = getUnlockedAchievements();

      setStreak({
        current: streakData?.current_count ?? 0,
        longest: streakData?.longest_count ?? 0,
      });

      setHealthScore({
        score: healthData.score,
        grade: healthData.grade,
        tips: healthData.tips,
      });

      setWeeklyAnalysis({
        thisWeek: weeklyData.thisWeek,
        lastWeek: weeklyData.lastWeek,
        percentChange: weeklyData.percentChange,
        trend: weeklyData.trend,
      });

      setAchievements(
        achievementData.map((a: Achievement) => ({
          type: a.achievement_type,
          unlockedAt: a.unlocked_at,
        }))
      );
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    streak,
    healthScore,
    weeklyAnalysis,
    achievements,
    isLoading,
    refresh,
  };
}
