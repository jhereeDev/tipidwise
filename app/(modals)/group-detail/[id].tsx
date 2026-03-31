import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Alert, Share } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useGroupDetail } from '../../../hooks/useGroups';
import { useResponsive } from '../../../hooks/useResponsive';
import { useCurrency } from '../../../context/CurrencyContext';
import { formatCurrency, formatDate } from '../../../lib/formatting';
import { calculateBalances, simplifyDebts } from '../../../lib/groups/debtSimplification';
import { calculateSplit, SplitType } from '../../../lib/groups/splitCalculations';
import { supabase } from '../../../lib/supabase/client';

export default function GroupDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { members, expenses, isLoading, fetchDetail, addExpense, settleUp } = useGroupDetail(id);
  const { hp, landscapeHp, contentWidth, isLandscape, sp } = useResponsive();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [addingExpense, setAddingExpense] = useState(false);

  const [groupInfo, setGroupInfo] = useState<{ name: string; emoji: string; inviteCode: string } | null>(null);

  useFocusEffect(useCallback(() => {
    fetchDetail();
    // Fetch group info
    supabase.from('groups').select('name, emoji, invite_code').eq('id', id).single()
      .then(({ data }) => {
        if (data) setGroupInfo({ name: data.name, emoji: data.emoji, inviteCode: data.invite_code });
      });
  }, [id]));

  // Calculate balances
  const balances = calculateBalances(
    members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    expenses.map((e) => ({
      paidBy: e.paidBy,
      splits: [], // We'd need to fetch splits — simplified for now
    })),
    []
  );

  const suggestedSettlements = simplifyDebts(balances);

  const handleAddExpense = async () => {
    if (!expenseTitle.trim() || !expenseAmount.trim()) {
      Alert.alert('Missing fields', 'Please fill in title and amount.');
      return;
    }
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    setAddingExpense(true);
    try {
      const memberIds = members.map((m) => m.userId);
      const splits = calculateSplit(splitType, amount, memberIds);
      await addExpense(expenseTitle.trim(), amount, splitType, splits);
      setShowAddExpense(false);
      setExpenseTitle('');
      setExpenseAmount('');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add expense.');
    } finally {
      setAddingExpense(false);
    }
  };

  const handleShareInvite = async () => {
    if (!groupInfo) return;
    try {
      await Share.share({
        message: `Join my group "${groupInfo.name}" on TipidWise! Use invite code: ${groupInfo.inviteCode}`,
      });
    } catch {}
  };

  const totalGroupExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingVertical: theme.spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>
              {groupInfo?.emoji} {groupInfo?.name ?? 'Group'}
            </Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShareInvite}>
            <Text style={{ fontSize: 20 }}>🔗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            {/* Summary Card */}
            <Card style={{ backgroundColor: theme.colors.primary[600] }}>
              <Text style={[theme.typography.labelSm, { color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.6 }]}>
                Total Group Expenses
              </Text>
              <Text style={[theme.typography.displaySm, { color: '#fff', marginTop: theme.spacing.xs }]}>
                {formatCurrency(totalGroupExpenses, currency)}
              </Text>
            </Card>

            {/* Members */}
            <Card>
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
                Members
              </Text>
              {members.map((m) => (
                <View key={m.userId} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: theme.radii.full,
                    backgroundColor: `${theme.colors.primary[500]}20`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 14 }}>👤</Text>
                  </View>
                  <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary, flex: 1 }]}>
                    {m.displayName} {m.userId === user?.id ? '(You)' : ''}
                  </Text>
                  {m.role === 'admin' && (
                    <Text style={[theme.typography.bodySm, { color: theme.colors.primary[500] }]}>Admin</Text>
                  )}
                </View>
              ))}
            </Card>

            {/* Add Expense Button */}
            <Button
              label="+ Add Group Expense"
              onPress={() => setShowAddExpense(true)}
              fullWidth
              size="lg"
            />

            {/* Expenses header */}
            {expenses.length > 0 && (
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary }]}>
                Recent Expenses
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  Paid by {item.paidByName} · {formatDate(item.date)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary }]}>
                  {formatCurrency(item.amount, currency)}
                </Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  {item.splitType} split
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
            <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>🧾</Text>
            <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
              No expenses yet. Add one to start splitting!
            </Text>
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: hp + landscapeHp,
          paddingTop: sp,
          paddingBottom: theme.spacing.xxl,
          maxWidth: contentWidth,
          alignSelf: 'center',
          width: '100%',
        }}
        refreshing={isLoading}
        onRefresh={fetchDetail}
      />

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} animationType="slide" transparent onRequestClose={() => setShowAddExpense(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowAddExpense(false)} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl,
          padding: hp + landscapeHp, paddingBottom: 40, gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>Add Group Expense</Text>

          <View style={{
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52, justifyContent: 'center',
          }}>
            <TextInput
              style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}
              value={expenseTitle}
              onChangeText={setExpenseTitle}
              placeholder="What was it for?"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52,
          }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textSecondary, marginRight: theme.spacing.sm }]}>
              {currency}
            </Text>
            <TextInput
              style={[theme.typography.headingSm, { flex: 1, color: theme.colors.textPrimary }]}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textDisabled}
            />
          </View>

          {/* Split type selector */}
          <View>
            <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
              Split Type
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
              {(['equal', 'unequal', 'percentage', 'shares'] as SplitType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSplitType(type)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: theme.radii.md,
                    backgroundColor: splitType === type ? theme.colors.primary[500] : theme.colors.background,
                    borderWidth: 1, borderColor: splitType === type ? theme.colors.primary[500] : theme.colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={[theme.typography.labelSm, { color: splitType === type ? '#fff' : theme.colors.textSecondary, textTransform: 'capitalize' }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Split {splitType === 'equal' ? 'equally' : `by ${splitType}`} among {members.length} member{members.length !== 1 ? 's' : ''}
          </Text>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => setShowAddExpense(false)}
              style={{ flex: 1, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddExpense}
              style={{ flex: 2, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center', opacity: addingExpense ? 0.6 : 1 }}
              disabled={addingExpense}
            >
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>{addingExpense ? 'Adding...' : 'Add Expense'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
