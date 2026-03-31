export const DEFAULT_CURRENCY = '₱';
export const DEFAULT_REMINDER_DAYS = 3;
export const NOTIFICATION_HOUR = 9; // 9 AM

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const RECURRENCE_INTERVALS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const CURRENCIES = [
  { value: '₱', label: 'Philippine Peso (₱)' },
  { value: '$', label: 'US Dollar ($)' },
  { value: '€', label: 'Euro (€)' },
  { value: '£', label: 'British Pound (£)' },
  { value: '¥', label: 'Japanese Yen (¥)' },
] as const;

export const REMINDER_DAYS_OPTIONS = [
  { value: '0', label: 'On the day' },
  { value: '1', label: '1 day before' },
  { value: '2', label: '2 days before' },
  { value: '3', label: '3 days before' },
  { value: '5', label: '5 days before' },
  { value: '7', label: '7 days before' },
] as const;

export const STORAGE_KEYS = {
  THEME: 'tipidwise_theme',
  CURRENCY: 'tipidwise_currency',
  REMINDER_DAYS: 'tipidwise_reminder_days',
  NOTIFICATION_PERMISSION: 'tipidwise_notification_permission',
} as const;
