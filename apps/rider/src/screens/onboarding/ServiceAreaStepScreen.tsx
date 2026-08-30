import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Building2, CheckCircle2, MapPin, Sparkles, Navigation } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { zodResolver } from '../../utils/zodResolver';
import { serviceAreaSchema, ServiceAreaFormValues } from '../../validation/onboardingValidation';

interface JaipurZoneConfig {
  zoneName: string;
  zoneLabel: string;
  defaultLocality: string;
  hubs: string[];
}

const JAIPUR_ZONES: JaipurZoneConfig[] = [
  {
    zoneName: 'Vaishali Nagar & West Jaipur',
    zoneLabel: 'Vaishali Nagar (West)',
    defaultLocality: 'Vaishali Nagar / Chitrakoot',
    hubs: [
      'Vaishali Nagar Amrapali Hub',
      'Khatipura / Sirsi Road Express Hub',
      'Chitrakoot Stadium Fulfillment Center',
      'Gandhi Path Quick Dispatch',
    ],
  },
  {
    zoneName: 'Mansarovar & South Jaipur',
    zoneLabel: 'Mansarovar (South)',
    defaultLocality: 'Mansarovar / VT Road',
    hubs: [
      'Mansarovar VT Road Central Hub',
      'Gopalpura Bypass Quick Hub',
      'Sanganer Airport Area Hub',
      'Muhana Mandi Fresh Logistics Hub',
    ],
  },
  {
    zoneName: 'Malviya Nagar & East Jaipur',
    zoneLabel: 'Malviya Nagar (East)',
    defaultLocality: 'Malviya Nagar / GT Mall',
    hubs: [
      'Malviya Nagar GT Central Hub',
      'Jagatpura / Mahal Road Fulfillment Center',
      'Durgapura Flyover Quick Dispatch',
      'Apex Circle Express Point',
    ],
  },
  {
    zoneName: 'C-Scheme & Central Walled City',
    zoneLabel: 'C-Scheme (Central)',
    defaultLocality: 'C-Scheme / Ashok Nagar',
    hubs: [
      'C-Scheme Ashok Nagar Central Hub',
      'Raja Park / MI Road Express Hub',
      'Johari Bazaar / Ajmeri Gate Hub',
      'Statue Circle Quick Point',
    ],
  },
  {
    zoneName: 'Vidhyadhar Nagar & North Jaipur',
    zoneLabel: 'Vidhyadhar Nagar (North)',
    defaultLocality: 'Vidhyadhar Nagar Sector 2',
    hubs: [
      'Vidhyadhar Nagar Sector 2 Hub',
      'Shastri Nagar / Ambabari Center',
      'Bani Park Express Point',
      'VKI Industrial Area Dispatch Hub',
    ],
  },
];

export const ServiceAreaStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(() => {
    const existingZone = draftData?.serviceArea?.zone;
    if (!existingZone) return 0;
    const idx = JAIPUR_ZONES.findIndex((z) => z.zoneName === existingZone);
    return idx >= 0 ? idx : 0;
  });

  const activeZone = JAIPUR_ZONES[selectedZoneIndex] || JAIPUR_ZONES[0];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceAreaFormValues>({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      city: 'Jaipur',
      zone: draftData?.serviceArea?.zone || activeZone.zoneName,
      locality: draftData?.serviceArea?.locality || activeZone.defaultLocality,
      preferredHubs: draftData?.serviceArea?.preferredHubs || [activeZone.hubs[0]],
    },
  });

  const selectedHubs = watch('preferredHubs') || [];

  const handleSelectZone = (index: number) => {
    setSelectedZoneIndex(index);
    const z = JAIPUR_ZONES[index];
    setValue('zone', z.zoneName, { shouldValidate: true });
    setValue('locality', z.defaultLocality, { shouldValidate: true });
    // Default to first hub in newly selected zone
    setValue('preferredHubs', [z.hubs[0]], { shouldValidate: true });
  };

  const toggleHub = (hub: string) => {
    let updated: string[];
    if (selectedHubs.includes(hub)) {
      if (selectedHubs.length === 1) return; // keep at least 1
      updated = selectedHubs.filter((h) => h !== hub);
    } else {
      updated = [...selectedHubs, hub];
    }
    setValue('preferredHubs', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: ServiceAreaFormValues) => {
    clearError();
    const success = await saveSection('service_area', data, true);
    if (success) {
      navigation.navigate('OnboardingPreferences');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('service_area', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={9}
      stepTitle="Service Area"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingBanking')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Choose Your Service Zone"
        subtitle="Select your primary operational zone in Jaipur and preferred fulfillment pickup centers."
        error={error}
      >
        {/* Operating City (Default Jaipur Exclusive) */}
        <View style={styles.cityBadge}>
          <MapPin size={16} color="#FF6600" />
          <View style={styles.cityBadgeTextCol}>
            <Text style={styles.cityBadgeTitle}>Operating City: Jaipur, Rajasthan</Text>
            <Text style={styles.cityBadgeSub}>
              Sevazo fleet operations are currently live across Jaipur metropolitan regions.
            </Text>
          </View>
        </View>

        {/* Zone Selection Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Delivery Zone *</Text>
          <View style={styles.zoneChipsRow}>
            {JAIPUR_ZONES.map((z, idx) => {
              const isSelected = selectedZoneIndex === idx;
              return (
                <TouchableOpacity
                  key={z.zoneName}
                  style={[styles.zoneChip, isSelected && styles.zoneChipSelected]}
                  onPress={() => handleSelectZone(idx)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Zone ${z.zoneLabel}`}
                >
                  <Text style={[styles.zoneChipText, isSelected && styles.zoneChipTextSelected]}>
                    {z.zoneLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Locality Input */}
        <Controller
          control={control}
          name="locality"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Primary Base Locality *"
              required
              placeholder="e.g. Vaishali Nagar, Mansarovar, Malviya Nagar"
              value={value}
              onChangeText={onChange}
              error={errors.locality?.message}
            />
          )}
        />

        {/* Dynamic Preferred Hubs for Selected Jaipur Zone */}
        <View style={styles.hubsSection}>
          <View style={styles.hubsHeaderRow}>
            <Text style={styles.hubsTitle}>Pickup Hubs in {activeZone.zoneLabel} *</Text>
            <Text style={styles.hubsCount}>{selectedHubs.length} selected</Text>
          </View>
          <Text style={styles.hubsSubtitle}>
            Orders from stores and dark stores mapped to these hubs will be assigned with priority.
          </Text>

          <View style={styles.hubsList}>
            {activeZone.hubs.map((hub) => {
              const isSelected = selectedHubs.includes(hub);
              return (
                <TouchableOpacity
                  key={hub}
                  style={[styles.hubItem, isSelected && styles.hubItemSelected]}
                  onPress={() => toggleHub(hub)}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Building2 size={18} color={isSelected ? '#FF6600' : Colors.textMuted} />
                  <Text style={[styles.hubItemText, isSelected && styles.hubItemTextSelected]}>
                    {hub}
                  </Text>
                  {isSelected && <CheckCircle2 size={18} color="#10B981" />}
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.preferredHubs && (
            <Text style={styles.errorText}>{errors.preferredHubs.message}</Text>
          )}
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cityBadgeTextCol: {
    flex: 1,
  },
  cityBadgeTitle: {
    ...Typography.titleSmall,
    color: '#EA580C',
    fontSize: 14,
    fontWeight: '700',
  },
  cityBadgeSub: {
    ...Typography.bodySmall,
    color: '#9A3412',
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  zoneChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  zoneChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  zoneChipSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  zoneChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  zoneChipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  hubsSection: {
    marginTop: Spacing.sm,
  },
  hubsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  hubsTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  hubsCount: {
    ...Typography.bodySmall,
    color: '#10B981',
    fontWeight: '700',
  },
  hubsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  hubsList: {
    gap: Spacing.sm,
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  hubItemSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
  },
  hubItemText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
    fontWeight: '600',
  },
  hubItemTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default ServiceAreaStepScreen;
