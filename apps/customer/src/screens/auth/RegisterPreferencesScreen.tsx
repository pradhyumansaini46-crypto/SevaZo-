import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import {
  ShoppingBag,
  Bell,
  Check,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';

const categoryOptions = [
  { id: 'Grocery', label: '🥦 Grocery & Staples' },
  { id: 'Food', label: '🍔 Food & Quick Meals' },
  { id: 'Fashion', label: '👕 Fashion & Lifestyle' },
  { id: 'Electronics', label: '⚡ Electronics & Gadgets' },
  { id: 'Beauty', label: '💄 Beauty & Personal Care' },
  { id: 'Home', label: '🏠 Home & Kitchen Needs' },
  { id: 'Other', label: '📦 Other Daily Essentials' },
];

export const RegisterPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registrationDraft, updateRegistrationDraft } = useAuthStore();
  const { showToast } = useUiStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    registrationDraft.preferences || ['Grocery', 'Dairy']
  );
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [accountAlerts, setAccountAlerts] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleNext = (isSkip = false) => {
    updateRegistrationDraft({
      preferences: isSkip ? [] : selectedCategories,
      notifications: {
        orderUpdates,
        deliveryAlerts,
        accountAlerts,
        marketingConsent,
      },
      currentStep: 'RegisterTerms',
    });

    showToast('success', 'Preferences recorded!');
    navigation.navigate('RegisterTerms');
  };

  const handleSaveExit = () => {
    updateRegistrationDraft({
      preferences: selectedCategories,
      notifications: {
        orderUpdates,
        deliveryAlerts,
        accountAlerts,
        marketingConsent,
      },
      currentStep: 'RegisterPreferences',
    });
    showToast('info', 'Preferences saved. You can resume anytime.');
    navigation.replace('Welcome');
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={6}
      stepTitle="Preferences"
      pageTitle="Shopping Preferences"
      pageSubtitle="Help us customize your home feed, store recommendations, and delivery alerts."
      onBack={() => navigation.goBack()}
      onSaveExit={handleSaveExit}
      primaryButtonText="Continue to Terms"
      onPrimaryPress={() => handleNext(false)}
      showSkip
      onSkip={() => handleNext(true)}
      skipText="Skip this step"
    >
      {/* Category Interests Grid */}
      <View style={styles.sectionHeader}>
        <ShoppingBag size={18} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>What do you shop for most?</Text>
      </View>
      <Text style={styles.sectionHint}>
        Select 1 or more categories to personalize your home screen.
      </Text>

      <View style={styles.categoryChipsWrap}>
        {categoryOptions.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => toggleCategory(cat.id)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {cat.label}
              </Text>
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <Check size={12} color={Colors.textInverse} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notification Controls */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Bell size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Notification Controls</Text>
      </View>

      <View style={styles.notificationGroup}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Live Order Updates</Text>
            <Text style={styles.toggleDesc}>
              Real-time rider assignment & order delivery ETA notifications.
            </Text>
          </View>
          <Switch
            value={orderUpdates}
            onValueChange={setOrderUpdates}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Arrival & Doorbell Alerts</Text>
            <Text style={styles.toggleDesc}>
              Instant alert when rider arrives outside your gate.
            </Text>
          </View>
          <Switch
            value={deliveryAlerts}
            onValueChange={setDeliveryAlerts}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Account & Safety Alerts</Text>
            <Text style={styles.toggleDesc}>
              Digital invoices and OTP login security notices.
            </Text>
          </View>
          <Switch
            value={accountAlerts}
            onValueChange={setAccountAlerts}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Offers & Cashback (Optional)</Text>
            <Text style={styles.toggleDesc}>
              Exclusive weekend flash sales and coupon codes.
            </Text>
          </View>
          <Switch
            value={marketingConsent}
            onValueChange={setMarketingConsent}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryChipText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryChipTextSelected: {
    color: Colors.primaryDark,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  notificationGroup: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  toggleLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
    paddingRight: Spacing.sm,
  },
});
