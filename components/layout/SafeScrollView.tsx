import React from 'react';
import { ScrollView, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

interface SafeScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onRefresh?: () => void;
  refreshing?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export default function SafeScrollView({
  children,
  style,
  contentStyle,
  onRefresh,
  refreshing,
  edges = ['bottom'],
}: SafeScrollViewProps) {
  const theme = useTheme();
  const { isLandscape } = useResponsive();

  // Auto-add left/right edges in landscape for notch/corner clearance
  const resolvedEdges = isLandscape
    ? ([...new Set([...edges, 'left', 'right'])] as ('top' | 'bottom' | 'left' | 'right')[])
    : edges;

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
      edges={resolvedEdges}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? false}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
              colors={[theme.colors.primary[500]]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
