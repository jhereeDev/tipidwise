import type { Theme } from '../types/theme';

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const typography = {
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, fontFamily: 'Inter_700Bold' },
  displaySm: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, fontFamily: 'Inter_700Bold' },
  headingLg: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, fontFamily: 'Inter_600SemiBold' },
  headingMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26, fontFamily: 'Inter_600SemiBold' },
  headingSm: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24, fontFamily: 'Inter_600SemiBold' },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  labelLg: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, fontFamily: 'Inter_500Medium' },
  labelSm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, fontFamily: 'Inter_500Medium' },
  monoMd: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.5 },
};

export const lightTheme: Theme = {
  isDark: false,
  spacing,
  radii,
  typography,
  colors: {
    primary: { 400: '#2DD4BF', 500: '#0D9488', 600: '#0F766E', 700: '#115E59' },
    success: { 500: '#22C55E', 600: '#16A34A' },
    danger: { 500: '#EF4444', 600: '#DC2626' },
    warning: { 500: '#F59E0B', 600: '#D97706' },
    neutral: {
      50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
      400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
      800: '#1F2937', 900: '#111827',
    },
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#D1D5DB',
    tabBar: '#FFFFFF',
    tabBarActive: '#0D9488',
    tabBarInactive: '#9CA3AF',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  spacing,
  radii,
  typography,
  colors: {
    primary: { 400: '#2DD4BF', 500: '#0D9488', 600: '#0F766E', 700: '#115E59' },
    success: { 500: '#4ADE80', 600: '#22C55E' },
    danger: { 500: '#F87171', 600: '#EF4444' },
    warning: { 500: '#FCD34D', 600: '#F59E0B' },
    neutral: {
      50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
      400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
      800: '#1E293B', 900: '#0F172A',
    },
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    border: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textDisabled: '#475569',
    tabBar: '#1E293B',
    tabBarActive: '#2DD4BF',
    tabBarInactive: '#64748B',
  },
};
