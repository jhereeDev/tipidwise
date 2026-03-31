import { getDatabase } from './client';
import type { Subscription, BillingCycle, SubscriptionCategory } from '../../types/models';
import type { SubscriptionFormState } from '../../types/forms';

function toSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as number,
    name: row.name as string,
    amount: row.amount as number,
    billingCycle: row.billing_cycle as BillingCycle,
    nextDueDate: row.next_due_date as string,
    reminderDaysBefore: row.reminder_days_before as number,
    isActive: Boolean(row.is_active),
    category: row.category as SubscriptionCategory,
    notes: row.notes as string | null,
    notificationId: row.notification_id as string | null,
    lastPaidDate: (row.last_paid_date as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function advanceDate(dateStr: string, cycle: BillingCycle): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  switch (cycle) {
    case 'weekly':    date.setDate(date.getDate() + 7); break;
    case 'monthly':   date.setMonth(date.getMonth() + 1); break;
    case 'quarterly': date.setMonth(date.getMonth() + 3); break;
    case 'yearly':    date.setFullYear(date.getFullYear() + 1); break;
  }
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const dy = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
}

export function getSubscriptions(activeOnly = false): Subscription[] {
  const db = getDatabase();
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const rows = db.getAllSync<Record<string, unknown>>(
    `SELECT * FROM subscriptions ${where} ORDER BY next_due_date ASC`
  );
  return rows.map(toSubscription);
}

export function getSubscriptionById(id: number): Subscription | null {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM subscriptions WHERE id = ?', [id]);
  return row ? toSubscription(row) : null;
}

export function getUpcomingSubscriptions(withinDays: number): Subscription[] {
  const db = getDatabase();
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + withinDays);

  const todayStr = today.toISOString().split('T')[0];
  const futureStr = future.toISOString().split('T')[0];

  const rows = db.getAllSync<Record<string, unknown>>(
    `SELECT * FROM subscriptions WHERE is_active = 1 AND next_due_date BETWEEN ? AND ? ORDER BY next_due_date ASC`,
    [todayStr, futureStr]
  );
  return rows.map(toSubscription);
}

export function insertSubscription(form: SubscriptionFormState): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO subscriptions (name, amount, billing_cycle, next_due_date, reminder_days_before, is_active, category, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      form.name.trim(),
      parseFloat(form.amount),
      form.billingCycle,
      form.nextDueDate,
      parseInt(form.reminderDaysBefore, 10),
      form.isActive ? 1 : 0,
      form.category,
      form.notes.trim() || null,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateSubscription(id: number, form: SubscriptionFormState): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE subscriptions SET name=?, amount=?, billing_cycle=?, next_due_date=?, reminder_days_before=?, is_active=?, category=?, notes=?, updated_at=? WHERE id=?`,
    [
      form.name.trim(),
      parseFloat(form.amount),
      form.billingCycle,
      form.nextDueDate,
      parseInt(form.reminderDaysBefore, 10),
      form.isActive ? 1 : 0,
      form.category,
      form.notes.trim() || null,
      now,
      id,
    ]
  );
}

export function updateSubscriptionNotificationId(id: number, notificationId: string | null): void {
  const db = getDatabase();
  db.runSync('UPDATE subscriptions SET notification_id=? WHERE id=?', [notificationId, id]);
}

export function toggleSubscriptionActive(id: number, isActive: boolean): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync('UPDATE subscriptions SET is_active=?, updated_at=? WHERE id=?', [isActive ? 1 : 0, now, id]);
}

export function deleteSubscription(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM subscriptions WHERE id = ?', [id]);
}

/** Mark a subscription as paid for this cycle and advance nextDueDate. Returns new nextDueDate. */
export function markSubscriptionPaid(id: number): string | null {
  const db = getDatabase();
  const sub = getSubscriptionById(id);
  if (!sub) return null;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const newNextDue = advanceDate(sub.nextDueDate, sub.billingCycle);
  const now = new Date().toISOString();
  db.runSync(
    'UPDATE subscriptions SET last_paid_date=?, next_due_date=?, updated_at=? WHERE id=?',
    [todayStr, newNextDue, now, id]
  );
  return newNextDue;
}

export function getTotalMonthlySubscriptionCost(): number {
  const db = getDatabase();
  const rows = db.getAllSync<{ amount: number; billing_cycle: string }>(
    'SELECT amount, billing_cycle FROM subscriptions WHERE is_active = 1'
  );

  return rows.reduce((total, row) => {
    switch (row.billing_cycle) {
      case 'weekly': return total + row.amount * 4.33;
      case 'monthly': return total + row.amount;
      case 'quarterly': return total + row.amount / 3;
      case 'yearly': return total + row.amount / 12;
      default: return total;
    }
  }, 0);
}
