import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ALL_CATEGORIES } from '@/constants/categories';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

type FilterType = 'all' | 'income' | 'expense';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function FilterBar({ 
  activeFilter, 
  onFilterChange, 
  activeCategory, 
  onCategoryChange 
}: FilterBarProps) {
  const { colors } = useTheme();

  const renderChip = (label: string, isActive: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: isActive ? colors.primary : colors.surfaceElevated }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.chipText,
        { 
          color: isActive ? 'white' : colors.textSecondary,
          fontWeight: isActive ? FontWeight.bold : FontWeight.medium
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {renderChip('Todos', activeFilter === 'all' && activeCategory === null, () => {
          onFilterChange('all');
          onCategoryChange(null);
        })}
        {renderChip('Ingresos', activeFilter === 'income' && activeCategory === null, () => {
          onFilterChange('income');
          onCategoryChange(null);
        })}
        {renderChip('Gastos', activeFilter === 'expense' && activeCategory === null, () => {
          onFilterChange('expense');
          onCategoryChange(null);
        })}
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {ALL_CATEGORIES.map(category => (
          <React.Fragment key={category.id}>
            {renderChip(category.name, activeCategory === category.id, () => {
              onCategoryChange(category.id);
            })}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: FontSize.sm,
  },
  divider: {
    width: 1,
    height: 24,
    marginRight: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
