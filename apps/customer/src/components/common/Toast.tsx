import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useUiStore, ToastConfig } from '../../stores/uiStore';

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { toasts, hideToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top > 0 ? insets.top + Spacing.sm : Spacing.md,
        },
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </View>
  );
};

const ToastItem: React.FC<{ toast: ToastConfig; onClose: () => void }> = ({ toast, onClose }) => {
  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: Colors.primary,
          icon: <CheckCircle2 size={20} color={Colors.primary} />,
          titleColor: Colors.primaryDark,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: Colors.danger,
          icon: <AlertCircle size={20} color={Colors.danger} />,
          titleColor: '#991B1B',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: Colors.accentOrange,
          icon: <AlertTriangle size={20} color={Colors.accentOrange} />,
          titleColor: '#92400E',
        };
      case 'info':
      default:
        return {
          bg: '#EFF6FF',
          border: Colors.secondary,
          icon: <Info size={20} color={Colors.secondary} />,
          titleColor: '#1E40AF',
        };
    }
  };

  const theme = getTheme();

  return (
    <View
      style={[
        styles.toastCard,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.iconWrap}>{theme.icon}</View>

      <View style={styles.contentWrap}>
        {toast.title ? (
          <Text style={[styles.title, { color: theme.titleColor }]}>{toast.title}</Text>
        ) : null}
        <Text style={styles.message}>{toast.message}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
        <X size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    gap: Spacing.xs,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Shadows.elevated,
  },
  iconWrap: {
    marginRight: Spacing.sm + 2,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    ...Typography.bodySmall,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    lineHeight: 16,
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
