import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ResponsiveContainer from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../context/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { formatCurrency, formatDate } from '../../../lib/formatting';
import { useCurrency } from '../../../context/CurrencyContext';
import { getExpenseById, deleteExpense } from '../../../lib/db/expenses';
import { EXPENSE_CATEGORIES } from '../../../constants/categories';

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hp, landscapeHp, contentWidth, isLandscape } = useResponsive();
  const expense = getExpenseById(parseInt(id, 10));

  if (!expense) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <Text style={[theme.typography.bodyLg, { color: theme.colors.textSecondary }]}>Expense not found</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteExpense(expense.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingVertical: theme.spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>Expense Details</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(modals)/add-expense', params: { id } } as any)}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          <Card elevated style={{ alignItems: 'center', padding: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            <View style={{
              width: 72, height: 72, borderRadius: theme.radii.xl,
              backgroundColor: `${cat?.color ?? '#EF4444'}20`,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Text style={{ fontSize: 36 }}>{cat?.icon ?? '📦'}</Text>
            </View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>{expense.title}</Text>
            <Text style={[theme.typography.displaySm, { color: theme.colors.danger[500], marginBottom: theme.spacing.md }]}>
              -{formatCurrency(expense.amount, currency)}
            </Text>
            <Badge label={expense.category} color={cat?.color} icon={cat?.icon} />
          </Card>

          <Card style={{ marginBottom: theme.spacing.md }}>
            <View style={{ gap: theme.spacing.sm }}>
              <DetailRow label="Date" value={formatDate(expense.date)} theme={theme} />
              <DetailRow label="Category" value={expense.category} theme={theme} />
              {expense.notes && <DetailRow label="Notes" value={expense.notes} theme={theme} />}
              <DetailRow label="Added" value={new Date(expense.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })} theme={theme} />
            </View>
          </Card>

          <Button label="Delete Expense" onPress={handleDelete} variant="destructive" fullWidth />
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
