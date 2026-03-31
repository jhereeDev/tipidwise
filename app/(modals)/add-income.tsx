import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useIncome } from '../../hooks/useIncome';
import { useResponsive } from '../../hooks/useResponsive';
import { INCOME_CATEGORIES } from '../../constants/categories';
import { RECURRENCE_INTERVALS } from '../../constants/config';
import { validateIncomeForm, hasErrors } from '../../lib/validation';
import { toDateString } from '../../lib/formatting';
import { getIncomeById } from '../../lib/db/income';
import type { IncomeFormState, FormErrors } from '../../types/forms';

const INITIAL_STATE: IncomeFormState = {
  title: '', amount: '', category: '', date: toDateString(new Date()),
  isRecurring: false, recurrenceInterval: '', notes: '',
};

export default function AddIncomeModal() {
  const theme = useTheme();
  const router = useRouter();
  const { hp, contentWidth, width } = useResponsive();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const { addIncome, updateIncome } = useIncome();

  const [form, setForm] = useState<IncomeFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors<IncomeFormState>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const income = getIncomeById(parseInt(id, 10));
      if (income) setForm({ title: income.title, amount: String(income.amount), category: income.category, date: income.date, isRecurring: income.isRecurring, recurrenceInterval: income.recurrenceInterval ?? '', notes: income.notes ?? '' });
    }
  }, [id]);

  const update = <K extends keyof IncomeFormState>(field: K, value: IncomeFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async () => {
    const validationErrors = validateIncomeForm(form);
    if (hasErrors(validationErrors)) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      if (isEditing && id) await updateIncome(parseInt(id, 10), form);
      else await addIncome(form);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = INCOME_CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));
  const intervalOptions = RECURRENCE_INTERVALS.map((r) => ({ value: r.value, label: r.label }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: hp, paddingVertical: theme.spacing.md,
          borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ minWidth: 60 }}>
            <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>
            {isEditing ? 'Edit Income' : 'Add Income'}
          </Text>
          <View style={{ minWidth: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ maxWidth: contentWidth, alignSelf: width >= 768 ? 'center' : 'stretch', width: '100%', paddingHorizontal: hp, gap: theme.spacing.md }}>
            <Input label="Title" placeholder="e.g. Monthly Salary" value={form.title} onChangeText={(v) => update('title', v)} error={errors.title} leftIcon="💼" />
            <Input label="Amount" placeholder="0.00" value={form.amount} onChangeText={(v) => update('amount', v)} error={errors.amount} keyboardType="decimal-pad" leftIcon="₱" />
            <Select label="Category" placeholder="Select category" options={categoryOptions} value={form.category} onChange={(v) => update('category', v as any)} error={errors.category} />
            <DatePicker label="Date" value={form.date} onChange={(v) => update('date', v)} error={errors.date} />

            {/* Recurring toggle */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: theme.colors.surface, borderRadius: theme.radii.md,
              padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Recurring Income</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Does this repeat regularly?</Text>
              </View>
              <Switch value={form.isRecurring} onValueChange={(v) => update('isRecurring', v)}
                trackColor={{ false: theme.colors.neutral[300], true: `${theme.colors.primary[500]}60` }}
                thumbColor={form.isRecurring ? theme.colors.primary[500] : theme.colors.neutral[400]} />
            </View>
            {form.isRecurring && (
              <Select label="Recurrence Interval" placeholder="Select interval" options={intervalOptions} value={form.recurrenceInterval} onChange={(v) => update('recurrenceInterval', v as any)} error={errors.recurrenceInterval} />
            )}

            <Input label="Notes (optional)" placeholder="Add a note..." value={form.notes} onChangeText={(v) => update('notes', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' } as any} leftIcon="📝" />
            <Button label={isEditing ? 'Save Changes' : 'Add Income'} onPress={handleSubmit} loading={loading} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
