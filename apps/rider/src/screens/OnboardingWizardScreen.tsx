import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  VehicleCategory,
  VehicleOwnership,
  BicycleType,
  KycDocumentItem,
  PreferredPayoutMethod,
} from '../types';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingWizard'>;

const TOTAL_STEPS = 11;

const VEHICLE_CATEGORIES: { id: VehicleCategory; label: string; icon: string; subtitle: string }[] = [
  { id: 'MOTORCYCLE', label: 'Motorcycle', icon: '🏍️', subtitle: 'Standard / Fuel Bike' },
  { id: 'SCOOTER', label: 'Scooter', icon: '🛵', subtitle: 'Gearless / Active' },
  { id: 'BICYCLE', label: 'Bicycle', icon: '🚲', subtitle: 'Eco / No DL Needed' },
  { id: 'ELECTRIC_BIKE', label: 'Electric EV', icon: '⚡', subtitle: 'Electric 2-Wheeler' },
  { id: 'CAR', label: 'Car / Van', icon: '🚗', subtitle: 'Bulk / Rain Delivery' },
  { id: 'THREE_WHEELER', label: 'Three Wheeler', icon: '🛺', subtitle: 'Commercial Cargo' },
];

const VEHICLE_OWNERSHIPS: { id: VehicleOwnership; label: string; description: string }[] = [
  { id: 'SELF', label: 'I own this vehicle', description: 'Registered in my legal name' },
  { id: 'COMPANY', label: 'Company / Employer owns it', description: 'Commercial fleet or company allotted' },
  { id: 'FAMILY', label: 'Family member owns it', description: 'Parent, spouse, or sibling ownership' },
  { id: 'RENTED_LEASED', label: 'Rented / Leased', description: 'Subscription or rental agency agreement' },
];

const BICYCLE_TYPES: { id: BicycleType; label: string; icon: string }[] = [
  { id: 'STANDARD', label: 'Standard Bicycle', icon: '🚲' },
  { id: 'ELECTRIC', label: 'Electric E-Bike', icon: '⚡' },
  { id: 'CARGO', label: 'Cargo Bicycle', icon: '📦' },
];

const POPULAR_RELATIONS = ['Brother', 'Father', 'Mother', 'Spouse', 'Sister', 'Friend', 'Guardian'];

const AVAILABLE_ZONES_JAIPUR = [
  'Vaishali Nagar',
  'Mansarovar',
  'Malviya Nagar',
  'Raja Park',
  'C-Scheme & Civil Lines',
  'Jagatpura',
];

const DELIVERY_CATEGORIES = [
  { id: 'Grocery', label: '🛒 Grocery & Instant (10-15 min)' },
  { id: 'Restaurant', label: '🍔 Restaurant & Hot Food' },
  { id: 'Retail', label: '🛍️ Retail & E-Commerce Delivery' },
  { id: 'Heavy', label: '📦 Heavy Items (> 10 kg)' },
];

const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const OnboardingWizardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { rider } = useAuthStore();
  const {
    currentStep,
    draftData,
    saveStep,
    submitApplication,
    isLoading,
  } = useOnboardingStore();

  const [activeStep, setActiveStep] = useState(route.params?.initialStep || currentStep || 1);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [locating, setLocating] = useState(false);

  // Step 1: Personal Details & Profile Photo
  const [firstName, setFirstName] = useState(draftData.step1?.firstName || 'Rahul');
  const [lastName, setLastName] = useState(draftData.step1?.lastName || 'Sharma');
  const [profilePhoto, setProfilePhoto] = useState(
    draftData.step1?.profilePhoto ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  );
  const [dob, setDob] = useState(draftData.step1?.dob || '1998-05-14');
  const [gender, setGender] = useState(draftData.step1?.gender || 'MALE');
  const [email, setEmail] = useState(draftData.step1?.email || rider?.email || 'rahul.sharma@example.com');
  const phone = rider?.phone || draftData.step1?.phone || '+91 9876543210';

  // Step 2: Address & GPS
  const [addressLine1, setAddressLine1] = useState(draftData.step2?.addressLine1 || 'Flat 302, Green Valley Apartments');
  const [addressLine2, setAddressLine2] = useState(draftData.step2?.addressLine2 || 'Tower B, Express Zone');
  const [locality, setLocality] = useState(draftData.step2?.locality || 'Sector 62');
  const [city, setCity] = useState(draftData.step2?.city || 'Noida');
  const [state, setState] = useState(draftData.step2?.state || 'Uttar Pradesh');
  const [postalCode, setPostalCode] = useState(draftData.step2?.postalCode || draftData.step2?.pincode || '201301');
  const [country, setCountry] = useState(draftData.step2?.country || 'India');
  const [latitude, setLatitude] = useState(draftData.step2?.latitude || 28.628);
  const [longitude, setLongitude] = useState(draftData.step2?.longitude || 77.3649);

  // Step 3: Emergency Contact
  const [emergencyName, setEmergencyName] = useState(draftData.step3?.emergencyContactName || 'Sunita Sharma');
  const [emergencyRelation, setEmergencyRelation] = useState(draftData.step3?.emergencyContactRelation || 'Mother');
  const [emergencyPhone, setEmergencyPhone] = useState(draftData.step3?.emergencyContactPhone || '+91 9811223344');

  // Step 4: Vehicle Type & Ownership
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>(
    draftData.step4?.vehicleCategory || 'MOTORCYCLE',
  );
  const [vehicleOwnership, setVehicleOwnership] = useState<VehicleOwnership>(
    draftData.step4?.vehicleOwnership || 'SELF',
  );

  const isBicycle = vehicleCategory === 'BICYCLE';

  // Step 5: Vehicle Details
  const [vehicleMake, setVehicleMake] = useState(draftData.step5?.make || 'Honda');
  const [vehicleModel, setVehicleModel] = useState(draftData.step5?.model || 'Shine 125');
  const [vehicleYear, setVehicleYear] = useState(draftData.step5?.year || '2024');
  const [vehicleColor, setVehicleColor] = useState(draftData.step5?.color || 'Black');
  const [registrationNumber, setRegistrationNumber] = useState(draftData.step5?.registrationNumber || 'RJ 14 AB 1234');
  const [rcUploaded, setRcUploaded] = useState(true);
  const [insuranceUploaded, setInsuranceUploaded] = useState(true);
  const [pucUploaded, setPucUploaded] = useState(true);

  // Bicycle Specific Details
  const [bicycleType, setBicycleType] = useState<BicycleType>(draftData.step5?.bicycleType || 'STANDARD');
  const [bicycleBrand, setBicycleBrand] = useState(draftData.step5?.bicycleBrand || 'Hero Cycles');
  const [bicycleModel, setBicycleModel] = useState(draftData.step5?.bicycleModel || 'Sprint Pro');
  const [bicycleColor, setBicycleColor] = useState(draftData.step5?.bicycleColor || 'Matte Black');
  const [bicyclePurchaseYear, setBicyclePurchaseYear] = useState(draftData.step5?.bicyclePurchaseYear || '2023');

  // Step 6: Driving Licence
  const [dlNumber, setDlNumber] = useState(draftData.step6?.dlNumber || 'RJ-1420110012345');
  const [dlState, setDlState] = useState(draftData.step6?.dlState || 'Rajasthan');
  const [dlIssueDate, setDlIssueDate] = useState(draftData.step6?.dlIssueDate || '2020-04-10');
  const [dlExpiryDate, setDlExpiryDate] = useState(draftData.step6?.dlExpiryDate || '2040-04-09');
  const [dlFrontUploaded, setDlFrontUploaded] = useState(true);
  const [dlBackUploaded, setDlBackUploaded] = useState(true);

  // Step 7: Identity Verification & KYC (Points 21-24)
  const [kycDocs, setKycDocs] = useState<KycDocumentItem[]>(
    draftData.step7?.documents || [
      {
        id: 'kyc-pan',
        type: 'PAN',
        title: 'Permanent Account Number (PAN)',
        documentNumber: 'ABCPS1234F',
        status: 'VERIFIED',
        frontUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      },
      {
        id: 'kyc-gov',
        type: 'GOVERNMENT_ID',
        title: 'Government ID (Aadhaar / Voter ID)',
        documentNumber: 'XXXXXXXX4812',
        status: 'VERIFIED',
        frontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
        backUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
      },
      {
        id: 'kyc-addr',
        type: 'ADDRESS_PROOF',
        title: 'Residential Address Proof',
        documentNumber: 'DOC-ADDR-9021',
        status: 'UNDER_REVIEW',
        frontUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500',
      },
      {
        id: 'kyc-dl-doc',
        type: 'OTHER_APPROVED_ID',
        title: 'Supporting Identification',
        documentNumber: 'SUP-ID-3341',
        status: 'REJECTED',
        rejectionReason: 'The uploaded image is not clear enough.',
        requiredAction: 'Upload a clearer image with all 4 corners visible.',
      },
    ],
  );

  // Step 8: Bank & Payout Details (Points 25 & 26)
  const [accountHolder, setAccountHolder] = useState(draftData.step8?.accountHolderName || 'Rahul Sharma');
  const [accountNumber, setAccountNumber] = useState(draftData.step8?.bankAccountNumber || '50100234564582');
  const [confirmAccount, setConfirmAccount] = useState(draftData.step8?.confirmAccountNumber || '50100234564582');
  const [ifsc, setIfsc] = useState(draftData.step8?.ifsc || 'HDFC0001234');
  const [bankName, setBankName] = useState(draftData.step8?.bankName || 'HDFC Bank');
  const [upiId, setUpiId] = useState(draftData.step8?.upiId || 'rahul.sharma@okhdfcbank');
  const [preferredPayout, setPreferredPayout] = useState<PreferredPayoutMethod>(
    draftData.step8?.preferredPayoutMethod || 'BANK_ACCOUNT',
  );

  // Step 9: Service Area (Point 27)
  const [selectedCity, setSelectedCity] = useState(draftData.step9?.city || 'Jaipur');
  const [selectedZones, setSelectedZones] = useState<string[]>(
    draftData.step9?.preferredZones || ['Vaishali Nagar', 'Mansarovar', 'Malviya Nagar'],
  );

  // Step 10: Delivery Preferences & Working Hours (Points 28 & 29)
  const [maxDistance, setMaxDistance] = useState(draftData.step10?.maxDistanceKm || 10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    draftData.step10?.preferredCategories || ['Grocery', 'Restaurant', 'Retail'],
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    draftData.step10?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  );
  const [workingShift, setWorkingShift] = useState(draftData.step10?.workingHoursSlot || '09:00 AM – 06:00 PM');

  // Step 11: Terms & Agreements (Point 31)
  const [agreementAccurate, setAgreementAccurate] = useState(true);
  const [agreementTerms, setAgreementTerms] = useState(true);
  const [agreementPrivacy, setAgreementPrivacy] = useState(true);
  const [agreementRiderAgreement, setAgreementRiderAgreement] = useState(true);
  const [agreementVerifyAuth, setAgreementVerifyAuth] = useState(true);
  const [agreementActivationNotice, setAgreementActivationNotice] = useState(true);
  const [confirmSubmitModalVisible, setConfirmSubmitModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.initialStep) {
      setActiveStep(route.params.initialStep);
    }
  }, [route.params?.initialStep]);

  // Current Location Handler
  const handleUseCurrentLocation = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      setLatitude(28.628);
      setLongitude(77.3649);
      setLocality('Sector 62');
      setCity('Noida');
      setState('Uttar Pradesh');
      setPostalCode('201301');
      Alert.alert('📍 Location Detected', 'Autofilled address from your GPS location: Sector 62, Noida, UP (201301)');
    }, 900);
  };

  // Mock Photo Selector
  const handleSelectPhoto = (type: 'camera' | 'gallery') => {
    setPhotoPickerVisible(false);
    const mockPhotos = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    ];
    const picked = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setProfilePhoto(picked);
    Alert.alert('Photo Updated', `Photo selected successfully via ${type === 'camera' ? 'Camera' : 'Gallery'}. Face detected ✅`);
  };

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter((z) => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleNext = async (saveAndExit = false) => {
    let currentStepPayload: any = {};

    if (activeStep === 1) {
      if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
        Alert.alert('Incomplete Details', 'Please fill in First Name, Last Name, and Date of Birth.');
        return;
      }
      currentStepPayload = { firstName, lastName, profilePhoto, dob, gender, phone, email };
    } else if (activeStep === 2) {
      if (!addressLine1.trim() || !locality.trim() || !city.trim() || !postalCode.trim()) {
        Alert.alert('Incomplete Address', 'Please provide Address Line 1, Locality, City, and Postal Code.');
        return;
      }
      currentStepPayload = { addressLine1, addressLine2, locality, city, state, postalCode, country, latitude, longitude };
    } else if (activeStep === 3) {
      if (!emergencyName.trim() || !emergencyRelation.trim() || !emergencyPhone.trim()) {
        Alert.alert('Incomplete Contact', 'Please provide Emergency Contact Full Name, Relationship, and Phone Number.');
        return;
      }
      currentStepPayload = { emergencyContactName: emergencyName, emergencyContactRelation: emergencyRelation, emergencyContactPhone: emergencyPhone };
    } else if (activeStep === 4) {
      currentStepPayload = { vehicleCategory, vehicleOwnership };
    } else if (activeStep === 5) {
      if (isBicycle) {
        if (!bicycleBrand.trim() || !bicycleColor.trim()) {
          Alert.alert('Incomplete Details', 'Please provide Bicycle Brand and Color.');
          return;
        }
        currentStepPayload = { isBicycle: true, bicycleType, bicycleBrand, bicycleModel, bicycleColor, bicyclePurchaseYear };
      } else {
        if (!vehicleMake.trim() || !vehicleModel.trim() || !registrationNumber.trim()) {
          Alert.alert('Incomplete Details', 'Please provide Vehicle Make, Model, and Registration Number.');
          return;
        }
        currentStepPayload = {
          isBicycle: false,
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
          color: vehicleColor,
          registrationNumber: registrationNumber.toUpperCase(),
          rcDocUrl: rcUploaded ? 'uploaded' : null,
          insuranceDocUrl: insuranceUploaded ? 'uploaded' : null,
          pucDocUrl: pucUploaded ? 'uploaded' : null,
        };
      }
    } else if (activeStep === 6) {
      if (isBicycle) {
        currentStepPayload = { isBicycle: true, isDlRequired: false };
      } else {
        if (!dlNumber.trim() || !dlState.trim() || !dlExpiryDate.trim()) {
          Alert.alert('Incomplete Licence Details', 'Please provide Driving Licence Number, Issuing State, and Expiry Date.');
          return;
        }
        currentStepPayload = {
          isBicycle: false,
          dlNumber,
          dlState,
          dlIssueDate,
          dlExpiryDate,
          dlFrontUrl: dlFrontUploaded ? 'uploaded' : null,
          dlBackUrl: dlBackUploaded ? 'uploaded' : null,
        };
      }
    } else if (activeStep === 7) {
      // Identity Verification / KYC (Points 21-24)
      currentStepPayload = { documents: kycDocs };
    } else if (activeStep === 8) {
      // Bank / Payout Details (Points 25 & 26)
      if (!accountHolder.trim() || !accountNumber.trim() || !ifsc.trim()) {
        Alert.alert('Incomplete Bank Details', 'Please provide Account Holder Name, Account Number, and IFSC Code.');
        return;
      }
      if (accountNumber !== confirmAccount) {
        Alert.alert('Account Mismatch', 'Account Number and Confirm Account Number do not match.');
        return;
      }
      const masked = `XXXX XXXX ${accountNumber.slice(-4)}`;
      currentStepPayload = {
        accountHolderName: accountHolder,
        bankAccountNumber: accountNumber,
        confirmAccountNumber: confirmAccount,
        maskedAccountNumber: masked,
        ifsc: ifsc.toUpperCase(),
        bankName,
        upiId,
        preferredPayoutMethod: preferredPayout,
      };
    } else if (activeStep === 9) {
      // Service Area (Point 27)
      currentStepPayload = { city: selectedCity, preferredZones: selectedZones };
    } else if (activeStep === 10) {
      // Delivery Preferences & Working Hours (Points 28 & 29)
      currentStepPayload = {
        maxDistanceKm: maxDistance,
        preferredCategories: selectedCategories,
        workingDays: selectedDays,
        workingHoursSlot: workingShift,
      };
    } else if (activeStep === 11) {
      // Agreements (Point 31)
      if (
        !agreementAccurate ||
        !agreementTerms ||
        !agreementPrivacy ||
        !agreementRiderAgreement ||
        !agreementVerifyAuth ||
        !agreementActivationNotice
      ) {
        Alert.alert(
          'Agreements Required',
          'Please review and check all 6 declarations before submitting your application.',
        );
        return;
      }

      if (saveAndExit) {
        currentStepPayload = {
          agreementVersion: 'v1.2',
          agreementsList: [
            'I confirm that the information provided is accurate.',
            'I agree to SevaZo Rider Terms.',
            'I agree to SevaZo Privacy Policy.',
            'I agree to the Rider Agreement.',
            'I authorize SevaZo to verify my submitted information.',
            'I understand that rider activation is subject to verification.',
          ],
          termsAccepted: true,
        };
      } else {
        // Trigger Point 32 Confirmation Modal
        setConfirmSubmitModalVisible(true);
        return;
      }
    }

    const res = await saveStep(activeStep, currentStepPayload, saveAndExit);

    if (saveAndExit) {
      navigation.navigate('OnboardingResume');
      return;
    }

    if (activeStep < TOTAL_STEPS) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setConfirmSubmitModalVisible(false);
    const step11Payload = {
      agreementVersion: 'v1.2',
      agreementsList: [
        'I confirm that the information provided is accurate.',
        'I agree to SevaZo Rider Terms.',
        'I agree to SevaZo Privacy Policy.',
        'I agree to the Rider Agreement.',
        'I authorize SevaZo to verify my submitted information.',
        'I understand that rider activation is subject to verification.',
      ],
      termsAccepted: true,
      acceptedAt: new Date().toISOString(),
    };

    await saveStep(11, step11Payload, false);
    const submitRes = await submitApplication();
    if (submitRes) {
      navigation.replace('ApplicationSubmitted', {
        applicationId: 'SVZ-RID-000123',
      });
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dotsRowScroll}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < activeStep;
            const isCurrent = step === activeStep;
            return (
              <React.Fragment key={step}>
                <TouchableOpacity
                  onPress={() => setActiveStep(step)}
                  style={[
                    styles.dot,
                    isCompleted && styles.dotCompleted,
                    isCurrent && styles.dotCurrent,
                  ]}
                >
                  <Text style={[styles.dotText, (isCompleted || isCurrent) && styles.dotTextActive]}>
                    {isCompleted ? '✓' : step}
                  </Text>
                </TouchableOpacity>
                {step < TOTAL_STEPS && (
                  <View
                    style={[
                      styles.dotLine,
                      step < activeStep && styles.dotLineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
        <View style={styles.stepInfoRow}>
          <Text style={styles.stepInfoText}>Step {activeStep} of {TOTAL_STEPS}</Text>
          <Text style={styles.stepInfoPercent}>{Math.round(((activeStep - 1) / TOTAL_STEPS) * 100)}% Complete</Text>
        </View>
      </View>
    );
  };

  // STEP 1: Personal Details & Profile Photo (Points 10 & 11)
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>11. Profile Photo & Personal Details</Text>
      <Text style={styles.stepSubtitle}>Upload a clear profile photo and enter your legal identification.</Text>

      <View style={styles.photoCard}>
        <View style={styles.photoContainer}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profileAvatar} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>[ + ]</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.photoBadge}
            onPress={() => setPhotoPickerVisible(true)}
          >
            <Text style={styles.photoBadgeText}>📷 Change</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.photoHeadline}>Upload a clear photo of yourself</Text>
        <Text style={styles.photoHelp}>
          • Face clearly visible{'\n'}• Appropriate lighting & plain background{'\n'}• JPG/PNG format under 5 MB
        </Text>

        <View style={styles.photoActionRow}>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={() => handleSelectPhoto('camera')}
          >
            <Text style={styles.photoBtnText}>📸 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoBtn, styles.photoBtnSecondary]}
            onPress={() => handleSelectPhoto('gallery')}
          >
            <Text style={styles.photoBtnTextSecondary}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="e.g. Rahul"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="e.g. Sharma"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth * (DD/MM/YYYY)</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
        />
        <Text style={styles.helperText}>Must be at least 18 years old to deliver on SevaZo.</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.pillsRow}>
          {['MALE', 'FEMALE', 'OTHER'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, gender === g && styles.pillActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>
                {g === 'MALE' ? '👨 Male' : g === 'FEMALE' ? '👩 Female' : '⚧ Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Mobile Number (OTP Verified)</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified ✅</Text>
          </View>
        </View>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={phone}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address (Optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  // STEP 2: Residential Address & GPS Location (Point 12)
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>12. Residential Address</Text>
      <Text style={styles.stepSubtitle}>
        Your current home address helps assign local hubs, dispatch orders, and coordinate operations.
      </Text>

      <TouchableOpacity
        style={styles.locationBanner}
        onPress={handleUseCurrentLocation}
        disabled={locating}
      >
        <View style={styles.locationIconWrap}>
          <Text style={{ fontSize: 22 }}>📍</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.locationTitle}>Use Current Location</Text>
          <Text style={styles.locationDesc}>
            {locating ? 'Detecting coordinates...' : 'Fetch precise GPS coordinates & autofill address'}
          </Text>
          {latitude && (
            <Text style={styles.coordsBadge}>
              GPS: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </Text>
          )}
        </View>
        {locating ? (
          <ActivityIndicator size="small" color="#059669" />
        ) : (
          <Text style={styles.locationArrow}>➔</Text>
        )}
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          value={addressLine1}
          onChangeText={setAddressLine1}
          placeholder="House / Flat No., Building Name, Street"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={addressLine2}
          onChangeText={setAddressLine2}
          placeholder="Apartment, Tower, Landmark (Optional)"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Locality / Area *</Text>
        <TextInput
          style={styles.input}
          value={locality}
          onChangeText={setLocality}
          placeholder="e.g. Sector 62 / Indiranagar"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.rowTwo}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Noida / Jaipur"
            placeholderTextColor="#94A3B8"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="Uttar Pradesh"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.rowTwo}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="201301"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={country}
            editable={false}
          />
        </View>
      </View>
    </View>
  );

  // STEP 3: Emergency Contact (Point 13)
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>13. Emergency Contact</Text>
      <Text style={styles.stepSubtitle}>
        Provide details of someone we can contact in case of on-road medical or emergency assistance.
      </Text>

      <View style={styles.privacyNotice}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          <Text style={{ fontWeight: '700' }}>Confidential:</Text> Emergency contact information is strictly protected and NEVER shared with customers or merchants.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={emergencyName}
          onChangeText={setEmergencyName}
          placeholder="e.g. Rahul Saini"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Relationship *</Text>
        <TextInput
          style={styles.input}
          value={emergencyRelation}
          onChangeText={setEmergencyRelation}
          placeholder="Brother / Parent / Spouse"
          placeholderTextColor="#94A3B8"
        />
        <View style={styles.pillsRow}>
          {POPULAR_RELATIONS.map((rel) => (
            <TouchableOpacity
              key={rel}
              style={[styles.pillSmall, emergencyRelation === rel && styles.pillActive]}
              onPress={() => setEmergencyRelation(rel)}
            >
              <Text style={[styles.pillSmallText, emergencyRelation === rel && styles.pillTextActive]}>
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  // STEP 4: Vehicle Type & Ownership (Points 14 & 15)
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>14. Select Vehicle Type</Text>
      <Text style={styles.stepSubtitle}>How will you deliver orders on the SevaZo platform?</Text>

      <View style={styles.vehicleGrid}>
        {VEHICLE_CATEGORIES.map((v) => {
          const selected = vehicleCategory === v.id;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.vehicleCard, selected && styles.vehicleCardActive]}
              onPress={() => setVehicleCategory(v.id)}
            >
              <Text style={styles.vehicleIcon}>{v.icon}</Text>
              <Text style={[styles.vehicleLabel, selected && styles.vehicleLabelActive]}>
                {v.label}
              </Text>
              <Text style={styles.vehicleSub}>{v.subtitle}</Text>
              {selected && <View style={styles.selectedBadge}><Text style={styles.checkIcon}>✓</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      <Text style={styles.stepTitle}>15. Vehicle Ownership</Text>
      <Text style={styles.stepSubtitle}>Who is the legal owner of this vehicle?</Text>

      {VEHICLE_OWNERSHIPS.map((o) => {
        const selected = vehicleOwnership === o.id;
        return (
          <TouchableOpacity
            key={o.id}
            style={[styles.ownershipCard, selected && styles.ownershipCardActive]}
            onPress={() => setVehicleOwnership(o.id)}
          >
            <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
              {selected && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.ownershipTitle, selected && styles.ownershipTitleActive]}>
                {o.label}
              </Text>
              <Text style={styles.ownershipDesc}>{o.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // STEP 5: Vehicle Details (Points 16, 17, 18)
  const renderStep5 = () => {
    if (isBicycle) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>17. Bicycle Details</Text>
          <Text style={styles.stepSubtitle}>
            Eco-friendly delivery. No motorized vehicle registration or RC required.
          </Text>

          <View style={styles.ecoBanner}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🌱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ecoTitle}>Zero-Emission Delivery Partner</Text>
              <Text style={styles.ecoDesc}>
                Bicycles deliver hyper-local food & quick-commerce orders within 3 km.
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bicycle Type *</Text>
            <View style={styles.pillsRow}>
              {BICYCLE_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt.id}
                  style={[styles.pill, bicycleType === bt.id && styles.pillActive]}
                  onPress={() => setBicycleType(bt.id)}
                >
                  <Text style={[styles.pillText, bicycleType === bt.id && styles.pillTextActive]}>
                    {bt.icon} {bt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Brand / Make *</Text>
            <TextInput
              style={styles.input}
              value={bicycleBrand}
              onChangeText={setBicycleBrand}
              placeholder="e.g. Hero / Firefox / Decathlon"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={bicycleModel}
              onChangeText={setBicycleModel}
              placeholder="e.g. Sprint Pro / Rockrider"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Color *</Text>
              <TextInput
                style={styles.input}
                value={bicycleColor}
                onChangeText={setBicycleColor}
                placeholder="e.g. Matte Black"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Purchase Year</Text>
              <TextInput
                style={styles.input}
                value={bicyclePurchaseYear}
                onChangeText={setBicyclePurchaseYear}
                placeholder="2023"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.docNoticeCard}>
            <Text style={styles.docNoticeTitle}>18. Vehicle Document Status</Text>
            <Text style={styles.docNoticeText}>
              ✅ <Text style={{ fontWeight: '700' }}>Registration Documents Not Required:</Text> Standard bicycles are legally exempt from RC, Insurance, and PUC requirements.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>16. Vehicle Details & Registration</Text>
        <Text style={styles.stepSubtitle}>
          Enter vehicle specifications and upload required transport compliance documents.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={vehicleCategory}
            editable={false}
          />
        </View>

        <View style={styles.rowTwo}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Make / Brand *</Text>
            <TextInput
              style={styles.input}
              value={vehicleMake}
              onChangeText={setVehicleMake}
              placeholder="e.g. Honda / Bajaj"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="e.g. Shine / Activa"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.rowTwo}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Manufacturing Year</Text>
            <TextInput
              style={styles.input}
              value={vehicleYear}
              onChangeText={setVehicleYear}
              placeholder="2024"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Color *</Text>
            <TextInput
              style={styles.input}
              value={vehicleColor}
              onChangeText={setVehicleColor}
              placeholder="e.g. Black / Red"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Registration Number (Number Plate) *</Text>
          <TextInput
            style={[styles.input, styles.plateInput]}
            value={registrationNumber}
            onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
            placeholder="RJ 14 AB 1234"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.stepTitle}>18. Vehicle Compliance Documents</Text>

        <View style={styles.docUploadRow}>
          <View style={styles.docUploadInfo}>
            <Text style={styles.docUploadTitle}>Registration Certificate (RC) *</Text>
            <Text style={styles.docUploadSub}>Clear photo of RC front side</Text>
          </View>
          <TouchableOpacity
            style={[styles.uploadPill, rcUploaded && styles.uploadPillDone]}
            onPress={() => setRcUploaded(!rcUploaded)}
          >
            <Text style={[styles.uploadPillText, rcUploaded && styles.uploadPillTextDone]}>
              {rcUploaded ? '✓ Uploaded' : '📤 Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docUploadRow}>
          <View style={styles.docUploadInfo}>
            <Text style={styles.docUploadTitle}>Vehicle Insurance Policy *</Text>
            <Text style={styles.docUploadSub}>Active 3rd-party or comprehensive</Text>
          </View>
          <TouchableOpacity
            style={[styles.uploadPill, insuranceUploaded && styles.uploadPillDone]}
            onPress={() => setInsuranceUploaded(!insuranceUploaded)}
          >
            <Text style={[styles.uploadPillText, insuranceUploaded && styles.uploadPillTextDone]}>
              {insuranceUploaded ? '✓ Uploaded' : '📤 Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docUploadRow}>
          <View style={styles.docUploadInfo}>
            <Text style={styles.docUploadTitle}>Pollution Certificate (PUC)</Text>
            <Text style={styles.docUploadSub}>Valid emission certificate</Text>
          </View>
          <TouchableOpacity
            style={[styles.uploadPill, pucUploaded && styles.uploadPillDone]}
            onPress={() => setPucUploaded(!pucUploaded)}
          >
            <Text style={[styles.uploadPillText, pucUploaded && styles.uploadPillTextDone]}>
              {pucUploaded ? '✓ Uploaded' : '📤 Upload'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // STEP 6: Driving Licence (Points 19 & 20)
  const renderStep6 = () => {
    if (isBicycle) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>20. Vehicle Verification (Bicycle)</Text>
          <Text style={styles.stepSubtitle}>
            Bicycle delivery partners are not required to hold a motor vehicle driving licence.
          </Text>

          <View style={styles.bicycleSuccessCard}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🚲 ✨</Text>
            <Text style={styles.bicycleSuccessTitle}>Bicycle Selected</Text>
            <Text style={styles.bicycleSuccessDesc}>
              No driving licence required for this vehicle type. Your bicycle onboarding profile is fully compliant with municipal delivery guidelines.
            </Text>
            <View style={styles.compliantBadge}>
              <Text style={styles.compliantText}>✓ DL Requirement Waived</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>19. Driving Licence (DL)</Text>
        <Text style={styles.stepSubtitle}>
          Provide valid Driving Licence details for motorized delivery operations.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Licence Number *</Text>
          <TextInput
            style={[styles.input, styles.plateInput]}
            value={dlNumber}
            onChangeText={(t) => setDlNumber(t.toUpperCase())}
            placeholder="RJ-1420110012345"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.rowTwo}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Issuing State *</Text>
            <TextInput
              style={styles.input}
              value={dlState}
              onChangeText={setDlState}
              placeholder="e.g. Rajasthan"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Expiry Date *</Text>
            <TextInput
              style={styles.input}
              value={dlExpiryDate}
              onChangeText={setDlExpiryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Issue</Text>
          <TextInput
            style={styles.input}
            value={dlIssueDate}
            onChangeText={setDlIssueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Upload Driving Licence Photos *</Text>

        <View style={styles.dlPhotoRow}>
          <TouchableOpacity
            style={[styles.dlBox, dlFrontUploaded && styles.dlBoxDone]}
            onPress={() => setDlFrontUploaded(!dlFrontUploaded)}
          >
            <Text style={styles.dlBoxIcon}>🪪</Text>
            <Text style={styles.dlBoxTitle}>Front Side</Text>
            <Text style={[styles.dlBoxStatus, dlFrontUploaded && styles.dlBoxStatusDone]}>
              {dlFrontUploaded ? '✓ Uploaded' : '+ Upload'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dlBox, dlBackUploaded && styles.dlBoxDone]}
            onPress={() => setDlBackUploaded(!dlBackUploaded)}
          >
            <Text style={styles.dlBoxIcon}>🪪</Text>
            <Text style={styles.dlBoxTitle}>Back Side</Text>
            <Text style={[styles.dlBoxStatus, dlBackUploaded && styles.dlBoxStatusDone]}>
              {dlBackUploaded ? '✓ Uploaded' : '+ Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityCheckNote}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🛡️</Text>
          <Text style={styles.securityCheckText}>
            Licence validity, expiry, and class category are cross-verified with official government transport records.
          </Text>
        </View>
      </View>
    );
  };

  // STEP 7: Identity Verification & KYC Documents (Points 21-24)
  const renderStep7 = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>21. Identity Verification / KYC</Text>
        <Text style={styles.stepSubtitle}>
          Verify your legal identification through government-recognized IDs.
        </Text>

        {kycDocs.map((doc, idx) => {
          const isVerified = doc.status === 'VERIFIED';
          const isUnderReview = doc.status === 'UNDER_REVIEW';
          const isRejected = doc.status === 'REJECTED';

          return (
            <View
              key={doc.id}
              style={[
                styles.kycCard,
                isRejected && styles.kycCardRejected,
                isVerified && styles.kycCardVerified,
              ]}
            >
              <View style={styles.kycHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kycDocType}>{doc.title}</Text>
                  <Text style={styles.kycDocNumber}>Doc No: {doc.documentNumber}</Text>
                </View>

                {/* Status Badge (Point 23) */}
                <View
                  style={[
                    styles.kycStatusBadge,
                    isVerified && styles.kycStatusVerified,
                    isUnderReview && styles.kycStatusReview,
                    isRejected && styles.kycStatusRejected,
                  ]}
                >
                  <Text
                    style={[
                      styles.kycStatusText,
                      isVerified && styles.kycStatusTextVerified,
                      isUnderReview && styles.kycStatusTextReview,
                      isRejected && styles.kycStatusTextRejected,
                    ]}
                  >
                    {isVerified
                      ? '✓ Verified'
                      : isUnderReview
                      ? '⏳ Under Review'
                      : isRejected
                      ? '⚠ Needs Correction'
                      : 'Not Uploaded'}
                  </Text>
                </View>
              </View>

              {/* Document Rejection Explanation (Point 24) */}
              {isRejected && (
                <View style={styles.rejectionNoticeBox}>
                  <Text style={styles.rejectionReasonTitle}>Reason for Correction:</Text>
                  <Text style={styles.rejectionReasonText}>{doc.rejectionReason}</Text>
                  <Text style={styles.rejectionActionText}>
                    <Text style={{ fontWeight: '700' }}>Required Action:</Text> {doc.requiredAction}
                  </Text>
                </View>
              )}

              {/* Upload & Replace Actions (Point 22 & 24) */}
              <View style={styles.kycActionRow}>
                <TouchableOpacity
                  style={styles.kycUploadBtn}
                  onPress={() => {
                    const updated = [...kycDocs];
                    updated[idx].status = 'VERIFIED';
                    updated[idx].rejectionReason = undefined;
                    setKycDocs(updated);
                    Alert.alert('Document Updated', `${doc.title} re-uploaded successfully.`);
                  }}
                >
                  <Text style={styles.kycUploadBtnText}>
                    {isRejected ? '🔄 Replace Document' : isVerified ? '✓ document.jpg' : '📤 Upload Front / Back'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // STEP 8: Bank & Payout Details (Points 25 & 26)
  const renderStep8 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>25. Bank & Payout Details</Text>
      <Text style={styles.stepSubtitle}>
        Where should SevaZo deposit your delivery earnings, surge bonuses, and customer tips?
      </Text>

      {/* Payout Method Selector */}
      <View style={styles.payoutMethodRow}>
        <TouchableOpacity
          style={[styles.payoutCard, preferredPayout === 'BANK_ACCOUNT' && styles.payoutCardActive]}
          onPress={() => setPreferredPayout('BANK_ACCOUNT')}
        >
          <Text style={styles.payoutIcon}>🏦</Text>
          <Text style={[styles.payoutTitle, preferredPayout === 'BANK_ACCOUNT' && styles.payoutTitleActive]}>
            Direct Bank Transfer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payoutCard, preferredPayout === 'UPI' && styles.payoutCardActive]}
          onPress={() => setPreferredPayout('UPI')}
        >
          <Text style={styles.payoutIcon}>⚡</Text>
          <Text style={[styles.payoutTitle, preferredPayout === 'UPI' && styles.payoutTitleActive]}>
            Instant UPI Payout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Account Holder Legal Name *</Text>
        <TextInput
          style={styles.input}
          value={accountHolder}
          onChangeText={setAccountHolder}
          placeholder="Name as per Bank Passbook"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Bank Account Number *</Text>
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="e.g. 50100234564582"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          secureTextEntry
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Account Number *</Text>
        <TextInput
          style={styles.input}
          value={confirmAccount}
          onChangeText={setConfirmAccount}
          placeholder="Re-enter Bank Account Number"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.rowTwo}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>IFSC Code *</Text>
          <TextInput
            style={[styles.input, styles.plateInput]}
            value={ifsc}
            onChangeText={(t) => setIfsc(t.toUpperCase())}
            placeholder="HDFC0001234"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="HDFC Bank"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>UPI ID (Optional for instant settlements)</Text>
        <TextInput
          style={styles.input}
          value={upiId}
          onChangeText={setUpiId}
          placeholder="username@okhdfcbank"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
        />
      </View>

      {/* Point 26: Bank Security Masking Card */}
      <View style={styles.bankSecurityCard}>
        <Text style={styles.bankSecurityTitle}>🔒 Bank Security & Protection</Text>
        <Text style={styles.bankSecurityText}>
          Saved account is masked as <Text style={{ fontWeight: '700' }}>XXXX XXXX {accountNumber.slice(-4)} (Verified ✓)</Text>. Full bank details are encrypted and never shown in plain text.
        </Text>
      </View>
    </View>
  );

  // STEP 9: Preferred Service Area (Point 27)
  const renderStep9 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>27. Preferred Service Area</Text>
      <Text style={styles.stepSubtitle}>
        Select your operating city and target delivery clusters.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Operating City *</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={selectedCity}
          editable={false}
        />
      </View>

      <Text style={[styles.label, { marginTop: 8 }]}>Preferred Operating Zones (Multi-Select):</Text>

      {AVAILABLE_ZONES_JAIPUR.map((zone) => {
        const isSelected = selectedZones.includes(zone);
        return (
          <TouchableOpacity
            key={zone}
            style={[styles.zoneCard, isSelected && styles.zoneCardActive]}
            onPress={() => toggleZone(zone)}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.zoneText, isSelected && styles.zoneTextActive]}>{zone}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.dispatchNoticeCard}>
        <Text style={styles.dispatchNoticeTitle}>⚖️ Dispatch Authority Notice</Text>
        <Text style={styles.dispatchNoticeText}>
          Rider zone preferences guide priority routing; however, SevaZo automated dispatch engine remains authoritative based on real-time citywide demand.
        </Text>
      </View>
    </View>
  );

  // STEP 10: Delivery Preferences & Working Availability (Points 28 & 29)
  const renderStep10 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>28. Delivery Preferences & Hours</Text>
      <Text style={styles.stepSubtitle}>
        Set your delivery preferences and optional preferred working slots.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Maximum Preferred Distance: {maxDistance} km</Text>
        <View style={styles.distancePillsRow}>
          {[3, 5, 8, 10, 12, 15].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.distPill, maxDistance === d && styles.distPillActive]}
              onPress={() => setMaxDistance(d)}
            >
              <Text style={[styles.distPillText, maxDistance === d && styles.distPillTextActive]}>
                {d} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Order Categories Willingness:</Text>
      {DELIVERY_CATEGORIES.map((cat) => {
        const isSelected = selectedCategories.includes(cat.id);
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.zoneCard, isSelected && styles.zoneCardActive]}
            onPress={() => toggleCategory(cat.id)}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.zoneText, isSelected && styles.zoneTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      {/* Point 29: Preferred Working Hours (Optional / Dashboard Controlled) */}
      <Text style={styles.stepTitle}>29. Preferred Working Schedule</Text>
      <Text style={styles.stepSubtitle}>
        Select days you typically plan to deliver. Active status is toggled anytime from the Rider Dashboard.
      </Text>

      <View style={styles.daysRow}>
        {WORKING_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayPill, isSelected && styles.dayPillActive]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.dayPillText, isSelected && styles.dayPillTextActive]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preferred Time Slot</Text>
        <TextInput
          style={styles.input}
          value={workingShift}
          onChangeText={setWorkingShift}
          placeholder="09:00 AM – 06:00 PM"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.onlineWorkflowCard}>
        <Text style={styles.onlineWorkflowTitle}>🟢 Real-time Online Dispatch</Text>
        <Text style={styles.onlineWorkflowText}>
          Schedule is non-binding. To receive delivery orders, simply toggle <Text style={{ fontWeight: '700' }}>[ GO ONLINE ]</Text> on your Rider Dashboard when ready!
        </Text>
      </View>
    </View>
  );

  // STEP 11: Master Application Review (Point 30)
  const renderStep11 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>30. Review Your Application</Text>
      <Text style={styles.stepSubtitle}>
        Review all 10 sections before final submission for operations approval.
      </Text>

      {/* Section 1 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>1. Personal Information</Text>
          <TouchableOpacity onPress={() => setActiveStep(1)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>Name: {firstName} {lastName} ({gender}) • DOB: {dob}</Text>
        <Text style={styles.reviewItem}>Mobile: {phone} (Verified ✅)</Text>
      </View>

      {/* Section 2 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>2. Residential Address & GPS</Text>
          <TouchableOpacity onPress={() => setActiveStep(2)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>{addressLine1}, {locality}, {city}, {state} ({postalCode})</Text>
        <Text style={styles.reviewItem}>GPS: {latitude}° N, {longitude}° E</Text>
      </View>

      {/* Section 3 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>3. Emergency Contact</Text>
          <TouchableOpacity onPress={() => setActiveStep(3)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>{emergencyName} ({emergencyRelation}) • {emergencyPhone}</Text>
      </View>

      {/* Section 4 & 5 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>4 & 5. Vehicle Details</Text>
          <TouchableOpacity onPress={() => setActiveStep(4)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        {isBicycle ? (
          <Text style={styles.reviewItem}>Bicycle: {bicycleBrand} {bicycleModel} • {bicycleColor} (Exempted ✅)</Text>
        ) : (
          <Text style={styles.reviewItem}>{vehicleCategory} • {vehicleMake} {vehicleModel} ({registrationNumber})</Text>
        )}
      </View>

      {/* Section 6 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>6. Driving Licence</Text>
          <TouchableOpacity onPress={() => setActiveStep(6)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>
          {isBicycle ? 'DL Requirement Waived for Bicycle ✅' : `DL: ${dlNumber} (${dlState}) • Expiry: ${dlExpiryDate}`}
        </Text>
      </View>

      {/* Section 7 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>7. Identity Verification / KYC</Text>
          <TouchableOpacity onPress={() => setActiveStep(7)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>PAN & Govt ID: Uploaded & Verified ✅</Text>
      </View>

      {/* Section 8 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>8. Bank & Payout Details</Text>
          <TouchableOpacity onPress={() => setActiveStep(8)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>A/C: XXXX XXXX {accountNumber.slice(-4)} • {bankName} ({ifsc})</Text>
        <Text style={styles.reviewItem}>UPI: {upiId || 'Not provided'}</Text>
      </View>

      {/* Section 9 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>9. Service Area</Text>
          <TouchableOpacity onPress={() => setActiveStep(9)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>City: {selectedCity} • Zones: {selectedZones.join(', ')}</Text>
      </View>

      {/* Section 10 */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>10. Delivery Preferences & Schedule</Text>
          <TouchableOpacity onPress={() => setActiveStep(10)}><Text style={styles.editLink}>[ Edit ]</Text></TouchableOpacity>
        </View>
        <Text style={styles.reviewItem}>Radius: {maxDistance} km • Categories: {selectedCategories.join(', ')}</Text>
        <Text style={styles.reviewItem}>Days: {selectedDays.join(', ')} • {workingShift}</Text>
      </View>

      {/* Point 31: 6 Mandatory Agreements */}
      <View style={styles.agreementsBlock}>
        <Text style={styles.agreementsBlockTitle}>31. Agreements & Declarations</Text>
        <Text style={styles.agreementsBlockSubtitle}>
          Please confirm all declarations before submitting your application:
        </Text>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementAccurate(!agreementAccurate)}
        >
          <View style={[styles.checkbox, agreementAccurate && styles.checkboxActive]}>
            {agreementAccurate && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I confirm that the information provided is accurate.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementTerms(!agreementTerms)}
        >
          <View style={[styles.checkbox, agreementTerms && styles.checkboxActive]}>
            {agreementTerms && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I agree to SevaZo Rider Terms.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementPrivacy(!agreementPrivacy)}
        >
          <View style={[styles.checkbox, agreementPrivacy && styles.checkboxActive]}>
            {agreementPrivacy && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I agree to SevaZo Privacy Policy.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementRiderAgreement(!agreementRiderAgreement)}
        >
          <View style={[styles.checkbox, agreementRiderAgreement && styles.checkboxActive]}>
            {agreementRiderAgreement && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I agree to the Rider Agreement.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementVerifyAuth(!agreementVerifyAuth)}
        >
          <View style={[styles.checkbox, agreementVerifyAuth && styles.checkboxActive]}>
            {agreementVerifyAuth && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I authorize SevaZo to verify my submitted information.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementItemRow}
          onPress={() => setAgreementActivationNotice(!agreementActivationNotice)}
        >
          <View style={[styles.checkbox, agreementActivationNotice && styles.checkboxActive]}>
            {agreementActivationNotice && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.agreementItemText}>
            I understand that rider activation is subject to verification.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (activeStep > 1) {
              setActiveStep(activeStep - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Registration</Text>
        <TouchableOpacity
          onPress={() => handleNext(true)}
          style={styles.saveExitHeaderBtn}
        >
          <Text style={styles.saveExitHeaderText}>Save & Exit</Text>
        </TouchableOpacity>
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeStep === 1 && renderStep1()}
        {activeStep === 2 && renderStep2()}
        {activeStep === 3 && renderStep3()}
        {activeStep === 4 && renderStep4()}
        {activeStep === 5 && renderStep5()}
        {activeStep === 6 && renderStep6()}
        {activeStep === 7 && renderStep7()}
        {activeStep === 8 && renderStep8()}
        {activeStep === 9 && renderStep9()}
        {activeStep === 10 && renderStep10()}
        {activeStep === 11 && renderStep11()}
      </ScrollView>

      {/* Floating Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveExitBtn}
          onPress={() => handleNext(true)}
          disabled={isLoading}
        >
          <Text style={styles.saveExitBtnText}>Save & Exit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveContinueBtn}
          onPress={() => handleNext(false)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveContinueBtnText}>
              {activeStep === TOTAL_STEPS ? 'Submit for Verification' : 'Save & Continue ➔'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Point 32: Submit Confirmation Modal */}
      <Modal visible={confirmSubmitModalVisible} transparent animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.confirmModalIconWrap}>
              <Text style={styles.confirmModalIcon}>📋</Text>
            </View>
            <Text style={styles.confirmModalTitle}>Submit Application</Text>
            <Text style={styles.confirmModalDesc}>
              Once submitted, your documents and information will be reviewed. Some information may not be editable while verification is in progress.
            </Text>

            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmSubmitModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitConfirmBtn}
                onPress={handleFinalSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitConfirmBtnText}>
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Picker Modal */}
      <Modal visible={photoPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Profile Photo</Text>
            <Text style={styles.modalSub}>Select an option to update your profile photo</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectPhoto('camera')}
            >
              <Text style={styles.modalOptionIcon}>📸</Text>
              <Text style={styles.modalOptionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectPhoto('gallery')}
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Choose from Photo Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setPhotoPickerVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Point 31: Agreements Styles
  agreementsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  agreementsBlockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  agreementsBlockSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  agreementItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  agreementItemText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  // Point 32: Submit Modal Styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmModalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmModalIcon: {
    fontSize: 28,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmModalDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  submitConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#059669',
  },
  submitConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  saveExitHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  saveExitHeaderText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  indicatorContainer: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dotsRowScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: '#059669',
  },
  dotCurrent: {
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  dotText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  dotTextActive: {
    color: '#FFFFFF',
  },
  dotLine: {
    width: 12,
    height: 2,
    backgroundColor: '#334155',
  },
  dotLineCompleted: {
    backgroundColor: '#059669',
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepInfoText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  stepInfoPercent: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  // Step 1
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#059669',
  },
  photoPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 28,
    color: '#64748B',
  },
  photoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  photoHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  photoHelp: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  photoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  photoBtnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  photoBtnTextSecondary: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  plateInput: {
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  rowTwo: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
  },
  pillSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // Location
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  locationDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  coordsBadge: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    marginTop: 4,
  },
  locationArrow: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
  },
  // Privacy
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
  // Vehicle
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vehicleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  vehicleCardActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  vehicleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  vehicleLabelActive: {
    color: '#059669',
  },
  vehicleSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  ownershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  ownershipCardActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#059669',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#059669',
  },
  ownershipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  ownershipTitleActive: {
    color: '#065F46',
  },
  ownershipDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // Bicycle
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  ecoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  ecoDesc: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  docNoticeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  docNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  docNoticeText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  docUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  docUploadInfo: {
    flex: 1,
  },
  docUploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  docUploadSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  uploadPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0F172A',
    borderRadius: 16,
  },
  uploadPillDone: {
    backgroundColor: '#DCFCE7',
  },
  uploadPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadPillTextDone: {
    color: '#15803D',
  },
  bicycleSuccessCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  bicycleSuccessTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },
  bicycleSuccessDesc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  compliantBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  compliantText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
  },
  dlPhotoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  dlBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dlBoxDone: {
    borderColor: '#059669',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  dlBoxIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  dlBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  dlBoxStatus: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  dlBoxStatusDone: {
    color: '#059669',
  },
  securityCheckNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityCheckText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  // Step 7 KYC
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  kycCardVerified: {
    borderColor: '#86EFAC',
  },
  kycCardRejected: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  kycDocType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  kycDocNumber: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  kycStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  kycStatusVerified: {
    backgroundColor: '#DCFCE7',
  },
  kycStatusReview: {
    backgroundColor: '#FEF3C7',
  },
  kycStatusRejected: {
    backgroundColor: '#FEE2E2',
  },
  kycStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  kycStatusTextVerified: {
    color: '#15803D',
  },
  kycStatusTextReview: {
    color: '#B45309',
  },
  kycStatusTextRejected: {
    color: '#B91C1C',
  },
  rejectionNoticeBox: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  rejectionReasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE123C',
    marginBottom: 2,
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#881337',
    marginBottom: 4,
  },
  rejectionActionText: {
    fontSize: 12,
    color: '#9F1239',
  },
  kycActionRow: {
    flexDirection: 'row',
  },
  kycUploadBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  kycUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Step 8 Bank
  payoutMethodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  payoutCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  payoutCardActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  payoutIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  payoutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  payoutTitleActive: {
    color: '#065F46',
  },
  bankSecurityCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  bankSecurityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bankSecurityText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  // Step 9 & 10
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  zoneCardActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 10,
  },
  zoneTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  dispatchNoticeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  dispatchNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  dispatchNoticeText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  distancePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  distPill: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  distPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  distPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  distPillTextActive: {
    color: '#FFFFFF',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  onlineWorkflowCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  onlineWorkflowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  onlineWorkflowText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  // Step 11 Review
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  reviewItem: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginLeft: 10,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  saveExitBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveExitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  saveContinueBtn: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveContinueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
});
