import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ResponsiveContainer from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../context/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { formatCurrency, formatDate, formatBillingCycle } from '../../../lib/formatting';
import { useCurrency } from '../../../context/CurrencyContext';
import { getSubscriptionById } from '../../../lib/db/subscriptions';
import { useSubscriptions } from '../../../hooks/useSubscriptions';
import { SUBSCRIPTION_CATEGORIES } from '../../../constants/categories';
import { daysUntil, isOverdue } from '../../../lib/dateUtils';

export default function SubscriptionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hp, landscapeHp, contentWidth, isLandscape } = useResponsive();
  const subscription = getSubscriptionById(parseInt(id, 10));
  const { deleteSubscription, toggleActive } = useSubscriptions();

  if (!subscription) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <Text style={[theme.typography.bodyLg, { color: theme.colors.textSecondary }]}>Subscription not found</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const cat = SUBSCRIPTION_CATEGORIES.find((c) => c.value === subscription.category);
  const days = daysUntil(subscription.nextDueDate);
  const overdue = isOverdue(subscription.nextDueDate);
  const daysLabel = overdue ? 'Overdue!' : days === 0 ? 'Due today!' : `Due in ${days} day${days !== 1 ? 's' : ''}`;
  const daysColor = overdue ? theme.colors.danger[500] : days <= 3 ? theme.colors.warning[500] : theme.colors.success[500];

  const handleDelete = () => {
    Alert.alert('Delete Subscription', `Are you sure you want to delete "${subscription.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSubscription(subscription.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingVertical: theme.spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>Subscription</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(modals)/add-subscription', params: { id } } as any)}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          <Card elevated style={{ alignItems: 'center', padding: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            <View style={{
              width: 72, height: 72, borderRadius: theme.radii.xl,
              backgroundColor: `${cat?.color ?? theme.colors.warning[500]}20`,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Text style={{ fontSize: 36 }}>{cat?.icon ?? '🔄'}</Text>
            </View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>{subscription.name}</Text>
            <Text style={[theme.typography.displaySm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
              {formatCurrency(subscription.amount, currency)}
            </Text>
            <Text style={[theme.typography.labelLg, { color: daysColor, marginBottom: theme.spacing.md }]}>{daysLabel}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Badge label={formatBillingCycle(subscription.billingCycle)} color={cat?.color} />
              <Badge label={subscription.isActive ? 'Active' : 'Paused'} color={subscription.isActive ? theme.colors.success[500] : theme.colors.neutral[500]} />
            </View>
          </Card>

          <Card style={{ marginBottom: theme.spacing.md }}>
            <View style={{ gap: theme.spacing.sm }}>
              <DetailRow label="Next Due Date" value={formatDate(subscription.nextDueDate)} theme={theme} />
              <DetailRow label="Billing Cycle" value={formatBillingCycle(subscription.billingCycle)} theme={theme} />
              <DetailRow label="Category" value={subscription.category} theme={theme} />
              <DetailRow label="Reminder" value={`${subscription.reminderDaysBefore} day${subscription.reminderDaysBefore !== 1 ? 's' : ''} before`} theme={theme} />
              {subscription.notes && <DetailRow label="Notes" value={subscription.notes} theme={theme} />}
            </View>
          </Card>

          {/* Toggle active */}
          <Card style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Active</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Toggle to pause/resume reminders</Text>
              </View>
              <Switch
                value={subscription.isActive}
                onValueChange={(v) => toggleActive(subscription.id, v)}
                trackColor={{ false: theme.colors.neutral[300], true: `${theme.colors.primary[500]}60` }}
                thumbColor={subscription.isActive ? theme.colors.primary[500] : theme.colors.neutral[400]}
              />
            </View>
          </Card>

          <Button label="Delete Subscription" onPress={handleDelete} variant="destructive" fullWidth />
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, flex: 1 }]}>{label}</Text>
      <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary, flex: 2, textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}
