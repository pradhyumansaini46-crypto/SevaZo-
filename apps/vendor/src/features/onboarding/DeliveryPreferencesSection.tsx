import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  Truck,
  Clock,
  Package,
  ShieldAlert,
  ThermometerSnowflake,
  Weight,
  GlassWater,
  Info,
  CheckCircle2,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError } from '../../utils';

export interface DeliveryPreferencesFormValues {
  prepTimeMinutes: number;
  pickupInstructions: string;
  packagingType: 'STANDARD_BAG' | 'ECO_FRIENDLY_BOX' | 'CORRUGATED_BOX' | 'INSULATED_POUCH';
  isFragile: boolean;
  isHeavy: boolean;
  isTemperatureSensitive: boolean;
}

interface DeliveryPreferencesSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const DeliveryPreferencesSection: React.FC<DeliveryPreferencesSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<DeliveryPreferencesFormValues>({
    defaultValues: {
      prepTimeMinutes: 15,
      pickupInstructions: 'Collect order package from counter #2 at front desk.',
      packagingType: 'ECO_FRIENDLY_BOX',
      isFragile: false,
      isHeavy: false,
      isTemperatureSensitive: false,
    },
  });

  const selectedPrep = watch('prepTimeMinutes');
  const selectedPackaging = watch('packagingType');
  const isFragile = watch('isFragile');
  const isHeavy = watch('isHeavy');
  const isTemp = watch('isTemperatureSensitive');

  useEffect(() => {
    let isMounted = true;
    const fetchDelivery = async () => {
      try {
        const state = await VendorApi.getOnboardingState();
        const vendorData = state.data;
        if (isMounted && vendorData?.deliveryPreference) {
          const pref = vendorData.deliveryPreference;
          reset({
            prepTimeMinutes: pref.prepTimeMinutes || 15,
            pickupInstructions: pref.pickupInstructions || 'Collect order package from counter #2.',
            packagingType: pref.packagingType || 'ECO_FRIENDLY_BOX',
            isFragile: Boolean(pref.isFragile),
            isHeavy: Boolean(pref.isHeavy),
            isTemperatureSensitive: Boolean(pref.isTemperatureSensitive),
          });
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchDelivery();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const onSubmit = async (values: DeliveryPreferencesFormValues) => {
    setLoading(true);
    try {
      await VendorApi.saveOnboardingStep(12, values);
      toast.success('Delivery & packaging preferences saved!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Unable to save delivery preferences.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading delivery preferences...
        </Text>
      </View>
    );
  }

  return (
    <StepContainer
      icon={<Truck size={24} color={colors.primary} />}
      title="Delivery & Fulfillment Setup"
      subtitle="Configure order packaging, preparation timelines, and rider pickup guidelines."
    >
      {/* 1. Preparation Time */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Clock size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Average Order Preparation Time
          </Text>
        </View>
        <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
          Used to calculate accurate customer ETA and dispatch riders right on time.
        </Text>

        <View style={styles.prepRow}>
          {[10, 15, 25, 45, 60].map((mins) => {
            const isSelected = selectedPrep === mins;
            return (
              <TouchableOpacity
                key={mins}
                onPress={() => setValue('prepTimeMinutes', mins)}
                style={[
                  styles.prepChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.prepChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '800' : '600' },
                  ]}
                >
                  {mins} min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Packaging Type */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Package size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Primary Packaging Type</Text>
        </View>

        <View style={styles.packagingGrid}>
          {[
            { id: 'ECO_FRIENDLY_BOX', label: 'Eco-Friendly Box / Bag' },
            { id: 'STANDARD_BAG', label: 'Standard Carry Bag' },
            { id: 'CORRUGATED_BOX', label: 'Heavy Corrugated Carton' },
            { id: 'INSULATED_POUCH', label: 'Insulated Thermal Pouch' },
          ].map((pack) => {
            const isSelected = selectedPackaging === pack.id;
            return (
              <TouchableOpacity
                key={pack.id}
                onPress={() => setValue('packagingType', pack.id as any)}
                style={[
                  styles.packOption,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <CheckCircle2 size={16} color={isSelected ? colors.primary : colors.border} />
                <Text
                  style={[
                    styles.packText,
                    { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {pack.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Special Handling & Logistics Flags */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <ShieldAlert size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Special Handling Requirements
          </Text>
        </View>
        <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
          Signals our automated dispatch system to assign riders with appropriate bags and transport.
        </Text>

        <View style={styles.switchList}>
          {/* Fragile Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchIconBox}>
              <GlassWater size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Fragile Goods</Text>
              <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                Glass bottles, ceramics, bakery cakes requiring upright careful carriage.
              </Text>
            </View>
            <Switch
              value={isFragile}
              onValueChange={(val) => setValue('isFragile', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Heavy / Bulky Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchIconBox}>
              <Weight size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Heavy / Bulky Orders</Text>
              <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                Orders frequently exceeding 10 kg requiring cargo rack or 4-wheeler dispatch.
              </Text>
            </View>
            <Switch
              value={isHeavy}
              onValueChange={(val) => setValue('isHeavy', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Temperature Sensitive Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchIconBox}>
              <ThermometerSnowflake size={18} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Temperature Sensitive</Text>
              <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                Frozen meats, dairy, ice-cream, or hot food requiring insulated thermal boxes.
              </Text>
            </View>
            <Switch
              value={isTemp}
              onValueChange={(val) => setValue('isTemperatureSensitive', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>
      </View>

      {/* 4. Rider Pickup Guidelines */}
      <Controller
        control={control}
        name="pickupInstructions"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Rider Pickup Instructions *"
            placeholder="e.g. Park in visitor bay, collect sealed parcel from counter #2."
            multiline
            numberOfLines={3}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            helperText="Directly displayed on the SevaZo Rider app during pickup navigation."
          />
        )}
      />

      {/* Action CTA */}
      <View style={styles.actionsBlock}>
        <Button
          title="Save & Continue"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </StepContainer>
  );
};

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
  card: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 16,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },
  prepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prepChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  prepChipText: {
    fontSize: 12,
  },
  packagingGrid: {
    gap: 8,
  },
  packOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 10,
  },
  packText: {
    fontSize: 13,
  },
  switchList: {
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },
  actionsBlock: {
    marginTop: 10,
  },
});
