import { useState, useEffect, useCallback } from 'react';
import * as ExpensesDB from '../lib/db/expenses';
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

export function useExpenses(options?: UseExpensesOptions): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    try {
      setIsLoading(true);
      const data = ExpensesDB.getExpenses(options);
      setExpenses(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [options?.month, options?.category, options?.limit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = async (form: ExpenseFormState) => {
    ExpensesDB.insertExpense(form);
    load();
  };

  const updateExpense = async (id: number, form: ExpenseFormState) => {
    ExpensesDB.updateExpense(id, form);
    load();
  };

  const deleteExpense = async (id: number) => {
    ExpensesDB.deleteExpense(id);
    load();
  };

  return { expenses, isLoading, error, addExpense, updateExpense, deleteExpense, refresh: load };
}
