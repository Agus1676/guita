import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import { MONTH_NAMES } from '@/utils/formatters';

interface MonthPickerProps {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
}

export default function MonthPicker({ year, month, onChangeMonth }: MonthPickerProps) {
  const { colors } = useTheme();

  const handlePrev = () => {
    if (month === 0) {
      onChangeMonth(year - 1, 11);
    } else {
      onChangeMonth(year, month - 1);
    }
  };

  const handleNext = () => {
    const currentDate = new Date();
    if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
      return;
    }
    if (month === 11) {
      onChangeMonth(year + 1, 0);
    } else {
      onChangeMonth(year, month + 1);
    }
  };

  const currentDate = new Date();
  const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={handlePrev} style={styles.button}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {MONTH_NAMES[month]} {year}
      </Text>
      
      <TouchableOpacity 
        onPress={handleNext} 
        style={styles.button}
        disabled={isCurrentMonth}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={isCurrentMonth ? colors.textTertiary : colors.textPrimary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    minWidth: 200,
  },
  button: {
    padding: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
