import { useState, useEffect, useCallback } from 'react';
import * as ExpensesDB from '../lib/db/expenses';
import * as SupabaseExpenses from '../lib/supabase/expenses';
import { useDataMode } from '../context/DataContext';
import type { Expense, ExpenseCategory } from '../types/models';
import type { ExpenseFormState } from '../types/forms';

interface UseExpensesOptions {
  month?: string;
  category?: ExpenseCategory;
  limit?: number;
}

interface UseExpensesResult {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (form: ExpenseFormState) => Promise<void>;
  updateExpense: (id: number, form: ExpenseFormState) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  refresh: () => void;
}

function mapSupabaseExpense(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useExpenses(options?: UseExpensesOptions): UseExpensesResult {
  const { mode, userId } = useDataMode();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      if (mode === 'cloud' && userId) {
        const data = await SupabaseExpenses.getSupabaseExpenses(userId, options?.month);
        setExpenses(data.map(mapSupabaseExpense));
      } else {
        const data = ExpensesDB.getExpenses(options);
        setExpenses(data);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [mode, userId, options?.month, options?.category, options?.limit]);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = async (form: ExpenseFormState) => {
    if (mode === 'cloud' && userId) {
      await SupabaseExpenses.addSupabaseExpense(userId, {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      });
    } else {
      ExpensesDB.insertExpense(form);
    }
    await load();
  };

  const updateExpense = async (id: number, form: ExpenseFormState) => {
    if (mode === 'cloud') {
      await SupabaseExpenses.updateSupabaseExpense(String(id), {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      });
    } else {
      ExpensesDB.updateExpense(id, form);
    }
    await load();
  };

  const deleteExpense = async (id: number) => {
    if (mode === 'cloud') {
      await SupabaseExpenses.deleteSupabaseExpense(String(id));
    } else {
      ExpensesDB.deleteExpense(id);
    }
    await load();
  };

  return { expenses, isLoading, error, addExpense, updateExpense, deleteExpense, refresh: load };
}
