import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { MapPin, Plus, CheckCircle, Home, Briefcase, Navigation } from 'lucide-react-native';
import { useLocationStore } from '../../stores/locationStore';
import { Address } from '../../types';

export const AddressListScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const onSelectAddress = route.params?.onSelectAddress;

  const { savedAddresses, currentAddress, setCurrentAddress, setDefaultAddress } = useLocationStore();

  const handleSelect = (addr: Address) => {
    setCurrentAddress(addr);
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    navigation.goBack();
  };

  const getLabelIcon = (label: string) => {
    if (label === 'Home') return <Home size={18} color={Colors.primary} />;
    if (label === 'Work') return <Briefcase size={18} color={Colors.secondary} />;
    return <Navigation size={18} color={Colors.accentOrange} />;
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Saved Addresses"
        subtitle="Choose delivery location"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Button
          title="Add New Address"
          onPress={() => navigation.navigate('AddEditAddress')}
          icon={<Plus size={18} color={Colors.textInverse} />}
          size="md"
          style={styles.addNewBtn}
        />

        <Text style={styles.sectionHeading}>Your Delivery Locations</Text>

        {savedAddresses.map((addr) => {
          const isSelected = currentAddress.id === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              activeOpacity={0.88}
              onPress={() => handleSelect(addr)}
              style={[
                styles.addressCard,
                isSelected && styles.addressCardSelected,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.labelRow}>
                  <View style={styles.iconCircle}>{getLabelIcon(addr.label)}</View>
                  <Text style={styles.labelTitle}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>DEFAULT</Text>
                    </View>
                  ) : null}
                </View>

                {isSelected ? (
                  <CheckCircle size={20} color={Colors.primary} />
                ) : null}
              </View>

              <Text style={styles.addressLine1}>{addr.line1}</Text>
              {addr.line2 ? (
                <Text style={styles.addressLine2}>{addr.line2}</Text>
              ) : null}
              {addr.landmark ? (
                <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
              ) : null}

              <Text style={styles.cityPincode}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddEditAddress', { address: addr })}
                  style={styles.actionLink}
                >
                  <Text style={styles.actionLinkText}>Edit</Text>
                </TouchableOpacity>

                {!addr.isDefault ? (
                  <TouchableOpacity
                    onPress={() => setDefaultAddress(addr.id)}
                    style={[styles.actionLink, { marginLeft: Spacing.md }]}
                  >
                    <Text style={styles.actionLinkText}>Set as Default</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  addNewBtn: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 4,
  },
  labelTitle: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  defaultPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  defaultPillText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  addressLine1: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addressLine2: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  landmarkText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cityPincode: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionLink: {
    paddingVertical: 2,
  },
  actionLinkText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
});
