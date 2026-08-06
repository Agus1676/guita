import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVATAR_EMOJIS = ['🚀', '🦊', '⚡', '👑', '💼', '💎', '🦁', '🦄', '🔮', '💸'];

export default function AvatarPickerModal({ visible, onClose }: AvatarPickerModalProps) {
  const { colors } = useTheme();
  const { user, updateUser } = useUser();
  const { showToast } = useToast();

  const [selectedEmoji, setSelectedEmoji] = useState(user?.avatarEmoji || '🚀');
  const [nameInput, setNameInput] = useState(user?.name || 'Aguss');

  const handleSave = async () => {
    const cleanName = nameInput.trim() || 'Aguss';
    await updateUser(cleanName, selectedEmoji);
    showToast('Perfil actualizado correctamente', 'success');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Editar Perfil & Avatar</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Nombre de Usuario</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Tu nombre..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Emoji Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Elegí tu Avatar Emoji</Text>
            <View style={styles.emojiGrid}>
              {AVATAR_EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiChip,
                    { backgroundColor: selectedEmoji === emoji ? colors.primary + '33' : colors.background },
                    selectedEmoji === emoji && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    padding: 14,
    borderRadius: BorderRadius.lg,
    fontSize: FontSize.md,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiChip: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emojiText: {
    fontSize: 26,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
