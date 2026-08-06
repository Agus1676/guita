import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryById } from '@/constants/categories';

export default function AiAdvisorCard() {
  const { colors } = useTheme();
  const { monthlyBalance, categoryTotals } = useDatabaseContext();
  const [modalVisible, setModalVisible] = useState(false);

  const topCategory = categoryTotals.length > 0 ? getCategoryById(categoryTotals[0].category) : null;
  const savingsRate = monthlyBalance.income > 0 
    ? Math.max(0, Math.round((monthlyBalance.balance / monthlyBalance.income) * 100)) 
    : 0;

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.cardContainer}
        >
          <View style={styles.cardHeader}>
            <View style={styles.badgeRow}>
              <Ionicons name="sparkles" size={16} color="#A78BFA" />
              <Text style={styles.badgeText}>GUITA AI ADVISOR</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A78BFA" />
          </View>

          <Text style={styles.cardTitle}>Consejo Financiero del Mes</Text>
          <Text style={styles.cardBody} numberOfLines={2}>
            {topCategory 
              ? `El ${Math.round((categoryTotals[0].total / (monthlyBalance.expense || 1)) * 100)}% de tus gastos fue en ${topCategory.name}. Tu tasa de ahorro actual es del ${savingsRate}%.`
              : 'Analizando tus movimientos para darte consejos de ahorro personalizados...'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal de Asistente IA */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={24} color="#6C63FF" />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Guita AI Advisor</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.insightBox}>
              <Ionicons name="pie-chart" size={24} color="#6C63FF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
                  Categoría Mayoritaria
                </Text>
                <Text style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  {topCategory 
                    ? `Destinaste ${formatCurrency(categoryTotals[0].total)} a ${topCategory.name}. Te sugerimos monitorear este rubro en la segunda mitad del mes.`
                    : 'Sin gastos registrados en el período seleccionado.'}
                </Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Ionicons name="trending-up" size={24} color="#4ADE80" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
                  Capacidad de Ahorro
                </Text>
                <Text style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  Tenés un remanente del {savingsRate}% de tus ingresos este mes. ¡Excelente hábito financiero!
                </Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Ionicons name="bulb-outline" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
                  Recomendación Inteligente
                </Text>
                <Text style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  Consolidar suscripciones duplicadas y pagar tarjetas de crédito antes del vencimiento te ahorrará intereses adicionales.
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 6,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardBody: {
    color: '#CBD5E1',
    fontSize: FontSize.sm,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
