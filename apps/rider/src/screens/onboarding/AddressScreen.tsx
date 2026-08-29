import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import { zodResolver } from '../../utils/zodResolver';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { addressSchema, AddressFormValues } from '../../validation/onboardingValidation';

export const AddressScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(
    draftData?.address?.latitude && draftData?.address?.longitude
      ? { lat: draftData.address.latitude, lng: draftData.address.longitude }
      : null
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: draftData?.address?.addressLine1 || '',
      addressLine2: draftData?.address?.addressLine2 || '',
      locality: draftData?.address?.locality || '',
      city: draftData?.address?.city || '',
      state: draftData?.address?.state || '',
      postalCode: draftData?.address?.postalCode || draftData?.address?.pincode || '',
      country: draftData?.address?.country || 'India',
      latitude: gpsCoordinates?.lat,
      longitude: gpsCoordinates?.lng,
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    clearError();
    const payload = {
      ...data,
      latitude: gpsCoordinates?.lat,
      longitude: gpsCoordinates?.lng,
    };
    const success = await saveSection('address', payload, true);
    if (success) {
      navigation.navigate('OnboardingEmergencyContact');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('address', { ...data, ...gpsCoordinates }, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please grant location permissions in your phone settings to detect your current address.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const detected = { lat: latitude, lng: longitude };
      setGpsCoordinates(detected);
      setValue('latitude', latitude);
      setValue('longitude', longitude);

      // Reverse geocode to extract address details
      try {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseResults && reverseResults.length > 0) {
          const item = reverseResults[0];
          if (item.name || item.street) {
            setValue('addressLine1', [item.name, item.street].filter(Boolean).join(', '));
          }
          if (item.district || item.subregion) {
            setValue('locality', item.district || item.subregion || '');
          }
          if (item.city) {
            setValue('city', item.city);
          }
          if (item.region) {
            setValue('state', item.region);
          }
          if (item.postalCode) {
            setValue('postalCode', item.postalCode);
          }
          if (item.country) {
            setValue('country', item.country);
          }
        }
      } catch {
        // Continue even if geocoding fails, coordinates are captured
      }
    } catch (e: any) {
      Alert.alert(
        'GPS Location Notice',
        'Could not fetch real-time GPS location. Please ensure Location services are turned on.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={14}
      stepTitle="Residential Address"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingPersonal')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Residential Address"
        subtitle="Where do you currently reside? This helps determine your nearest fulfillment hubs and dispatch zones."
        error={error}
      >
        {/* GPS Quick Location Button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
          disabled={isLocating}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Use current location via GPS"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#FF6600" />
          ) : (
            <Navigation size={18} color="#FF6600" />
          )}
          <Text style={styles.locationButtonText}>
            {isLocating ? 'Detecting GPS coordinates...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>

        {gpsCoordinates && (
          <View style={styles.gpsBadge}>
            <MapPin size={14} color="#10B981" />
            <Text style={styles.gpsBadgeText}>
              GPS Coordinates: {gpsCoordinates.lat.toFixed(4)}, {gpsCoordinates.lng.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Address Line 1 */}
        <Controller
          control={control}
          name="addressLine1"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Address Line 1 (Flat / House No. / Building)"
              required
              placeholder="e.g. Flat 402, Sunshine Heights"
              value={value}
              onChangeText={onChange}
              error={errors.addressLine1?.message}
            />
          )}
        />

        {/* Address Line 2 */}
        <Controller
          control={control}
          name="addressLine2"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Address Line 2 (Street / Landmark)"
              placeholder="e.g. Near Indiranagar Metro Station"
              value={value}
              onChangeText={onChange}
              error={errors.addressLine2?.message}
            />
          )}
        />

        {/* Locality */}
        <Controller
          control={control}
          name="locality"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Locality / Area"
              required
              placeholder="e.g. Indiranagar"
              value={value}
              onChangeText={onChange}
              error={errors.locality?.message}
            />
          )}
        />

        {/* City & State */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  required
                  placeholder="e.g. Bengaluru"
                  value={value}
                  onChangeText={onChange}
                  error={errors.city?.message}
                />
              )}
            />
          </View>

          <View style={styles.col}>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="State"
                  required
                  placeholder="e.g. Karnataka"
                  value={value}
                  onChangeText={onChange}
                  error={errors.state?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Postal Code & Country */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Postal Code / PIN"
                  required
                  placeholder="e.g. 560038"
                  value={value}
                  onChangeText={onChange}
                  error={errors.postalCode?.message}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}
            />
          </View>

          <View style={styles.col}>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Country"
                  placeholder="e.g. India"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Your residential location helps us match you with deliveries close to your home.
          </Text>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF6600',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  locationButtonText: {
    ...Typography.bodyMedium,
    color: '#FF6600',
    fontWeight: '700',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#052E16',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  gpsBadgeText: {
    ...Typography.bodySmall,
    color: '#10B981',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
});

export default AddressScreen;
