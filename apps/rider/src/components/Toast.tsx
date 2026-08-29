import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useToastStore, ToastType } from '../store/toastStore';
import { Typography, Spacing, BorderRadius } from '../theme';

export const Toast: React.FC = () => {
  const { visible, message, type, duration, hideToast } = useToastStore();
  const opacityAnim = new Animated.Value(0);
  const translateYAnim = new Animated.Value(-20);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!visible) return null;

  const getToastIcon = (toastType: ToastType) => {
    switch (toastType) {
      case 'success':
        return <CheckCircle2 size={20} color="#22C55E" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'info':
      default:
        return <Info size={20} color="#38BDF8" />;
    }
  };

  const getBorderColor = (toastType: ToastType) => {
    switch (toastType) {
      case 'success':
        return '#22C55E';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
      default:
        return '#38BDF8';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: getBorderColor(type),
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
    >
      <View style={styles.iconContainer}>{getToastIcon(type)}</View>
      <Text style={styles.messageText}>{message}</Text>
      <TouchableOpacity
        onPress={handleHide}
        style={styles.closeBtn}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
      >
        <X size={16} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  messageText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '600',
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default Toast;
