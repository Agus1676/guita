import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { formatCurrency, getMonthRange } from '@/utils/formatters';
import { getCategoryById } from '@/constants/categories';
import MonthPicker from '@/components/MonthPicker';
import EmptyState from '@/components/EmptyState';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import * as dbNative from '@/db/database.native';
import * as dbWeb from '@/db/database.web';
import type { CategoryTotal, MonthlyBalance } from '@/db/database';

type PeriodMode = 'month' | '3months' | '6months';

export default function ChartsScreen() {
  const { colors } = useTheme();
  const { categoryTotals, monthlyBalance, currentYear, currentMonth, setMonth } = useDatabaseContext();

  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [customTotals, setCustomTotals] = useState<CategoryTotal[]>([]);
  const [customBalance, setCustomBalance] = useState<MonthlyBalance>({ income: 0, expense: 0, balance: 0 });

  let sqliteDb: any = null;
  if (Platform.OS !== 'web') {
    try {
      sqliteDb = useSQLiteContext();
    } catch (e) {}
  }

  const loadPeriodData = useCallback(async () => {
    const db = Platform.OS === 'web' ? dbWeb : dbNative;

    if (periodMode === 'month') {
      setCustomTotals(categoryTotals);
      setCustomBalance(monthlyBalance);
      return;
    }

    let startDate = '2026-06-01';
    let endDate = '2026-08-31';

    if (periodMode === '6months') {
      startDate = '2026-03-01';
    }

    const allTxs = await db.getTransactions(sqliteDb, { startDate, endDate });

    let income = 0;
    let expense = 0;
    const catMap: { [cat: string]: number } = {};

    allTxs.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    const totals: CategoryTotal[] = Object.keys(catMap).map(cat => ({
      category: cat,
      total: catMap[cat],
    })).sort((a, b) => b.total - a.total);

    setCustomTotals(totals);
    setCustomBalance({ income, expense, balance: income - expense });
  }, [periodMode, categoryTotals, monthlyBalance, sqliteDb]);

  useEffect(() => {
    loadPeriodData();
  }, [loadPeriodData]);

  const activeTotals = periodMode === 'month' ? categoryTotals : customTotals;
  const activeBalance = periodMode === 'month' ? monthlyBalance : customBalance;
  const totalExpense = activeBalance.expense;

  const pieData = activeTotals.map(ct => {
    const cat = getCategoryById(ct.category);
    return {
      value: ct.total,
      color: cat?.color || '#A0A0B8',
      text: cat?.name || ct.category,
    };
  });

  const sortedCategories = [...activeTotals].sort((a, b) => b.total - a.total).slice(0, 5);
  const maxCategoryTotal = sortedCategories.length > 0 ? sortedCategories[0].total : 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Estadísticas</Text>

        {/* Segmented Period Switcher */}
        <View style={[styles.periodContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={[styles.periodBtn, periodMode === 'month' && { backgroundColor: colors.primary }]}
            onPress={() => setPeriodMode('month')}
          >
            <Text style={[styles.periodText, { color: periodMode === 'month' ? '#FFF' : colors.textSecondary }]}>
              Este Mes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.periodBtn, periodMode === '3months' && { backgroundColor: colors.primary }]}
            onPress={() => setPeriodMode('3months')}
          >
            <Text style={[styles.periodText, { color: periodMode === '3months' ? '#FFF' : colors.textSecondary }]}>
              3 Meses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.periodBtn, periodMode === '6months' && { backgroundColor: colors.primary }]}
            onPress={() => setPeriodMode('6months')}
          >
            <Text style={[styles.periodText, { color: periodMode === '6months' ? '#FFF' : colors.textSecondary }]}>
              6 Meses
            </Text>
          </TouchableOpacity>
        </View>

        {periodMode === 'month' && (
          <View style={styles.section}>
            <MonthPicker year={currentYear} month={currentMonth} onChangeMonth={setMonth} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {periodMode === 'month' ? 'Resumen del Mes' : periodMode === '3months' ? 'Resumen 3 Meses' : 'Resumen 6 Meses'}
          </Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderLeftColor: colors.income, borderLeftWidth: 4 }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ingresos</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(activeBalance.income)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderLeftColor: colors.expense, borderLeftWidth: 4 }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Gastos</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(activeBalance.expense)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary, borderLeftWidth: 4, width: '100%', marginTop: 12 }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Balance Neto</Text>
              <Text style={[styles.summaryValue, { color: activeBalance.balance >= 0 ? colors.income : colors.expense }]}>
                {formatCurrency(activeBalance.balance)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Gastos por Categoría</Text>
          {activeTotals.length > 0 ? (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
              <PieChart
                donut
                radius={100}
                innerRadius={60}
                data={pieData}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                      {formatCurrency(totalExpense)}
                    </Text>
                  </View>
                )}
              />
              <View style={styles.legendContainer}>
                {activeTotals.map(ct => {
                  const cat = getCategoryById(ct.category);
                  const percentage = ((ct.total / (totalExpense || 1)) * 100).toFixed(1);
                  return (
                    <View key={ct.category} style={styles.legendItem}>
                      <View style={styles.legendLeft}>
                        <View style={[styles.legendDot, { backgroundColor: cat?.color || '#A0A0B8' }]} />
                        <Text style={[styles.legendText, { color: colors.textPrimary }]}>{cat?.name}</Text>
                      </View>
                      <View style={styles.legendRight}>
                        <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>{formatCurrency(ct.total)}</Text>
                        <Text style={[styles.legendPercentage, { color: colors.textSecondary }]}>{percentage}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <EmptyState icon="pie-chart-outline" title="Sin datos" message="No hay gastos en el período seleccionado" />
          )}
        </View>

        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Top Categorías</Text>
            <View style={[styles.topCard, { backgroundColor: colors.surface }]}>
              {sortedCategories.map(ct => {
                const cat = getCategoryById(ct.category);
                const progress = (ct.total / maxCategoryTotal) * 100;
                const percentage = ((ct.total / (totalExpense || 1)) * 100).toFixed(1);

                return (
                  <View key={ct.category} style={styles.topItem}>
                    <View style={styles.topHeader}>
                      <View style={styles.topTitle}>
                        <Ionicons name={(cat?.icon as any) || 'list'} size={20} color={cat?.color || colors.primary} />
                        <Text style={[styles.topName, { color: colors.textPrimary }]}>{cat?.name}</Text>
                      </View>
                      <View style={styles.topValues}>
                        <Text style={[styles.topAmount, { color: colors.textPrimary }]}>{formatCurrency(ct.total)}</Text>
                        <Text style={[styles.topPercentage, { color: colors.textSecondary }]}>{percentage}%</Text>
                      </View>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                      <View style={[styles.progressBarFill, { backgroundColor: cat?.color || colors.primary, width: `${progress}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: 20 },

  periodContainer: { flexDirection: 'row', borderRadius: 100, padding: 4, marginBottom: 20 },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100 },
  periodText: { fontSize: FontSize.sm, fontWeight: '600' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryCard: { width: '48%', padding: 16, borderRadius: BorderRadius.lg, marginBottom: 12 },
  summaryLabel: { fontSize: FontSize.sm, marginBottom: 4 },
  summaryValue: { fontSize: FontSize.md, fontWeight: '700' },
  chartCard: { padding: 20, borderRadius: 16, alignItems: 'center' },
  legendContainer: { width: '100%', marginTop: 24 },
  legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  legendLeft: { flexDirection: 'row', alignItems: 'center' },
  legendRight: { alignItems: 'flex-end' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendText: { fontSize: FontSize.md },
  legendAmount: { fontSize: FontSize.md, fontWeight: '600' },
  legendPercentage: { fontSize: FontSize.xs, marginTop: 2 },
  topCard: { padding: 20, borderRadius: 16 },
  topItem: { marginBottom: 20 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  topTitle: { flexDirection: 'row', alignItems: 'center' },
  topName: { fontSize: FontSize.md, marginLeft: 12, fontWeight: '500' },
  topValues: { alignItems: 'flex-end' },
  topAmount: { fontSize: FontSize.md, fontWeight: '600' },
  topPercentage: { fontSize: FontSize.sm },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%' },
  progressBarFill: { height: 6, borderRadius: 3 },
});
