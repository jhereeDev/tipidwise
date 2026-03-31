import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../lib/formatting';

interface AmountDisplayProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function AmountDisplay({ amount, type = 'neutral', style, size = 'md' }: AmountDisplayProps) {
  const theme = useTheme();
  const currency = useCurrency();

  const color =
    type === 'income' ? theme.colors.success[500] :
    type === 'expense' ? theme.colors.danger[500] :
    theme.colors.textPrimary;

  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  const typography = size === 'lg' ? theme.typography.displaySm : size === 'sm' ? theme.typography.bodyMd : theme.typography.monoMd;

  return (
    <Text style={[typography, { color }, style]}>
      {prefix}{formatCurrency(amount, currency)}
    </Text>
  );
}
