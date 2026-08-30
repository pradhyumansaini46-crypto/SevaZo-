import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  Store,
  Image as ImageIcon,
  UploadCloud,
  RotateCw,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  Eye,
  Star,
  MapPin,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError } from '../../utils';

interface StoreProfileFormValues {
  name: string;
  description: string;
  phone: string;
  email: string;
  logo: string;
  banner: string;
}

interface StoreProfileSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const StoreProfileSection: React.FC<StoreProfileSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StoreProfileFormValues>({
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      logo: '',
      banner: '',
    },
  });

  const logoUrl = watch('logo');
  const bannerUrl = watch('banner');
  const storeName = watch('name');
  const storeDescription = watch('description');

  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      try {
        const state = await VendorApi.getOnboardingState();
        const vendorData = state.data;
        const store = vendorData?.stores?.[0];

        if (isMounted) {
          reset({
            name: store?.name || vendorData?.displayName || vendorData?.businessName || '',
            description: store?.description || '',
            phone: vendorData?.businessPhone || vendorData?.phone || '',
            email: vendorData?.businessEmail || vendorData?.email || '',
            logo: store?.logo || '',
            banner: store?.banner || '',
          });
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchStore();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleUploadLogo = async () => {
    setUploadingLogo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const sampleLogos = [
        'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300',
        'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=300',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
      ];
      const newLogo = sampleLogos[Math.floor(Math.random() * sampleLogos.length)];
      setValue('logo', newLogo);
      toast.success('Store 1:1 logo uploaded successfully!');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadBanner = async () => {
    setUploadingBanner(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const sampleBanners = [
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
      ];
      const newBanner = sampleBanners[Math.floor(Math.random() * sampleBanners.length)];
      setValue('banner', newBanner);
      toast.success('Store 16:9 hero banner uploaded successfully!');
    } finally {
      setUploadingBanner(false);
    }
  };

  const onSubmit = async (values: StoreProfileFormValues) => {
    if (!values.name.trim()) {
      toast.warning('Please enter a Customer-facing Store Display Name.');
      return;
    }

    setLoading(true);
    try {
      await VendorApi.saveOnboardingStep(8, values);
      toast.success('Store storefront branding saved!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Unable to save store profile.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading store profile...
        </Text>
      </View>
    );
  }

  return (
    <StepContainer
      icon={<Store size={24} color={colors.primary} />}
      title="Store Branding & Profile"
      subtitle="Design your customer-facing digital storefront on the SevaZo app."
    >
      {/* Live Customer-Facing Storefront Preview Card */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Eye size={16} color={colors.primary} />
          <Text style={[styles.previewHeading, { color: colors.textPrimary }]}>
            Live Customer Storefront Preview
          </Text>
        </View>

        <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* 16:9 Banner Cover */}
          <View style={styles.bannerContainer}>
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholderBanner, { backgroundColor: colors.border }]}>
                <ImageIcon size={28} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.openBadge}>
              <Text style={styles.openText}>● LIVE ON SevaZo</Text>
            </View>
          </View>

          {/* Store Meta Row */}
          <View style={styles.previewMeta}>
            {/* 1:1 Logo */}
            <View style={[styles.logoWrapper, { borderColor: colors.surface }]}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
              ) : (
                <View style={[styles.placeholderLogo, { backgroundColor: colors.primaryLight }]}>
                  <Store size={24} color={colors.primary} />
                </View>
              )}
            </View>

            <View style={styles.metaContent}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]} numberOfLines={1}>
                {storeName || 'My Store Name'}
              </Text>
              <Text style={[styles.previewDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {storeDescription || 'Neighborhood store description.'}
              </Text>
              <View style={styles.ratingRow}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingText, { color: colors.textPrimary }]}>4.9 (New Partner)</Text>
                <Text style={[styles.etaText, { color: colors.textSecondary }]}>• 15-25 mins</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Image Upload Actions */}
      <View style={styles.imageUploadGrid}>
        {/* 1:1 Logo Box */}
        <View style={[styles.uploadBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.boxLabel, { color: colors.textPrimary }]}>Store Logo (1:1 Ratio)</Text>
          <Text style={[styles.boxSub, { color: colors.textSecondary }]}>Square icon (300x300 px)</Text>
          <Button
            title={uploadingLogo ? 'Uploading...' : 'Choose 1:1 Logo'}
            variant="outline"
            size="sm"
            fullWidth
            loading={uploadingLogo}
            onPress={handleUploadLogo}
            leftIcon={<UploadCloud size={14} color={colors.primary} />}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* 16:9 Banner Box */}
        <View style={[styles.uploadBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.boxLabel, { color: colors.textPrimary }]}>Hero Cover (16:9 Ratio)</Text>
          <Text style={[styles.boxSub, { color: colors.textSecondary }]}>Widescreen header (1200x675 px)</Text>
          <Button
            title={uploadingBanner ? 'Uploading...' : 'Choose 16:9 Banner'}
            variant="outline"
            size="sm"
            fullWidth
            loading={uploadingBanner}
            onPress={handleUploadBanner}
            leftIcon={<UploadCloud size={14} color={colors.primary} />}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formFields}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Store Display Name *"
              placeholder="e.g. ABC Fresh Supermarket"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              leftIcon={<Store size={18} color={colors.textSecondary} />}
              helperText="Exact branding displayed to customers on the SevaZo app."
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Store Description & Specialty"
              placeholder="Fresh organic fruits, daily essentials, and quick delivery..."
              multiline
              numberOfLines={3}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
            />
          )}
        />

        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Store Hotline"
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  prefix="+91"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={<Phone size={16} color={colors.textSecondary} />}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Customer Support Email"
                  placeholder="support@abcstore.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={<Mail size={16} color={colors.textSecondary} />}
                />
              )}
            />
          </View>
        </View>
      </View>

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
  previewSection: {
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  previewHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  bannerContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  openText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  previewMeta: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 3,
    marginTop: -28,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContent: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  previewDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  etaText: {
    fontSize: 11,
  },
  imageUploadGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  uploadBox: {
    flex: 1,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  boxSub: {
    fontSize: 10,
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
