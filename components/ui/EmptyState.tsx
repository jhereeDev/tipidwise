import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, paddingHorizontal: theme.spacing.xl }}>
      <Text style={{ fontSize: 56, marginBottom: theme.spacing.lg }}>{icon}</Text>
      <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.sm }]}>
        {title}
      </Text>
      <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg }]}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
