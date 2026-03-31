import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const theme = useTheme();

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginRight: theme.spacing.sm }}>🔥</Text>
        <Text style={[theme.typography.displaySm, { color: theme.colors.textPrimary, marginRight: theme.spacing.xs }]}>
          {currentStreak}
        </Text>
        <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary }]}>
          day{currentStreak !== 1 ? 's' : ''} streak
        </Text>
      </View>
      <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs, marginLeft: 36 }]}>
        Longest: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
      </Text>
    </Card>
  );
}
