import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Store, Clock, TrendingUp, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../../theme';
import { Button } from '../../components/Button';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';

const GUEST_CATEGORIES = [
  { id: 'grocery', name: 'Grocery & Essentials', emoji: '🥦', storeName: 'Green Basket Mart', desc: 'Fresh fruits, vegetables & daily essentials' },
  { id: 'restaurant', name: 'Restaurant & Cafe', emoji: '🍕', storeName: 'Spice Symphony Bistro', desc: 'Hot gourmet meals, fast food & beverages' },
  { id: 'pharmacy', name: 'Pharmacy & Wellness', emoji: '💊', storeName: 'CarePlus Medicos', desc: 'Prescriptions, OTC medicines & healthcare' },
  { id: 'retail', name: 'Retail & Lifestyle', emoji: '🛍️', storeName: 'Urban Trendz Store', desc: 'Electronics, apparel & home living' },
];

export const WelcomeScreen = ({ navigation }: any) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { setAuth } = useAuthStore();

  const [guestModalVisible, setGuestModalVisible] = useState(false);

  const handleSelectGuestCategory = async (cat: typeof GUEST_CATEGORIES[0]) => {
    setGuestModalVisible(false);
    await setAuth(
      'mock-guest-vendor-token',
      'mock-guest-refresh',
      {
        id: 'vnd-guest-preview',
        ownerName: 'Vikram Mehta (Guest)',
        businessName: cat.storeName,
        storeName: cat.storeName,
        phone: '+91 9876543210',
        email: 'merchant.guest@sevazo.in',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        isEmailVerified: true,
        isPhoneVerified: true,
        category: cat.id,
      } as any,
      'DASHBOARD',
      100
    );
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Top Group: Brand Header + Feature Cards with Tight Gap */}
        <View style={styles.topGroup}>
          {/* Top Hero Brand Header with Official Graphic Logo */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/sevazo-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Official SevaZo Logo"
            />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to SevaZo Vendor</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hyperlocal merchant partner platform
            </Text>
          </View>

          {/* Feature Value Props - Tight & Compact */}
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: isDark ? colors.surface : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED' },
                ]}
              >
                <Store size={18} color="#FF6600" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Reach local customers.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Instant store discovery & high-volume orders in your area.
                </Text>
              </View>
            </View>

            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? '#052E16' : '#ECFDF5' },
                ]}
              >
                <Clock size={18} color="#10B981" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Daily automated payouts.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Next-day direct bank transfers & automated settlements.
                </Text>
              </View>
            </View>

            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? '#2A1B0A' : '#FEF3C7' },
                ]}
              >
                <TrendingUp size={18} color="#D97706" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Grow with SevaZo.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Dedicated fleet dispatch & real-time analytics portal.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons: Tightly Anchored with Reduced Gap */}
        <View style={styles.actions}>
          <Button
            title="Register Your Business"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Register')}
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            accessibilityLabel="Register Your Business"
          />

          <Button
            title="Login"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Login to existing vendor account"
          />

          {/* Guest Login Test Button */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => setGuestModalVisible(true)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Guest Login Test Access"
          >
            <Sparkles size={16} color="#FF6600" />
            <Text style={styles.guestBtnText}>Guest Login (Direct Dashboard Access)</Text>
          </TouchableOpacity>

          <Text style={[styles.footerNotice, { color: colors.textSecondary }]}>
            By continuing, you agree to SevaZo's Terms of Merchant Service and Privacy Policy.
          </Text>
        </View>
      </View>

      {/* Guest Login Category Chooser Modal */}
      <Modal
        visible={guestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGuestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Business Category</Text>
                <Text style={styles.modalSubtitle}>Select store category for guest testing preview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setGuestModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryList}>
              {GUEST_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryOption}
                  onPress={() => handleSelectGuestCategory(cat)}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryEmojiBadge}>
                    <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.categoryTextInfo}>
                    <Text style={styles.categoryNameText}>{cat.name}</Text>
                    <Text style={styles.categoryDescText}>{cat.desc}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  topGroup: {
    gap: 10,
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 95,
    height: 95,
    marginBottom: 0,
  },
  title: {
    ...Typography.hero,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    ...Typography.bodyMedium,
    marginTop: 1,
    textAlign: 'center',
    fontSize: 13,
  },
  valueCard: {
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.sm + 2,
    ...Shadows.card,
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  valueIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    fontSize: 13,
  },
  valueDesc: {
    ...Typography.bodySmall,
    marginTop: 1,
    fontSize: 11.5,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginTop: 6,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    paddingVertical: 11,
    borderRadius: BorderRadius.lg,
    marginTop: 2,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  footerNotice: {
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 2,
    paddingHorizontal: 12,
  },
  // Guest Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  categoryModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  categoryList: {
    gap: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  categoryEmojiBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTextInfo: {
    flex: 1,
  },
  categoryNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryDescText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});

export default WelcomeScreen;
