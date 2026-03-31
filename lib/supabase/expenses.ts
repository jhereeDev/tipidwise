import { supabase } from './client';

export interface SupabaseExpense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getSupabaseExpenses(userId: string, month?: string) {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (month) {
    const [y, m] = month.split('-');
    const start = `${y}-${m}-01`;
    const endMonth = parseInt(m) === 12 ? `${parseInt(y) + 1}-01-01` : `${y}-${String(parseInt(m) + 1).padStart(2, '0')}-01`;
    query = query.gte('date', start).lt('date', endMonth);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function addSupabaseExpense(userId: string, expense: {
  title: string; amount: number; category: string; date: string; notes?: string;
}) {
  const { error } = await supabase.from('expenses').insert({
    user_id: userId,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    notes: expense.notes ?? null,
  });
  if (error) throw error;
}

export async function updateSupabaseExpense(id: string, expense: {
  title: string; amount: number; category: string; date: string; notes?: string;
}) {
  const { error } = await supabase.from('expenses').update({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    notes: expense.notes ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteSupabaseExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function getSupabaseExpenseTotal(userId: string, month: string): Promise<number> {
  const expenses = await getSupabaseExpenses(userId, month);
  return expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
}
