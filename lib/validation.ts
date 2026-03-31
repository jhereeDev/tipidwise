import type { ExpenseFormState, IncomeFormState, SubscriptionFormState, FormErrors } from '../types/forms';

export function validateExpenseForm(form: ExpenseFormState): FormErrors<ExpenseFormState> {
  const errors: FormErrors<ExpenseFormState> = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  if (!form.category) errors.category = 'Category is required';
  if (!form.date) errors.date = 'Date is required';

  return errors;
}

export function validateIncomeForm(form: IncomeFormState): FormErrors<IncomeFormState> {
  const errors: FormErrors<IncomeFormState> = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  if (!form.category) errors.category = 'Category is required';
  if (!form.date) errors.date = 'Date is required';
  if (form.isRecurring && !form.recurrenceInterval) {
    errors.recurrenceInterval = 'Select recurrence interval';
  }

  return errors;
}

export function validateSubscriptionForm(form: SubscriptionFormState): FormErrors<SubscriptionFormState> {
  const errors: FormErrors<SubscriptionFormState> = {};

  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  if (!form.billingCycle) errors.billingCycle = 'Billing cycle is required';
  if (!form.nextDueDate) errors.nextDueDate = 'Next due date is required';
  if (!form.category) errors.category = 'Category is required';

  return errors;
}

export function hasErrors(errors: FormErrors<unknown>): boolean {
  return Object.keys(errors).length > 0;
}
