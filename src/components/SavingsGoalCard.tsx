import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

const GOAL_STORAGE_KEY = 'guita_savings_goal_v1';

export default function SavingsGoalCard() {
  const { colors } = useTheme();
  const { monthlyBalance } = useDatabaseContext();

  const [goalTitle, setGoalTitle] = useState('Vacaciones 🏖️');
  const [targetAmount, setTargetAmount] = useState(500000);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editAmountInput, setEditAmountInput] = useState('');

  useEffect(() => {
    async function loadGoal() {
      try {
        const stored = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setGoalTitle(parsed.title || 'Vacaciones 🏖️');
          setTargetAmount(parsed.target || 500000);
        }
      } catch (e) {}
    }
    loadGoal();
  }, []);

  const openEditModal = () => {
    setEditTitleInput(goalTitle);
    setEditAmountInput(targetAmount.toString());
    setModalVisible(true);
  };

  const handleSaveGoal = async () => {
    const newTarget = parseFloat(editAmountInput.replace(/\./g, '').replace(',', '.')) || 500000;
    const newTitle = editTitleInput.trim() || 'Meta de Ahorro';
    
    setGoalTitle(newTitle);
    setTargetAmount(newTarget);
    setModalVisible(false);

    try {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify({
        title: newTitle,
        target: newTarget,
      }));
    } catch (e) {}
  };

  const currentSaved = Math.max(0, monthlyBalance.balance);
  const progressPercent = Math.min(100, Math.round((currentSaved / (targetAmount || 1)) * 100));

  return (
    <>
      <TouchableOpacity onPress={openEditModal} activeOpacity={0.88}>
        <View style={[styles.cardContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="flag-outline" size={20} color={colors.income} />
              <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>{goalTitle}</Text>
            </View>
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
          </View>

          <View style={styles.valuesRow}>
            <Text style={[styles.currentSavedText, { color: colors.income }]}>
              {formatCurrency(currentSaved)}
            </Text>
            <Text style={[styles.targetText, { color: colors.textSecondary }]}>
              de {formatCurrency(targetAmount)} ({progressPercent}%)
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
            <LinearGradient
              colors={['#00D09C', '#6C63FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal Editar Meta */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
              Editar Meta de Ahorro
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Nombre de la meta</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                value={editTitleInput}
                onChangeText={setEditTitleInput}
                placeholder="Ej: Vacaciones 🏖️"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Monto Objetivo ($ ARS)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                value={editAmountInput}
                onChangeText={setEditAmountInput}
                keyboardType="numeric"
                placeholder="500000"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.cancelBtn, { backgroundColor: colors.background }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSaveGoal} 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Guardar Meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginLeft: 8,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  currentSavedText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  targetText: {
    fontSize: FontSize.xs,
    marginLeft: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: BorderRadius.xl,
    padding: 24,
  },
  modalHeaderTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: BorderRadius.lg,
    fontSize: FontSize.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelBtn: {
    flex: 0.48,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  saveBtn: {
    flex: 0.48,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
});
