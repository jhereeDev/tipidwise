import { useState, useEffect, useCallback } from 'react';
import * as IncomeDB from '../lib/db/income';
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

export function useIncome(options?: UseIncomeOptions): UseIncomeResult {
  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    try {
      setIsLoading(true);
      const data = IncomeDB.getIncome(options);
      setIncome(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load income');
    } finally {
      setIsLoading(false);
    }
  }, [options?.month, options?.category, options?.limit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const addIncome = async (form: IncomeFormState) => {
    IncomeDB.insertIncome(form);
    load();
  };

  const updateIncome = async (id: number, form: IncomeFormState) => {
    IncomeDB.updateIncome(id, form);
    load();
  };

  const deleteIncome = async (id: number) => {
    IncomeDB.deleteIncome(id);
    load();
  };

  return { income, isLoading, error, addIncome, updateIncome, deleteIncome, refresh: load };
}
