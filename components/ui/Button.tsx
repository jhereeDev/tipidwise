import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: disabled || loading ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    ...sizeStyles[size],
    ...variantContainerStyles(theme, variant),
  };

  const textStyle: TextStyle = {
    ...theme.typography.labelLg,
    ...variantTextStyles(theme, variant),
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : theme.colors.textPrimary} size="small" />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
  md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 42 },
  lg: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 52 },
};

function variantContainerStyles(theme: ReturnType<typeof useTheme>, variant: Variant): ViewStyle {
  switch (variant) {
    case 'primary': return { backgroundColor: theme.colors.primary[500] };
    case 'secondary': return { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border };
    case 'ghost': return { backgroundColor: 'transparent' };
    case 'destructive': return { backgroundColor: theme.colors.danger[500] };
  }
}

function variantTextStyles(theme: ReturnType<typeof useTheme>, variant: Variant): TextStyle {
  switch (variant) {
    case 'primary': return { color: '#FFFFFF' };
    case 'secondary': return { color: theme.colors.textPrimary };
    case 'ghost': return { color: theme.colors.primary[500] };
    case 'destructive': return { color: '#FFFFFF' };
  }
}

const styles = StyleSheet.create({});
