import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  X,
  ShieldCheck,
  ArrowLeft,
  Headphones,
  ExternalLink,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicationStatus'>;

export const ApplicationStatusScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { draftData, sectionStatus } = useOnboardingStore();
  const { rider } = useAuthStore();

  const [showSupportModal, setShowSupportModal] = useState(false);

  const applicationId = rider?.applicationId || 'SVZ-RID-000123';
  const isOverallApproved =
    rider?.approvalStatus === 'APPROVED' || (rider as any)?.onboardingStatus === 'APPROVED';

  // All 8 steps filled by the user with exact 1-line descriptions
  const verificationStages = [
    {
      id: 'personal',
      title: '1. Personal Information',
      desc: 'Name, DOB, verified mobile & profile photo.',
      dbKey: 'PERSONAL',
    },
    {
      id: 'address',
      title: '2. Residential Address',
      desc: 'Street address, locality, city & postal code.',
      dbKey: 'ADDRESS',
    },
    {
      id: 'identity',
      title: '3. Identity & Licence',
      desc: 'PAN card, Aadhaar & Driving Licence verification.',
      dbKey: 'IDENTITY',
    },
    {
      id: 'vehicle',
      title: '4. Vehicle & Compliance',
      desc: 'Vehicle registration (RC), Insurance & PUC policy.',
      dbKey: 'VEHICLE',
    },
    {
      id: 'banking',
      title: '5. Bank & Payouts',
      desc: 'Direct bank account / UPI payout gateway.',
      dbKey: 'BANKING',
    },
    {
      id: 'preferences',
      title: '6. Service Area & Preferences',
      desc: 'Operating base, dispatch radius & category preferences.',
      dbKey: 'DELIVERY_PREFERENCES',
    },
    {
      id: 'availability',
      title: '7. Working Hours & Availability',
      desc: 'Weekly shifts and preferred operating hours.',
      dbKey: 'AVAILABILITY',
    },
    {
      id: 'consent',
      title: '8. Consent & Declaration',
      desc: 'Safety compliance, background check & digital signature.',
      dbKey: 'CONSENT',
    },
  ];

  const handleCallSupport = () => {
    Linking.openURL('tel:+919876543210').catch(() => {});
  };

  const handleEmailSupport = () => {
    Linking.openURL(
      `mailto:rider-support@sevazo.in?subject=Application Query - ${applicationId}&body=Hello SevaZo Support Team,\n\nI have a question regarding my Rider application (ID: ${applicationId}).`
    ).catch(() => {});
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL(
      `https://wa.me/919876543210?text=Hi SevaZo Support, I need help with my Rider Application: ${applicationId}`
    ).catch(() => {});
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Welcome');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Status</Text>
        </View>

        <TouchableOpacity
          style={styles.homeShortcut}
          onPress={() => navigation.navigate('Approved')}
        >
          <Text style={styles.homeShortcutText}>Simulate Approval ✨</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeDot}>●</Text>
            <Text style={styles.heroBadgeText}>
              {isOverallApproved ? 'Approved & Active' : 'Under Review'}
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            {isOverallApproved
              ? 'Your account has been approved!'
              : 'Your application is under review.'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isOverallApproved
              ? 'Welcome to the SevaZo delivery fleet. You can now go online and start accepting orders.'
              : 'Our operations team is actively reviewing your submitted documents and setting up your fleet partner profile.'}
          </Text>

          <View style={styles.appIdRow}>
            <Text style={styles.appIdLabel}>Application ID:</Text>
            <Text style={styles.appIdValue}>{applicationId}</Text>
          </View>
        </View>

        {/* Verification Progress Section */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <Text style={styles.progressCardTitle}>Verification Progress</Text>
            <Text style={styles.progressCountText}>
              {isOverallApproved ? '8 of 8 Verified' : '8 Steps Submitted'}
            </Text>
          </View>

          {verificationStages.map((stage) => {
            // Strictly check database verification status:
            // Do NOT show verified until confirmed by database approval
            const isVerified = isOverallApproved;

            return (
              <View key={stage.id} style={styles.stageRow}>
                {/* Status Indicator Icon */}
                <View
                  style={[
                    styles.stageIconWrap,
                    isVerified ? styles.stageIconWrapDone : styles.stageIconWrapProg,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageIconText,
                      isVerified ? styles.stageIconTextDone : styles.stageIconTextProg,
                    ]}
                  >
                    {isVerified ? '✓' : '●'}
                  </Text>
                </View>

                {/* Page Name & 1-line Description */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                </View>

                {/* Status Badge Pill */}
                <View
                  style={[
                    styles.stageStatusPill,
                    isVerified ? styles.stageStatusPillDone : styles.stageStatusPillProg,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageStatusPillText,
                      isVerified ? styles.stageStatusPillTextDone : styles.stageStatusPillTextProg,
                    ]}
                  >
                    {isVerified ? 'Verified' : 'Reviewing'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Average Turnaround SLA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaIconCircle}>
            <Clock size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.etaTitle}>Average Turnaround Time</Text>
            <Text style={styles.etaDesc}>
              Verification usually completes in <Text style={{ fontWeight: '800' }}>2–4 hours</Text> during standard operational shifts (8:00 AM – 10:00 PM).
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer Actions (Back Button + Contact Support) */}
      <View style={styles.footer}>
        {/* Back Button (Replaced View Application) */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to previous screen"
        >
          <ArrowLeft size={18} color="#334155" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {/* Contact Support Button */}
        <TouchableOpacity
          style={styles.contactSupportBtn}
          onPress={() => setShowSupportModal(true)}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Contact SevaZo Partner Support"
        >
          <Headphones size={18} color="#FFFFFF" />
          <Text style={styles.contactSupportBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Company Contact Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSupportModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.supportSheet}>
                {/* Drag handle */}
                <View style={styles.modalHandle} />

                {/* Header */}
                <View style={styles.supportHeaderRow}>
                  <View style={styles.supportHeaderLeft}>
                    <View style={styles.supportIconWrap}>
                      <Headphones size={22} color="#FF6600" />
                    </View>
                    <View>
                      <Text style={styles.supportModalTitle}>SevaZo Partner Support</Text>
                      <Text style={styles.supportModalSubTitle}>We're here to help you get on the road</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowSupportModal(false)}
                    style={styles.modalCloseBtn}
                    activeOpacity={0.7}
                  >
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Contact Options List */}
                <View style={styles.contactOptionsList}>
                  {/* Option 1: Direct Phone Call */}
                  <TouchableOpacity
                    style={styles.contactOptionItem}
                    onPress={handleCallSupport}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactOptionIconWrap, { backgroundColor: '#FFF7ED' }]}>
                      <Phone size={22} color="#FF6600" />
                    </View>
                    <View style={styles.contactOptionTextWrap}>
                      <Text style={styles.contactOptionTitle}>Direct Helpline (Toll-Free)</Text>
                      <Text style={styles.contactOptionDetail}>+91 98765 43210 • 1800-123-SEVAZO</Text>
                    </View>
                    <ExternalLink size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Option 2: WhatsApp Chat Support */}
                  <TouchableOpacity
                    style={styles.contactOptionItem}
                    onPress={handleWhatsAppSupport}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactOptionIconWrap, { backgroundColor: '#ECFDF5' }]}>
                      <MessageCircle size={22} color="#10B981" />
                    </View>
                    <View style={styles.contactOptionTextWrap}>
                      <Text style={styles.contactOptionTitle}>WhatsApp Partner Helpdesk</Text>
                      <Text style={styles.contactOptionDetail}>Instant chat assistance & query updates</Text>
                    </View>
                    <ExternalLink size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Option 3: Official Support Email */}
                  <TouchableOpacity
                    style={styles.contactOptionItem}
                    onPress={handleEmailSupport}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactOptionIconWrap, { backgroundColor: '#EFF6FF' }]}>
                      <Mail size={22} color="#3B82F6" />
                    </View>
                    <View style={styles.contactOptionTextWrap}>
                      <Text style={styles.contactOptionTitle}>Official Support Email</Text>
                      <Text style={styles.contactOptionDetail}>rider-support@sevazo.in</Text>
                    </View>
                    <ExternalLink size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Additional Info Box */}
                <View style={styles.supportMetaBox}>
                  <View style={styles.metaRow}>
                    <Clock size={16} color="#64748B" />
                    <Text style={styles.metaText}>
                      <Text style={{ fontWeight: '700' }}>Operating Hours:</Text> 8:00 AM – 10:00 PM (Monday to Sunday)
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.metaText}>
                      <Text style={{ fontWeight: '700' }}>Fleet Hub:</Text> World Trade Park, Malviya Nagar, Jaipur, RJ
                    </Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeActionBtn}
                  onPress={() => setShowSupportModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeActionBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBackBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
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
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    borderColor: '#FED7AA',
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
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6600',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  stageIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 13,
    fontWeight: '800',
  },
  stageIconTextDone: {
    color: '#15803D',
  },
  stageIconTextProg: {
    color: '#D97706',
    fontSize: 8,
  },
  stageTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stageDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  stageStatusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
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
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  etaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 18,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  contactSupportBtn: {
    flex: 1.3,
    flexDirection: 'row',
    backgroundColor: '#FF6600',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  contactSupportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  supportSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  supportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  supportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  supportIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  supportModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportModalSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  contactOptionsList: {
    gap: 12,
    marginBottom: 20,
  },
  contactOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  contactOptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactOptionTextWrap: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactOptionDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  supportMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  closeActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});

export default ApplicationStatusScreen;
