import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  inset?: number;
}

export default function Divider({ style, inset = 0 }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.colors.border,
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}
