import { useState, useEffect, useCallback } from 'react';
import * as IncomeDB from '../lib/db/income';
import * as SupabaseIncome from '../lib/supabase/income';
import { useDataMode } from '../context/DataContext';
import type { Income, IncomeCategory } from '../types/models';
import type { IncomeFormState } from '../types/forms';

interface UseIncomeOptions {
  month?: string;
  category?: IncomeCategory;
  limit?: number;
}

interface UseIncomeResult {
  income: Income[];
  isLoading: boolean;
  error: string | null;
  addIncome: (form: IncomeFormState) => Promise<void>;
  updateIncome: (id: number, form: IncomeFormState) => Promise<void>;
  deleteIncome: (id: number) => Promise<void>;
  refresh: () => void;
}

function mapSupabaseIncome(row: any): Income {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    isRecurring: row.is_recurring ?? false,
    recurrenceInterval: row.recurrence_interval,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useIncome(options?: UseIncomeOptions): UseIncomeResult {
  const { mode, userId } = useDataMode();
  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      if (mode === 'cloud' && userId) {
        const data = await SupabaseIncome.getSupabaseIncome(userId, options?.month);
        setIncome(data.map(mapSupabaseIncome));
      } else {
        const data = IncomeDB.getIncome(options);
        setIncome(data);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load income');
    } finally {
      setIsLoading(false);
    }
  }, [mode, userId, options?.month, options?.category, options?.limit]);

  useEffect(() => {
    load();
  }, [load]);

  const addIncome = async (form: IncomeFormState) => {
    if (mode === 'cloud' && userId) {
      await SupabaseIncome.addSupabaseIncome(userId, {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        isRecurring: form.isRecurring,
        recurrenceInterval: form.recurrenceInterval || undefined,
        notes: form.notes || undefined,
      });
    } else {
      IncomeDB.insertIncome(form);
    }
    await load();
  };

  const updateIncome = async (id: number, form: IncomeFormState) => {
    if (mode === 'cloud') {
      await SupabaseIncome.updateSupabaseIncome(String(id), {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        isRecurring: form.isRecurring,
        recurrenceInterval: form.recurrenceInterval || undefined,
        notes: form.notes || undefined,
      });
    } else {
      IncomeDB.updateIncome(id, form);
    }
    await load();
  };

  const deleteIncome = async (id: number) => {
    if (mode === 'cloud') {
      await SupabaseIncome.deleteSupabaseIncome(String(id));
    } else {
      IncomeDB.deleteIncome(id);
    }
    await load();
  };

  return { income, isLoading, error, addIncome, updateIncome, deleteIncome, refresh: load };
}
