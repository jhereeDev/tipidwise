import { useState, useEffect } from 'react';
import { getTotalExpensesByMonth } from '../lib/db/expenses';
import { getTotalIncomeByMonth } from '../lib/db/income';
import { getUpcomingSubscriptions } from '../lib/db/subscriptions';
import { getExpenses } from '../lib/db/expenses';
import { getIncome } from '../lib/db/income';
import { getAllTimeBalance } from '../lib/db/reports';
import { toMonthKey } from '../lib/formatting';
import type { Subscription, Transaction } from '../types/models';

interface DashboardData {
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netThisMonth: number;
  allTimeBalance: { totalIncome: number; totalExpenses: number; net: number };
  upcomingSubscriptions: Subscription[];
  recentTransactions: Transaction[];
  isLoading: boolean;
  refresh: () => void;
}

export function useDashboardSummary(): DashboardData {
  const [data, setData] = useState<Omit<DashboardData, 'isLoading' | 'refresh'>>({
    totalIncomeThisMonth: 0,
    totalExpensesThisMonth: 0,
    netThisMonth: 0,
    allTimeBalance: { totalIncome: 0, totalExpenses: 0, net: 0 },
    upcomingSubscriptions: [],
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    try {
      setIsLoading(true);
      const month = toMonthKey();

      const totalIncome = getTotalIncomeByMonth(month);
      const totalExpenses = getTotalExpensesByMonth(month);
      const upcoming = getUpcomingSubscriptions(7);

      // Merge recent expenses and income, sort by date desc, take 10
      const recentExpenses = getExpenses({ limit: 10 }).map((e) => ({ ...e, type: 'expense' as const }));
      const recentIncome = getIncome({ limit: 10 }).map((i) => ({ ...i, type: 'income' as const }));
      const combined = [...recentExpenses, ...recentIncome]
        .sort((a, b) => {
          const dateDiff = b.date.localeCompare(a.date);
          if (dateDiff !== 0) return dateDiff;
          return b.createdAt.localeCompare(a.createdAt);
        })
        .slice(0, 10);

      setData({
        totalIncomeThisMonth: totalIncome,
        totalExpensesThisMonth: totalExpenses,
        netThisMonth: totalIncome - totalExpenses,
        allTimeBalance: getAllTimeBalance(),
        upcomingSubscriptions: upcoming,
        recentTransactions: combined as Transaction[],
      });
    } catch {
      // Silently handle errors on dashboard
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { ...data, isLoading, refresh: load };
}
