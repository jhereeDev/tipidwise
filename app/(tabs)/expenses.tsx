import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ExpenseListItem from '../../components/expenses/ExpenseListItem';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useResponsive } from '../../hooks/useResponsive';
import { toMonthKey, formatMonth, formatCurrency } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { getTotalExpensesByMonth } from '../../lib/db/expenses';

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(toMonthKey(d));
  }
  return months;
}

export default function ExpensesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { hp, sp, isTablet, contentWidth, width, landscapeHp, safeEdges } = useResponsive();
  const [selectedMonth, setSelectedMonth] = useState(toMonthKey());
  const [searchQuery, setSearchQuery] = useState('');
  const { expenses, isLoading, refresh } = useExpenses({ month: selectedMonth });
  const total = getTotalExpensesByMonth(selectedMonth);
  const monthOptions = getMonthOptions();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (e) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
  }, [expenses, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeEdges}>
      {/* Header */}
      <View style={{
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        paddingHorizontal: hp + landscapeHp,
      }}>
      <View style={{
        paddingTop: sp, paddingBottom: sp * 0.5,
        maxWidth: contentWidth, alignSelf: 'center', width: '100%',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
          <View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Expenses</Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {formatMonth(selectedMonth)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            {/* Budgets button */}
            <TouchableOpacity
              onPress={() => router.push('/(modals)/budgets' as any)}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 8,
                borderRadius: theme.radii.full,
                backgroundColor: `${theme.colors.primary[500]}12`,
                borderWidth: 1,
                borderColor: `${theme.colors.primary[500]}30`,
              }}
              activeOpacity={0.75}
            >
              <Text style={[theme.typography.labelSm, { color: theme.colors.primary[500] }]}>🎯 Budgets</Text>
            </TouchableOpacity>
            <View style={{
              backgroundColor: `${theme.colors.danger[500]}12`,
              borderRadius: theme.radii.lg,
              paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
            }}>
              <Text style={[theme.typography.monoMd, { color: theme.colors.danger[500] }]}>
                -{formatCurrency(total, currency)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/add-expense' as any)}
              style={{
                backgroundColor: theme.colors.danger[500],
                borderRadius: theme.radii.full,
                width: 44, height: 44,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontSize: 24, lineHeight: 28, fontWeight: '300' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.sm }}>
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
                  backgroundColor: active ? theme.colors.danger[500] : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.danger[500] : theme.colors.border,
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

        {/* Search bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderWidth: 1, borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          paddingHorizontal: theme.spacing.md,
          height: 44,
          marginBottom: theme.spacing.sm,
          gap: theme.spacing.sm,
        }}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={[theme.typography.bodyMd, { flex: 1, color: theme.colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search expenses..."
            placeholderTextColor={theme.colors.textDisabled}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, maxWidth: contentWidth, alignSelf: 'center', width: '100%', paddingHorizontal: landscapeHp }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="🧾"
            title={searchQuery ? 'No results' : 'No expenses yet'}
            description={
              searchQuery
                ? `No expenses matching "${searchQuery}".`
                : `No expenses recorded for ${formatMonth(selectedMonth)}.`
            }
            actionLabel={searchQuery ? undefined : 'Add Expense'}
            onAction={searchQuery ? undefined : () => router.push('/(modals)/add-expense' as any)}
          />
        ) : (
          <>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: hp, paddingVertical: theme.spacing.sm,
            }}>
              <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
            <Card noPadding style={{ flex: 1, marginHorizontal: hp, marginBottom: theme.spacing.md }}>
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                  <ExpenseListItem
                    expense={item}
                    onPress={() => router.push(`/(modals)/expense-detail/${item.id}` as any)}
                    showDivider={index < filtered.length - 1}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: theme.spacing.xs }}
                refreshing={isLoading}
                onRefresh={refresh}
              />
            </Card>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
