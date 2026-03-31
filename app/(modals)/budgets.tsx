import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useBudgets } from '../../hooks/useBudgets';
import { useResponsive } from '../../hooks/useResponsive';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency, toMonthKey } from '../../lib/formatting';
import Card from '../../components/ui/Card';
import type { ExpenseCategory } from '../../types/models';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining', 'Transport', 'Shopping', 'Health',
  'Entertainment', 'Housing', 'Education', 'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#EF4444',
  'Transport': '#F59E0B',
  'Shopping': '#8B5CF6',
  'Health': '#06B6D4',
  'Entertainment': '#EC4899',
  'Housing': '#0D9488',
  'Education': '#3B82F6',
  'Other': '#6B7280',
};

export default function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { hp, sp, contentWidth, width } = useResponsive();
  const { budgetsWithSpend, setBudget, removeBudget, refresh } = useBudgets(toMonthKey());

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [limitInput, setLimitInput] = useState('');

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const openSetBudget = (cat: ExpenseCategory) => {
    const existing = budgetsWithSpend.find((b) => b.category === cat);
    setSelectedCategory(cat);
    setLimitInput(existing ? String(existing.monthlyLimit) : '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!selectedCategory) return;
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget limit greater than 0.');
      return;
    }
    setBudget(selectedCategory, limit);
    setModalVisible(false);
  };

  const handleRemove = (cat: ExpenseCategory) => {
    Alert.alert(
      'Remove Budget',
      `Remove the budget limit for ${cat}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeBudget(cat) },
      ]
    );
  };

  const budgetMap = new Map(budgetsWithSpend.map((b) => [b.category, b]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: hp, paddingTop: sp, paddingBottom: sp * 0.75,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <View>
          <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Budgets</Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Monthly spending limits
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40, height: 40, borderRadius: theme.radii.full,
            backgroundColor: theme.colors.surface,
            borderWidth: 1, borderColor: theme.colors.border,
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={EXPENSE_CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          paddingHorizontal: hp,
          paddingTop: sp,
          paddingBottom: theme.spacing.xxl,
          maxWidth: contentWidth,
          alignSelf: width >= 768 ? 'center' : undefined,
          width: '100%',
        }}
        renderItem={({ item: cat }) => {
          const budget = budgetMap.get(cat);
          const color = CATEGORY_COLORS[cat] ?? '#6B7280';
          const hasBudget = !!budget;
          const isOver = budget?.isOverBudget ?? false;
          const pct = budget?.percentage ?? 0;
          const barColor = isOver
            ? theme.colors.danger[500]
            : pct >= 80
            ? theme.colors.warning[500]
            : theme.colors.primary[500];

          return (
            <Card style={{ marginBottom: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: hasBudget ? theme.spacing.sm : 0 }}>
                {/* Color dot */}
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary, flex: 1 }]}>
                  {cat}
                </Text>
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
                  {hasBudget && (
                    <TouchableOpacity onPress={() => handleRemove(cat)} activeOpacity={0.7}>
                      <Text style={[theme.typography.bodySm, { color: theme.colors.danger[500] }]}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => openSetBudget(cat)}
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: 6,
                      borderRadius: theme.radii.full,
                      backgroundColor: hasBudget ? theme.colors.surface : theme.colors.primary[500],
                      borderWidth: 1,
                      borderColor: hasBudget ? theme.colors.border : theme.colors.primary[500],
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[theme.typography.labelSm, { color: hasBudget ? theme.colors.textPrimary : '#fff' }]}>
                      {hasBudget ? 'Edit' : 'Set Limit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {hasBudget && budget && (
                <>
                  {/* Progress bar */}
                  <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3, marginBottom: 6 }}>
                    <View style={{
                      height: 6,
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: barColor,
                      borderRadius: 3,
                    }} />
                  </View>
                  {/* Spend detail */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      {formatCurrency(budget.spent, currency)} spent
                    </Text>
                    <Text style={[theme.typography.bodySm, {
                      color: isOver ? theme.colors.danger[500] : theme.colors.textSecondary,
                    }]}>
                      {isOver
                        ? `${formatCurrency(Math.abs(budget.remaining), currency)} over`
                        : `${formatCurrency(budget.remaining, currency)} left`} / {formatCurrency(budget.monthlyLimit, currency)}
                    </Text>
                  </View>
                </>
              )}
            </Card>
          );
        }}
      />

      {/* Set Limit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl,
          borderTopRightRadius: theme.radii.xl,
          padding: hp,
          paddingBottom: 40,
          gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>
            Budget for {selectedCategory}
          </Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Set a monthly spending limit for this category.
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.md,
            height: 52,
          }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textSecondary, marginRight: theme.spacing.sm }]}>
              {currency}
            </Text>
            <TextInput
              style={[theme.typography.headingSm, { flex: 1, color: theme.colors.textPrimary }]}
              value={limitInput}
              onChangeText={setLimitInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                flex: 1, height: 52, borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.background,
                borderWidth: 1, borderColor: theme.colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 2, height: 52, borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.primary[500],
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
