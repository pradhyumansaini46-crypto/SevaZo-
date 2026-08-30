import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  User,
  MapPin,
  PhoneCall,
  Bike,
  ShieldCheck,
  CreditCard,
  Compass,
  CheckCircle,
  FileCheck,
  FileText,
  Clock,
  Edit2,
  CheckSquare,
  Square,
  AlertCircle,
  Shield,
  ExternalLink,
  Car,
  Calendar,
  Settings,
  HeartHandshake,
  Landmark,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { ConfirmModal } from '../../components/Modal';
import { useOnboardingStore } from '../../store/onboardingStore';

const AGREEMENTS = [
  { id: 'accuracy', text: 'I confirm that the information provided is accurate and truthful.' },
  { id: 'terms', text: 'I agree to the Sevazo Rider Partner Terms of Service.' },
  { id: 'privacy', text: 'I agree to the Sevazo Partner Privacy Policy.' },
  { id: 'rider_agreement', text: 'I agree to the Independent Delivery Partner Master Agreement.' },
  { id: 'verification_auth', text: 'I authorize Sevazo to verify my submitted documents and identity.' },
  { id: 'activation_notice', text: 'I understand that rider activation is strictly subject to verification approval.' },
];

export const ReviewStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, isSaving, error, clearError, submitApplication } =
    useOnboardingStore();

  const [acceptedAgreements, setAcceptedAgreements] = useState<string[]>([
    'accuracy',
    'terms',
    'privacy',
    'rider_agreement',
    'verification_auth',
    'activation_notice',
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleAgreement = (id: string) => {
    if (acceptedAgreements.includes(id)) {
      setAcceptedAgreements((prev) => prev.filter((a) => a !== id));
    } else {
      setAcceptedAgreements((prev) => [...prev, id]);
    }
  };

  const allAgreementsAccepted = AGREEMENTS.every((a) => acceptedAgreements.includes(a.id));

  const handleOpenSubmitConfirm = () => {
    if (!allAgreementsAccepted) {
      Alert.alert(
        'Agreements Required',
        'Please accept all mandatory terms and agreements before submitting your application.'
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    clearError();
    const result = await submitApplication();
    if (result) {
      navigation.replace('ApplicationSubmitted', {
        applicationId: 'SVZ-RID-000123',
      });
    }
  };

  const personal = draftData?.personal || {};
  const address = draftData?.address || {};
  const identity = draftData?.identity || {};
  const vehicle = draftData?.vehicle || {};
  const banking = draftData?.banking || {};
  const serviceArea = draftData?.serviceArea || {};
  const preferences = draftData?.deliveryPreferences || {};
  const availability = draftData?.availability || {};

  // Helper to format weekly schedule for display
  const formatSchedule = () => {
    const schedule = availability?.weeklySchedule;
    if (!schedule) return null;
    const activeDays = Object.entries(schedule as Record<string, any>)
      .filter(([_, val]) => val?.enabled)
      .map(([key, val]: [string, any]) => {
        const dayName = key.charAt(0).toUpperCase() + key.slice(1);
        const slot = val.slots?.[0] || '08:00 AM-08:00 PM';
        return `${dayName}: ${slot}`;
      });
    return activeDays;
  };

  const activeDays = formatSchedule();

  return (
    <OnboardingLayout
      currentStep={9}
      totalSteps={9}
      stepTitle="Review & Submit"
      completionPercentage={100}
      onBack={() => navigation.navigate('OnboardingAvailability')}
      onSaveContinue={handleOpenSubmitConfirm}
      continueTitle="Submit Application"
      isLastStep={true}
      isLoading={isSaving}
      disabled={!allAgreementsAccepted}
    >
      <StepContainer
        title="Application Review"
        subtitle="Review all submitted information. You can tap 'Edit' on any section to make updates before final submission."
        error={error}
      >
        {/* 1. Personal & Emergency Details */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <User size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>1. Personal & Emergency Details</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingPersonal')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit personal details"
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Name: </Text>
              {personal.firstName || 'Rahul'} {personal.lastName || 'Sharma'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>DOB: </Text>
              {personal.dob || '1995-08-15'} ({personal.gender || 'Male'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Mobile: </Text>
              {personal.phone || '+91 9876543210'} (Verified)
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Email: </Text>
              {personal.email || 'rahul.sharma@example.com'}
            </Text>
            <View style={styles.innerDivider} />
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Emergency Contact: </Text>
              {personal.emergencyContactName || draftData?.emergencyContact?.fullName || 'Ramesh Sharma'} (
              {personal.emergencyRelationship || draftData?.emergencyContact?.relationship || 'Father'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Emergency Phone: </Text>
              +91 {personal.emergencyPhone || draftData?.emergencyContact?.mobileNumber || '9811122233'}
            </Text>
          </View>
        </View>

        {/* 2. Residential Address */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MapPin size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>2. Residential Address</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingAddress')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              {address.addressLine1 || 'Flat 402, Sunshine Heights'},{' '}
              {address.locality || 'Indiranagar'}, {address.city || 'Jaipur'},{' '}
              {address.state || 'Rajasthan'} - {address.postalCode || '302021'}
            </Text>
          </View>
        </View>

        {/* 3. Identity & Driving Licence */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <ShieldCheck size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>3. Identity & Driving Licence</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingIdentity')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Identity Document: </Text>
              {identity.idType || 'AADHAAR'} ({identity.idNumber || '1234 5678 9012'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>PAN Card: </Text>
              {identity.panNumber || 'ABCDE1234F'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Government ID Scans: </Text>
              {identity.frontImage ? '✅ Front & Back Attached' : '✅ Attached & Valid'}
            </Text>
            <View style={styles.innerDivider} />
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Driving Licence No: </Text>
                  {identity.licenseNumber || draftData?.drivingLicence?.licenseNumber || 'RJ-1420110012345'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>DL Expiry: </Text>
                  {identity.expiryDate || draftData?.drivingLicence?.expiryDate || '2032-12-31'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>DL Photos: </Text>
                  {identity.licenseFrontImage || draftData?.drivingLicence?.frontImage
                    ? '✅ Front & Back Uploaded'
                    : '✅ Attached & Valid'}
                </Text>
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Licence: </Text>
                Exempt (Bicycle Rider)
              </Text>
            )}
          </View>
        </View>

        {/* 4. Vehicle Details & Documents */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Bike size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>4. Vehicle & Documents</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingVehicle')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Vehicle Mode: </Text>
              {vehicle.vehicleType || 'MOTORCYCLE'} ({vehicle.ownershipType || 'OWNED'})
            </Text>
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Vehicle: </Text>
                  {vehicle.make || 'Honda'} {vehicle.model || 'Activa 6G'} (
                  {vehicle.manufacturingYear || '2022'}) - {vehicle.color || 'Black'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Reg No: </Text>
                  {vehicle.registrationNumber || 'RJ 14 AB 1234'}
                </Text>
                <View style={styles.innerDivider} />
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>RC Number: </Text>
                  {vehicle.rcNumber || draftData?.vehicleDocuments?.rcNumber || 'RJ 14 AB 1234'} (✅ Uploaded)
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Insurance: </Text>
                  {vehicle.insuranceNumber || draftData?.vehicleDocuments?.insuranceNumber || 'POL-998877'} (Exp:{' '}
                  {vehicle.insuranceExpiry || draftData?.vehicleDocuments?.insuranceExpiry || '2027-12-31'})
                </Text>
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Bicycle: </Text>
                {vehicle.bicycleBrand || 'Hero Cycles'} ({vehicle.color || 'Black'})
              </Text>
            )}
          </View>
        </View>

        {/* 5. Bank & Payouts */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Landmark size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>5. Bank & Payouts</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingBanking')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Payout Mode: </Text>
              {banking.preferredPayoutMethod === 'UPI' ? 'UPI Direct' : 'Bank Account (NEFT/IMPS)'}
            </Text>
            {banking.preferredPayoutMethod === 'UPI' ? (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>UPI ID: </Text>
                {banking.upiId || 'rahul@paytm'} (✅ Verified)
              </Text>
            ) : (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Account Holder: </Text>
                  {banking.accountHolder || 'Rahul Sharma'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Bank / Branch: </Text>
                  {banking.bankName || 'HDFC Bank Ltd (Indiranagar)'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Account Number: </Text>
                  ••••••••{banking.accountNumber ? banking.accountNumber.slice(-4) : '5678'} (IFSC:{' '}
                  {banking.ifsc || 'HDFC0001234'})
                </Text>
              </>
            )}
          </View>
        </View>

        {/* 6. Service Area */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Compass size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>6. Service Area</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingServiceArea')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>City: </Text>
              Jaipur, Rajasthan
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Operational Zone: </Text>
              {serviceArea.zone || 'Malviya Nagar & Jagatpura'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Preferred Hubs: </Text>
              {serviceArea.preferredHubs?.join(', ') || 'Apex Circle Hub, World Trade Park Hub'}
            </Text>
          </View>
        </View>

        {/* 7. Delivery Preferences */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Settings size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>7. Delivery Preferences</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingPreferences')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Preferred Radius: </Text>
              {preferences.maxDistanceKm || 5} km
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Categories: </Text>
              {preferences.categories?.join(', ') || 'Food & Dining, Grocery & Essentials'}
            </Text>
          </View>
        </View>

        {/* 8. Availability & Working Hours */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>8. Availability & Shifts</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingAvailability')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            {activeDays && activeDays.length > 0 ? (
              activeDays.map((item, idx) => (
                <Text key={idx} style={styles.detailRow}>
                  • {item}
                </Text>
              ))
            ) : (
              <Text style={styles.detailRow}>Monday to Sunday (08:00 AM - 08:00 PM)</Text>
            )}
          </View>
        </View>

        {/* ========================================================= */}
        {/* AGREEMENTS & CONSENTS                                     */}
        {/* ========================================================= */}
        <View style={styles.agreementsSection}>
          <View style={styles.agreementsHeader}>
            <Shield size={18} color="#FF6600" />
            <Text style={styles.agreementsTitle}>Agreements & Declarations</Text>
          </View>

          {AGREEMENTS.map((a) => {
            const isChecked = acceptedAgreements.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.agreementItem}
                onPress={() => toggleAgreement(a.id)}
                activeOpacity={0.7}
              >
                {isChecked ? (
                  <CheckSquare size={20} color="#FF6600" />
                ) : (
                  <Square size={20} color={Colors.textMuted} />
                )}
                <Text style={[styles.agreementText, isChecked && styles.agreementTextChecked]}>
                  {a.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </StepContainer>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Submit Application?"
        message="Please confirm that all details are accurate. Once submitted, your profile will be sent to the Sevazo Operations Admin for verification."
        confirmTitle="Confirm & Submit"
        cancelTitle="Review Again"
        onConfirm={handleFinalSubmit}
        onClose={() => setShowConfirmModal(false)}
        confirmVariant="primary"
      />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  cardTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  editBtnText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
    fontSize: 12,
  },
  cardBody: {
    gap: 4,
  },
  detailRow: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  innerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  agreementsSection: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  agreementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  agreementsTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  agreementText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  agreementTextChecked: {
    color: Colors.textPrimary,
  },
});

export default ReviewStepScreen;
