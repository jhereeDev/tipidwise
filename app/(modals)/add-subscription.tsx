import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useResponsive } from '../../hooks/useResponsive';
import { SUBSCRIPTION_CATEGORIES } from '../../constants/categories';
import { BILLING_CYCLES, REMINDER_DAYS_OPTIONS } from '../../constants/config';
import { validateSubscriptionForm, hasErrors } from '../../lib/validation';
import { toDateString } from '../../lib/formatting';
import { getSubscriptionById } from '../../lib/db/subscriptions';
import type { SubscriptionFormState, FormErrors } from '../../types/forms';

const INITIAL_STATE: SubscriptionFormState = {
  name: '', amount: '', billingCycle: '', nextDueDate: toDateString(new Date()),
  reminderDaysBefore: '3', isActive: true, category: '', notes: '',
};

export default function AddSubscriptionModal() {
  const theme = useTheme();
  const router = useRouter();
  const { hp, contentWidth, width } = useResponsive();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const { addSubscription, updateSubscription } = useSubscriptions();

  const [form, setForm] = useState<SubscriptionFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors<SubscriptionFormState>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const sub = getSubscriptionById(parseInt(id, 10));
      if (sub) setForm({ name: sub.name, amount: String(sub.amount), billingCycle: sub.billingCycle, nextDueDate: sub.nextDueDate, reminderDaysBefore: String(sub.reminderDaysBefore), isActive: sub.isActive, category: sub.category, notes: sub.notes ?? '' });
    }
  }, [id]);

  const update = <K extends keyof SubscriptionFormState>(field: K, value: SubscriptionFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async () => {
    const validationErrors = validateSubscriptionForm(form);
    if (hasErrors(validationErrors)) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      if (isEditing && id) await updateSubscription(parseInt(id, 10), form);
      else await addSubscription(form);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = SUBSCRIPTION_CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));
  const cycleOptions = BILLING_CYCLES.map((c) => ({ value: c.value, label: c.label }));
  const reminderOptions = REMINDER_DAYS_OPTIONS.map((r) => ({ value: r.value, label: r.label }));

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
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </Text>
          <View style={{ minWidth: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ maxWidth: contentWidth, alignSelf: width >= 768 ? 'center' : 'stretch', width: '100%', paddingHorizontal: hp, gap: theme.spacing.md }}>
            <Input label="Service Name" placeholder="e.g. Netflix, Spotify" value={form.name} onChangeText={(v) => update('name', v)} error={errors.name} leftIcon="🔄" />
            <Input label="Amount" placeholder="0.00" value={form.amount} onChangeText={(v) => update('amount', v)} error={errors.amount} keyboardType="decimal-pad" leftIcon="₱" />

            {/* Two-column row for cycle + category on tablet */}
            <View style={{ flexDirection: width >= 600 ? 'row' : 'column', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Select label="Billing Cycle" placeholder="Select cycle" options={cycleOptions} value={form.billingCycle} onChange={(v) => update('billingCycle', v as any)} error={errors.billingCycle} />
              </View>
              <View style={{ flex: 1 }}>
                <Select label="Category" placeholder="Select category" options={categoryOptions} value={form.category} onChange={(v) => update('category', v as any)} error={errors.category} />
              </View>
            </View>

            <View style={{ flexDirection: width >= 600 ? 'row' : 'column', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <DatePicker label="Next Due Date" value={form.nextDueDate} onChange={(v) => update('nextDueDate', v)} error={errors.nextDueDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Select label="Remind Me" placeholder="Reminder timing" options={reminderOptions} value={form.reminderDaysBefore} onChange={(v) => update('reminderDaysBefore', v)} />
              </View>
            </View>

            {/* Active toggle */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: theme.colors.surface, borderRadius: theme.radii.md,
              padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Active</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Receive reminders for this subscription</Text>
              </View>
              <Switch value={form.isActive} onValueChange={(v) => update('isActive', v)}
                trackColor={{ false: theme.colors.neutral[300], true: `${theme.colors.primary[500]}60` }}
                thumbColor={form.isActive ? theme.colors.primary[500] : theme.colors.neutral[400]} />
            </View>

            <Input label="Notes (optional)" placeholder="Add a note..." value={form.notes} onChangeText={(v) => update('notes', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' } as any} leftIcon="📝" />
            <Button label={isEditing ? 'Save Changes' : 'Add Subscription'} onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ backgroundColor: theme.colors.warning[500] }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
