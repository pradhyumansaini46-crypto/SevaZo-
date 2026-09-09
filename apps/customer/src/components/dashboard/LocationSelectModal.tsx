import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Home, Briefcase, MapPin, Plus, Check, X } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Address } from '../../types';
import { useLocationStore } from '../../stores/locationStore';
import { triggerHaptic } from '../../utils/haptics';

interface LocationSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onAddNewAddress: () => void;
}

export const LocationSelectModal: React.FC<LocationSelectModalProps> = ({
  visible,
  onClose,
  onAddNewAddress,
}) => {
  const { currentAddress, savedAddresses, setCurrentAddress } = useLocationStore();

  const handleSelectAddress = (addr: Address) => {
    triggerHaptic('selection');
    setCurrentAddress(addr);
    onClose();
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) {
      return <Home size={18} color={Colors.primary} />;
    }
    if (l.includes('work') || l.includes('office')) {
      return <Briefcase size={18} color={Colors.secondary} />;
    }
    return <MapPin size={18} color={Colors.accentOrange} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.indicatorBar} />

              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Choose delivery location</Text>
                  <Text style={styles.subtitle}>Select where you want your order delivered</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                >
                  <X size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.addressList}
              >
                {savedAddresses.map((addr) => {
                  const isSelected = currentAddress.id === addr.id;

                  return (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={0.82}
                      onPress={() => handleSelectAddress(addr)}
                      style={[
                        styles.addressItem,
                        isSelected && styles.selectedAddressItem,
                      ]}
                    >
                      <View style={styles.iconCircle}>
                        {getAddressIcon(addr.label)}
                      </View>

                      <View style={styles.addressTextCol}>
                        <View style={styles.labelRow}>
                          <Text style={styles.addressLabel}>{addr.label}</Text>
                          {isSelected ? (
                            <View style={styles.activeTag}>
                              <Text style={styles.activeTagText}>CURRENT</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text numberOfLines={1} style={styles.addressLine}>
                          {addr.line1}
                        </Text>
                        <Text style={styles.addressCity}>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkCircle}>
                          <Check size={14} color={Colors.textInverse} strokeWidth={3} />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    triggerHaptic('medium');
                    onClose();
                    onAddNewAddress();
                  }}
                  style={styles.addNewButton}
                >
                  <View style={styles.addIconCircle}>
                    <Plus size={18} color={Colors.primary} strokeWidth={2.8} />
                  </View>
                  <Text style={styles.addNewText}>Add new address</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    maxHeight: '75%',
    ...Shadows.elevated,
  },
  indicatorBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  addressList: {
    marginTop: Spacing.xs,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  selectedAddressItem: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addressTextCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressLabel: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  activeTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  activeTagText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  addressLine: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addressCity: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'none',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addNewText: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
});
