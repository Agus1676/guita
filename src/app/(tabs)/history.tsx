import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useUser } from '@/context/UserContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { getMonthRange, MONTH_NAMES } from '@/utils/formatters';
import { exportTransactionsToCSV } from '@/utils/exporter';
import { generatePDFReport } from '@/utils/pdfExporter';
import FilterBar from '@/components/FilterBar';
import TransactionItem from '@/components/TransactionItem';
import EmptyState from '@/components/EmptyState';
import MonthPicker from '@/components/MonthPicker';
import type { Transaction } from '@/db/database';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const { currentYear, currentMonth, setMonth, searchTransactions, deleteTransaction } = useDatabaseContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const loadTransactions = useCallback(async () => {
    const { start, end } = getMonthRange(currentYear, currentMonth);
    const options: any = {
      startDate: start,
      endDate: end,
    };
    if (filterType !== 'all') {
      options.type = filterType;
    }
    if (filterCategory) {
      options.category = filterCategory;
    }
    if (searchQuery.trim()) {
      options.search = searchQuery.trim();
    }
    const results = await searchTransactions(options);
    setFilteredTransactions(results);
  }, [searchQuery, filterType, filterCategory, currentYear, currentMonth, searchTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleExportOptions = () => {
    if (filteredTransactions.length === 0) {
      Alert.alert("Sin datos", "No hay movimientos para exportar en este filtro.");
      return;
    }

    Alert.alert(
      "Exportar Reporte",
      "Elegí el formato de reporte que deseas generar:",
      [
        {
          text: "📄 Exportar PDF Profesional",
          onPress: async () => {
            setIsExporting(true);
            try {
              const monthLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
              await generatePDFReport(filteredTransactions, monthLabel, user?.name || 'Aguss');
            } catch (e) {
              Alert.alert("Error", "No se pudo generar el documento PDF.");
            } finally {
              setIsExporting(false);
            }
          }
        },
        {
          text: "📊 Exportar CSV para Excel",
          onPress: async () => {
            setIsExporting(true);
            try {
              const monthLabel = `${MONTH_NAMES[currentMonth]}_${currentYear}`;
              await exportTransactionsToCSV(filteredTransactions, monthLabel, user?.name || 'Aguss');
            } catch (e) {
              Alert.alert("Error", "No se pudo exportar el archivo CSV.");
            } finally {
              setIsExporting(false);
            }
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar movimiento",
      "¿Estás seguro de que querés eliminar este movimiento?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(id);
            loadTransactions();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Historial</Text>
        <TouchableOpacity 
          onPress={handleExportOptions} 
          disabled={isExporting}
          style={[styles.exportBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="document-text-outline" size={18} color="#FFF" />
          <Text style={styles.exportBtnText}>
            {isExporting ? 'Generando...' : 'Exportar Reporte'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthPickerContainer}>
        <MonthPicker year={currentYear} month={currentMonth} onChangeMonth={setMonth} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Buscar movimientos..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FilterBar 
          activeFilter={filterType} 
          onFilterChange={setFilterType}
          activeCategory={filterCategory}
          onCategoryChange={setFilterCategory}
        />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} showDate onDelete={() => handleDelete(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState 
            icon="search-outline" 
            title="Sin resultados" 
            message="No se encontraron movimientos con estos filtros" 
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 10 
  },
  title: { fontSize: FontSize.xl, fontWeight: '700' },
  exportBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: BorderRadius.full 
  },
  exportBtnText: { marginLeft: 6, fontSize: FontSize.sm, fontWeight: '700', color: '#FFF' },
  monthPickerContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: BorderRadius.lg },
  searchInput: { flex: 1, marginLeft: 8, fontSize: FontSize.md },
  filterContainer: { paddingBottom: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
});
