import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../Button';
import { useUiStore } from '../../stores/uiStore';

export const GlobalModal: React.FC = () => {
  const { modal, hideModal } = useUiStore();

  if (!modal || !modal.isOpen) return null;

  return (
    <RNModal
      visible={modal.isOpen}
      transparent
      animationType="fade"
      onRequestClose={hideModal}
    >
      <TouchableWithoutFeedback onPress={hideModal}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text style={styles.title}>{modal.title}</Text>
              <Text style={styles.message}>{modal.message}</Text>

              <View style={styles.actionRow}>
                {modal.secondaryButtonText ? (
                  <Button
                    title={modal.secondaryButtonText}
                    variant="outline"
                    onPress={() => {
                      modal.onSecondaryPress?.();
                      hideModal();
                    }}
                    style={styles.actionBtn}
                  />
                ) : null}

                <Button
                  title={modal.primaryButtonText || 'OK'}
                  variant={modal.type === 'danger' ? 'danger' : 'primary'}
                  onPress={() => {
                    modal.onPrimaryPress?.();
                    hideModal();
                  }}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.elevated,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  actionBtn: {
    minWidth: 100,
  },
});
