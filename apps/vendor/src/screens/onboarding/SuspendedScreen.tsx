import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  HelpCircle,
  PhoneCall,
  LogOut,
  Mail,
} from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';

export const SuspendedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.replace('Welcome');
  };

  const handleAppeal = () => {
    Alert.alert(
      'Dispute Appeal Submitted',
      'Your appeal request has been submitted to the Sevazo Trust & Safety team. A grievance officer will contact you within 24 hours.'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Account Notice"
        subtitle="Sevazo Partner Compliance"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.suspensionCard, { backgroundColor: isDark ? '#3B1515' : '#FEE2E2', borderColor: '#EF4444' }]}>
          <ShieldAlert size={48} color="#EF4444" />
          <Text style={styles.cardTitle}>Merchant Account Suspended</Text>
          <Text style={[styles.cardSubtitle, { color: isDark ? '#FECACA' : '#991B1B' }]}>
            Store orders and live catalog visibility have been temporarily disabled.
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.infoHeading, { color: colors.textPrimary }]}>Reason for Action</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {vendor?.rejectionReason ||
              'Policy violation detected: Repeated high cancellation rates or customer safety escalation. Please review the Sevazo Merchant Operational Standard Guidelines.'}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Text style={[styles.infoHeading, { color: colors.textPrimary }]}>How to Resolve</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You can file a formal dispute appeal with evidence or contact our legal and merchant grievance council.
          </Text>
        </View>

        <Button
          title="File Dispute Appeal"
          onPress={handleAppeal}
          fullWidth
          size="lg"
          style={{ marginBottom: 12 }}
        />

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Logout from Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.xl,
  },
  suspensionCard: {
    padding: 24,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoBox: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 24,
    ...Shadows.card,
  },
  infoHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
