import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../lib/formatting';
import Card from '../ui/Card';

export interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  deadline?: string;
}

interface GoalProgressCardProps {
  goals: Goal[];
  onSeeAll?: () => void;
}

export default function GoalProgressCard({ goals, onSeeAll }: GoalProgressCardProps) {
  const theme = useTheme();
  const currency = useCurrency();

  if (goals.length === 0) return null;

  return (
    <Card>
      <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
        Savings Goals
      </Text>
      {goals.slice(0, 3).map((goal) => {
        const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
        return (
          <View key={goal.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm, gap: theme.spacing.sm }}>
            <Text style={{ fontSize: 20, marginTop: 2 }}>{goal.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[theme.typography.labelSm, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {goal.title}
                </Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  {pct.toFixed(0)}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3 }}>
                <View style={{
                  height: 6,
                  width: `${pct}%`,
                  backgroundColor: pct >= 100 ? theme.colors.success[500] : theme.colors.primary[500],
                  borderRadius: 3,
                }} />
              </View>
              <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
              </Text>
            </View>
          </View>
        );
      })}
      {goals.length > 3 && onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{ alignItems: 'center', paddingTop: theme.spacing.xs }}>
          <Text style={[theme.typography.labelSm, { color: theme.colors.primary[500] }]}>
            See all ({goals.length})
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
