import { useState, useEffect, useCallback } from 'react';
import { getBudgets, upsertBudget, deleteBudget, type Budget } from '../lib/db/budgets';
import { getTotalExpensesByMonth } from '../lib/db/expenses';
import { toMonthKey } from '../lib/formatting';
import type { ExpenseCategory } from '../types/models';

export interface BudgetWithSpend extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

interface UseBudgetsResult {
  budgets: Budget[];
  budgetsWithSpend: BudgetWithSpend[];
  isLoading: boolean;
  setBudget: (category: ExpenseCategory, limit: number) => void;
  removeBudget: (category: ExpenseCategory) => void;
  refresh: () => void;
}

export function useBudgets(month?: string): UseBudgetsResult {
  const selectedMonth = month ?? toMonthKey();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    setBudgets(getBudgets());
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { getExpensesByCategory } = require('../lib/db/reports');
  const categoryTotals: { category: string; total: number }[] = getExpensesByCategory(selectedMonth);

  const budgetsWithSpend: BudgetWithSpend[] = budgets.map((b) => {
    const catTotal = categoryTotals.find((c) => c.category === b.category);
    const spent = catTotal?.total ?? 0;
    const remaining = b.monthlyLimit - spent;
    const percentage = b.monthlyLimit > 0 ? Math.min((spent / b.monthlyLimit) * 100, 100) : 0;
    return { ...b, spent, remaining, percentage, isOverBudget: spent > b.monthlyLimit };
  });

  const setBudget = (category: ExpenseCategory, limit: number) => {
    upsertBudget(category, limit);
    load();
  };

  const removeBudget = (category: ExpenseCategory) => {
    deleteBudget(category);
    load();
  };

  return { budgets, budgetsWithSpend, isLoading, setBudget, removeBudget, refresh: load };
}
