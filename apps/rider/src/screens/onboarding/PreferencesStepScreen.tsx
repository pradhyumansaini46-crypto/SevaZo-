import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Package, Utensils, ShoppingBag, Pill, AlertCircle, Minus, Plus, Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { useOnboardingStore } from '../../store/onboardingStore';
import { zodResolver } from '../../utils/zodResolver';
import {
  deliveryPreferencesSchema,
  DeliveryPreferencesFormValues,
} from '../../validation/onboardingValidation';

const CATEGORIES = [
  { id: 'FOOD', label: 'Food & Dining', icon: Utensils },
  { id: 'GROCERY', label: 'Groceries & Mart', icon: ShoppingBag },
  { id: 'PHARMACY', label: 'Medicines & Health', icon: Pill },
  { id: 'PARCEL', label: 'Courier & Packages', icon: Package },
];

const RULER_STOPS = [1, 2, 3, 4, 5, 6, 7, 8];

export const PreferencesStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryPreferencesFormValues>({
    resolver: zodResolver(deliveryPreferencesSchema),
    defaultValues: {
      maxDistanceKm: Math.min(8, draftData?.deliveryPreferences?.maxDistanceKm || 5),
      categories: draftData?.deliveryPreferences?.categories || ['FOOD', 'GROCERY', 'PARCEL'],
      acceptHeavyItems: draftData?.deliveryPreferences?.acceptHeavyItems || false,
      acceptSpecialHandling: draftData?.deliveryPreferences?.acceptSpecialHandling || true,
    },
  });

  const selectedRadius = Math.min(8, watch('maxDistanceKm') || 5);
  const selectedCategories = watch('categories') || [];

  const toggleCategory = (catId: string) => {
    let updated: string[];
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // Keep at least 1
      updated = selectedCategories.filter((c) => c !== catId);
    } else {
      updated = [...selectedCategories, catId];
    }
    setValue('categories', updated, { shouldValidate: true });
  };

  const handleStepDistance = (delta: number) => {
    const nextVal = Math.max(1, Math.min(8, selectedRadius + delta));
    setValue('maxDistanceKm', nextVal, { shouldValidate: true });
  };

  const onSubmit = async (data: DeliveryPreferencesFormValues) => {
    clearError();
    const success = await saveSection('delivery_preferences', data, true);
    if (success) {
      navigation.navigate('OnboardingAvailability');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('delivery_preferences', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  // Percentage calculation for linear track fill (from 1km to 8km)
  const minKm = 1;
  const maxKm = 8;
  const fillPercentage = Math.min(100, Math.max(0, ((selectedRadius - minKm) / (maxKm - minKm)) * 100));

  return (
    <OnboardingLayout
      currentStep={11}
      totalSteps={14}
      stepTitle="Delivery Preferences"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingServiceArea')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Order & Distance Preferences"
        subtitle="Customize your delivery radius and order categories to maximize your earnings."
        error={error}
      >
        {/* Important Platform Dispatch Notice */}
        <View style={styles.dispatchNotice}>
          <AlertCircle size={18} color="#FF6600" />
          <View style={styles.dispatchNoticeTextCol}>
            <Text style={styles.dispatchNoticeTitle}>Platform Dispatch Priority</Text>
            <Text style={styles.dispatchNoticeDesc}>
              These settings represent your preferred delivery profile. The Sevazo automated dispatch
              engine optimizes live order allocation based on real-time customer demand.
            </Text>
          </View>
        </View>

        {/* Modern Lining Ruler Range Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>Preferred Max Delivery Radius</Text>
            <View style={styles.currentDistanceBadge}>
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.currentDistanceText}>{selectedRadius} km</Text>
            </View>
          </View>

          {/* Lining Ruler Track Container */}
          <View style={styles.rulerContainer}>
            {/* Background Track with Fill */}
            <View style={styles.trackBackground}>
              <View style={[styles.trackFill, { width: `${fillPercentage}%` }]} />
            </View>

            {/* Ruler Tick Lines */}
            <View style={styles.tickLinesRow}>
              {RULER_STOPS.map((stop) => {
                const isPassed = selectedRadius >= stop;
                const isSelected = selectedRadius === stop;
                return (
                  <TouchableOpacity
                    key={stop}
                    style={styles.tickCol}
                    onPress={() => setValue('maxDistanceKm', stop, { shouldValidate: true })}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.tickLine,
                        isPassed && styles.tickLineActive,
                        isSelected && styles.tickLineCurrent,
                      ]}
                    />
                    <Text
                      style={[
                        styles.tickLabel,
                        isPassed && styles.tickLabelActive,
                        isSelected && styles.tickLabelCurrent,
                      ]}
                    >
                      {stop}k
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Stepper Increment / Decrement Controls */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleStepDistance(-1)}
              disabled={selectedRadius <= 1}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Decrease distance by 1 kilometer"
            >
              <Minus size={18} color={selectedRadius <= 1 ? Colors.textMuted : '#FF6600'} />
            </TouchableOpacity>

            <View style={styles.rangeSummary}>
              <Text style={styles.rangeSummaryText}>
                {selectedRadius <= 3
                  ? '⚡ Hyperlocal • Faster return & turnaround'
                  : selectedRadius <= 6
                  ? '⭐ Short trips • Optimal order volume'
                  : '🚀 Max Radius (8 km) • Maximum drop coverage'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleStepDistance(1)}
              disabled={selectedRadius >= 8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Increase distance by 1 kilometer"
            >
              <Plus size={18} color={selectedRadius >= 8 ? Colors.textMuted : '#FF6600'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligible Delivery Categories *</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => {
              const isSelected = selectedCategories.includes(c.id);
              const Icon = c.icon;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catCard, isSelected && styles.catCardSelected]}
                  onPress={() => toggleCategory(c.id)}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Icon size={20} color={isSelected ? '#FF6600' : Colors.textMuted} />
                  <Text style={[styles.catCardText, isSelected && styles.catCardTextSelected]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.categories && (
            <Text style={styles.errorText}>{errors.categories.message}</Text>
          )}
        </View>

        {/* Toggles: Heavy Items & Special Handling */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Accept Heavy Packages (&gt; 10 kg)</Text>
              <Text style={styles.toggleDesc}>
                Includes higher weight surge incentives and helper support.
              </Text>
            </View>
            <Controller
              control={control}
              name="acceptHeavyItems"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: Colors.surfaceElevated, true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleRowBorder]}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Fragile & Special Handling</Text>
              <Text style={styles.toggleDesc}>
                Cakes, glass items, and flowers with priority handling care bonus.
              </Text>
            </View>
            <Controller
              control={control}
              name="acceptSpecialHandling"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: Colors.surfaceElevated, true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
          </View>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  dispatchNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  dispatchNoticeTextCol: {
    flex: 1,
  },
  dispatchNoticeTitle: {
    ...Typography.titleSmall,
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
  },
  dispatchNoticeDesc: {
    ...Typography.bodySmall,
    color: '#9A3412',
    marginTop: 2,
    lineHeight: 18,
  },
  sliderCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sliderLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  currentDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6600',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  currentDistanceText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  rulerContainer: {
    marginVertical: Spacing.md,
  },
  trackBackground: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#FF6600',
    borderRadius: 3,
  },
  tickLinesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: 2,
  },
  tickCol: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 28,
  },
  tickLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 1,
    marginBottom: 4,
  },
  tickLineActive: {
    backgroundColor: '#EA580C',
    height: 14,
  },
  tickLineCurrent: {
    backgroundColor: '#FF6600',
    height: 18,
    width: 3,
  },
  tickLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tickLabelActive: {
    color: Colors.textSecondary,
  },
  tickLabelCurrent: {
    color: '#FF6600',
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeSummary: {
    flex: 1,
    alignItems: 'center',
  },
  rangeSummaryText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  catCardSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
  },
  catCardText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  catCardTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  toggleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  toggleRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  toggleDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default PreferencesStepScreen;
