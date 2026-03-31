import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import IncomeListItem from '../../components/income/IncomeListItem';
import { useTheme } from '../../context/ThemeContext';
import { useIncome } from '../../hooks/useIncome';
import { useResponsive } from '../../hooks/useResponsive';
import { toMonthKey, formatMonth, formatCurrency } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { getTotalIncomeByMonth } from '../../lib/db/income';

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(toMonthKey(d));
  }
  return months;
}

export default function IncomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { hp, sp, contentWidth, width, landscapeHp, safeEdges } = useResponsive();
  const [selectedMonth, setSelectedMonth] = useState(toMonthKey());
  const [searchQuery, setSearchQuery] = useState('');
  const { income, isLoading, refresh } = useIncome({ month: selectedMonth });
  const total = getTotalIncomeByMonth(selectedMonth);
  const monthOptions = getMonthOptions();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return income;
    const q = searchQuery.toLowerCase();
    return income.filter(
      (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [income, searchQuery]);

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
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Income</Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {formatMonth(selectedMonth)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View style={{
              backgroundColor: `${theme.colors.success[500]}12`,
              borderRadius: theme.radii.lg,
              paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
            }}>
              <Text style={[theme.typography.monoMd, { color: theme.colors.success[500] }]}>
                +{formatCurrency(total, currency)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/add-income' as any)}
              style={{
                backgroundColor: theme.colors.success[500],
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
                  backgroundColor: active ? theme.colors.success[500] : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.success[500] : theme.colors.border,
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
            placeholder="Search income..."
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
            icon="💰"
            title={searchQuery ? 'No results' : 'No income recorded'}
            description={
              searchQuery
                ? `No income matching "${searchQuery}".`
                : `No income recorded for ${formatMonth(selectedMonth)}.`
            }
            actionLabel={searchQuery ? undefined : 'Add Income'}
            onAction={searchQuery ? undefined : () => router.push('/(modals)/add-income' as any)}
          />
        ) : (
          <>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: hp, paddingVertical: theme.spacing.sm,
            }}>
              <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
            <Card noPadding style={{ flex: 1, marginHorizontal: hp, marginBottom: theme.spacing.md }}>
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                  <IncomeListItem
                    income={item}
                    onPress={() => router.push(`/(modals)/income-detail/${item.id}` as any)}
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
