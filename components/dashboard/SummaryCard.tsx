import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { formatMonth, toMonthKey } from '../../lib/formatting';
import { useResponsive } from '../../hooks/useResponsive';

interface SummaryCardProps {
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export default function SummaryCard({ totalIncome, totalExpenses, net }: SummaryCardProps) {
  const theme = useTheme();
  const currency = useCurrency();
  const { isTablet, fontScale } = useResponsive();
  const isPositive = net >= 0;
  const netColor = isPositive ? theme.colors.success[500] : theme.colors.danger[500];

  // Budget utilisation bar
  const total = totalIncome + totalExpenses;
  const expenseRatio = total > 0 ? Math.min(totalExpenses / (totalIncome || 1), 1) : 0;

  return (
    <View
      style={{
        borderRadius: theme.radii.xl,
        backgroundColor: theme.colors.primary[600],
        padding: isTablet ? theme.spacing.xl : theme.spacing.lg,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        ...Platform.select({
          ios: { shadowColor: theme.colors.primary[700], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16 },
          android: { elevation: 8 },
        }),
      }}
    >
      {/* Decorative circle */}
      <View style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.07)',
      }} />
      <View style={{
        position: 'absolute', bottom: -20, right: 60,
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
      }} />

      {/* Month label */}
      <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.7)', marginBottom: theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
        {formatMonth(toMonthKey())}
      </Text>

      {/* Net balance */}
      <Text style={{
        fontSize: isTablet ? 42 * fontScale : 36 * fontScale,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        color: '#FFFFFF',
        marginBottom: theme.spacing.xs,
        letterSpacing: -1,
      }}>
        {isPositive ? '+' : ''}{formatCurrency(net, currency)}
      </Text>
      <Text style={[theme.typography.bodySm, { color: 'rgba(255,255,255,0.65)', marginBottom: theme.spacing.lg }]}>
        Net balance this month
      </Text>

      {/* Progress bar */}
      {totalIncome > 0 && (
        <View style={{ marginBottom: theme.spacing.lg }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <View style={{
              height: 6,
              borderRadius: 3,
              width: `${expenseRatio * 100}%`,
              backgroundColor: expenseRatio > 0.9 ? theme.colors.danger[500] : expenseRatio > 0.7 ? theme.colors.warning[500] : 'rgba(255,255,255,0.85)',
            }} />
          </View>
          <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.6)', marginTop: theme.spacing.xs }]}>
            {Math.round(expenseRatio * 100)}% of income spent
          </Text>
        </View>
      )}

      {/* Income / Expense breakdown */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
        }}>
          <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.7)', marginBottom: theme.spacing.xs }]}>
            💰 Income
          </Text>
          <Text style={{
            fontSize: isTablet ? 18 : 15,
            fontWeight: '600',
            fontFamily: 'Inter_600SemiBold',
            color: '#FFFFFF',
            letterSpacing: -0.3,
          }}>
            {formatCurrency(totalIncome, currency)}
          </Text>
        </View>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
        }}>
          <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.7)', marginBottom: theme.spacing.xs }]}>
            🧾 Expenses
          </Text>
          <Text style={{
            fontSize: isTablet ? 18 : 15,
            fontWeight: '600',
            fontFamily: 'Inter_600SemiBold',
            color: '#FFFFFF',
            letterSpacing: -0.3,
          }}>
            {formatCurrency(totalExpenses, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}
