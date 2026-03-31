import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDateShort } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { daysUntil, isOverdue } from '../../lib/dateUtils';
import { SUBSCRIPTION_CATEGORIES } from '../../constants/categories';
import type { Subscription } from '../../types/models';

interface Props {
  subscriptions: Subscription[];
  onMarkPaid?: (id: number) => void;
}

export default function UpcomingSubscriptions({ subscriptions, onMarkPaid }: Props) {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();

  if (subscriptions.length === 0) return null;

  return (
    <Card noPadding style={{ marginBottom: theme.spacing.md }}>
      <View style={{
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary }]}>
          Due Soon
        </Text>
        <View style={{
          backgroundColor: `${theme.colors.warning[500]}20`,
          borderRadius: theme.radii.full,
          paddingHorizontal: 8, paddingVertical: 2,
        }}>
          <Text style={[theme.typography.labelSm, { color: theme.colors.warning[600] }]}>
            {subscriptions.length} upcoming
          </Text>
        </View>
      </View>

      {subscriptions.map((sub, idx) => {
        const cat = SUBSCRIPTION_CATEGORIES.find((c) => c.value === sub.category);
        const days = daysUntil(sub.nextDueDate);
        const overdue = isOverdue(sub.nextDueDate);
        const isDueOrOverdue = days <= 0;
        const daysLabel = overdue ? 'Overdue!' : days === 0 ? 'Due today' : `${days}d`;
        const urgentColor = overdue
          ? theme.colors.danger[500]
          : days <= 2
          ? theme.colors.warning[500]
          : theme.colors.success[500];

        return (
          <TouchableOpacity
            key={sub.id}
            onPress={() => router.push(`/(modals)/subscription-detail/${sub.id}` as any)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 12,
              minHeight: 56,
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopColor: theme.colors.border,
            }}
            activeOpacity={0.65}
          >
            <View style={{
              width: 40, height: 40,
              borderRadius: theme.radii.lg,
              backgroundColor: `${cat?.color ?? theme.colors.warning[500]}18`,
              alignItems: 'center', justifyContent: 'center',
              marginRight: theme.spacing.sm,
            }}>
              <Text style={{ fontSize: 18 }}>{cat?.icon ?? '🔄'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {sub.name}
              </Text>
              <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                {formatDateShort(sub.nextDueDate)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={[theme.typography.monoMd, { color: theme.colors.textPrimary }]}>
                {formatCurrency(sub.amount, currency)}
              </Text>
              {isDueOrOverdue && onMarkPaid ? (
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); onMarkPaid(sub.id); }}
                  style={{
                    paddingHorizontal: 8, paddingVertical: 3,
                    borderRadius: theme.radii.full,
                    backgroundColor: theme.colors.success[500],
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[theme.typography.labelSm, { color: '#fff' }]}>✓ Paid</Text>
                </TouchableOpacity>
              ) : (
                <View style={{
                  backgroundColor: `${urgentColor}20`,
                  borderRadius: theme.radii.full,
                  paddingHorizontal: 6, paddingVertical: 1,
                }}>
                  <Text style={[theme.typography.labelSm, { color: urgentColor }]}>{daysLabel}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </Card>
  );
}
