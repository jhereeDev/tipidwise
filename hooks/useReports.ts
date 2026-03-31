import { useState, useEffect, useCallback } from 'react';
import {
  getExpensesByCategory,
  getIncomeByCategory,
  getMonthlyTrends,
  getAllTimeBalance,
  type CategoryTotal,
  type MonthlyTotal,
} from '../lib/db/reports';
import { toMonthKey } from '../lib/formatting';

interface ReportsData {
  expensesByCategory: CategoryTotal[];
  incomeByCategory: CategoryTotal[];
  monthlyTrends: MonthlyTotal[];
  allTimeBalance: { totalIncome: number; totalExpenses: number; net: number };
  isLoading: boolean;
  refresh: () => void;
}

export function useReports(month?: string): ReportsData {
  const selectedMonth = month ?? toMonthKey();
  const [data, setData] = useState<Omit<ReportsData, 'isLoading' | 'refresh'>>({
    expensesByCategory: [],
    incomeByCategory: [],
    monthlyTrends: [],
    allTimeBalance: { totalIncome: 0, totalExpenses: 0, net: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    try {
      setIsLoading(true);
      setData({
        expensesByCategory: getExpensesByCategory(selectedMonth),
        incomeByCategory: getIncomeByCategory(selectedMonth),
        monthlyTrends: getMonthlyTrends(6),
        allTimeBalance: getAllTimeBalance(),
      });
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { load(); }, [load]);

  return { ...data, isLoading, refresh: load };
}
