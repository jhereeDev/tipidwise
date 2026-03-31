import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  style?: object;
  leftIcon?: string;
  rightElement?: React.ReactNode;
}

export default function Input({ label, error, containerStyle, style: inputStyle, leftIcon, rightElement, ...props }: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[theme.typography.labelLg, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1.5,
          borderColor: error ? theme.colors.danger[500] : focused ? theme.colors.primary[500] : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
        }}
      >
        {leftIcon ? (
          <Text style={{ fontSize: 18, marginRight: theme.spacing.sm }}>{leftIcon}</Text>
        ) : null}
        <TextInput
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholderTextColor={theme.colors.textDisabled}
          style={[
            theme.typography.bodyLg,
            {
              flex: 1,
              color: theme.colors.textPrimary,
              paddingVertical: theme.spacing.sm,
            },
            inputStyle,
          ]}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={[theme.typography.bodySm, { color: theme.colors.danger[500], marginTop: theme.spacing.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 0 },
});
