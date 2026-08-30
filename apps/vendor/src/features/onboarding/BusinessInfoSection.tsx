import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Store,
  FileText,
  UtensilsCrossed,
  Pill,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { gstinSchema, panSchema, fssaiSchema } from '../../validation/schemas';
import { normalizeApiError } from '../../utils';

// Dynamic Zod Schema Generator based on category
const createBusinessSchema = (category: string, entityType: string) => {
  const isFood = category === 'FOOD_RESTAURANT';
  const isPharmacy = category === 'PHARMACY';
  const isCorporate = entityType === 'PVT_LTD' || entityType === 'LLP' || entityType === 'PARTNERSHIP';

  return z.object({
    businessName: z.string().min(3, 'Registered legal business name is required (min 3 chars)'),
    displayName: z.string().min(2, 'Customer-facing store display name is required'),
    legalEntityType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PVT_LTD', 'INDIVIDUAL']),
    businessCategory: z.enum([
      'FOOD_RESTAURANT',
      'PHARMACY',
      'GROCERY_RETAIL',
      'FASHION_APPAREL',
      'ELECTRONICS',
      'SERVICES',
      'OTHER',
    ]),
    yearEstablished: z
      .string()
      .regex(/^(19|20)\d{2}$/, 'Enter a valid 4-digit year (e.g. 2021)')
      .optional()
      .or(z.literal('')),
    businessDescription: z.string().min(10, 'Please enter at least 10 characters describing your store').optional().or(z.literal('')),
    businessPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
    businessEmail: z.string().email('Valid email address is required').optional().or(z.literal('')),
    website: z.string().url('Please enter a valid website URL with https://').optional().or(z.literal('')),

    // Category-specific regulatory fields
    fssaiNumber: isFood
      ? fssaiSchema
      : z.string().optional().or(z.literal('')),
    foodCategory: isFood
      ? z.enum(['VEG_ONLY', 'NON_VEG', 'BOTH'])
      : z.string().optional(),
    kitchenType: isFood
      ? z.enum(['CLOUD_KITCHEN', 'DINE_IN_RESTAURANT', 'BAKERY', 'CAFE', 'SWEET_SHOP'])
      : z.string().optional(),

    drugLicenseNumber: isPharmacy
      ? z.string().min(5, 'Valid Drug License number is mandatory for pharmacy')
      : z.string().optional().or(z.literal('')),
    pharmacistName: isPharmacy
      ? z.string().min(3, 'Registered Pharmacist name is required')
      : z.string().optional().or(z.literal('')),
    pharmacistRegNumber: isPharmacy
      ? z.string().min(4, 'Pharmacist Registration number is required')
      : z.string().optional().or(z.literal('')),

    // Tax compliance
    panNumber: panSchema,
    gstin: isCorporate || isPharmacy
      ? gstinSchema
      : z.string().optional().or(z.literal('')),
    tradeLicenseNumber: z.string().optional().or(z.literal('')),
  });
};

type BusinessFormValues = z.infer<ReturnType<typeof createBusinessSchema>>;

interface BusinessInfoSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('GROCERY_RETAIL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('PROPRIETORSHIP');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: (data, context, options) => {
      const schema = createBusinessSchema(selectedCategory, selectedEntityType);
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: {
      businessName: '',
      displayName: '',
      legalEntityType: 'PROPRIETORSHIP',
      businessCategory: 'GROCERY_RETAIL',
      yearEstablished: '',
      businessDescription: '',
      businessPhone: '',
      businessEmail: '',
      website: '',
      panNumber: '',
      gstin: '',
      tradeLicenseNumber: '',
      fssaiNumber: '',
      foodCategory: 'BOTH',
      kitchenType: 'DINE_IN_RESTAURANT',
      drugLicenseNumber: '',
      pharmacistName: '',
      pharmacistRegNumber: '',
    },
  });

  // Fetch saved business details on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBusiness = async () => {
      try {
        const res = await VendorApi.getBusinessInfo();
        if (isMounted && res) {
          const cat = res.businessCategory || 'GROCERY_RETAIL';
          const ent = res.legalEntityType || 'PROPRIETORSHIP';
          setSelectedCategory(cat);
          setSelectedEntityType(ent);

          reset({
            businessName: res.businessName || '',
            displayName: res.displayName || '',
            legalEntityType: ent,
            businessCategory: cat,
            yearEstablished: res.yearEstablished || '',
            businessDescription: res.businessDescription || '',
            businessPhone: res.businessPhone || '',
            businessEmail: res.businessEmail || '',
            website: res.website || '',
            panNumber: res.panNumber || '',
            gstin: res.gstin || '',
            tradeLicenseNumber: res.tradeLicenseNumber || '',
            fssaiNumber: res.fssaiNumber || '',
            foodCategory: res.foodCategory || 'BOTH',
            kitchenType: res.kitchenType || 'DINE_IN_RESTAURANT',
            drugLicenseNumber: res.drugLicenseNumber || '',
            pharmacistName: res.pharmacistName || '',
            pharmacistRegNumber: res.pharmacistRegNumber || '',
          });
        }
      } catch (err) {
        // Silent fallback to defaults
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchBusiness();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setValue('businessCategory', cat as any);
  };

  const handleEntityTypeChange = (type: string) => {
    setSelectedEntityType(type);
    setValue('legalEntityType', type as any);
  };

  const onSubmit = async (values: BusinessFormValues) => {
    setLoading(true);
    try {
      await VendorApi.patchBusiness(values);
      toast.success('Business information saved successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Unable to save business details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const currentValues = watch();
      await VendorApi.patchBusiness(currentValues);
      toast.info('Draft saved to SevaZo Cloud.');
      if (onSaveDraft) onSaveDraft();
    } catch (err: any) {
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
          Loading business profile...
        </Text>
      </View>
    );
  }

  const isFoodCategory = selectedCategory === 'FOOD_RESTAURANT';
  const isPharmacyCategory = selectedCategory === 'PHARMACY';
  const isCorporate =
    selectedEntityType === 'PVT_LTD' ||
    selectedEntityType === 'LLP' ||
    selectedEntityType === 'PARTNERSHIP';

  return (
    <StepContainer
      icon={<Building2 size={24} color={colors.primary} />}
      title="Tell us about your business"
      subtitle="Provide your registered entity details and category-specific licenses."
    >
      {/* 1. Category Selector Chips */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          Business Category *
        </Text>
        <Text style={[styles.sectionHelper, { color: colors.textSecondary }]}>
          Fields and licenses adjust automatically based on your primary trade category.
        </Text>

        <View style={styles.categoryGrid}>
          {[
            { id: 'GROCERY_RETAIL', label: 'Retail & Grocery', icon: ShoppingBag },
            { id: 'FOOD_RESTAURANT', label: 'Food & Dining', icon: UtensilsCrossed },
            { id: 'PHARMACY', label: 'Pharmacy & Health', icon: Pill },
            { id: 'FASHION_APPAREL', label: 'Fashion & Apparel', icon: Sparkles },
            { id: 'ELECTRONICS', label: 'Electronics & Gadgets', icon: Store },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryChange(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Icon size={16} color={isSelected ? colors.primary : colors.textSecondary} />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Legal Entity Type Selector */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          Legal Entity Type *
        </Text>

        <View style={styles.entityRow}>
          {[
            { id: 'PROPRIETORSHIP', label: 'Proprietorship' },
            { id: 'PARTNERSHIP', label: 'Partnership' },
            { id: 'PVT_LTD', label: 'Pvt Ltd' },
            { id: 'LLP', label: 'LLP' },
            { id: 'INDIVIDUAL', label: 'Individual' },
          ].map((ent) => {
            const isSelected = selectedEntityType === ent.id;
            return (
              <TouchableOpacity
                key={ent.id}
                onPress={() => handleEntityTypeChange(ent.id)}
                style={[
                  styles.entityChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.entityText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {ent.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Core Business Identity Fields */}
      <View style={styles.formFields}>
        <Controller
          control={control}
          name="businessName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Business / Legal Name *"
              placeholder="e.g. ABC Retail Enterprises Pvt Ltd"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.businessName?.message}
              leftIcon={<Building2 size={18} color={colors.textSecondary} />}
              helperText="Official registered business entity name as per PAN / GSTIN."
            />
          )}
        />

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Store Display Name *"
              placeholder="e.g. ABC Fresh Mart"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.displayName?.message}
              leftIcon={<Store size={18} color={colors.textSecondary} />}
              helperText="Customer-facing store name displayed on the SevaZo app."
            />
          )}
        />

        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="businessPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Business Phone *"
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  prefix="+91"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.businessPhone?.message}
                  leftIcon={<Phone size={16} color={colors.textSecondary} />}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="yearEstablished"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Year Established"
                  placeholder="2021"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.yearEstablished?.message}
                  leftIcon={<Calendar size={16} color={colors.textSecondary} />}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="businessEmail"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Business Invoicing Email"
              placeholder="billing@abcretail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.businessEmail?.message}
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="website"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Official Website (Optional)"
              placeholder="https://www.abcretail.com"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.website?.message}
              leftIcon={<Globe size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="businessDescription"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Business Description"
              placeholder="Brief description of items and specialties offered in your store..."
              multiline
              numberOfLines={3}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.businessDescription?.message}
            />
          )}
        />
      </View>

      {/* 4. DYNAMIC REGULATORY COMPLIANCE SECTION */}

      {/* Food Business Regulatory Block */}
      {isFoodCategory && (
        <View style={[styles.complianceCard, { backgroundColor: colors.surface, borderColor: '#F59E0B' }]}>
          <View style={styles.complianceHeader}>
            <UtensilsCrossed size={18} color="#D97706" />
            <Text style={styles.complianceTitle}>Food Safety & FSSAI Compliance</Text>
          </View>
          <Text style={[styles.complianceSub, { color: colors.textSecondary }]}>
            Mandatory licensing required by FSSAI for food and restaurant merchants.
          </Text>

          <Controller
            control={control}
            name="fssaiNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="FSSAI License Number *"
                placeholder="14-digit FSSAI Number"
                keyboardType="number-pad"
                maxLength={14}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fssaiNumber?.message}
                leftIcon={<ShieldCheck size={18} color="#D97706" />}
              />
            )}
          />

          <View style={styles.miniOptionBlock}>
            <Text style={[styles.miniOptionLabel, { color: colors.textPrimary }]}>Kitchen Type *</Text>
            <View style={styles.kitchenRow}>
              {['DINE_IN_RESTAURANT', 'CLOUD_KITCHEN', 'BAKERY', 'CAFE'].map((kt) => {
                const isSelected = watch('kitchenType') === kt;
                return (
                  <TouchableOpacity
                    key={kt}
                    onPress={() => setValue('kitchenType', kt as any)}
                    style={[
                      styles.miniChip,
                      {
                        backgroundColor: isSelected ? '#FEF3C7' : colors.background,
                        borderColor: isSelected ? '#D97706' : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniChipText,
                        { color: isSelected ? '#B45309' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {kt.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Pharmacy Regulatory Block */}
      {isPharmacyCategory && (
        <View style={[styles.complianceCard, { backgroundColor: colors.surface, borderColor: '#7C3AED' }]}>
          <View style={styles.complianceHeader}>
            <Pill size={18} color="#7C3AED" />
            <Text style={styles.complianceTitle}>Pharmacy & Drug Licensing</Text>
          </View>
          <Text style={[styles.complianceSub, { color: colors.textSecondary }]}>
            Mandatory drug control licenses and registered pharmacist credentials.
          </Text>

          <Controller
            control={control}
            name="drugLicenseNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Drug License Number (Form 20/21) *"
                placeholder="e.g. DL-MH-123456"
                autoCapitalize="characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.drugLicenseNumber?.message}
                leftIcon={<ShieldCheck size={18} color="#7C3AED" />}
              />
            )}
          />

          <Controller
            control={control}
            name="pharmacistName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Registered Pharmacist Name *"
                placeholder="e.g. John Doe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.pharmacistName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pharmacistRegNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Pharmacist Registration Number *"
                placeholder="e.g. REG-PHARM-99881"
                autoCapitalize="characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.pharmacistRegNumber?.message}
              />
            )}
          />
        </View>
      )}

      {/* 5. TAX & REGISTRATION COMPLIANCE */}
      <View style={styles.formFields}>
        <Controller
          control={control}
          name="panNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="PAN Number (Business / Proprietor) *"
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              value={value}
              onChangeText={(t) => onChange(t.toUpperCase())}
              onBlur={onBlur}
              error={errors.panNumber?.message}
              leftIcon={<FileText size={18} color={colors.textSecondary} />}
              helperText="10-digit alphanumeric permanent account number."
            />
          )}
        />

        <Controller
          control={control}
          name="gstin"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={isCorporate || isPharmacyCategory ? 'GSTIN Number *' : 'GSTIN Number (Optional)'}
              placeholder="27AABCS1429B1Z0"
              autoCapitalize="characters"
              maxLength={15}
              value={value}
              onChangeText={(t) => onChange(t.toUpperCase())}
              onBlur={onBlur}
              error={errors.gstin?.message}
              leftIcon={<FileText size={18} color={colors.textSecondary} />}
              helperText={
                isCorporate
                  ? 'Mandatory for registered corporate and LLP entities.'
                  : 'Optional for unregistered small traders with annual turnover < ₹20/40 Lakhs.'
              }
            />
          )}
        />

        <Controller
          control={control}
          name="tradeLicenseNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Trade License / Shop & Est. Number"
              placeholder="TL-MUM-2024-9988"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.tradeLicenseNumber?.message}
            />
          )}
        />
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
  sectionBlock: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionHelper: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
  },
  entityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  entityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  entityText: {
    fontSize: 12,
  },
  formFields: {
    gap: 16,
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  complianceCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
    gap: 14,
    ...Shadows.card,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  complianceSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  miniOptionBlock: {
    gap: 8,
  },
  miniOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  kitchenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  miniChipText: {
    fontSize: 11,
  },
  actionsBlock: {
    marginTop: 12,
  },
});
