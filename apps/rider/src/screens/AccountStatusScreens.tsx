import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertOctagon, UserX, PhoneCall, LogOut } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { useAuthStore } from '../store/authStore';

export const SuspendedScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentCard}>
        <View style={[styles.iconCircle, { backgroundColor: '#3B1212', borderColor: '#EF4444' }]}>
          <AlertOctagon size={44} color="#EF4444" />
        </View>

        <Text style={styles.title}>Account Suspended</Text>
        <Text style={styles.subtitle}>
          Your delivery partner access has been temporarily suspended due to a compliance or safety policy review.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Reason Code: SEC-POL-402</Text>
          <Text style={styles.infoBody}>
            Multiple cancellation breaches or missing periodic identity reverification.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => alert('Initiating Partner Appeal: Support Ticket #SEV-99120 opened')}
        >
          <PhoneCall size={18} color="#0F172A" />
          <Text style={styles.actionButtonText}>File Suspension Appeal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
          <LogOut size={16} color={Colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const DeactivatedScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentCard}>
        <View style={[styles.iconCircle, { backgroundColor: '#1E293B', borderColor: Colors.border }]}>
          <UserX size={44} color={Colors.textSecondary} />
        </View>

        <Text style={styles.title}>Account Deactivated</Text>
        <Text style={styles.subtitle}>
          This partner account is inactive or permanently closed. Please contact Fleet Operations if you wish to reactivate.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => alert('Dialing Sevzo Partner Care: 1800-419-SEVZO')}
        >
          <PhoneCall size={18} color="#0F172A" />
          <Text style={styles.actionButtonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
          <LogOut size={16} color={Colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.glowBlue,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#1E1212',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.lg,
    width: '100%',
  },
  infoTitle: {
    ...Typography.bodySmall,
    color: '#EF4444',
    fontWeight: '700',
  },
  infoBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
    ...Shadows.glowBlue,
  },
  actionButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#0F172A',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  secondaryButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
