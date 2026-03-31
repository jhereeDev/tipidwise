import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';

interface InsightCardProps {
  healthScore: number;
  grade: string;
  weeklyChange: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  tips: string[];
}

function getScoreColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#84cc16';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
}

export default function InsightCard({ healthScore, grade, weeklyChange, weeklyTrend, tips }: InsightCardProps) {
  const theme = useTheme();
  const scoreColor = getScoreColor(grade);
  const trendIcon = weeklyTrend === 'up' ? '↑' : weeklyTrend === 'down' ? '↓' : '→';
  const trendColor = weeklyTrend === 'up' ? '#ef4444' : weeklyTrend === 'down' ? '#22c55e' : theme.colors.textSecondary;

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: scoreColor, marginRight: theme.spacing.xs, fontFamily: 'Inter_700Bold' }}>
          {healthScore}
        </Text>
        <View style={{ backgroundColor: scoreColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radii.md }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{grade}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: trendColor }}>{trendIcon} {Math.abs(weeklyChange)}%</Text>
        <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>vs last week</Text>
      </View>
      {tips.length > 0 && (
        <View style={{ marginTop: theme.spacing.sm, backgroundColor: theme.colors.background, borderRadius: theme.radii.md, padding: theme.spacing.sm, flexDirection: 'row', gap: theme.spacing.xs }}>
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={2}>
            {tips[0]}
          </Text>
        </View>
      )}
    </Card>
  );
}
