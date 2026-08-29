import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useOnboardingStore } from '../store/onboardingStore';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicationSubmitted'>;

export const ApplicationSubmittedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { draftData } = useOnboardingStore();

  const applicationId = route.params?.applicationId || 'SVZ-RID-000123';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.celebrationIconWrap}>
          <Text style={styles.celebrationIcon}>🎉</Text>
        </View>

        <Text style={styles.title}>Application Submitted</Text>
        <Text style={styles.subtitle}>
          Your Sevazo Rider application has been submitted successfully.
        </Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Application ID</Text>
          <Text style={styles.idValue}>{applicationId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusDot}>●</Text>
            <Text style={styles.statusText}>Under Review</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            Our operations team is actively verifying your vehicle, documents, and banking information. Verification typically takes 2–4 hours.
          </Text>
          <Text style={styles.infoSubText}>
            We'll notify you by SMS and push notification once your account is activated.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.replace('ApplicationStatus')}
        >
          <Text style={styles.primaryBtnText}>View Status</Text>
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
  celebrationIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  celebrationIcon: {
    fontSize: 48,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  idCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  idValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6600',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  statusDot: {
    color: '#EA580C',
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  infoSubText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
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

export default ApplicationSubmittedScreen;
