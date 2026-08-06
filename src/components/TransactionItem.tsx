import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { getCategoryById } from '@/constants/categories';
import type { Transaction } from '@/db/database';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: number) => void;
  showDate?: boolean;
}

export default function TransactionItem({ transaction, onDelete, showDate }: TransactionItemProps) {
  const { colors } = useTheme();
  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${category?.color || colors.primary}33` }]}>
        <Ionicons name={(category?.icon as any) || 'help-circle'} size={24} color={category?.color || colors.primary} />
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
          {category?.name || 'Sin categoría'}
        </Text>
        {transaction.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {transaction.description}
          </Text>
        ) : null}
        {showDate && (
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            {formatShortDate(transaction.date)}
          </Text>
        )}
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[
          styles.amount, 
          { color: isIncome ? colors.income : colors.expense }
        ]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.expense} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  description: {
    fontSize: FontSize.sm,
  },
  date: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  deleteButton: {
    marginTop: Spacing.xs,
    padding: 4,
  },
});
