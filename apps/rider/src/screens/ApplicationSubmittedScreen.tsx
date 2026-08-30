import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicationSubmitted'>;

export const ApplicationSubmittedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();

  const applicationId = route.params?.applicationId || 'SVZ-RID-000123';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Official Brand Logo Icon (Replaced Party Popper Emoji) */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/sevazo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Official Sevazo Logo"
          />
        </View>

        <Text style={styles.title}>Application Submitted</Text>
        <Text style={styles.subtitle}>
          Your Sevazo Rider application has been submitted successfully to the operations verification desk.
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
            Our operations team is actively reviewing your vehicle, identity credentials, and banking details. Verification typically completes within 2–4 hours.
          </Text>
          <Text style={styles.infoSubText}>
            You will receive instant SMS and notification updates as soon as your account is activated.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.replace('ApplicationStatus')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Track Verification Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    width: 86,
    height: 86,
  },
  title: {
    ...Typography.titleLarge,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontSize: 13.5,
  },
  idCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  idValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6600',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statusDot: {
    color: '#EA580C',
    fontSize: 10,
    marginRight: 6,
  },
  statusText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  infoSubText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  primaryBtn: {
    backgroundColor: '#FF6600',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ApplicationSubmittedScreen;
