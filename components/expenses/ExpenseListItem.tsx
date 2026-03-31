import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDateShort } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import type { Expense } from '../../types/models';
import Divider from '../ui/Divider';

interface Props {
  expense: Expense;
  onPress: () => void;
  showDivider?: boolean;
}

export default function ExpenseListItem({ expense, onPress, showDivider = true }: Props) {
  const theme = useTheme();
  const currency = useCurrency();
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: theme.spacing.md,
          minHeight: 64,
        }}
        activeOpacity={0.65}
      >
        <View style={{
          width: 44, height: 44,
          borderRadius: theme.radii.lg,
          backgroundColor: `${cat?.color ?? '#6B7280'}18`,
          alignItems: 'center', justifyContent: 'center',
          marginRight: theme.spacing.sm,
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 20 }}>{cat?.icon ?? '📦'}</Text>
        </View>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {expense.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={[theme.typography.labelSm, {
              color: 'white',
              backgroundColor: `${cat?.color ?? '#6B7280'}90`,
              paddingHorizontal: 6, paddingVertical: 1,
              borderRadius: theme.radii.sm,
              overflow: 'hidden',
            }]}>
              {cat?.label ?? expense.category}
            </Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {formatDateShort(expense.date)}
            </Text>
          </View>
        </View>
        <Text style={[theme.typography.monoMd, { color: theme.colors.danger[500] }]}>
          -{formatCurrency(expense.amount, currency)}
        </Text>
      </TouchableOpacity>
      {showDivider && <Divider inset={theme.spacing.md} />}
    </>
  );
}
