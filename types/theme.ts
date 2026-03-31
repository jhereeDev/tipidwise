import type { TextStyle } from 'react-native';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ThemeColors {
  primary: Pick<ColorScale, 400 | 500 | 600 | 700>;
  success: Pick<ColorScale, 500 | 600>;
  danger: Pick<ColorScale, 500 | 600>;
  warning: Pick<ColorScale, 500 | 600>;
  neutral: ColorScale;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeTypography {
  displayLg: TextStyle;
  displaySm: TextStyle;
  headingLg: TextStyle;
  headingMd: TextStyle;
  headingSm: TextStyle;
  bodyLg: TextStyle;
  bodyMd: TextStyle;
  bodySm: TextStyle;
  labelLg: TextStyle;
  labelSm: TextStyle;
  monoMd: TextStyle;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radii: ThemeRadii;
  isDark: boolean;
}
