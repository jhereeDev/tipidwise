import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../ui/Card';
import Divider from '../ui/Divider';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDateShort } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import type { Transaction } from '../../types/models';

interface Props {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: Props) {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();

  return (
    <Card noPadding style={{ marginBottom: theme.spacing.md }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
      }}>
        <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary }]}>
          Recent Transactions
        </Text>
        {transactions.length > 0 && (
          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary }]}>
            Last {transactions.length}
          </Text>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.md }}>
          <Text style={{ fontSize: 36, marginBottom: theme.spacing.sm }}>📋</Text>
          <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
            No transactions yet.{'\n'}Add your first expense or income.
          </Text>
        </View>
      ) : (
        transactions.map((tx, idx) => {
          const isExpense = tx.type === 'expense';
          const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
          const cat = categories.find((c) => c.value === tx.category);
          const title = (tx as any).title;

          return (
            <View key={`${tx.type}-${tx.id}`}>
              {idx > 0 && <Divider inset={theme.spacing.md} />}
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    (isExpense
                      ? `/(modals)/expense-detail/${tx.id}`
                      : `/(modals)/income-detail/${tx.id}`) as any
                  )
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 12,
                  minHeight: 60,
                }}
                activeOpacity={0.65}
              >
                <View style={{
                  width: 44, height: 44,
                  borderRadius: theme.radii.lg,
                  backgroundColor: `${cat?.color ?? theme.colors.primary[500]}18`,
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: theme.spacing.sm,
                }}>
                  <Text style={{ fontSize: 20 }}>{cat?.icon ?? '💰'}</Text>
                </View>
                <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <Text
                    style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={[theme.typography.labelSm, {
                      color: 'white',
                      backgroundColor: `${cat?.color ?? theme.colors.neutral[500]}90`,
                      paddingHorizontal: 6, paddingVertical: 1,
                      borderRadius: theme.radii.sm,
                      overflow: 'hidden',
                    }]}>
                      {tx.category}
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      {formatDateShort(tx.date)}
                    </Text>
                  </View>
                </View>
                <Text style={[theme.typography.monoMd, {
                  color: isExpense ? theme.colors.danger[500] : theme.colors.success[500],
                  fontWeight: '600',
                }]}>
                  {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </Card>
  );
}
