import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerSelectionHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
}

export function triggerLightHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function triggerMediumHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export function triggerSuccessHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export function triggerWarningHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}
