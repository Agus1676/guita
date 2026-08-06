import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

interface BalanceCardProps {
  income: number;
  expense: number;
  balance: number;
  dolarBlueRate?: number;
}

export default function BalanceCard({ income, expense, balance, dolarBlueRate = 1400 }: BalanceCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currencyMode, setCurrencyMode] = useState<'ARS' | 'USD'>('ARS');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const toggleCurrency = () => {
    setCurrencyMode(prev => (prev === 'ARS' ? 'USD' : 'ARS'));
  };

  const formatAmount = (amount: number) => {
    if (currencyMode === 'USD') {
      const usdValue = amount / (dolarBlueRate || 1400);
      return `US$ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return formatCurrency(amount);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#6C63FF', '#9F7AEA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Balance del Mes</Text>
            
            {/* Toggle ARS / USD Button */}
            <TouchableOpacity onPress={toggleCurrency} style={styles.currencyToggleBtn}>
              <Ionicons name="swap-horizontal" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.currencyToggleText}>
                {currencyMode === 'ARS' ? 'Ver en USD' : 'Ver en ARS'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.balance}>{formatAmount(balance)}</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.labelRow}>
                <Ionicons name="arrow-up" size={16} color="#4ADE80" />
                <Text style={styles.label}>Ingresos</Text>
              </View>
              <Text style={styles.amount}>{formatAmount(income)}</Text>
            </View>

            <View style={styles.column}>
              <View style={styles.labelRow}>
                <Ionicons name="arrow-down" size={16} color="#F87171" />
                <Text style={styles.label}>Gastos</Text>
              </View>
              <Text style={styles.amount}>{formatAmount(expense)}</Text>
            </View>
          </View>

          {currencyMode === 'USD' && (
            <Text style={styles.dolarNote}>
              * Cotización Dólar Blue: ${dolarBlueRate} ARS
            </Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: Spacing.xxl,
  },
  content: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    color: 'white',
    fontSize: FontSize.md,
    opacity: 0.9,
  },
  currencyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  balance: {
    color: 'white',
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    color: 'white',
    fontSize: FontSize.sm,
    opacity: 0.9,
    marginLeft: Spacing.xs,
  },
  amount: {
    color: 'white',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  dolarNote: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
