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
  const emergency = draftData?.emergencyContact || {};
  const vehicle = draftData?.vehicle || {};
  const identity = draftData?.identity || {};
  const dl = draftData?.drivingLicence || {};
  const vehicleDocs = draftData?.vehicleDocuments || {};
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
      currentStep={14}
      totalSteps={14}
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
        {/* 1. Personal Information */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <User size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>1. Personal Information</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingPersonal')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit personal information"
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

        {/* 3. Emergency Contact */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <PhoneCall size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>3. Emergency Contact</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingEmergencyContact')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Contact: </Text>
              {emergency.fullName || 'Ramesh Sharma'} ({emergency.relationship || 'Father'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Mobile: </Text>
              +91 {emergency.mobileNumber || '9811122233'}
            </Text>
          </View>
        </View>

        {/* 4. Vehicle Details */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Bike size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>4. Vehicle Details</Text>
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
              <Text style={styles.label}>Mode: </Text>
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
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Bicycle: </Text>
                {vehicle.bicycleBrand || 'Hero Cycles'} ({vehicle.color || 'Black'})
              </Text>
            )}
          </View>
        </View>

        {/* 5. Identity Verification (Aadhaar / PAN) */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <ShieldCheck size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>5. Identity Verification</Text>
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
            {identity.panNumber ? (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>PAN Card: </Text>
                {identity.panNumber}
              </Text>
            ) : null}
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Photo Uploaded: </Text>
              {identity.frontImage || identity.idFrontPhoto ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
        </View>

        {/* 6. Driving Licence */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <FileCheck size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>6. Driving Licence</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingDrivingLicence')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Licence No: </Text>
                  {dl.licenseNumber || 'RJ-1420110012345'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Valid Till: </Text>
                  {dl.expiryDate || '2032-12-31'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Front Photo: </Text>
                  {dl.frontImage || dl.licenseFrontPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Back Photo: </Text>
                  {dl.backImage || dl.licenseBackPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </Text>
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Status: </Text>
                Not required for Bicycle riders
              </Text>
            )}
          </View>
        </View>

        {/* 7. Vehicle Documents (RC, Insurance, PUC) */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Car size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>7. Vehicle Documents</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingVehicleDocuments')}
            >
              <Edit2 size={14} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>RC (Registration Certificate): </Text>
                  {vehicleDocs.rcFrontImage || vehicleDocs.rcPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Insurance: </Text>
                  {vehicleDocs.insuranceImage || vehicleDocs.insurancePhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>PUC Certificate: </Text>
                  {vehicleDocs.pucImage || vehicleDocs.pucPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </Text>
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Status: </Text>
                Not required for Bicycle riders
              </Text>
            )}
          </View>
        </View>

        {/* 8. Bank & Payouts */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <CreditCard size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>8. Bank & Payouts</Text>
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
              <Text style={styles.label}>Account Holder: </Text>
              {banking.accountHolder || 'Rahul Sharma'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Bank: </Text>
              {banking.bankName || 'HDFC Bank Ltd'} (IFSC: {banking.ifsc || 'HDFC0001234'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Account No: </Text>
              XXXX XXXX 7890 (Masked for security)
            </Text>
            {banking.upiId && (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>UPI ID: </Text>
                {banking.upiId}
              </Text>
            )}
          </View>
        </View>

        {/* 9. Service Area / Zone */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Compass size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>9. Service Zone</Text>
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
              {serviceArea.city || 'Jaipur'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Hub / Zone: </Text>
              {serviceArea.zone || 'Vaishali Nagar'}
            </Text>
          </View>
        </View>

        {/* 10. Delivery Preferences */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Settings size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>10. Delivery Preferences</Text>
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
              <Text style={styles.label}>Max Delivery Radius: </Text>
              {preferences.maxDistanceKm || 5} km
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Preferred Order Types: </Text>
              {(preferences.orderTypes && preferences.orderTypes.length > 0)
                ? preferences.orderTypes.join(', ')
                : 'Food, Grocery, Packages'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Shift Preference: </Text>
              {preferences.shiftPreference || 'Flexible'}
            </Text>
          </View>
        </View>

        {/* 11. Weekly Availability / Shifts */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>11. Weekly Availability & Shifts</Text>
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
              activeDays.map((dayLine, idx) => (
                <Text key={idx} style={styles.detailRow}>
                  <Text style={styles.label}>• </Text>
                  {dayLine}
                </Text>
              ))
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Schedule: </Text>
                Mon-Sat: 08:00 AM - 08:00 PM (Default)
              </Text>
            )}
          </View>
        </View>

        {/* Mandatory Agreements */}
        <View style={styles.agreementsContainer}>
          <Text style={styles.agreementsTitle}>Terms & Declarations *</Text>
          <Text style={styles.agreementsSubtitle}>
            Please review and agree to the following terms before submitting your application:
          </Text>

          <View style={styles.agreementsList}>
            {AGREEMENTS.map((agreement) => {
              const isChecked = acceptedAgreements.includes(agreement.id);
              return (
                <TouchableOpacity
                  key={agreement.id}
                  style={styles.agreementItem}
                  onPress={() => toggleAgreement(agreement.id)}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                >
                  <View style={styles.checkboxBox}>
                    {isChecked ? (
                      <CheckSquare size={20} color="#FF6600" />
                    ) : (
                      <Square size={20} color={Colors.textMuted} />
                    )}
                  </View>
                  <Text style={[styles.agreementText, isChecked && styles.agreementTextChecked]}>
                    {agreement.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Confirmation Modal */}
        <ConfirmModal
          visible={showConfirmModal}
          title="Submit for Verification?"
          message="Once submitted, your profile and uploaded documents will be queued for operations verification. Some fields will be locked from editing while review is in progress."
          confirmTitle="Submit Application"
          cancelTitle="Review Again"
          onConfirm={handleFinalSubmit}
          onClose={() => setShowConfirmModal(false)}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontSize: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  editBtnText: {
    ...Typography.bodySmall,
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 11,
  },
  cardBody: {
    gap: 4,
  },
  detailRow: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  agreementsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  agreementsTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  agreementsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  agreementsList: {
    gap: Spacing.md,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkboxBox: {
    marginTop: 2,
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
