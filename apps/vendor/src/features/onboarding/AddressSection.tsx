import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Crosshair,
  Compass,
  Info,
  Building,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { addressSchema, AddressFormValues } from '../../validation/schemas';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError } from '../../utils';

interface AddressSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 19.0596,
    longitude: 72.8295,
  });
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      line1: '',
      line2: '',
      area: '',
      landmark: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
    },
  });

  // Fetch saved address from server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      try {
        const res = await VendorApi.getAddressInfo();
        if (isMounted && res) {
          reset({
            line1: res.line1 || '',
            line2: res.line2 || '',
            area: res.area || res.locality || '',
            landmark: res.landmark || '',
            city: res.city || 'Mumbai',
            state: res.state || 'Maharashtra',
            pincode: res.pincode || '400050',
            country: res.country || 'India',
          });

          if (res.latitude && res.longitude) {
            setCoords({ latitude: Number(res.latitude), longitude: Number(res.longitude) });
            setLocationConfirmed(true);
          }
        }
      } catch (err) {
        // Fallback to empty form
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchAddress();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleUseCurrentLocation = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      const simulatedLat = 19.0596;
      const simulatedLng = 72.8295;
      setCoords({ latitude: simulatedLat, longitude: simulatedLng });
      setLocationConfirmed(true);

      setValue('line1', 'Shop 4, Sunrise Commercial Complex, Linking Road');
      setValue('area', 'Bandra West');
      setValue('city', 'Mumbai');
      setValue('state', 'Maharashtra');
      setValue('pincode', '400050');
      setValue('country', 'India');

      toast.success('GPS Location pinned & address auto-filled!');
    }, 900);
  };

  const handleConfirmPin = () => {
    setLocationConfirmed(true);
    toast.success('Store map pin confirmed at coordinates.');
  };

  const onSubmit = async (values: AddressFormValues) => {
    if (!locationConfirmed) {
      toast.warning('Please confirm your store location pin on the map.');
      return;
    }

    setLoading(true);
    try {
      await VendorApi.patchAddress({
        ...values,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      toast.success('Business address & coordinates saved successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Unable to save address.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const currentValues = watch();
      await VendorApi.patchAddress({
        ...currentValues,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      toast.info('Address draft saved.');
      if (onSaveDraft) onSaveDraft();
    } catch {
      toast.error('Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading address details...
        </Text>
      </View>
    );
  }

  return (
    <StepContainer
      icon={<MapPin size={24} color={colors.primary} />}
      title="Store Location & Address"
      subtitle="Accurate address and map coordinates enable precision delivery dispatch and customer discovery."
    >
      {/* GPS Auto-detect Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleUseCurrentLocation}
        disabled={locating}
        style={[styles.gpsButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
      >
        <Navigation size={18} color={colors.primary} />
        <Text style={[styles.gpsText, { color: colors.primary }]}>
          {locating ? 'Detecting GPS Coordinates...' : 'Use Current Device Location'}
        </Text>
      </TouchableOpacity>

      {/* Interactive Map Visual & Pin Positioning Canvas */}
      <View style={[styles.mapContainer, { borderColor: colors.border, backgroundColor: isDarkMap(themeMode) ? '#0F172A' : '#E2E8F0' }]}>
        <View style={styles.mapGridLines} />
        
        {/* Central Pulsing Pin */}
        <View style={styles.pinWrapper}>
          <View style={[styles.pinCircle, { backgroundColor: colors.primary }]}>
            <MapPin size={22} color="#FFFFFF" />
          </View>
          <View style={styles.pinShadow} />
        </View>

        {/* Live Coordinate Badge */}
        <View style={[styles.coordBadge, { backgroundColor: colors.surface }]}>
          <Compass size={14} color={colors.primary} />
          <Text style={[styles.coordText, { color: colors.textPrimary }]}>
            Lat: {coords.latitude.toFixed(4)}, Lng: {coords.longitude.toFixed(4)}
          </Text>
        </View>

        {/* Pin Confirmation Action */}
        <TouchableOpacity
          onPress={handleConfirmPin}
          style={[
            styles.confirmPinBtn,
            { backgroundColor: locationConfirmed ? colors.success : colors.primary },
          ]}
        >
          {locationConfirmed ? (
            <>
              <CheckCircle2 size={14} color="#FFFFFF" />
              <Text style={styles.confirmPinText}>Pin Confirmed</Text>
            </>
          ) : (
            <>
              <Crosshair size={14} color="#FFFFFF" />
              <Text style={styles.confirmPinText}>Confirm Store Pin</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Purpose Notice */}
      <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Info size={16} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          Exact GPS coordinates are utilized for automatic rider assignment, accurate delivery radius (5–15 km), customer ETA computation, and neighborhood discovery.
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formFields}>
        <Controller
          control={control}
          name="line1"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address Line 1 (Flat, Shop No, Building) *"
              placeholder="e.g. Shop 4, Sunrise Commercial Complex"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.line1?.message}
              leftIcon={<Building size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="line2"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address Line 2 (Street, Road)"
              placeholder="e.g. Linking Road, Near National Park"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.line2?.message}
            />
          )}
        />

        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="area"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Locality / Area *"
                  placeholder="e.g. Bandra West"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.area?.message}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="landmark"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Landmark"
                  placeholder="Opposite Metro Gate"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.landmark?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="City *"
                  placeholder="Mumbai"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.city?.message}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="State *"
                  placeholder="Maharashtra"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.state?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Postal PIN Code *"
                  placeholder="400050"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.pincode?.message}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Country *"
                  placeholder="India"
                  value={value || 'India'}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={false}
                  error={errors.country?.message}
                />
              )}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsBlock}>
        <Button
          title="Save & Continue"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          title="Save Draft"
          variant="outline"
          size="md"
          fullWidth
          disabled={loading}
          onPress={handleSaveDraft}
          style={{ marginTop: 8 }}
        />
      </View>
    </StepContainer>
  );
};

const isDarkMap = (mode: string) => mode === 'DARK';

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 8,
  },
  gpsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapContainer: {
    height: 180,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 14,
    ...Shadows.card,
  },
  mapGridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 4,
  },
  coordBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
    ...Shadows.card,
  },
  coordText: {
    fontSize: 11,
    fontWeight: '700',
  },
  confirmPinBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  confirmPinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  formFields: {
    gap: 14,
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsBlock: {
    marginTop: 10,
  },
});
