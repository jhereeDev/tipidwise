import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function ResponsiveContainer({ children, style, noPadding }: ResponsiveContainerProps) {
  const { contentWidth, width, hp } = useResponsive();
  const isTablet = width >= 768;

  return (
    <View
      style={[
        {
          width: contentWidth,
          alignSelf: isTablet ? 'center' : 'stretch',
          paddingHorizontal: noPadding ? 0 : hp,
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
