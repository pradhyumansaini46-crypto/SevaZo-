import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useOnboardingStore } from '../store/onboardingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicationStatus'>;

export const ApplicationStatusScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { draftData } = useOnboardingStore();

  const applicationId = 'SVZ-RID-000123';

  const verificationStages = [
    { title: 'Personal Information', status: 'COMPLETED', icon: '✓', desc: 'Name, DOB, verified phone & photo' },
    { title: 'Vehicle', status: 'COMPLETED', icon: '✓', desc: 'Vehicle classification & ownership records' },
    { title: 'Documents', status: 'IN_PROGRESS', icon: '●', desc: 'Operations team review in progress' },
    { title: 'Banking', status: 'COMPLETED', icon: '✓', desc: 'Bank account verification' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <TouchableOpacity
          style={styles.homeShortcut}
          onPress={() => navigation.navigate('Approved')}
        >
          <Text style={styles.homeShortcutText}>Simulate Approval ✨</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Status Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeDot}>●</Text>
            <Text style={styles.heroBadgeText}>Under Review</Text>
          </View>
          <Text style={styles.heroTitle}>Your application is under review.</Text>
          <Text style={styles.heroSubtitle}>
            Our team is reviewing your documents and setting up your delivery profile.
          </Text>

          <View style={styles.appIdRow}>
            <Text style={styles.appIdLabel}>Application ID:</Text>
            <Text style={styles.appIdValue}>{applicationId}</Text>
          </View>
        </View>

        {/* Verification Progress (Point 34) */}
        <View style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Verification Progress</Text>

          {verificationStages.map((stage, idx) => {
            const isDone = stage.status === 'COMPLETED';
            const isInProg = stage.status === 'IN_PROGRESS';

            return (
              <View key={stage.title} style={styles.stageRow}>
                <View
                  style={[
                    styles.stageIconWrap,
                    isDone && styles.stageIconWrapDone,
                    isInProg && styles.stageIconWrapProg,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageIconText,
                      isDone && styles.stageIconTextDone,
                      isInProg && styles.stageIconTextProg,
                    ]}
                  >
                    {stage.icon}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                </View>

                <View
                  style={[
                    styles.stageStatusPill,
                    isDone && styles.stageStatusPillDone,
                    isInProg && styles.stageStatusPillProg,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageStatusPillText,
                      isDone && styles.stageStatusPillTextDone,
                      isInProg && styles.stageStatusPillTextProg,
                    ]}
                  >
                    {isDone ? 'Verified' : 'Reviewing'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Estimated Time Card */}
        <View style={styles.etaCard}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>⏱️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.etaTitle}>Average Turnaround</Text>
            <Text style={styles.etaDesc}>
              Verification usually completes in <Text style={{ fontWeight: '700' }}>2–4 hours</Text> during standard operational shifts (8:00 AM – 10:00 PM).
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions (Point 34) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewAppBtn}
          onPress={() => navigation.navigate('OnboardingWizard', { initialStep: 11 })}
        >
          <Text style={styles.viewAppBtnText}>View Application</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactSupportBtn}
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.contactSupportBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  homeShortcut: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  homeShortcutText: {
    color: '#FF6600',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 12,
  },
  heroBadgeDot: {
    color: '#EA580C',
    fontSize: 10,
    marginRight: 6,
  },
  heroBadgeText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appIdLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  appIdValue: {
    color: '#FF6600',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stageIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconWrapDone: {
    backgroundColor: '#DCFCE7',
  },
  stageIconWrapProg: {
    backgroundColor: '#FEF3C7',
  },
  stageIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  stageIconTextDone: {
    color: '#15803D',
  },
  stageIconTextProg: {
    color: '#D97706',
    fontSize: 10,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  stageDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stageStatusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  stageStatusPillDone: {
    backgroundColor: '#DCFCE7',
  },
  stageStatusPillProg: {
    backgroundColor: '#FEF3C7',
  },
  stageStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stageStatusPillTextDone: {
    color: '#15803D',
  },
  stageStatusPillTextProg: {
    color: '#B45309',
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 16,
  },
  etaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 2,
  },
  etaDesc: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  viewAppBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  viewAppBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  contactSupportBtn: {
    flex: 1,
    backgroundColor: '#FF6600',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactSupportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
