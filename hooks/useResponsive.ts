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
  // Adaptive font scale
  fontScale: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmallPhone = width < 375;

  return {
    width,
    height,
    isTablet,
    isLandscape: width > height,
    columns: isTablet ? 2 : 1,
    contentWidth: Math.min(width, 680),
    isSmallPhone,
    hp: isTablet ? 24 : isSmallPhone ? 12 : 16,
    sp: isTablet ? 20 : 14,
    fontScale: isTablet ? 1.1 : isSmallPhone ? 0.9 : 1,
  };
}
