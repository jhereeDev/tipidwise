import { useWindowDimensions } from 'react-native';

export interface ResponsiveValues {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  columns: number;
  contentWidth: number;
  isSmallPhone: boolean;
  // Adaptive spacing — scales up on larger screens
  hp: number; // horizontal padding
  sp: number; // section padding (vertical gap between sections)
  // Extra horizontal padding in landscape for notch/corner clearance
  landscapeHp: number;
  // Adaptive font scale
  fontScale: number;
  // Safe area edges that should be applied (includes left/right in landscape)
  safeEdges: ('top' | 'bottom' | 'left' | 'right')[];
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmallPhone = width < 375;
  const isLandscape = width > height;
  const landscapeHp = isLandscape ? 44 : 0;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    columns: isTablet ? 2 : 1,
    contentWidth: isTablet ? Math.min(width, 900) : width,
    isSmallPhone,
    hp: isTablet ? 24 : isSmallPhone ? 12 : 16,
    sp: isTablet ? 20 : 14,
    landscapeHp,
    fontScale: isTablet ? 1.1 : isSmallPhone ? 0.9 : 1,
    safeEdges: isLandscape ? ['top', 'left', 'right'] : ['top'],
  };
}
