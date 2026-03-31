import { useState, useCallback } from 'react';
import {
  getAllSavingsGoals,
  createSavingsGoal,
  updateSavingsGoalProgress,
  deleteSavingsGoal,
  SavingsGoal,
} from '../lib/db/savingsGoals';

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      setGoals(getAllSavingsGoals());
    } catch (err) {
      console.error('Failed to fetch savings goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addGoal = useCallback((goal: {
    title: string;
    targetAmount: number;
    deadline?: string;
    category?: string;
    icon?: string;
  }) => {
    const id = createSavingsGoal(goal);
    refresh();
    return id;
  }, [refresh]);

  const updateProgress = useCallback((id: number, amount: number) => {
    updateSavingsGoalProgress(id, amount);
    refresh();
  }, [refresh]);

  const deleteGoal = useCallback((id: number) => {
    deleteSavingsGoal(id);
    refresh();
  }, [refresh]);

  return { goals, isLoading, refresh, addGoal, updateProgress, deleteGoal };
}
