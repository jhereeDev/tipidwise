import type { ExpenseCategory, IncomeCategory, SubscriptionCategory } from '../types/models';

export const EXPENSE_CATEGORIES: Array<{ value: ExpenseCategory; label: string; icon: string; color: string }> = [
  { value: 'Food & Dining', label: 'Food & Dining', icon: '🍜', color: '#F59E0B' },
  { value: 'Transport', label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { value: 'Health', label: 'Health', icon: '💊', color: '#10B981' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { value: 'Housing', label: 'Housing', icon: '🏠', color: '#6366F1' },
  { value: 'Education', label: 'Education', icon: '📚', color: '#0EA5E9' },
  { value: 'Other', label: 'Other', icon: '📦', color: '#6B7280' },
];

export const INCOME_CATEGORIES: Array<{ value: IncomeCategory; label: string; icon: string; color: string }> = [
  { value: 'Salary', label: 'Salary', icon: '💼', color: '#22C55E' },
  { value: 'Freelance', label: 'Freelance', icon: '💻', color: '#0D9488' },
  { value: 'Business', label: 'Business', icon: '🏢', color: '#3B82F6' },
  { value: 'Investment', label: 'Investment', icon: '📈', color: '#F59E0B' },
  { value: 'Gift', label: 'Gift', icon: '🎁', color: '#EC4899' },
  { value: 'Refund', label: 'Refund', icon: '↩️', color: '#6366F1' },
  { value: 'Other', label: 'Other', icon: '💰', color: '#6B7280' },
];

export const SUBSCRIPTION_CATEGORIES: Array<{ value: SubscriptionCategory; label: string; icon: string; color: string }> = [
  { value: 'Streaming', label: 'Streaming', icon: '📺', color: '#EF4444' },
  { value: 'Software', label: 'Software', icon: '⚙️', color: '#3B82F6' },
  { value: 'Utilities', label: 'Utilities', icon: '⚡', color: '#F59E0B' },
  { value: 'Fitness', label: 'Fitness', icon: '🏋️', color: '#22C55E' },
  { value: 'News & Media', label: 'News & Media', icon: '📰', color: '#6366F1' },
  { value: 'Gaming', label: 'Gaming', icon: '🎮', color: '#8B5CF6' },
  { value: 'Other', label: 'Other', icon: '🔄', color: '#6B7280' },
];
