import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { MapPin, Home, Briefcase, Navigation, LocateFixed } from 'lucide-react-native';
import { useLocationStore } from '../../stores/locationStore';
import { Address } from '../../types';

export const AddEditAddressScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const existingAddress: Address | undefined = route.params?.address;

  const { addAddress, updateAddress } = useLocationStore();

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(
    (existingAddress?.label === 'Home' || existingAddress?.label === 'Work' || existingAddress?.label === 'Other')
      ? existingAddress.label
      : 'Home'
  );
  const [line1, setLine1] = useState(existingAddress?.line1 || '');
  const [line2, setLine2] = useState(existingAddress?.line2 || '');
  const [landmark, setLandmark] = useState(existingAddress?.landmark || '');
  const [city, setCity] = useState(existingAddress?.city || 'Jaipur');
  const [state, setState] = useState(existingAddress?.state || 'Rajasthan');
  const [pincode, setPincode] = useState(existingAddress?.pincode || '302017');
  const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
  const [error, setError] = useState('');

  const handleUseCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            const addr = data?.address || {};
            setLine1(addr.house_number || addr.building || 'Flat 304, Kalpatru Splendor');
            setLine2([addr.road, addr.suburb || addr.neighbourhood].filter(Boolean).join(', ') || 'Jagatpura, Malviya Nagar');
            setCity(addr.city || addr.town || 'Jaipur');
            setState(addr.state || 'Rajasthan');
            setPincode(addr.postcode?.replace(/\D/g, '').slice(0, 6) || '302017');
          } catch {
            setLine1('Flat 304, Kalpatru Splendor');
            setLine2('Jagatpura, Malviya Nagar');
            setLandmark('Near Jagatpura Flyover');
            setCity('Jaipur');
            setState('Rajasthan');
            setPincode('302017');
          }
        },
        () => {
          setLine1('Flat 304, Kalpatru Splendor');
          setLine2('Jagatpura, Malviya Nagar');
          setLandmark('Near Jagatpura Flyover');
          setCity('Jaipur');
          setState('Rajasthan');
          setPincode('302017');
        }
      );
    } else {
      setLine1('Flat 304, Kalpatru Splendor');
      setLine2('Jagatpura, Malviya Nagar');
      setLandmark('Near Jagatpura Flyover');
      setCity('Jaipur');
      setState('Rajasthan');
      setPincode('302017');
    }
  };

  const handleSave = () => {
    if (!line1.trim() || !pincode.trim() || !city.trim()) {
      setError('Please fill in all mandatory address details.');
      return;
    }
    setError('');

    const payload: Address = {
      id: existingAddress?.id || `addr-${Date.now()}`,
      label,
      line1: line1.trim(),
      line2: line2.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault,
    };

    if (existingAddress) {
      updateAddress(payload);
    } else {
      addAddress(payload);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title={existingAddress ? 'Edit Residential Address' : 'Residential Address'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* GPS Auto-Detect Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleUseCurrentLocation}
          style={styles.gpsBanner}
        >
          <LocateFixed size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>Use Current Location (GPS)</Text>
            <Text style={styles.gpsSubtitle}>Auto-fetch house location & pin</Text>
          </View>
        </TouchableOpacity>

        {/* Label Selector */}
        <Text style={styles.sectionLabel}>Save Address As</Text>
        <View style={styles.labelRow}>
          {[
            { key: 'Home', icon: <Home size={16} color={label === 'Home' ? Colors.primaryDark : Colors.textSecondary} /> },
            { key: 'Work', icon: <Briefcase size={16} color={label === 'Work' ? Colors.primaryDark : Colors.textSecondary} /> },
            { key: 'Other', icon: <Navigation size={16} color={label === 'Other' ? Colors.primaryDark : Colors.textSecondary} /> },
          ].map((item) => {
            const isSelected = label === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => setLabel(item.key as any)}
                style={[
                  styles.labelPill,
                  isSelected && styles.labelPillSelected,
                ]}
              >
                {item.icon}
                <Text
                  style={[
                    styles.labelPillText,
                    isSelected && styles.labelPillTextSelected,
                  ]}
                >
                  {item.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Address Inputs */}
        <Input
          label="House / Flat / Block No. *"
          placeholder="e.g. Flat 304, Kalpatru Splendor"
          value={line1}
          onChangeText={setLine1}
        />

        <Input
          label="Apartment / Road / Area"
          placeholder="e.g. Jagatpura, Malviya Nagar"
          value={line2}
          onChangeText={setLine2}
        />

        <Input
          label="Nearby Landmark"
          placeholder="e.g. Near Jagatpura Flyover"
          value={landmark}
          onChangeText={setLandmark}
        />

        <View style={styles.cityPincodeRow}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Input
              label="Pincode *"
              placeholder="e.g. 302017"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="City *"
              placeholder="e.g. Jaipur"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        <Input
          label="State *"
          placeholder="e.g. Rajasthan"
          value={state}
          onChangeText={setState}
        />

        {/* Set Default Switch */}
        <View style={styles.defaultRow}>
          <View>
            <Text style={styles.defaultTitle}>Set as Default Delivery Address</Text>
            <Text style={styles.defaultSub}>Use this address automatically at checkout</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.surface}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={existingAddress ? 'Update Address' : 'Save Address'}
          onPress={handleSave}
          size="lg"
          style={styles.saveBtn}
        />
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  gpsTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  gpsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
  sectionLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  labelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginRight: Spacing.sm,
  },
  labelPillSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  labelPillText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  labelPillTextSelected: {
    color: Colors.primaryDark,
  },
  cityPincodeRow: {
    flexDirection: 'row',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  defaultTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  defaultSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
