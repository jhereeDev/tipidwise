import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { useResponsive } from '../../hooks/useResponsive';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../lib/formatting';

const GOAL_ICONS = ['🎯', '🏠', '✈️', '🚗', '💻', '📱', '🎓', '💍', '🏥', '🎉'];

export default function SavingsGoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { hp, sp, contentWidth, safeEdges, landscapeHp } = useResponsive();
  const { goals, refresh, addGoal, updateProgress, deleteGoal } = useSavingsGoals();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [contributeAmount, setContributeAmount] = useState('');

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const handleAdd = async () => {
    if (!title.trim() || !targetAmount.trim()) {
      Alert.alert('Missing fields', 'Please enter a title and target amount.');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid target amount.');
      return;
    }
    await addGoal({
      title: title.trim(),
      targetAmount: target,
      deadline: deadline || undefined,
      icon: selectedIcon,
    });
    setShowAddModal(false);
    setTitle('');
    setTargetAmount('');
    setDeadline('');
  };

  const handleContribute = async () => {
    if (!selectedGoalId || !contributeAmount.trim()) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    await updateProgress(selectedGoalId, amount);
    setShowContributeModal(false);
    setContributeAmount('');
    setSelectedGoalId(null);
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Delete Goal', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeEdges}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingTop: sp, paddingBottom: sp * 0.75 }}>
          <View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Savings Goals</Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {goals.length} goal{goals.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: theme.radii.full, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ backgroundColor: theme.colors.primary[500], borderRadius: theme.radii.full, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.8}>
              <Text style={{ color: '#fff', fontSize: 24, lineHeight: 28, fontWeight: '300' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: hp + landscapeHp, paddingTop: sp, paddingBottom: theme.spacing.xxl, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }}
        renderItem={({ item }) => {
          const pct = item.target_amount > 0 ? Math.min((item.current_amount / item.target_amount) * 100, 100) : 0;
          const isComplete = item.is_completed;
          return (
            <Card style={{ marginBottom: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                  {item.deadline && (
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      Due: {item.deadline}
                    </Text>
                  )}
                </View>
                {isComplete && <Text style={{ fontSize: 20 }}>✅</Text>}
              </View>

              {/* Progress bar */}
              <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 4, marginBottom: theme.spacing.xs }}>
                <View style={{
                  height: 8,
                  width: `${pct}%`,
                  backgroundColor: isComplete ? theme.colors.success[500] : theme.colors.primary[500],
                  borderRadius: 4,
                }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(item.current_amount, currency)} / {formatCurrency(item.target_amount, currency)} ({pct.toFixed(0)}%)
                </Text>
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  {!isComplete && (
                    <TouchableOpacity
                      onPress={() => { setSelectedGoalId(item.id); setShowContributeModal(true); }}
                      style={{ paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radii.full, backgroundColor: theme.colors.primary[500] }}
                    >
                      <Text style={[theme.typography.labelSm, { color: '#fff' }]}>+ Add</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.danger[500] }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxl }}>
            <Text style={{ fontSize: 64, marginBottom: theme.spacing.lg }}>🎯</Text>
            <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>No savings goals yet</Text>
            <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg }]}>
              Set a savings target and track your progress.
            </Text>
            <Button label="Create Goal" onPress={() => setShowAddModal(true)} />
          </View>
        )}
      />

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowAddModal(false)} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl,
          padding: hp + landscapeHp, paddingBottom: 40, gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>New Savings Goal</Text>

          {/* Icon picker */}
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            {GOAL_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={{
                  width: 44, height: 44, borderRadius: theme.radii.lg,
                  backgroundColor: selectedIcon === icon ? `${theme.colors.primary[500]}20` : theme.colors.background,
                  borderWidth: 2, borderColor: selectedIcon === icon ? theme.colors.primary[500] : theme.colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52, justifyContent: 'center',
          }}>
            <TextInput
              style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Goal name (e.g. Emergency fund)"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52,
          }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textSecondary, marginRight: theme.spacing.sm }]}>{currency}</Text>
            <TextInput
              style={[theme.typography.headingSm, { flex: 1, color: theme.colors.textPrimary }]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholder="Target amount"
              placeholderTextColor={theme.colors.textDisabled}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ flex: 1, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={{ flex: 2, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal visible={showContributeModal} animationType="slide" transparent onRequestClose={() => setShowContributeModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowContributeModal(false)} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl,
          padding: hp + landscapeHp, paddingBottom: 40, gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>Add to Goal</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52,
          }}>
            <Text style={[theme.typography.headingSm, { color: theme.colors.textSecondary, marginRight: theme.spacing.sm }]}>{currency}</Text>
            <TextInput
              style={[theme.typography.headingSm, { flex: 1, color: theme.colors.textPrimary }]}
              value={contributeAmount}
              onChangeText={setContributeAmount}
              keyboardType="decimal-pad"
              placeholder="Amount to add"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity onPress={() => setShowContributeModal(false)} style={{ flex: 1, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleContribute} style={{ flex: 2, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.success[500], alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Add Savings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
