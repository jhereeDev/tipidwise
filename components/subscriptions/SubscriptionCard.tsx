import React from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, formatBillingCycle } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { daysUntil, isOverdue } from '../../lib/dateUtils';
import { SUBSCRIPTION_CATEGORIES } from '../../constants/categories';
import type { Subscription } from '../../types/models';

interface Props {
  subscription: Subscription;
  onPress: () => void;
  onToggleActive: (isActive: boolean) => void;
  onMarkPaid?: () => void;
}

export default function SubscriptionCard({ subscription, onPress, onToggleActive, onMarkPaid }: Props) {
  const theme = useTheme();
  const currency = useCurrency();
  const cat = SUBSCRIPTION_CATEGORIES.find((c) => c.value === subscription.category);
  const days = daysUntil(subscription.nextDueDate);
  const overdue = isOverdue(subscription.nextDueDate);

  // Paid this cycle = next due date is still in the future (already paid and advanced)
  const isPaid = days > 0 && subscription.lastPaidDate !== null;
  const isDueOrOverdue = days <= 0;

  const urgentColor = overdue
    ? theme.colors.danger[500]
    : days === 0
    ? theme.colors.warning[600]
    : days <= 2
    ? theme.colors.warning[500]
    : days <= 7
    ? theme.colors.primary[500]
    : theme.colors.success[500];

  const daysLabel = overdue
    ? `${Math.abs(days)}d overdue`
    : days === 0
    ? 'Due today'
    : `${days}d left`;

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      opacity: subscription.isActive ? 1 : 0.55,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    }}>
      {/* Top color accent strip */}
      <View style={{ height: 4, backgroundColor: subscription.isActive ? (cat?.color ?? theme.colors.warning[500]) : theme.colors.neutral[300] }} />

      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ padding: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
          <View style={{
            width: 48, height: 48,
            borderRadius: theme.radii.xl,
            backgroundColor: `${cat?.color ?? theme.colors.warning[500]}18`,
            alignItems: 'center', justifyContent: 'center',
            marginRight: theme.spacing.sm,
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: 24 }}>{cat?.icon ?? '🔄'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {subscription.name}
              </Text>
              {/* Paid badge */}
              {isPaid && (
                <View style={{
                  backgroundColor: `${theme.colors.success[500]}18`,
                  borderRadius: theme.radii.full,
                  paddingHorizontal: 7, paddingVertical: 2,
                  flexDirection: 'row', alignItems: 'center', gap: 3,
                }}>
                  <Text style={{ fontSize: 10 }}>✓</Text>
                  <Text style={[theme.typography.labelSm, { color: theme.colors.success[500] }]}>Paid</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <Text style={[theme.typography.labelSm, {
                color: cat?.color ?? theme.colors.warning[500],
                backgroundColor: `${cat?.color ?? theme.colors.warning[500]}18`,
                paddingHorizontal: 7, paddingVertical: 2,
                borderRadius: theme.radii.full,
                overflow: 'hidden',
              }]}>
                {formatBillingCycle(subscription.billingCycle)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[theme.typography.monoMd, { color: theme.colors.textPrimary, fontSize: 17 }]}>
              {formatCurrency(subscription.amount, currency)}
            </Text>
            <View style={{
              backgroundColor: `${urgentColor}18`,
              borderRadius: theme.radii.full,
              paddingHorizontal: 7, paddingVertical: 2,
              marginTop: 3,
            }}>
              <Text style={[theme.typography.labelSm, { color: urgentColor }]}>{daysLabel}</Text>
            </View>
          </View>
        </View>

        {/* Last paid note */}
        {isPaid && subscription.lastPaidDate && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            marginBottom: theme.spacing.sm,
          }}>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              Last paid {formatDate(subscription.lastPaidDate)} · Next due {formatDate(subscription.nextDueDate)}
            </Text>
          </View>
        )}

        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: theme.spacing.sm,
          borderTopWidth: 1, borderTopColor: theme.colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              📅 {formatDate(subscription.nextDueDate)}
            </Text>
            {/* Mark Paid button — shown only when due/overdue and subscription is active */}
            {isDueOrOverdue && subscription.isActive && onMarkPaid && (
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); onMarkPaid(); }}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 5,
                  borderRadius: theme.radii.full,
                  backgroundColor: theme.colors.success[500],
                }}
                activeOpacity={0.75}
              >
                <Text style={[theme.typography.labelSm, { color: '#fff' }]}>✓ Mark Paid</Text>
              </TouchableOpacity>
            )}
          </View>
          <Switch
            value={subscription.isActive}
            onValueChange={onToggleActive}
            trackColor={{ false: theme.colors.neutral[300], true: `${theme.colors.primary[500]}60` }}
            thumbColor={subscription.isActive ? theme.colors.primary[500] : theme.colors.neutral[400]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
