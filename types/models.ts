export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Housing'
  | 'Education'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Gift'
  | 'Refund'
  | 'Other';

export type SubscriptionCategory =
  | 'Streaming'
  | 'Software'
  | 'Utilities'
  | 'Fitness'
  | 'News & Media'
  | 'Gaming'
  | 'Other';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurrenceInterval = 'weekly' | 'monthly' | 'yearly';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // 'YYYY-MM-DD'
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: number;
  title: string;
  amount: number;
  category: IncomeCategory;
  date: string; // 'YYYY-MM-DD'
  isRecurring: boolean;
  recurrenceInterval: RecurrenceInterval | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextDueDate: string; // 'YYYY-MM-DD'
  reminderDaysBefore: number;
  isActive: boolean;
  category: SubscriptionCategory;
  notes: string | null;
  notificationId: string | null;
  lastPaidDate: string | null; // 'YYYY-MM-DD'
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netThisMonth: number;
  upcomingSubscriptions: Subscription[];
  recentTransactions: (Expense & { type: 'expense' })[] | (Income & { type: 'income' })[];
}

export type Transaction = (Expense & { type: 'expense' }) | (Income & { type: 'income' });
