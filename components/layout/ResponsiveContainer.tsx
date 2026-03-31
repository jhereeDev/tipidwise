import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function ResponsiveContainer({ children, style, noPadding }: ResponsiveContainerProps) {
  const { contentWidth, hp, landscapeHp } = useResponsive();

  return (
    <View
      style={[
        {
          maxWidth: contentWidth,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: noPadding ? 0 : hp + landscapeHp,
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
