import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Spacing, FontWeight } from '@/constants/theme';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  type: 'income' | 'expense';
}

function formatWithThousandSeparators(text: string): string {
  if (!text) return '';
  
  // Remove existing dots
  const clean = text.replace(/\./g, '');
  const parts = clean.split(',');
  
  // Format integer part
  const integerPart = parts[0].replace(/\D/g, '');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // If user typed a comma
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, '').slice(0, 2);
    return `${formattedInteger},${decimalPart}`;
  }
  
  return formattedInteger;
}

export default function AmountInput({ value, onChangeText, type }: AmountInputProps) {
  const { colors } = useTheme();
  const textColor = type === 'income' ? colors.income : colors.expense;

  const handleChange = (input: string) => {
    const formatted = formatWithThousandSeparators(input);
    onChangeText(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.symbol, { color: colors.textSecondary }]}>$</Text>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
        maxLength={15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  symbol: {
    fontSize: 32,
    fontWeight: FontWeight.medium,
    marginRight: Spacing.xs,
    marginTop: 8,
  },
  input: {
    fontSize: 48,
    fontWeight: FontWeight.extrabold,
    minWidth: 120,
    textAlign: 'center',
  },
});
