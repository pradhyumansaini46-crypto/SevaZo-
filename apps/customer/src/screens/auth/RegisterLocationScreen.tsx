import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  MapPin,
  Navigation,
  Search,
  Zap,
  CheckCircle2,
  Building,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useUiStore } from '../../stores/uiStore';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';

const sampleLocations = [
  {
    name: 'Indiranagar, Bengaluru',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: 'Koramangala, Bengaluru',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    name: 'HSR Layout, Bengaluru',
    address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    latitude: 12.9121,
    longitude: 77.6446,
  },
  {
    name: 'Whitefield, Bengaluru',
    address: 'ITPL Main Rd, Whitefield, Bengaluru, Karnataka 560066',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    latitude: 12.9698,
    longitude: 77.7500,
  },
];

export const RegisterLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { updateRegistrationDraft } = useAuthStore();
  const { setCurrentAddress } = useLocationStore();
  const { showToast } = useUiStore();

  const [detecting, setDetecting] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(sampleLocations[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUseCurrentLocation = () => {
    setDetecting(true);
    setTimeout(() => {
      const loc = sampleLocations[0];
      setSelectedLoc(loc);
      setDetecting(false);
      showToast('success', 'Pinpoint GPS location detected!');
    }, 1000);
  };

  const handleContinue = () => {
    const defaultAddr = {
      id: `addr-${Date.now()}`,
      customerId: 'cust-1',
      label: 'Home' as const,
      line1: selectedLoc.name,
      line2: selectedLoc.address,
      city: selectedLoc.city,
      state: selectedLoc.state,
      pincode: selectedLoc.pincode,
      latitude: selectedLoc.latitude,
      longitude: selectedLoc.longitude,
      isDefault: true,
      contactName: 'Valued Customer',
      contactPhone: '+91 9876543210',
    };

    updateRegistrationDraft({
      location: {
        latitude: selectedLoc.latitude,
        longitude: selectedLoc.longitude,
        formattedAddress: selectedLoc.address,
        city: selectedLoc.city,
      },
      address: defaultAddr,
      currentStep: 'RegisterAddress',
    });

    setCurrentAddress(defaultAddr);
    showToast('success', `Location set to ${selectedLoc.name.split(',')[0]}`);
    navigation.navigate('RegisterAddress');
  };

  const handleSaveExit = () => {
    updateRegistrationDraft({
      location: {
        latitude: selectedLoc.latitude,
        longitude: selectedLoc.longitude,
        formattedAddress: selectedLoc.address,
        city: selectedLoc.city,
      },
      currentStep: 'RegisterLocation',
    });
    showToast('info', 'Location saved. You can resume anytime.');
    navigation.replace('Welcome');
  };

  const filteredLocations = sampleLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={6}
      stepTitle="Delivery Location"
      pageTitle="Where should we deliver?"
      pageSubtitle="We need your location to show available dark stores, instant delivery slots, and real-time inventory."
      onBack={() => navigation.goBack()}
      onSaveExit={handleSaveExit}
      primaryButtonText={`Confirm Location (${selectedLoc.name.split(',')[0]})`}
      onPrimaryPress={handleContinue}
    >
      {/* Permission Explanation Badge */}
      <View style={styles.explanationCard}>
        <View style={styles.iconCircle}>
          <Zap size={20} color={Colors.primary} />
        </View>
        <View style={styles.explanationTextWrap}>
          <Text style={styles.explanationTitle}>10-Minute Dark Store Mapping</Text>
          <Text style={styles.explanationDesc}>
            Location helps us match you with the closest Sevazo Pod for 10-15 min deliveries.
          </Text>
        </View>
      </View>

      {/* GPS Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleUseCurrentLocation}
        style={styles.gpsButton}
      >
        <View style={styles.gpsIconCircle}>
          {detecting ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Navigation size={20} color={Colors.textInverse} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.gpsTitle}>Use Current Location</Text>
          <Text style={styles.gpsSubtitle}>
            {detecting ? 'Detecting via device GPS...' : 'Enable device GPS for pinpoint accuracy'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Manual Search Toggle */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search area, street or locality..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Suggested / Detected Area List */}
      <View style={styles.locationList}>
        <Text style={styles.listHeader}>Nearby Service Areas</Text>
        {filteredLocations.map((loc, idx) => {
          const isSelected = selectedLoc.name === loc.name;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => setSelectedLoc(loc)}
              style={[
                styles.locationCard,
                isSelected && styles.locationCardSelected,
              ]}
            >
              <View style={styles.locIconWrap}>
                <Building
                  size={20}
                  color={isSelected ? Colors.primary : Colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
                <Text style={styles.locName}>{loc.name}</Text>
                <Text style={styles.locAddress} numberOfLines={2}>
                  {loc.address}
                </Text>
              </View>
              {isSelected ? (
                <CheckCircle2 size={20} color={Colors.primary} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  explanationTextWrap: {
    flex: 1,
  },
  explanationTitle: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  explanationDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: Spacing.md,
    ...Shadows.small,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  gpsSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  locationList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  listHeader: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  locationCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  locIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locName: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  locAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
