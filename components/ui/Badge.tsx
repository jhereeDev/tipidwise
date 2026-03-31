import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps {
  label: string;
  color?: string;
  icon?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function Badge({ label, color, icon, style, size = 'md' }: BadgeProps) {
  const theme = useTheme();
  const bgColor = color ? `${color}20` : `${theme.colors.primary[500]}20`;
  const textColor = color ?? theme.colors.primary[500];

  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: theme.radii.full,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 2 : 4,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 4,
        },
        style,
      ]}
    >
      {icon ? <Text style={{ fontSize: size === 'sm' ? 10 : 12 }}>{icon}</Text> : null}
      <Text style={[size === 'sm' ? theme.typography.labelSm : theme.typography.labelLg, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}
