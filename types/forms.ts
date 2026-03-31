import type { ExpenseCategory, IncomeCategory, SubscriptionCategory, BillingCycle, RecurrenceInterval } from './models';

export interface ExpenseFormState {
  title: string;
  amount: string;
  category: ExpenseCategory | '';
  date: string;
  notes: string;
}

export interface IncomeFormState {
  title: string;
  amount: string;
  category: IncomeCategory | '';
  date: string;
  isRecurring: boolean;
  recurrenceInterval: RecurrenceInterval | '';
  notes: string;
}

export interface SubscriptionFormState {
  name: string;
  amount: string;
  billingCycle: BillingCycle | '';
  nextDueDate: string;
  reminderDaysBefore: string;
  isActive: boolean;
  category: SubscriptionCategory | '';
  notes: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
