import { supabase } from './client';

export async function getSupabaseIncome(userId: string, month?: string) {
  let query = supabase
    .from('income')
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

export async function addSupabaseIncome(userId: string, income: {
  title: string; amount: number; category: string; date: string;
  isRecurring?: boolean; recurrenceInterval?: string; notes?: string;
}) {
  const { error } = await supabase.from('income').insert({
    user_id: userId,
    title: income.title,
    amount: income.amount,
    category: income.category,
    date: income.date,
    is_recurring: income.isRecurring ?? false,
    recurrence_interval: income.recurrenceInterval ?? null,
    notes: income.notes ?? null,
  });
  if (error) throw error;
}

export async function updateSupabaseIncome(id: string, income: {
  title: string; amount: number; category: string; date: string;
  isRecurring?: boolean; recurrenceInterval?: string; notes?: string;
}) {
  const { error } = await supabase.from('income').update({
    title: income.title,
    amount: income.amount,
    category: income.category,
    date: income.date,
    is_recurring: income.isRecurring ?? false,
    recurrence_interval: income.recurrenceInterval ?? null,
    notes: income.notes ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteSupabaseIncome(id: string) {
  const { error } = await supabase.from('income').delete().eq('id', id);
  if (error) throw error;
}

export async function getSupabaseIncomeTotal(userId: string, month: string): Promise<number> {
  const income = await getSupabaseIncome(userId, month);
  return income.reduce((sum: number, i: any) => sum + Number(i.amount), 0);
}
