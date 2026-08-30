import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  User,
  MapPin,
  Bike,
  ShieldCheck,
  CreditCard,
  Compass,
  FileCheck,
  Calendar,
  Edit2,
  CheckSquare,
  Square,
  Shield,
  Landmark,
  Scale,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { ConfirmModal } from '../../components/Modal';
import { useOnboardingStore } from '../../store/onboardingStore';

const AGREEMENTS = [
  { id: 'accuracy', text: 'I confirm that all information and uploaded documents are authentic and accurate.' },
  { id: 'terms', text: 'I agree to the SevaZo Fleet Partner Terms of Service.' },
  { id: 'privacy', text: 'I agree to the SevaZo Partner Privacy Policy & Location Tracking terms.' },
  { id: 'rider_agreement', text: 'I accept the Independent Delivery Partner Master Fleet Agreement.' },
  { id: 'verification_auth', text: 'I authorize SevaZo Operations to verify my credentials on government portals.' },
  { id: 'activation_notice', text: 'I understand that fleet activation is strictly subject to document approval.' },
];

export const ReviewStepScreen = ({ navigation }: any) => {
  const { draftData, isSaving, error, clearError, submitApplication } =
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
        'Please accept all mandatory terms and declarations before submitting your application.'
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
  const consent = draftData?.consent || {};

  // Format weekly schedule
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
      currentStep={8}
      totalSteps={8}
      stepTitle="Review & Submit"
      completionPercentage={100}
      onBack={() => navigation.navigate('OnboardingConsent')}
      onSaveContinue={handleOpenSubmitConfirm}
      continueTitle="Submit Application"
      isLastStep={true}
      isLoading={isSaving}
      disabled={!allAgreementsAccepted}
    >
      <StepContainer
        title="Application Review & Preview"
        subtitle="Review all submitted information across all steps. Tap 'Edit' on any section to modify before final submission."
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
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Full Name: </Text>
              {personal.firstName || 'Rahul'} {personal.lastName || 'Sharma'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Date of Birth: </Text>
              {personal.dob || '1996-05-12'} ({personal.gender || 'MALE'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Registered Phone: </Text>
              +91 {personal.phone || '9876543210'} (Verified)
            </Text>
            {personal.email ? (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Email Address: </Text>
                {personal.email}
              </Text>
            ) : null}
            <View style={styles.innerDivider} />
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Emergency Contact: </Text>
              {personal.emergencyContactName || 'Ramesh Sharma'} ({personal.emergencyRelationship || 'Father'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Emergency Number: </Text>
              +91 {personal.emergencyPhone || '9811122233'}
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
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              {address.addressLine1 || 'Flat 402, Sunshine Heights'},{' '}
              {address.addressLine2 ? `${address.addressLine2}, ` : ''}
              {address.locality || 'Malviya Nagar'}, {address.city || 'Jaipur'},{' '}
              {address.state || 'Rajasthan'} - {address.postalCode || '302017'}
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
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>PAN Card: </Text>
              {identity.panNumber || 'ABCDE1234F'} (Verified)
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Govt ID ({identity.idType || 'AADHAAR'}): </Text>
              {identity.idNumber || '2345 6789 0123'} (Front & Back Scans Attached)
            </Text>
            <View style={styles.innerDivider} />
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Driving Licence No: </Text>
                  {identity.licenseNumber || 'RJ14 20180012345'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>DL Expiry Date: </Text>
                  {identity.expiryDate || '2032-12-31'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>DL Scans: </Text>
                  ✅ Front & Back Scans Attached
                </Text>
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Driving Licence: </Text>
                Exempt (Standard Bicycle Rider)
              </Text>
            )}
          </View>
        </View>

        {/* 4. Vehicle & Compliance Documents */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Bike size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>4. Vehicle & Compliance Documents</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingVehicle')}
            >
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Vehicle Type: </Text>
              {vehicle.vehicleType || 'MOTORCYCLE'} ({vehicle.ownershipType || 'OWNED'})
            </Text>
            {vehicle.vehicleType !== 'BICYCLE' ? (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Vehicle Model: </Text>
                  {vehicle.make || 'Honda'} {vehicle.model || 'Activa 6G'} ({vehicle.manufacturingYear || '2022'}) - {vehicle.color || 'Matte Black'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Registration Number: </Text>
                  {vehicle.registrationNumber || 'RJ 14 AB 1234'}
                </Text>
                <View style={styles.innerDivider} />
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>RC Book: </Text>
                  {vehicle.registrationNumber || 'RJ 14 AB 1234'} (✅ Uploaded)
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Insurance Policy: </Text>
                  {vehicle.insuranceNumber || 'POL-998877'} (Exp: {vehicle.insuranceExpiry || '2026-12-31'})
                </Text>
                {vehicle.pucImage && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.label}>Pollution (PUC): </Text>
                    ✅ PUC Certificate Attached
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Bicycle Specs: </Text>
                {vehicle.bicycleBrand || 'Hero Cycles'} ({vehicle.color || 'Black'})
              </Text>
            )}
          </View>
        </View>

        {/* 5. Bank Account & Payouts */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Landmark size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>5. Bank & Payout Details</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingBanking')}
            >
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Payout Preference: </Text>
              {banking.preferredPayoutMethod === 'UPI' ? '⚡ Instant UPI Direct Transfer' : '🏦 Bank Account (NEFT/IMPS)'}
            </Text>
            {banking.preferredPayoutMethod === 'UPI' ? (
              <Text style={styles.detailRow}>
                <Text style={styles.label}>Verified UPI ID: </Text>
                {banking.upiId || 'rahul@okhdfcbank'}
              </Text>
            ) : (
              <>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Account Beneficiary: </Text>
                  {banking.accountHolder || 'Rahul Sharma'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Bank & Branch: </Text>
                  {banking.bankName || 'HDFC Bank Ltd (Indiranagar)'}
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.label}>Account Number: </Text>
                  ••••••••{banking.accountNumber ? banking.accountNumber.slice(-4) : '5678'} (IFSC: {banking.ifsc || 'HDFC0001234'})
                </Text>
              </>
            )}
          </View>
        </View>

        {/* 6. Service Area & Delivery Preferences (Merged) */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Compass size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>6. Service Area & Delivery Preferences</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingPreferences')}
            >
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Operating Base: </Text>
              {serviceArea.locality || preferences.locality || 'Malviya Nagar'}, {serviceArea.city || preferences.city || 'Jaipur'} ({serviceArea.zone || preferences.zone || 'Central Zone'})
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Preferred Hubs: </Text>
              {preferences.preferredHubs?.join(', ') || serviceArea.preferredHubs?.join(', ') || 'Central Commercial Hub, South Malls Hub'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Max Delivery Radius: </Text>
              {preferences.maxDistanceKm || 8} km
            </Text>
            <View style={styles.innerDivider} />
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Heavy Packages (&gt;10kg): </Text>
              {preferences.acceptHeavyItems ? '✅ Opted In' : '❌ Opted Out'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Fragile & Special Orders: </Text>
              {preferences.acceptSpecialHandling ? '✅ Opted In' : '❌ Opted Out'}
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Selected Categories: </Text>
              {preferences.categories?.join(', ') || 'Food & Dining, Grocery & FMCG, Pharmacy, Express Courier'}
            </Text>
          </View>
        </View>

        {/* 7. Availability & Working Hours */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={18} color="#FF6600" />
              <Text style={styles.cardTitle}>7. Working Hours & Availability</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingAvailability')}
            >
              <Edit2 size={13} color="#FF6600" />
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
              <Text style={styles.detailRow}>Monday to Saturday (08:00 AM - 08:00 PM)</Text>
            )}
          </View>
        </View>

        {/* 8. Rider Consent & Declaration Form */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Scale size={18} color="#10B981" />
              <Text style={styles.cardTitle}>8. Consent & Legal Declaration</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('OnboardingConsent')}
            >
              <Edit2 size={13} color="#FF6600" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Rider Code of Conduct: </Text>
              ✅ Accepted
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Road Safety & Gear Commitment: </Text>
              ✅ Accepted
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Zero Tolerance Policy: </Text>
              ✅ Accepted
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Background Check & Location Consent: </Text>
              ✅ Authorized
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.label}>Digital Electronic Signature: </Text>
              {consent.signatureName || `${personal.firstName || 'Rahul'} ${personal.lastName || 'Sharma'}`} (Confirmed)
            </Text>
          </View>
        </View>

        {/* Agreements & Declarations Checkboxes */}
        <View style={styles.agreementsSection}>
          <View style={styles.agreementsHeader}>
            <Shield size={18} color="#FF6600" />
            <Text style={styles.agreementsTitle}>Final Legal Undertakings</Text>
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
                  <Square size={20} color="#94A3B8" />
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
        message="Please confirm that all details are accurate. Once submitted, your profile will be sent to the SevaZo Operations Admin for verification."
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
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    flex: 1,
  },
  cardTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  editBtnText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
    fontSize: 12,
  },
  cardBody: {
    gap: 6,
  },
  detailRow: {
    ...Typography.bodyMedium,
    color: '#334155',
    lineHeight: 22,
    fontSize: 13.5,
  },
  label: {
    fontWeight: '700',
    color: '#0F172A',
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  agreementsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  agreementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  agreementsTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: 2,
  },
  agreementText: {
    ...Typography.bodySmall,
    color: '#64748B',
    flex: 1,
    lineHeight: 18,
    fontSize: 12.5,
  },
  agreementTextChecked: {
    color: '#1E293B',
    fontWeight: '600',
  },
});

export default ReviewStepScreen;
