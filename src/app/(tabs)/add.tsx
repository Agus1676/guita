import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useToast } from '@/context/ToastContext';
import AmountInput from '@/components/AmountInput';
import CategoryPicker from '@/components/CategoryPicker';
import { FontSize, BorderRadius } from '@/constants/theme';
import { formatShortDate, getTodayString, formatCurrency } from '@/utils/formatters';

export default function AddScreen() {
  const { colors } = useTheme();
  const { addTransaction } = useDatabaseContext();
  const { showToast } = useToast();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [installments, setInstallments] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getNumericAmount = (str: string) => {
    const raw = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(raw) || 0;
  };

  const handleSave = async () => {
    const parsedAmount = getNumericAmount(amount);
    if (parsedAmount <= 0 || !selectedCategory) return;

    setIsSaving(true);
    try {
      let finalDescription = description;
      if (type === 'expense' && installments > 1) {
        const monthlyAmount = parsedAmount / installments;
        finalDescription = `${description ? description + ' ' : ''}(${installments} cuotas de ${formatCurrency(monthlyAmount)})`;
      }

      await addTransaction(type, parsedAmount, selectedCategory, finalDescription, date);
      
      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setDescription('');
      setInstallments(1);
      
      showToast('Movimiento registrado correctamente 💸', 'success');
    } catch (error) {
      showToast('No se pudo guardar el movimiento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(selectedDate.getDate()).padStart(2, '0');
      const formatted = `${selectedDate.getFullYear()}-${monthStr}-${dayStr}`;
      setDate(formatted);
    }
  };

  const parsedAmount = getNumericAmount(amount);
  const isFormValid = parsedAmount > 0 && selectedCategory && !isSaving;
  const monthlyInstallment = parsedAmount > 0 && installments > 1 ? parsedAmount / installments : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Nuevo Movimiento</Text>
          
          {/* Toggle Type */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.toggleBtn, type === 'income' && { backgroundColor: colors.income }]}
              onPress={() => { setType('income'); setSelectedCategory(null); setInstallments(1); }}
            >
              <Text style={[
                styles.toggleText, 
                { color: type === 'income' ? '#FFF' : colors.textSecondary }
              ]}>Ingreso</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, type === 'expense' && { backgroundColor: colors.expense }]}
              onPress={() => { setType('expense'); setSelectedCategory(null); }}
            >
              <Text style={[
                styles.toggleText, 
                { color: type === 'expense' ? '#FFF' : colors.textSecondary }
              ]}>Gasto</Text>
            </TouchableOpacity>
          </View>

          <AmountInput value={amount} onChangeText={setAmount} type={type} />

          {/* Cuotas Selector for Expense */}
          {type === 'expense' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Plan de Cuotas</Text>
              <View style={styles.installmentsRow}>
                {[1, 3, 6, 12].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.installmentChip,
                      { backgroundColor: installments === num ? colors.primary : colors.surface }
                    ]}
                    onPress={() => setInstallments(num)}
                  >
                    <Text style={[
                      styles.installmentText,
                      { color: installments === num ? '#FFF' : colors.textSecondary }
                    ]}>
                      {num === 1 ? 'Contado' : `${num} cuotas`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {installments > 1 && monthlyInstallment > 0 && (
                <View style={[styles.installmentPreview, { backgroundColor: colors.surface }]}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <Text style={[styles.installmentPreviewText, { color: colors.textPrimary }]}>
                    {installments} cuotas de <Text style={{ fontWeight: '700', color: colors.expense }}>{formatCurrency(monthlyInstallment)}</Text> / mes
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Categoría</Text>
            <CategoryPicker type={type} selectedId={selectedCategory} onSelect={setSelectedCategory} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Descripción</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
              placeholder="Descripción opcional..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Fecha</Text>
            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: colors.surface }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatShortDate(date)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(date + 'T12:00:00')}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            disabled={!isFormValid} 
            onPress={handleSave}
            style={[styles.saveBtnWrapper, !isFormValid && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={['#6C63FF', '#9F7AEA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', borderRadius: 100, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100 },
  toggleText: { fontSize: FontSize.md, fontWeight: '600' },

  installmentsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  installmentChip: { flex: 0.23, paddingVertical: 10, borderRadius: BorderRadius.lg, alignItems: 'center' },
  installmentText: { fontSize: FontSize.xs, fontWeight: '600' },
  installmentPreview: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.lg },
  installmentPreviewText: { marginLeft: 10, fontSize: FontSize.sm },

  section: { marginTop: 24 },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 12 },
  input: { padding: 16, borderRadius: BorderRadius.lg, fontSize: FontSize.md },
  dateBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.lg },
  dateText: { marginLeft: 12, fontSize: FontSize.md, fontWeight: '500' },
  footer: { padding: 20, paddingBottom: 20 },
  saveBtnWrapper: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveBtn: { padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: FontSize.md, fontWeight: '700' },
});
