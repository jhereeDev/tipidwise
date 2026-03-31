import { useState, useEffect, useCallback } from 'react';
import { getTotalExpensesByMonth, getExpenses } from '../lib/db/expenses';
import { getTotalIncomeByMonth, getIncome } from '../lib/db/income';
import { getUpcomingSubscriptions } from '../lib/db/subscriptions';
import { getAllTimeBalance } from '../lib/db/reports';
import * as SupabaseExpenses from '../lib/supabase/expenses';
import * as SupabaseIncome from '../lib/supabase/income';
import { useDataMode } from '../context/DataContext';
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
  const { mode, userId } = useDataMode();
  const [data, setData] = useState<Omit<DashboardData, 'isLoading' | 'refresh'>>({
    totalIncomeThisMonth: 0,
    totalExpensesThisMonth: 0,
    netThisMonth: 0,
    allTimeBalance: { totalIncome: 0, totalExpenses: 0, net: 0 },
    upcomingSubscriptions: [],
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const month = toMonthKey();

      if (mode === 'cloud' && userId) {
        // Fetch from Supabase
        const [expenses, income] = await Promise.all([
          SupabaseExpenses.getSupabaseExpenses(userId, month),
          SupabaseIncome.getSupabaseIncome(userId, month),
        ]);

        const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
        const totalIncome = income.reduce((s: number, i: any) => s + Number(i.amount), 0);

        // All-time totals
        const [allExpenses, allIncome] = await Promise.all([
          SupabaseExpenses.getSupabaseExpenses(userId),
          SupabaseIncome.getSupabaseIncome(userId),
        ]);
        const allTimeExpenses = allExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
        const allTimeIncome = allIncome.reduce((s: number, i: any) => s + Number(i.amount), 0);

        // Recent transactions
        const recentExp = expenses.slice(0, 10).map((e: any) => ({
          id: e.id, title: e.title, amount: Number(e.amount), category: e.category,
          date: e.date, notes: e.notes, createdAt: e.created_at, updatedAt: e.updated_at, type: 'expense' as const,
        }));
        const recentInc = income.slice(0, 10).map((i: any) => ({
          id: i.id, title: i.title, amount: Number(i.amount), category: i.category,
          date: i.date, notes: i.notes, isRecurring: i.is_recurring, recurrenceInterval: i.recurrence_interval,
          createdAt: i.created_at, updatedAt: i.updated_at, type: 'income' as const,
        }));
        const combined = [...recentExp, ...recentInc]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10);

        setData({
          totalIncomeThisMonth: totalIncome,
          totalExpensesThisMonth: totalExpenses,
          netThisMonth: totalIncome - totalExpenses,
          allTimeBalance: { totalIncome: allTimeIncome, totalExpenses: allTimeExpenses, net: allTimeIncome - allTimeExpenses },
          upcomingSubscriptions: [], // Subscriptions from Supabase TBD
          recentTransactions: combined as Transaction[],
        });
      } else {
        // Local SQLite
        const totalIncome = getTotalIncomeByMonth(month);
        const totalExpenses = getTotalExpensesByMonth(month);
        const upcoming = getUpcomingSubscriptions(7);

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
      }
    } catch {
      // Silently handle errors on dashboard
    } finally {
      setIsLoading(false);
    }
  }, [mode, userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, isLoading, refresh: load };
}
