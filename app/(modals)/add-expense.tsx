import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useResponsive } from '../../hooks/useResponsive';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { validateExpenseForm, hasErrors } from '../../lib/validation';
import { toDateString } from '../../lib/formatting';
import { getExpenseById } from '../../lib/db/expenses';
import type { ExpenseFormState, FormErrors } from '../../types/forms';

const INITIAL_STATE: ExpenseFormState = {
  title: '',
  amount: '',
  category: '',
  date: toDateString(new Date()),
  notes: '',
};

export default function AddExpenseModal() {
  const theme = useTheme();
  const router = useRouter();
  const { hp, contentWidth, landscapeHp, isLandscape } = useResponsive();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const { addExpense, updateExpense } = useExpenses();

  const [form, setForm] = useState<ExpenseFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors<ExpenseFormState>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const expense = getExpenseById(parseInt(id, 10));
      if (expense) {
        setForm({ title: expense.title, amount: String(expense.amount), category: expense.category, date: expense.date, notes: expense.notes ?? '' });
      }
    }
  }, [id]);

  const update = (field: keyof ExpenseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async () => {
    const validationErrors = validateExpenseForm(form);
    if (hasErrors(validationErrors)) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      if (isEditing && id) await updateExpense(parseInt(id, 10), form);
      else await addExpense(form);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          borderBottomWidth: 1, borderBottomColor: theme.colors.border,
          paddingHorizontal: hp + landscapeHp,
        }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          maxWidth: contentWidth, width: '100%', alignSelf: 'center',
          paddingVertical: theme.spacing.md,
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ minWidth: 60 }}>
            <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={{ minWidth: 60 }} />
        </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingVertical: theme.spacing.lg }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ maxWidth: contentWidth, alignSelf: 'center', width: '100%', paddingHorizontal: hp + landscapeHp, gap: theme.spacing.md }}>
            <Input label="Title" placeholder="e.g. Lunch at Jollibee" value={form.title} onChangeText={(v) => update('title', v)} error={errors.title} leftIcon="🧾" />
            <Input label="Amount" placeholder="0.00" value={form.amount} onChangeText={(v) => update('amount', v)} error={errors.amount} keyboardType="decimal-pad" leftIcon="₱" />
            <Select label="Category" placeholder="Select category" options={categoryOptions} value={form.category} onChange={(v) => update('category', v)} error={errors.category} />
            <DatePicker label="Date" value={form.date} onChange={(v) => update('date', v)} error={errors.date} />
            <Input
              label="Notes (optional)" placeholder="Add a note..." value={form.notes}
              onChangeText={(v) => update('notes', v)} multiline numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' } as any} leftIcon="📝"
            />
            <Button label={isEditing ? 'Save Changes' : 'Add Expense'} onPress={handleSubmit} loading={loading} fullWidth variant="destructive" size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
