import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ResponsiveContainer from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency, formatDate, formatBillingCycle } from '../../../lib/formatting';
import { useCurrency } from '../../../context/CurrencyContext';
import { getIncomeById, deleteIncome } from '../../../lib/db/income';
import { INCOME_CATEGORIES } from '../../../constants/categories';

export default function IncomeDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const income = getIncomeById(parseInt(id, 10));

  if (!income) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <Text style={[theme.typography.bodyLg, { color: theme.colors.textSecondary }]}>Income record not found</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const cat = INCOME_CATEGORIES.find((c) => c.value === income.category);

  const handleDelete = () => {
    Alert.alert('Delete Income', 'Are you sure you want to delete this income record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteIncome(income.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>Income Details</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(modals)/add-income', params: { id } } as any)}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          <Card elevated style={{ alignItems: 'center', padding: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            <View style={{
              width: 72, height: 72, borderRadius: theme.radii.xl,
              backgroundColor: `${cat?.color ?? '#22C55E'}20`,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Text style={{ fontSize: 36 }}>{cat?.icon ?? '💰'}</Text>
            </View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>{income.title}</Text>
            <Text style={[theme.typography.displaySm, { color: theme.colors.success[500], marginBottom: theme.spacing.md }]}>
              +{formatCurrency(income.amount, currency)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Badge label={income.category} color={cat?.color} icon={cat?.icon} />
              {income.isRecurring && <Badge label={`Recurring · ${income.recurrenceInterval}`} color={theme.colors.primary[500]} icon="🔄" />}
            </View>
          </Card>

          <Card style={{ marginBottom: theme.spacing.md }}>
            <View style={{ gap: theme.spacing.sm }}>
              <DetailRow label="Date" value={formatDate(income.date)} theme={theme} />
              <DetailRow label="Category" value={income.category} theme={theme} />
              {income.isRecurring && income.recurrenceInterval && (
                <DetailRow label="Recurrence" value={formatBillingCycle(income.recurrenceInterval)} theme={theme} />
              )}
              {income.notes && <DetailRow label="Notes" value={income.notes} theme={theme} />}
              <DetailRow label="Added" value={new Date(income.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })} theme={theme} />
            </View>
          </Card>

          <Button label="Delete Income" onPress={handleDelete} variant="destructive" fullWidth />
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
