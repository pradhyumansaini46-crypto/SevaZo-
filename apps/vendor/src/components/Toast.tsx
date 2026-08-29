import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { ToastItem } from '../stores/toastStore';
import { BorderRadius, Shadows } from '../theme';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          text: '#065F46',
          icon: <CheckCircle2 size={18} color="#10B981" />,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          text: '#991B1B',
          icon: <AlertCircle size={18} color="#EF4444" />,
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#F59E0B',
          text: '#92400E',
          icon: <AlertTriangle size={18} color="#F59E0B" />,
        };
      case 'info':
      default:
        return {
          bg: '#EFF6FF',
          border: '#3B82F6',
          text: '#1E40AF',
          icon: <Info size={18} color="#3B82F6" />,
        };
    }
  };

  const config = getToastConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconContainer}>{config.icon}</View>
      <Text style={[styles.message, { color: config.text }]}>{toast.message}</Text>
      <TouchableOpacity
        onPress={() => onDismiss(toast.id)}
        style={styles.closeBtn}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
      >
        <X size={16} color={config.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: 8,
    width: '100%',
    ...Shadows.card,
  },
  iconContainer: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
