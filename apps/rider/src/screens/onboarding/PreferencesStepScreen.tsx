import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  Package,
  Utensils,
  ShoppingBag,
  Pill,
  Minus,
  Plus,
  Zap,
  MapPin,
  Compass,
  Building,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { zodResolver } from '../../utils/zodResolver';
import {
  deliveryPreferencesSchema,
  DeliveryPreferencesFormValues,
} from '../../validation/onboardingValidation';

const FLEET_HUBS = [
  { id: 'hub_central', name: 'Central Commercial Hub', code: 'HUB-01' },
  { id: 'hub_north', name: 'North Market & Tech District', code: 'HUB-02' },
  { id: 'hub_south', name: 'South Residential & Malls Hub', code: 'HUB-03' },
  { id: 'hub_east', name: 'East Express Logistic Point', code: 'HUB-04' },
  { id: 'hub_west', name: 'West Metro Corridor', code: 'HUB-05' },
];

const VENDOR_APP_CATEGORIES = [
  { id: 'FOOD_RESTAURANT', label: 'Food & Dining', icon: Utensils, desc: 'Hot meals & restaurant orders' },
  { id: 'GROCERY_RETAIL', label: 'Grocery & Supermarket', icon: ShoppingBag, desc: 'Daily essentials & FMCG' },
  { id: 'PHARMACY', label: 'Pharmacy & Medicine', icon: Pill, desc: 'Prescription & OTC wellness' },
  { id: 'FRESH_PRODUCE', label: 'Fruits & Vegetables', icon: Sparkles, desc: 'Farm fresh farm-to-table' },
  { id: 'MEAT_SEAFOOD', label: 'Meat & Seafood', icon: Package, desc: 'Cold chain hygienic delivery' },
  { id: 'BAKERY_CAKES', label: 'Bakery & Cakes', icon: Sparkles, desc: 'Pastries & custom cakes' },
  { id: 'DAIRY_ESSENTIALS', label: 'Dairy & Milk', icon: ShoppingBag, desc: 'Morning milk & curd deliveries' },
  { id: 'ELECTRONICS', label: 'Electronics & Gadgets', icon: Zap, desc: 'Mobile accessories & parts' },
  { id: 'FASHION_APPAREL', label: 'Fashion & Apparel', icon: ShoppingBag, desc: 'Clothing & footwear returns' },
  { id: 'PET_SUPPLIES', label: 'Pet Food & Supplies', icon: Sparkles, desc: 'Pet care & accessories' },
  { id: 'HOME_ESSENTIALS', label: 'Home & Kitchen', icon: Building, desc: 'Homecare & cleaning supplies' },
  { id: 'DOCUMENTS_COURIER', label: 'Express Document Courier', icon: Package, desc: 'P2P papers & parcel drops' },
];

const RULER_STOPS = [2, 4, 6, 8, 10, 12, 15, 20];

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
      city: draftData?.serviceArea?.city || draftData?.deliveryPreferences?.city || 'Jaipur',
      zone: draftData?.serviceArea?.zone || draftData?.deliveryPreferences?.zone || 'Central Zone',
      locality:
        draftData?.serviceArea?.locality ||
        draftData?.deliveryPreferences?.locality ||
        'Malviya Nagar',
      preferredHubs:
        draftData?.serviceArea?.preferredHubs ||
        draftData?.deliveryPreferences?.preferredHubs ||
        ['hub_central', 'hub_south'],
      maxDistanceKm: draftData?.deliveryPreferences?.maxDistanceKm || 8,
      acceptHeavyItems: draftData?.deliveryPreferences?.acceptHeavyItems || false,
      acceptSpecialHandling: draftData?.deliveryPreferences?.acceptSpecialHandling || true,
      categories:
        draftData?.deliveryPreferences?.categories || [
          'FOOD_RESTAURANT',
          'GROCERY_RETAIL',
          'PHARMACY',
          'DOCUMENTS_COURIER',
        ],
    },
  });

  const selectedRadius = watch('maxDistanceKm') || 8;
  const selectedCategories = watch('categories') || [];
  const selectedHubs = watch('preferredHubs') || [];

  const toggleCategory = (catId: string) => {
    let updated: string[];
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return;
      updated = selectedCategories.filter((c: string) => c !== catId);
    } else {
      updated = [...selectedCategories, catId];
    }
    setValue('categories', updated, { shouldValidate: true });
  };

  const toggleHub = (hubId: string) => {
    let updated: string[];
    if (selectedHubs.includes(hubId)) {
      if (selectedHubs.length === 1) return;
      updated = selectedHubs.filter((h: string) => h !== hubId);
    } else {
      updated = [...selectedHubs, hubId];
    }
    setValue('preferredHubs', updated, { shouldValidate: true });
  };

  const handleStepDistance = (delta: number) => {
    const nextVal = Math.max(2, Math.min(20, selectedRadius + delta));
    setValue('maxDistanceKm', nextVal, { shouldValidate: true });
  };

  const onSubmit = async (data: DeliveryPreferencesFormValues) => {
    clearError();
    // Save to both service_area and delivery_preferences keys for backward compatibility
    await saveSection('service_area', {
      city: data.city,
      zone: data.zone,
      locality: data.locality,
      preferredHubs: data.preferredHubs,
    });
    const success = await saveSection('delivery_preferences', data, true);
    if (success) {
      // Step 7 is Availability & Working Hours
      navigation.navigate('OnboardingAvailability');
    }
  };

  const minKm = 2;
  const maxKm = 20;
  const fillPercentage = Math.min(100, Math.max(0, ((selectedRadius - minKm) / (maxKm - minKm)) * 100));

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={8}
      stepTitle="Service Area & Preferences"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingBanking')}
      onSaveContinue={handleSubmit(onSubmit)}
      isLoading={isSaving}
    >
      <StepContainer
        title="Service Area & Delivery Preferences"
        subtitle="Select your operating zone, dispatch radius, and eligible delivery categories."
        error={error}
      >
        {/* ========================================================= */}
        {/* MERGED: 1. Service Area & Fleet Hubs                      */}
        {/* ========================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Compass size={20} color="#FF6600" />
            <Text style={styles.sectionTitle}>1. Operating Service Area</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Operating City"
                    required
                    placeholder="e.g. Jaipur"
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
                name="zone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Primary Zone"
                    required
                    placeholder="e.g. Central Zone"
                    value={value}
                    onChangeText={onChange}
                    error={errors.zone?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="locality"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Primary Locality / Base Point"
                required
                placeholder="e.g. Malviya Nagar / Mansarovar"
                value={value}
                onChangeText={onChange}
                error={errors.locality?.message}
                leftIcon={<MapPin size={18} color={Colors.textSecondary} />}
                helperText="Orders near your base point will be prioritized for pickup."
              />
            )}
          />

          {/* Preferred Fleet Hubs Multi-select */}
          <Text style={styles.subSectionTitle}>Preferred Fleet Hubs *</Text>
          <View style={styles.hubsContainer}>
            {FLEET_HUBS.map((hub) => {
              const isSelected = selectedHubs.includes(hub.id);
              return (
                <TouchableOpacity
                  key={hub.id}
                  style={[styles.hubChip, isSelected && styles.hubChipSelected]}
                  onPress={() => toggleHub(hub.id)}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View style={styles.hubChipLeft}>
                    {isSelected ? (
                      <CheckCircle2 size={16} color="#FF6600" />
                    ) : (
                      <Building size={16} color="#94A3B8" />
                    )}
                    <Text style={[styles.hubName, isSelected && styles.hubNameSelected]}>
                      {hub.name}
                    </Text>
                  </View>
                  <Text style={[styles.hubCode, isSelected && styles.hubCodeSelected]}>
                    {hub.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. Maximum Delivery Radius (Lining Ruler Slider)          */}
        {/* ========================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sliderHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>2. Max Delivery Radius</Text>
              <Text style={styles.sectionSubtitle}>
                Maximum travel distance for one-way order drops.
              </Text>
            </View>
            <View style={styles.currentDistanceBadge}>
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.currentDistanceText}>{selectedRadius} km</Text>
            </View>
          </View>

          {/* Lining Ruler Track Container */}
          <View style={styles.rulerContainer}>
            <View style={styles.trackBackground}>
              <View style={[styles.trackFill, { width: `${fillPercentage}%` }]} />
            </View>

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

          {/* Stepper Controls */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleStepDistance(-2)}
              disabled={selectedRadius <= 2}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Decrease radius"
            >
              <Minus size={18} color={selectedRadius <= 2 ? '#CBD5E1' : '#FF6600'} />
            </TouchableOpacity>

            <View style={styles.rangeSummary}>
              <Text style={styles.rangeSummaryText}>
                {selectedRadius <= 4
                  ? '⚡ Hyperlocal • Ultra-fast returns & high batching'
                  : selectedRadius <= 10
                  ? '⭐ Standard City Radius • Optimal volume & earnings'
                  : '🚀 Wide Coverage • Maximum long-distance drop surge'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleStepDistance(2)}
              disabled={selectedRadius >= 20}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Increase radius"
            >
              <Plus size={18} color={selectedRadius >= 20 ? '#CBD5E1' : '#FF6600'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* POINT 7: Heavy Items & Special Handling (Placed ABOVE)     */}
        {/* ========================================================= */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Special Package Handling</Text>
          <Text style={styles.sectionSubtitle}>
            Enable high-payout specialized order types.
          </Text>

          {/* Heavy Items Switch */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Accept Heavy Packages (&gt; 10 kg)</Text>
              <Text style={styles.toggleDesc}>
                Includes higher weight surge incentives and heavy-cargo trip bonuses.
              </Text>
            </View>
            <Controller
              control={control}
              name="acceptHeavyItems"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
          </View>

          {/* Fragile Switch */}
          <View style={[styles.toggleRow, styles.toggleRowBorder]}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Fragile & Special Handling</Text>
              <Text style={styles.toggleDesc}>
                Cakes, glassware, flowers & medical samples with priority care bonus.
              </Text>
            </View>
            <Controller
              control={control}
              name="acceptSpecialHandling"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
          </View>
        </View>

        {/* ========================================================= */}
        {/* POINT 7: ALL 12 VENDOR APP CATEGORIES                     */}
        {/* ========================================================= */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Eligible Delivery Categories *</Text>
          <Text style={styles.sectionSubtitle}>
            All store categories supported by SevaZo merchant network.
          </Text>

          <View style={styles.catGrid}>
            {VENDOR_APP_CATEGORIES.map((c) => {
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
                  <View style={styles.catTopRow}>
                    <View
                      style={[
                        styles.catIconCircle,
                        isSelected ? styles.catIconCircleSelected : styles.catIconCircleDefault,
                      ]}
                    >
                      <Icon size={18} color={isSelected ? '#FF6600' : '#64748B'} />
                    </View>
                    {isSelected && <CheckCircle2 size={16} color="#10B981" />}
                  </View>
                  <Text style={[styles.catCardText, isSelected && styles.catCardTextSelected]}>
                    {c.label}
                  </Text>
                  <Text style={styles.catDesc} numberOfLines={1}>
                    {c.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.categories && (
            <Text style={styles.errorText}>{errors.categories.message}</Text>
          )}
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 2,
  },
  subSectionTitle: {
    ...Typography.bodyMedium,
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  hubsContainer: {
    gap: Spacing.sm,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  hubChipSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  hubChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hubName: {
    ...Typography.bodyMedium,
    color: '#334155',
    fontWeight: '600',
    fontSize: 13.5,
  },
  hubNameSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  hubCode: {
    ...Typography.caption,
    color: '#94A3B8',
    fontSize: 10,
  },
  hubCodeSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6600',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  currentDistanceText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  rulerContainer: {
    marginVertical: Spacing.sm,
  },
  trackBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
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
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
    marginBottom: 4,
  },
  tickLineActive: {
    backgroundColor: '#FF6600',
    height: 14,
  },
  tickLineCurrent: {
    backgroundColor: '#FF6600',
    height: 18,
    width: 3,
  },
  tickLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tickLabelActive: {
    color: '#475569',
  },
  tickLabelCurrent: {
    color: '#FF6600',
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
    fontWeight: '700',
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  toggleRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    ...Typography.bodyLarge,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleDesc: {
    ...Typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 4,
  },
  catCardSelected: {
    borderColor: '#FF6600',
    backgroundColor: '#FFF7ED',
  },
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconCircleDefault: {
    backgroundColor: '#FFFFFF',
  },
  catIconCircleSelected: {
    backgroundColor: '#FFEDD5',
  },
  catCardText: {
    ...Typography.bodyMedium,
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  catCardTextSelected: {
    color: '#EA580C',
    fontWeight: '800',
  },
  catDesc: {
    ...Typography.caption,
    color: '#94A3B8',
    fontSize: 10,
    textTransform: 'none',
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default PreferencesStepScreen;
