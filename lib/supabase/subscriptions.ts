import { supabase } from './client';

export async function getSupabaseSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('next_due_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addSupabaseSubscription(userId: string, sub: {
  name: string; amount: number; billingCycle: string; nextDueDate: string;
  reminderDaysBefore?: number; isActive?: boolean; category: string; notes?: string;
}) {
  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    name: sub.name,
    amount: sub.amount,
    billing_cycle: sub.billingCycle,
    next_due_date: sub.nextDueDate,
    reminder_days_before: sub.reminderDaysBefore ?? 3,
    is_active: sub.isActive ?? true,
    category: sub.category,
    notes: sub.notes ?? null,
  });
  if (error) throw error;
}

export async function deleteSupabaseSubscription(id: string) {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
}
