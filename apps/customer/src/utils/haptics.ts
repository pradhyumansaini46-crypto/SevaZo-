import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Universal Haptic Feedback Trigger
 * Provides tactile feedback on native iOS/Android via expo-haptics,
 * with safe graceful fallback for Web (navigator.vibrate) and older devices.
 */
export const triggerHaptic = (type: HapticType = 'light') => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        switch (type) {
          case 'selection':
          case 'light':
            navigator.vibrate(8);
            break;
          case 'medium':
            navigator.vibrate(18);
            break;
          case 'heavy':
            navigator.vibrate(28);
            break;
          case 'success':
            navigator.vibrate([15, 40, 20]);
            break;
          case 'warning':
          case 'error':
            navigator.vibrate([30, 50, 30]);
            break;
        }
      }
      return;
    }

    // Native platforms
    switch (type) {
      case 'selection':
        Haptics.selectionAsync().catch(() => {});
        break;
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
    }
  } catch {
    // Fail silently without affecting UI
  }
};
