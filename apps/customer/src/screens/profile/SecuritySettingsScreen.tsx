import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import {
  ShieldCheck,
  Smartphone,
  LogOut,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';

export const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const { showToast, showModal } = useUiStore();

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await customerApi.getNotificationPreferences();
    setMarketingConsent(prefs.marketingConsent || false);
  };

  const handleMarketingToggle = async (val: boolean) => {
    setMarketingConsent(val);
    await customerApi.updateNotificationPreferences({ marketingConsent: val });
    showToast(
      'success',
      val
        ? 'Marketing and promotional alerts enabled.'
        : 'Marketing alerts disabled.'
    );
  };

  const handleLogoutAllDevices = async () => {
    showModal({
      title: 'Logout All Devices?',
      message:
        'This will terminate all other active customer sessions across your phones and tablets.',
      primaryButtonText: 'Logout All',
      secondaryButtonText: 'Cancel',
      type: 'danger',
      onPrimaryPress: async () => {
        setLoggingOutAll(true);
        try {
          await customerApi.logoutAllDevices();
          showToast('success', 'Logged out of all other devices.');
        } catch {
          showToast('error', 'Failed to logout devices.');
        } finally {
          setLoggingOutAll(false);
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    showModal({
      title: 'Delete Account Permanently?',
      message:
        'This will erase your customer profile, order history, and saved addresses in accordance with DPDP regulations. This action cannot be undone.',
      primaryButtonText: 'Delete Permanently',
      secondaryButtonText: 'Keep Account',
      type: 'danger',
      onPrimaryPress: async () => {
        try {
          await customerApi.deleteAccount();
          showToast('success', 'Account deleted successfully.');
          await logout();
          navigation.replace('Auth');
        } catch {
          showToast('error', 'Unable to delete account at this time.');
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Security & Privacy" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.xl : Spacing.xl,
          },
        ]}
      >
        {/* Encryption Badge */}
        <View style={styles.badgeCard}>
          <ShieldCheck size={24} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.badgeTitle}>256-Bit TLS & Data Protection</Text>
            <Text style={styles.badgeDesc}>
              All transactions and profile credentials are end-to-end encrypted.
            </Text>
          </View>
        </View>

        {/* Multi-Device Management (Prompt 13) */}
        <Text style={styles.sectionHeader}>Active Sessions & Devices</Text>

        <View style={styles.cardGroup}>
          <View style={styles.deviceRow}>
            <Smartphone size={20} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.deviceName}>Current Mobile Device</Text>
              <Text style={styles.deviceStatus}>Active Now • App v1.0.0</Text>
            </View>
            <View style={styles.activeTag}>
              <CheckCircle2 size={12} color={Colors.primaryDark} />
              <Text style={styles.activeTagText}>CURRENT</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogoutAllDevices}
            style={styles.actionRow}
          >
            <LogOut size={18} color={Colors.accentOrange} />
            <Text style={styles.actionRowText}>Logout from All Other Devices</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Marketing Consent (Prompt 08 & 13) */}
        <Text style={styles.sectionHeader}>Privacy Controls</Text>

        <View style={styles.cardGroup}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Promotional Communications</Text>
              <Text style={styles.toggleDesc}>
                Receive coupon codes, cashback offers, and weekly sales.
              </Text>
            </View>
            <Switch
              value={marketingConsent}
              onValueChange={handleMarketingToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
        </View>

        {/* Account Deletion (Prompt 13) */}
        <Text style={styles.sectionHeader}>Account Deletion</Text>

        <View style={[styles.cardGroup, { borderColor: '#FCA5A5' }]}>
          <View style={styles.deleteBlock}>
            <AlertTriangle size={20} color={Colors.danger} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.deleteTitle}>Erase Personal Data</Text>
              <Text style={styles.deleteDesc}>
                Permanently scrub your account, saved addresses, and profile info.
              </Text>
            </View>
          </View>

          <Button
            title="Delete My Account"
            variant="danger"
            size="md"
            onPress={handleDeleteAccount}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing.lg,
  },
  badgeTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  badgeDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  cardGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  deviceName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deviceStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  activeTagText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  actionRowText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.accentOrange,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    paddingRight: Spacing.sm,
  },
  deleteBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.danger,
  },
  deleteDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
