import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Approved'>;

export const ApprovedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setAuth, token, rider } = useAuthStore();

  const handleGoHome = () => {
    if (rider) {
      setAuth(token || 'mock-token', {
        ...rider,
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
      }, 'APPROVED');
    }
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🎉</Text>
        </View>

        <Text style={styles.title}>You're Approved!</Text>
        <Text style={styles.subtitle}>
          Your Sevazo Rider account has been verified.
        </Text>

        <Text style={styles.desc}>
          You can now complete your rider setup and go online when eligible. Deliver orders, earn on your schedule, and track your tips directly in the app.
        </Text>

        <View style={styles.perksCard}>
          <View style={styles.perkRow}>
            <Text style={styles.perkIcon}>⚡</Text>
            <Text style={styles.perkText}>Instant Daily/Weekly Payouts</Text>
          </View>
          <View style={styles.perkRow}>
            <Text style={styles.perkIcon}>🛡️</Text>
            <Text style={styles.perkText}>100% On-Road Accidental Insurance</Text>
          </View>
          <View style={styles.perkRow}>
            <Text style={styles.perkIcon}>🎁</Text>
            <Text style={styles.perkText}>Surge Bonuses & Customer Tips</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleGoHome}>
          <Text style={styles.primaryBtnText}>Go to Rider Home ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  perksCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  perkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  perkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: '#FF6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ApprovedScreen;
