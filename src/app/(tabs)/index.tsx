import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryById } from '@/constants/categories';
import { fetchDolarRates, DolarData } from '@/utils/dolarApi';
import { forceSeedSampleData } from '@/utils/sampleData';
import { scheduleDailyReminder } from '@/utils/notifications';
import BalanceCard from '@/components/BalanceCard';
import TransactionItem from '@/components/TransactionItem';
import MonthPicker from '@/components/MonthPicker';
import EmptyState from '@/components/EmptyState';
import AuthModal from '@/components/AuthModal';
import AiAdvisorCard from '@/components/AiAdvisorCard';
import SavingsGoalCard from '@/components/SavingsGoalCard';
import AvatarPickerModal from '@/components/AvatarPickerModal';
import { PieChart } from 'react-native-gifted-charts';

export default function DashboardScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const { 
    recentTransactions, 
    monthlyBalance, 
    categoryTotals, 
    currentYear, 
    currentMonth, 
    setMonth,
    refreshData 
  } = useDatabaseContext();

  const [dolarData, setDolarData] = useState<DolarData | null>(null);
  const [loadingDolar, setLoadingDolar] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  let sqliteDb: any = null;
  if (Platform.OS !== 'web') {
    try {
      sqliteDb = useSQLiteContext();
    } catch (e) {}
  }

  useEffect(() => {
    async function initDashboard() {
      const data = await fetchDolarRates();
      setDolarData(data);
      setLoadingDolar(false);
      await scheduleDailyReminder();
    }
    initDashboard();
  }, []);

  const handleSeedHistory = async () => {
    await forceSeedSampleData(sqliteDb);
    await refreshData();
    showToast('22 Movimientos de prueba cargados 🚀', 'success');
  };

  const handleLogout = () => {
    Alert.alert(
      "Opciones de Perfil",
      "¿Qué deseas realizar?",
      [
        { text: "Editar Perfil / Avatar", onPress: () => setShowAvatarPicker(true) },
        { text: "Cerrar Sesión", style: "destructive", onPress: () => { logout(); showToast('Sesión cerrada', 'info'); } },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const totalExpense = monthlyBalance.expense;
  
  const pieData = categoryTotals.map(ct => {
    const cat = getCategoryById(ct.category);
    return {
      value: ct.total,
      color: cat?.color || '#A0A0B8',
      text: cat?.name || ct.category,
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header con Perfil */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleLogout} style={styles.profileBox}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.avatarEmoji || '🚀'}
              </Text>
            </View>
            <View>
              <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                Hola {user?.name || 'Aguss'} 👋
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {user?.email || 'aguss@guita.app'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleSeedHistory} style={styles.iconBtn}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Financial Advisor Widget */}
        <AiAdvisorCard />

        {/* Savings Goal Card Widget */}
        <SavingsGoalCard />

        {/* Widget Dolar Argentina */}
        <View style={[styles.dolarCard, { backgroundColor: colors.surface }]}>
          <View style={styles.dolarHeader}>
            <View style={styles.dolarTitleRow}>
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
              <Text style={[styles.dolarTitle, { color: colors.textPrimary }]}>Dólar Hoy (ARS)</Text>
            </View>
            <Text style={[styles.dolarTag, { color: colors.textTertiary }]}>En vivo</Text>
          </View>

          {loadingDolar ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
          ) : (
            <View style={styles.dolarRatesRow}>
              <View style={styles.rateBox}>
                <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Dólar Blue</Text>
                <Text style={[styles.rateValue, { color: colors.income }]}>
                  ${dolarData?.blue?.venta || 1400}
                </Text>
              </View>
              <View style={[styles.rateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.rateBox}>
                <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Dólar Oficial</Text>
                <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
                  ${dolarData?.oficial?.venta || 990}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Month Picker */}
        <View style={styles.section}>
          <MonthPicker year={currentYear} month={currentMonth} onChangeMonth={setMonth} />
        </View>

        {/* Balance Card */}
        <View style={styles.section}>
          <BalanceCard 
            income={monthlyBalance.income} 
            expense={monthlyBalance.expense} 
            balance={monthlyBalance.balance}
            dolarBlueRate={dolarData?.blue?.venta || 1400} 
          />
        </View>

        {/* Chart */}
        {categoryTotals.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <PieChart
              donut
              radius={80}
              innerRadius={50}
              data={pieData}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
                    {formatCurrency(totalExpense)}
                  </Text>
                </View>
              )}
            />
            <View style={styles.legendContainer}>
              {categoryTotals.map(ct => {
                const cat = getCategoryById(ct.category);
                return (
                  <View key={ct.category} style={styles.legendItem}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: cat?.color || '#A0A0B8' }]} />
                      <Text style={[styles.legendText, { color: colors.textSecondary }]}>{cat?.name}</Text>
                    </View>
                    <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>{formatCurrency(ct.total)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Últimos Movimientos</Text>
          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => (
              <TransactionItem key={t.id} transaction={t} showDate />
            ))
          ) : (
            <TouchableOpacity onPress={handleSeedHistory}>
              <EmptyState 
                icon="wallet-outline" 
                title="Sin movimientos" 
                message="Toca acá o en las estrellitas arriba para cargar movimientos de prueba" 
              />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal 
        visible={showAvatarPicker} 
        onClose={() => setShowAvatarPicker(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  profileBox: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 22 },
  greeting: { fontSize: FontSize.lg, fontWeight: '700' },
  subtitle: { fontSize: FontSize.xs },
  iconBtn: { padding: 8, marginLeft: 4 },
  
  dolarCard: { padding: 16, borderRadius: BorderRadius.lg, marginBottom: 20 },
  dolarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dolarTitleRow: { flexDirection: 'row', alignItems: 'center' },
  dolarTitle: { fontSize: FontSize.sm, fontWeight: '700', marginLeft: 6 },
  dolarTag: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  dolarRatesRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  rateBox: { alignItems: 'center' },
  rateLabel: { fontSize: FontSize.xs, marginBottom: 2 },
  rateValue: { fontSize: FontSize.md, fontWeight: '700' },
  rateDivider: { width: 1, height: 28 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: 12 },
  chartCard: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  legendContainer: { width: '100%', marginTop: 20 },
  legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  legendLeft: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: FontSize.sm },
  legendAmount: { fontSize: FontSize.sm, fontWeight: '600' },
});
