import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  User,
  Home,
  PhoneCall,
  Bike,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  FileCheck,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { SectionStatus } from './SectionStatus';
import { Button } from '../Button';
import { STEP_NAMES, SECTION_KEYS } from '../../store/onboardingStore';
import { SectionStatus as SectionStatusType } from '../../types';

export interface ResumeOnboardingProps {
  applicationId: string;
  completionPercentage: number;
  sectionStatus: Record<string, SectionStatusType>;
  rejectionReason?: string | null;
  onSelectStep: (stepNumber: number) => void;
  onResume: () => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  ACCOUNT: <CheckCircle size={18} color="#10B981" />,
  PERSONAL: <User size={18} color="#FF6600" />,
  ADDRESS: <Home size={18} color="#FF6600" />,
  EMERGENCY_CONTACT: <PhoneCall size={18} color="#FF6600" />,
  VEHICLE: <Bike size={18} color="#FF6600" />,
  IDENTITY: <ShieldCheck size={18} color="#FF6600" />,
  DRIVING_LICENSE: <FileText size={18} color="#FF6600" />,
  VEHICLE_DOCUMENTS: <FileCheck size={18} color="#FF6600" />,
  BANKING: <CreditCard size={18} color="#FF6600" />,
  SERVICE_AREA: <MapPin size={18} color="#FF6600" />,
  DELIVERY_PREFERENCES: <Clock size={18} color="#FF6600" />,
  AVAILABILITY: <Clock size={18} color="#FF6600" />,
  AGREEMENTS: <FileText size={18} color="#FF6600" />,
  REVIEW: <CheckCircle size={18} color="#10B981" />,
};

export const ResumeOnboarding: React.FC<ResumeOnboardingProps> = ({
  applicationId,
  completionPercentage,
  sectionStatus,
  rejectionReason,
  onSelectStep,
  onResume,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <View style={styles.appIdBadge}>
            <Text style={styles.appIdText}>Application ID: {applicationId}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Sparkles size={12} color="#FF6600" />
            <Text style={styles.statusText}>{completionPercentage}% Complete</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Rider Onboarding</Text>
        <Text style={styles.heroSubtitle}>
          Complete all 9 sections to submit your profile for instant verification.
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
        </View>

        <Button
          title="Resume Application"
          variant="primary"
          size="medium"
          onPress={onResume}
          style={styles.resumeButton}
        />
      </View>

      {rejectionReason && (
        <View style={styles.rejectionCard}>
          <Text style={styles.rejectionTitle}>Action Required on Application</Text>
          <Text style={styles.rejectionText}>{rejectionReason}</Text>
        </View>
      )}

      {/* 14 Steps Checklist */}
      <Text style={styles.sectionHeader}>Onboarding Sections</Text>

      <View style={styles.stepList}>
        {STEP_NAMES.map((name, index) => {
          const stepNumber = index + 1;
          const sectionKey = SECTION_KEYS[index];
          const status = sectionStatus[sectionKey] || (stepNumber === 1 ? 'COMPLETED' : 'NOT_STARTED');
          const isCompleted = status === 'COMPLETED';

          return (
            <TouchableOpacity
              key={sectionKey}
              style={[styles.stepItem, isCompleted && styles.stepItemCompleted]}
              onPress={() => onSelectStep(stepNumber)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Step ${stepNumber}: ${name}, Status: ${status}`}
            >
              <View style={styles.stepIconBox}>
                {SECTION_ICONS[sectionKey] || <FileText size={18} color="#FF6600" />}
              </View>

              <View style={styles.stepInfo}>
                <Text style={styles.stepNumberText}>Step {stepNumber}</Text>
                <Text style={styles.stepNameText}>{name}</Text>
              </View>

              <View style={styles.stepStatusBox}>
                <SectionStatus status={status} />
              </View>

              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  appIdBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  appIdText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
    fontSize: 11,
  },
  heroTitle: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6600',
    borderRadius: BorderRadius.full,
  },
  resumeButton: {
    marginTop: Spacing.xs,
  },
  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rejectionTitle: {
    ...Typography.titleSmall,
    color: '#B91C1C',
    marginBottom: 4,
    fontWeight: '700',
  },
  rejectionText: {
    ...Typography.bodySmall,
    color: '#DC2626',
  },
  sectionHeader: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stepList: {
    gap: Spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepItemCompleted: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepNumberText: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stepNameText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  stepStatusBox: {
    marginRight: Spacing.sm,
  },
});

export default ResumeOnboarding;
