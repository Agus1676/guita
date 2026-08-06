import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { getCategoriesByType } from '@/constants/categories';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

interface CategoryPickerProps {
  type: 'income' | 'expense';
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export default function CategoryPicker({ type, selectedId, onSelect }: CategoryPickerProps) {
  const { colors } = useTheme();
  const categories = getCategoriesByType(type);

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedId === item.id;
    const itemColor = isSelected ? item.color : colors.textSecondary;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: isSelected ? `${item.color}26` : colors.surfaceElevated },
          isSelected && { borderColor: item.color, borderWidth: 1 }
        ]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name={item.icon as any} size={28} color={itemColor} />
        <Text style={[
          styles.categoryName, 
          { color: isSelected ? colors.textPrimary : colors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.medium }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  categoryItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryName: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
