import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useReports } from '../../hooks/useReports';
import { useResponsive } from '../../hooks/useResponsive';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency, formatMonth, toMonthKey } from '../../lib/formatting';
import SafeScrollView from '../../components/layout/SafeScrollView';
import Card from '../../components/ui/Card';

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#EF4444',
  'Transport': '#F59E0B',
  'Shopping': '#8B5CF6',
  'Health': '#06B6D4',
  'Entertainment': '#EC4899',
  'Housing': '#0D9488',
  'Education': '#3B82F6',
  'Other': '#6B7280',
  'Salary': '#22C55E',
  'Freelance': '#10B981',
  'Business': '#14B8A6',
  'Investment': '#6366F1',
  'Gift': '#F472B6',
  'Refund': '#84CC16',
};

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(toMonthKey(d));
  }
  return months;
}

function getMonthShort(month: string): string {
  const [year, m] = month.split('-');
  const d = new Date(Number(year), Number(m) - 1, 1);
  return d.toLocaleDateString('en-PH', { month: 'short' });
}

export default function ReportsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const { hp, sp, isTablet, contentWidth, width } = useResponsive();
  const [selectedMonth, setSelectedMonth] = useState(toMonthKey());
  const monthOptions = getMonthOptions();

  const { expensesByCategory, incomeByCategory, monthlyTrends, allTimeBalance, isLoading, refresh } =
    useReports(selectedMonth);

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const maxTrendValue = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.income, t.expenses)),
    1
  );

  const totalExpenses = expensesByCategory.reduce((s, c) => s + c.total, 0);
  const totalIncome = incomeByCategory.reduce((s, c) => s + c.total, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        paddingHorizontal: hp, paddingTop: sp, paddingBottom: sp * 0.5,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        maxWidth: contentWidth, alignSelf: width >= 768 ? 'center' : 'stretch', width: '100%',
      }}>
        <View style={{ marginBottom: theme.spacing.md }}>
          <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Reports</Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            {formatMonth(selectedMonth)}
          </Text>
        </View>

        {/* Month chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs, paddingBottom: sp * 0.5 }}>
          {monthOptions.map((m) => {
            const active = selectedMonth === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMonth(m)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 7,
                  borderRadius: theme.radii.full,
                  backgroundColor: active ? theme.colors.primary[500] : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary[500] : theme.colors.border,
                }}
                activeOpacity={0.75}
              >
                <Text style={[theme.typography.labelLg, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                  {formatMonth(m)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SafeScrollView
        onRefresh={refresh}
        refreshing={isLoading}
        contentStyle={{ paddingTop: sp }}
      >
        <View style={{
          paddingHorizontal: hp,
          maxWidth: contentWidth,
          alignSelf: width >= 768 ? 'center' : 'stretch',
          width: '100%',
        }}>

          {/* All-time balance */}
          <Card style={{ marginBottom: theme.spacing.md, backgroundColor: theme.colors.primary[600] }}>
            <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.75)', marginBottom: theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
              All-Time Balance
            </Text>
            <Text style={[theme.typography.displaySm, { color: '#fff', marginBottom: theme.spacing.md }]}>
              {allTimeBalance.net >= 0 ? '+' : ''}{formatCurrency(allTimeBalance.net, currency)}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: theme.radii.md, padding: theme.spacing.sm }}>
                <Text style={[theme.typography.bodySm, { color: 'rgba(255,255,255,0.7)' }]}>Total Income</Text>
                <Text style={[theme.typography.headingSm, { color: '#fff' }]}>
                  {formatCurrency(allTimeBalance.totalIncome, currency)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: theme.radii.md, padding: theme.spacing.sm }}>
                <Text style={[theme.typography.bodySm, { color: 'rgba(255,255,255,0.7)' }]}>Total Expenses</Text>
                <Text style={[theme.typography.headingSm, { color: '#fff' }]}>
                  {formatCurrency(allTimeBalance.totalExpenses, currency)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Monthly trend chart */}
          <Card style={{ marginBottom: theme.spacing.md }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.md }]}>
              6-Month Trend
            </Text>

            {/* Legend */}
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg, marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: theme.colors.success[500] }} />
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Income</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: theme.colors.danger[500] }} />
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Expenses</Text>
              </View>
            </View>

            {/* Bars */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 }}>
              {monthlyTrends.map((t) => {
                const incomeH = (t.income / maxTrendValue) * 100;
                const expenseH = (t.expenses / maxTrendValue) * 100;
                const isSelected = t.month === selectedMonth;
                return (
                  <View key={t.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                      {/* Income bar */}
                      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{
                          height: `${Math.max(incomeH, 3)}%`,
                          backgroundColor: theme.colors.success[500],
                          borderRadius: 3,
                          opacity: isSelected ? 1 : 0.6,
                        }} />
                      </View>
                      {/* Expense bar */}
                      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{
                          height: `${Math.max(expenseH, 3)}%`,
                          backgroundColor: theme.colors.danger[500],
                          borderRadius: 3,
                          opacity: isSelected ? 1 : 0.6,
                        }} />
                      </View>
                    </View>
                    <Text style={[theme.typography.bodySm, {
                      color: isSelected ? theme.colors.primary[500] : theme.colors.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 10,
                    }]}>
                      {getMonthShort(t.month)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Net for selected month */}
            {monthlyTrends.length > 0 && (() => {
              const selected = monthlyTrends.find((t) => t.month === selectedMonth);
              if (!selected) return null;
              const isPositive = selected.net >= 0;
              return (
                <View style={{
                  marginTop: theme.spacing.md,
                  paddingTop: theme.spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                  <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                    Net for {getMonthShort(selectedMonth)}
                  </Text>
                  <Text style={[theme.typography.labelLg, { color: isPositive ? theme.colors.success[500] : theme.colors.danger[500] }]}>
                    {isPositive ? '+' : ''}{formatCurrency(selected.net, currency)}
                  </Text>
                </View>
              );
            })()}
          </Card>

          {/* Two-column on tablet */}
          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            {/* Expenses by Category */}
            <Card style={{ flex: 1 }}>
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
                Expenses by Category
              </Text>
              {expensesByCategory.length === 0 ? (
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  No expenses this month.
                </Text>
              ) : (
                expensesByCategory.map((cat) => {
                  const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                  const color = CATEGORY_COLORS[cat.category] ?? '#6B7280';
                  return (
                    <View key={cat.category} style={{ marginBottom: theme.spacing.sm }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={[theme.typography.bodySm, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                          {cat.category}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                            {pct.toFixed(0)}%
                          </Text>
                          <Text style={[theme.typography.labelSm, { color: theme.colors.textPrimary }]}>
                            {formatCurrency(cat.total, currency)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3 }}>
                        <View style={{
                          height: 6,
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: 3,
                        }} />
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            {/* Income by Category */}
            <Card style={{ flex: 1 }}>
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
                Income by Category
              </Text>
              {incomeByCategory.length === 0 ? (
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  No income this month.
                </Text>
              ) : (
                incomeByCategory.map((cat) => {
                  const pct = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0;
                  const color = CATEGORY_COLORS[cat.category] ?? '#6B7280';
                  return (
                    <View key={cat.category} style={{ marginBottom: theme.spacing.sm }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={[theme.typography.bodySm, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                          {cat.category}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                            {pct.toFixed(0)}%
                          </Text>
                          <Text style={[theme.typography.labelSm, { color: theme.colors.textPrimary }]}>
                            {formatCurrency(cat.total, currency)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3 }}>
                        <View style={{
                          height: 6,
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: 3,
                        }} />
                      </View>
                    </View>
                  );
                })
              )}
            </Card>
          </View>

          {/* Income vs Expense comparison */}
          <Card style={{ marginBottom: theme.spacing.md }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.md }]}>
              This Month's Summary
            </Text>
            <View style={{ gap: theme.spacing.sm }}>
              {/* Income bar */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Income</Text>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.success[500] }]}>
                    {formatCurrency(totalIncome, currency)}
                  </Text>
                </View>
                <View style={{ height: 10, backgroundColor: theme.colors.border, borderRadius: 5 }}>
                  <View style={{
                    height: 10,
                    width: totalIncome + totalExpenses > 0
                      ? `${(totalIncome / (totalIncome + totalExpenses)) * 100}%`
                      : '0%',
                    backgroundColor: theme.colors.success[500],
                    borderRadius: 5,
                  }} />
                </View>
              </View>
              {/* Expenses bar */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Expenses</Text>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.danger[500] }]}>
                    {formatCurrency(totalExpenses, currency)}
                  </Text>
                </View>
                <View style={{ height: 10, backgroundColor: theme.colors.border, borderRadius: 5 }}>
                  <View style={{
                    height: 10,
                    width: totalIncome + totalExpenses > 0
                      ? `${(totalExpenses / (totalIncome + totalExpenses)) * 100}%`
                      : '0%',
                    backgroundColor: theme.colors.danger[500],
                    borderRadius: 5,
                  }} />
                </View>
              </View>
              {/* Divider + net */}
              <View style={{
                paddingTop: theme.spacing.sm,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Net</Text>
                <Text style={[theme.typography.headingSm, {
                  color: totalIncome - totalExpenses >= 0 ? theme.colors.success[500] : theme.colors.danger[500],
                }]}>
                  {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses, currency)}
                </Text>
              </View>
            </View>
          </Card>

        </View>
      </SafeScrollView>
    </SafeAreaView>
  );
}
