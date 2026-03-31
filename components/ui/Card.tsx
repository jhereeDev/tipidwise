import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
}

export default function Card({ children, style, elevated = false, noPadding = false }: CardProps) {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: theme.colors.border,
    padding: noPadding ? 0 : theme.spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: elevated
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 }
        : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: elevated ? 6 : 2 },
    }),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
}
