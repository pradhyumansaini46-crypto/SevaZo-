export type DeliveryStatus =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNMENT_OFFERED'
  | 'RIDER_ACCEPTED'
  | 'RIDER_AT_VENDOR'
  | 'PICKUP_VERIFIED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'RIDER_AT_CUSTOMER'
  | 'DELIVERY_VERIFIED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETURN_REQUIRED'
  | 'RETURNED';

export type SectionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type OnboardingStatus =
  | 'NO_ACCOUNT'
  | 'LOGGED_OUT'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type NextAction =
  | 'OPEN_WELCOME'
  | 'OPEN_LOGIN'
  | 'RESUME_REGISTRATION'
  | 'OPEN_VERIFICATION_STATUS'
  | 'OPEN_HOME'
  | 'OPEN_CORRECTION'
  | 'OPEN_SUSPENDED'
  | 'OPEN_SUPPORT';

export type VehicleCategory =
  | 'MOTORCYCLE'
  | 'SCOOTER'
  | 'BICYCLE'
  | 'ELECTRIC_BIKE'
  | 'CAR'
  | 'THREE_WHEELER'
  | 'OTHER';

export type VehicleOwnership = 'SELF' | 'COMPANY' | 'FAMILY' | 'RENTED_LEASED';

export type BicycleType = 'STANDARD' | 'ELECTRIC' | 'CARGO';

export type KycDocumentType = 'GOVERNMENT_ID' | 'PAN' | 'ADDRESS_PROOF' | 'OTHER_APPROVED_ID';

export type KycDocumentStatus =
  | 'NOT_UPLOADED'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export type PreferredPayoutMethod = 'BANK_ACCOUNT' | 'UPI';

export interface KycDocumentItem {
  id: string;
  type: KycDocumentType;
  title: string;
  documentNumber: string;
  frontUrl?: string;
  backUrl?: string;
  status: KycDocumentStatus;
  rejectionReason?: string;
  requiredAction?: string;
}

export interface RiderOnboardingData {
  currentStep: number;
  completedSteps: number[];
  completionPercentage: number;
  status: OnboardingStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  draftData: {
    // Step 1: Personal Details & Profile Photo (Points 10, 11)
    step1?: {
      firstName?: string;
      lastName?: string;
      profilePhoto?: string;
      dob?: string;
      gender?: string;
      phone?: string;
      email?: string;
    };
    // Step 2: Residential Address & GPS (Point 12)
    step2?: {
      addressLine1?: string;
      addressLine2?: string;
      locality?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      pincode?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
    // Step 3: Emergency Contact (Point 13)
    step3?: {
      emergencyContactName?: string;
      emergencyContactRelation?: string;
      emergencyContactPhone?: string;
    };
    // Step 4: Vehicle Type & Ownership (Points 14, 15)
    step4?: {
      vehicleCategory?: VehicleCategory;
      vehicleOwnership?: VehicleOwnership;
    };
    // Step 5: Vehicle Details (Points 16, 17, 18)
    step5?: {
      make?: string;
      model?: string;
      year?: string;
      color?: string;
      registrationNumber?: string;
      rcDocUrl?: string;
      insuranceDocUrl?: string;
      pucDocUrl?: string;
      isBicycle?: boolean;
      bicycleType?: BicycleType;
      bicycleBrand?: string;
      bicycleModel?: string;
      bicycleColor?: string;
      bicyclePurchaseYear?: string;
    };
    // Step 6: Driving Licence (Points 19, 20)
    step6?: {
      isBicycle?: boolean;
      isDlRequired?: boolean;
      dlNumber?: string;
      dlState?: string;
      dlIssueDate?: string;
      dlExpiryDate?: string;
      dlFrontUrl?: string;
      dlBackUrl?: string;
    };
    // Step 7: Identity Verification & KYC Documents (Points 21, 22, 23, 24)
    step7?: {
      panNumber?: string;
      aadhaarNumber?: string;
      documents?: KycDocumentItem[];
    };
    // Step 8: Bank & Payout Details (Points 25, 26)
    step8?: {
      accountHolderName?: string;
      bankAccountNumber?: string;
      confirmAccountNumber?: string;
      maskedAccountNumber?: string;
      ifsc?: string;
      bankName?: string;
      upiId?: string;
      preferredPayoutMethod?: PreferredPayoutMethod;
      isVerified?: boolean;
    };
    // Step 9: Service Area (Point 27)
    step9?: {
      city?: string;
      preferredZones?: string[];
    };
    // Step 10: Delivery Preferences & Working Hours (Points 28, 29)
    step10?: {
      maxDistanceKm?: number;
      preferredCategories?: string[];
      workingDays?: string[];
      workingHoursSlot?: string;
    };
    // Step 11: Master Application Review & Agreements (Point 30)
    step11?: {
      termsAccepted?: boolean;
      termsAcceptedAt?: string;
    };
  };
}

export interface RiderUser {
  id: string;
  applicationId?: string;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  status: string;
  approvalStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  operationalStatus?: 'OFFLINE' | 'ONLINE' | 'BUSY' | 'ON_DELIVERY' | 'SUSPENDED';
  isOnline: boolean;
  rating: number;
  totalEarnings: number;
  walletBalance: number;
  deliveriesCount: number;
  vehicleType?: string;
  vehicleNumber?: string;
  onboarding?: RiderOnboardingData;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  pickupOtp?: string;
  deliveryOtp?: string;
  distanceKm: number;
  estimatedMinutes: number;
  deliveryFee: number;
  riderEarning: number;
  vendor: {
    name: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  };
  items: DeliveryItem[];
  createdAt: string;
}

export interface AssignmentOffer {
  id: string;
  deliveryId: string;
  distanceToStoreKm: number;
  totalTripKm: number;
  estimatedMinutes: number;
  estimatedEarnings: number;
  expiresInSeconds: number;
  vendorName: string;
  vendorAddress: string;
  customerAddress: string;
  itemsCount: number;
}

export interface EarningsSummary {
  walletBalance: number;
  totalLifetimeEarnings: number;
  totalDeliveries: number;
  today: {
    amount: number;
    tripsCount: number;
  };
  thisWeek: {
    amount: number;
    tripsCount: number;
  };
}

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { phone: string; email?: string; isRegister?: boolean };
  OnboardingResume: undefined;
  OnboardingPersonal: undefined;
  OnboardingAddress: undefined;
  OnboardingEmergencyContact: undefined;
  OnboardingVehicle: undefined;
  OnboardingIdentity: undefined;
  OnboardingDrivingLicence: undefined;
  OnboardingVehicleDocuments: undefined;
  OnboardingBanking: undefined;
  OnboardingServiceArea: undefined;
  OnboardingPreferences: undefined;
  OnboardingAvailability: undefined;
  OnboardingReview: undefined;
  OnboardingWizard: { initialStep?: number } | undefined;
  ApplicationSubmitted: { applicationId?: string } | undefined;
  ApplicationStatus: undefined;
  Correction: { rejectionReason?: string; correctionItems?: any[] } | undefined;
  Approved: undefined;
  Suspended: undefined;
  Deactivated: undefined;
  Main: undefined;
  DeliveryDetails: { deliveryId: string };
  Navigation: { deliveryId: string };
  Pickup: { deliveryId: string };
  PickupVerification: { deliveryId: string };
  CustomerDelivery: { deliveryId: string };
  DeliveryProof: { deliveryId: string };
  DeliveryComplete: { deliveryId: string; earnings: number };
  Support: undefined;
  Notifications: undefined;
  Settings: undefined;
};
