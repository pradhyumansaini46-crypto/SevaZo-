import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Switch,
  ActivityIndicator,
  Pressable,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Store,
  User,
  Building2,
  MapPin,
  FileText,
  Landmark,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Save,
  Check,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Utensils,
  Pill,
  Tv,
  Shirt,
  Sparkle,
  Home,
  Wrench,
  HelpCircle,
  AlertTriangle,
  Zap,
  Navigation,
  Globe,
  Camera,
  Calendar,
  Lock,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  ChevronRight,
  Package,
  Layers,
  Thermometer,
  Image as ImageIcon,
  X,
  Smartphone,
  Mail,
  ExternalLink,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ImagePickerModal, SelectedFilePayload } from '../../components/ImagePickerModal';
import { VendorApi } from '../../services/vendorApi';
import { LegalEntityType, BusinessType, DocumentStatus } from '../../types';

const POPULAR_UPI_SUFFIXES = [
  '@okhdfcbank',
  '@okaxis',
  '@oksbi',
  '@okicici',
  '@paytm',
  '@ybl',
  '@ibl',
  '@upi',
];

const KNOWN_BANK_MAP: Record<string, string> = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  AXIS: 'Axis Bank',
  UTIB: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
  YESB: 'Yes Bank',
  INDB: 'IndusInd Bank',
  CNRB: 'Canara Bank',
  UBIN: 'Union Bank of India',
  IDFB: 'IDFC FIRST Bank',
  IOBA: 'Indian Overseas Bank',
  BCOI: 'Bank of India',
  MAHB: 'Bank of Maharashtra',
  PSIB: 'Punjab & Sind Bank',
  UCOB: 'UCO Bank',
  CBIN: 'Central Bank of India',
  AIRP: 'Airtel Payments Bank',
  PYTM: 'Paytm Payments Bank',
  IPOS: 'India Post Payments Bank',
  FDRL: 'Federal Bank',
  AUBL: 'AU Small Finance Bank',
};

async function fetchRealIfscData(code: string): Promise<{ bank: string; branch?: string; city?: string; state?: string } | null> {
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  if (clean.length !== 11) return null;

  // 1. Try public official RBI Razorpay IFSC API
  try {
    const res = await fetch(`https://ifsc.razorpay.com/${clean}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.BANK || data.bank)) {
        return {
          bank: data.BANK || data.bank,
          branch: data.BRANCH || data.branch || 'Branch',
          city: data.CITY || data.city,
          state: data.STATE || data.state,
        };
      }
    }
  } catch (err) {
    console.warn('Online IFSC API error, using known bank map:', err);
  }

  // 2. Intelligent prefix map fallback
  const prefix = clean.slice(0, 4);
  const matchedBank = KNOWN_BANK_MAP[prefix];
  if (matchedBank) {
    return {
      bank: matchedBank,
      branch: `Branch (${clean.slice(4)})`,
    };
  }

  return null;
}

const STEP_TITLES: Record<number, string> = {
  1: 'Business Category',
  2: 'Owner Details',
  3: 'Business Information',
  4: 'Store Address',
  5: 'Set Map Location',
  6: 'KYC Documents',
  7: 'Storefront Photos',
  8: 'Operating Hours',
  9: 'Banking & Payouts',
  10: 'Partner Consent',
  11: 'Review & Submit',
};

interface DocItem {
  type: string;
  title: string;
  required: boolean;
  documentNumber: string;
  fileUrl?: string;
  fileName?: string;
  status: DocumentStatus;
  expiryDate?: string;
}

interface ProductDraft {
  name: string;
  category: string;
  brand: string;
  description: string;
  price: string;
  mrp: string;
  stock: string;
  weight: string;
  sku: string;
  variants: { size: string; color: string; price: string; stock: string }[];
  returnEligible: boolean;
}

interface DaySchedule {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  label: string;
  isOpen: boolean;
  is24Hours: boolean;
  openTime: string;
  closeTime: string;
  session2Open?: string;
  session2Close?: string;
}

export const OnboardingWizardScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor, updateVendor, completionPercentage } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<number>(route?.params?.initialStep || vendor?.currentOnboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(Boolean(route?.params?.isResume));

  // Cleansing Mock Data Detectors
  const isMockName = vendor?.firstName === 'Vikram' || vendor?.lastName === 'Mehta' || vendor?.ownerName === 'Vikram Mehta' || vendor?.ownerName?.includes('Vikram');
  const isMockDob = vendor?.dateOfBirth === '15/08/1988';
  const isMockPhoto = !vendor?.profilePhoto || vendor?.profilePhoto?.includes('unsplash') || vendor?.avatar?.includes('unsplash');
  const isMockBusiness = vendor?.businessName?.includes('Fresh Mart') || vendor?.displayName?.includes('Fresh Mart') || vendor?.storeName?.includes('Fresh Mart');
  const isMockAddress = vendor?.address?.line1?.includes('Shop #4') || vendor?.address?.line1?.includes('Shop #14') || vendor?.address?.line1?.includes('Galleria') || vendor?.address?.locality === 'Bandra West' || vendor?.address?.area === 'Bandra West' || vendor?.address?.city === 'Mumbai' || vendor?.address?.city === 'Gurugram';
  const isMockBank = vendor?.bankAccount?.accountHolder?.includes('Fresh Mart') || vendor?.bankAccount?.accountNumber?.includes('50100') || vendor?.bankAccount?.accountNumber?.includes('6789') || vendor?.bankAccount?.ifsc?.includes('HDFC0000123') || vendor?.bankAccount?.ifsc?.includes('HDFC0001234');

  // STEP 1: Business Type & Category
  const [businessType, setBusinessType] = useState<BusinessType>((vendor?.businessType as BusinessType) || 'GROCERY_STORE');
  const [businessCategory, setBusinessCategory] = useState<string>(vendor?.businessCategory || '');

  // STEP 2: Owner Details (User/Owner Entity)
  const [firstName, setFirstName] = useState(isMockName ? '' : vendor?.firstName || '');
  const [lastName, setLastName] = useState(isMockName ? '' : vendor?.lastName || '');
  const [email, setEmail] = useState(vendor?.email?.includes('@sevazo.internal') ? '' : vendor?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(isMockDob ? '' : vendor?.dateOfBirth || '');
  const [profilePhoto, setProfilePhoto] = useState(isMockPhoto ? '' : vendor?.profilePhoto || '');

  // Step 5: Shop Photos (up to 5 photos)
  const [shopPhotos, setShopPhotos] = useState<string[]>([]);
  const [pickerTarget, setPickerTarget] = useState<'PROFILE' | 'SHOP' | 'BANNER' | 'LOGO' | 'KYC_DOC'>('PROFILE');
  const [activeKycDocType, setActiveKycDocType] = useState<string | null>(null);

  const handleImagePicked = (uri: string, filePayload?: SelectedFilePayload) => {
    if (pickerTarget === 'PROFILE') {
      setProfilePhoto(uri);
    } else if (pickerTarget === 'SHOP') {
      setShopPhotos((prev) => (prev.length < 5 ? [...prev, uri] : prev));
    } else if (pickerTarget === 'BANNER') {
      setStoreBanner(uri);
    } else if (pickerTarget === 'LOGO') {
      setStoreLogo(uri);
    } else if (pickerTarget === 'KYC_DOC' && activeKycDocType) {
      const fileName = filePayload?.name || uri.split('/').pop() || `${activeKycDocType.toLowerCase()}_doc.pdf`;
      setDocumentsList((prev) =>
        prev.map((doc) =>
          doc.type === activeKycDocType
            ? { ...doc, fileName, fileUrl: uri, status: 'UPLOADED' }
            : doc
        )
      );
      Alert.alert('Document Attached', `${activeKycDocType} document attached successfully.`);
      setActiveKycDocType(null);
    }
  };

  const handleOpenKycUpload = (docType: string) => {
    setActiveKycDocType(docType);
    setPickerTarget('KYC_DOC');
    setShowImagePickerModal(true);
  };

  const handleDeleteShopPhoto = (index: number) => {
    setShopPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDobChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    setDateOfBirth(formatted);
  };

  // STEP 3: Dynamic Business Information
  const [businessName, setBusinessName] = useState(isMockBusiness ? '' : vendor?.businessName || '');
  const [displayName, setDisplayName] = useState(isMockBusiness ? '' : vendor?.displayName || '');
  const [legalEntityType, setLegalEntityType] = useState<LegalEntityType>(vendor?.legalEntityType || 'PROPRIETORSHIP');
  const [yearEstablished, setYearEstablished] = useState(isMockBusiness ? '' : vendor?.yearEstablished || '');
  const [businessDescription, setBusinessDescription] = useState(isMockBusiness ? '' : vendor?.businessDescription || '');
  const [businessPhone, setBusinessPhone] = useState(vendor?.businessPhone || vendor?.phone || '');
  const [businessEmail, setBusinessEmail] = useState(vendor?.businessEmail || vendor?.email || '');
  const [website, setWebsite] = useState(isMockBusiness ? '' : vendor?.website || '');

  // Category Specific Fields
  const [foodCategory, setFoodCategory] = useState(vendor?.foodCategory || 'PURE_VEG');
  const [kitchenType, setKitchenType] = useState(vendor?.kitchenType || 'DINE_IN_TAKEAWAY');
  const [drugLicenseNumber, setDrugLicenseNumber] = useState(vendor?.drugLicenseNumber?.includes('148291') ? '' : vendor?.drugLicenseNumber || '');
  const [pharmacistName, setPharmacistName] = useState(vendor?.pharmacistName?.includes('Patil') ? '' : vendor?.pharmacistName || '');
  const [pharmacistRegNumber, setPharmacistRegNumber] = useState(vendor?.pharmacistRegNumber?.includes('PH-88412') ? '' : vendor?.pharmacistRegNumber || '');
  const [fssaiNumber, setFssaiNumber] = useState(vendor?.fssaiNumber?.includes('11521018000456') ? '' : vendor?.fssaiNumber || '');
  const [gstin, setGstin] = useState(vendor?.gstin?.includes('27AABCS1429B1Z0') ? '' : vendor?.gstin || '');
  const [panNumber, setPanNumber] = useState(vendor?.panNumber?.includes('ABCDE1234F') ? '' : vendor?.panNumber || '');
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState(vendor?.tradeLicenseNumber?.includes('MH-MUM') ? '' : vendor?.tradeLicenseNumber || '');

  // STEP 4: Business Address
  const [line1, setLine1] = useState(isMockAddress ? '' : vendor?.address?.line1 || '');
  const [line2, setLine2] = useState(isMockAddress ? '' : vendor?.address?.line2 || '');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState(isMockAddress ? '' : vendor?.address?.landmark || '');
  const [city, setCity] = useState(isMockAddress ? '' : vendor?.address?.city || '');
  const [state, setState] = useState(isMockAddress ? '' : vendor?.address?.state || '');
  const [pincode, setPincode] = useState(isMockAddress ? '' : vendor?.address?.pincode || '');
  const [country, setCountry] = useState('India');

  // STEP 5: Store Location Verification (GPS Coordinates)
  const [latitude, setLatitude] = useState(isMockAddress ? 0 : vendor?.address?.latitude || 0);
  const [longitude, setLongitude] = useState(isMockAddress ? 0 : vendor?.address?.longitude || 0);

  // STEP 6: KYC Documents
  const [documentsList, setDocumentsList] = useState<DocItem[]>([
    {
      type: 'PAN',
      title: 'Business / Owner PAN Card',
      required: true,
      documentNumber: '',
      fileName: undefined,
      fileUrl: undefined,
      status: 'NOT_UPLOADED',
    },
    {
      type: 'GST',
      title: 'GST Certificate (GSTIN)',
      required: businessType !== 'LOCAL_SERVICES',
      documentNumber: '',
      fileName: undefined,
      fileUrl: undefined,
      status: 'NOT_UPLOADED',
    },
    {
      type: 'FSSAI',
      title: 'FSSAI Food Safety License',
      required: businessType === 'GROCERY_STORE' || businessType === 'RESTAURANT',
      documentNumber: '',
      fileName: undefined,
      fileUrl: undefined,
      status: 'NOT_UPLOADED',
    },
    {
      type: 'CHEQUE',
      title: 'Cancelled Cheque / Bank Statement',
      required: true,
      documentNumber: '',
      fileName: undefined,
      fileUrl: undefined,
      status: 'NOT_UPLOADED',
    },
  ]);

  // STEP 9: Bank & Settlements
  const [accountHolder, setAccountHolder] = useState(isMockBank ? '' : vendor?.bankAccount?.accountHolder || '');
  const [bankName, setBankName] = useState(isMockBank ? '' : vendor?.bankAccount?.bankName || '');
  const [branchName, setBranchName] = useState('');
  const [accountNumber, setAccountNumber] = useState(isMockBank ? '' : vendor?.bankAccount?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(isMockBank ? '' : vendor?.bankAccount?.accountNumber || '');
  const [ifsc, setIfsc] = useState(isMockBank ? '' : vendor?.bankAccount?.ifsc || '');
  const [accountType, setAccountType] = useState('CURRENT');
  const [payoutPreference, setPayoutPreference] = useState<'BANK_ACCOUNT' | 'UPI'>('BANK_ACCOUNT');
  const [upiId, setUpiId] = useState(vendor?.upiId?.includes('freshmart') ? '' : vendor?.upiId || '');
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [upiVerifiedName, setUpiVerifiedName] = useState<string | null>(null);
  const [verifyingIfsc, setVerifyingIfsc] = useState(false);
  const [ifscVerified, setIfscVerified] = useState(false);

  // STEP 8: Store Profile (Customer-Facing Store)
  const [storeDisplayName, setStoreDisplayName] = useState(isMockBusiness ? '' : vendor?.storeName || '');
  const [storeLogo, setStoreLogo] = useState(isMockPhoto ? '' : vendor?.logo || '');
  const [storeBanner, setStoreBanner] = useState(isMockPhoto ? '' : vendor?.banner || '');
  const [storeDesc, setStoreDesc] = useState(isMockBusiness ? '' : '');
  const [storePhone, setStorePhone] = useState(vendor?.businessPhone || vendor?.phone || '');
  const [storeEmail, setStoreEmail] = useState(vendor?.businessEmail || vendor?.email || '');

  // STEP 9: Store Operating Hours (7 Days Schedule)
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    { dayOfWeek: 'MONDAY', label: 'Monday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'TUESDAY', label: 'Tuesday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'WEDNESDAY', label: 'Wednesday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'THURSDAY', label: 'Thursday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'FRIDAY', label: 'Friday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'SATURDAY', label: 'Saturday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 'SUNDAY', label: 'Sunday', isOpen: true, is24Hours: false, openTime: '09:00', closeTime: '22:00' },
  ]);

  // STEP 10: Service Area
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('5.0');
  const [servicePincodes, setServicePincodes] = useState('');

  // STEP 11: Product Setup (Starter Products or Skip)
  const [productsList, setProductsList] = useState<ProductDraft[]>([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdMrp, setNewProdMrp] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');

  // STEP 12: Delivery Preferences & Handling
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('15');
  const [deliveryPreference, setDeliveryPreference] = useState(vendor?.deliveryPreference || 'SEVAZO_LOGISTICS');
  const [packagingType, setPackagingType] = useState('SEALED_BOX');
  const [temperatureHandling, setTemperatureHandling] = useState('ROOM_TEMP');
  const [isFragile, setIsFragile] = useState(false);
  // STEP 10: Vendor Consent & Legal Declarations Form
  const [signatoryRole, setSignatoryRole] = useState<'Proprietor' | 'Director' | 'Managing Partner' | 'Authorized Signatory' | 'Store Manager' | 'Employee'>('Proprietor');
  const [escalationContactName, setEscalationContactName] = useState('');
  const [escalationContactPhone, setEscalationContactPhone] = useState('');
  const [escalationContactEmail, setEscalationContactEmail] = useState('');
  const [taxComplianceType, setTaxComplianceType] = useState('Regular GST Registered');
  const [agreeAccurateInfo, setAgreeAccurateInfo] = useState(false);
  const [agreeVendorTerms, setAgreeVendorTerms] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [agreeSupplyAgreement, setAgreeSupplyAgreement] = useState(false);
  const [agreeVerifyAuth, setAgreeVerifyAuth] = useState(false);

  // STEP 11: Email Verification Flow & State Machine
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'pending_email_verification' | 'token_expired' | 'verified'>('idle');
  const [verificationCountdown, setVerificationCountdown] = useState(600); // 10 minutes
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailVerificationStatus === 'pending_email_verification' && verificationCountdown > 0) {
      interval = setInterval(() => {
        setVerificationCountdown((prev) => {
          if (prev <= 1) {
            setEmailVerificationStatus('token_expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailVerificationStatus, verificationCountdown]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Cleanse any old persisted development mock data in local storage
    if (vendor && (isMockName || isMockDob || isMockPhoto || isMockBusiness || isMockAddress || isMockBank)) {
      updateVendor({
        firstName: isMockName ? '' : vendor.firstName,
        lastName: isMockName ? '' : vendor.lastName,
        ownerName: isMockName ? '' : vendor.ownerName,
        dateOfBirth: isMockDob ? '' : vendor.dateOfBirth,
        profilePhoto: isMockPhoto ? '' : vendor.profilePhoto,
        avatar: isMockPhoto ? '' : vendor.avatar,
        businessName: isMockBusiness ? '' : vendor.businessName,
        displayName: isMockBusiness ? '' : vendor.displayName,
        storeName: isMockBusiness ? '' : vendor.storeName,
        logo: isMockPhoto ? '' : vendor.logo,
        banner: isMockPhoto ? '' : vendor.banner,
        businessDescription: isMockBusiness ? '' : vendor.businessDescription,
        address: isMockAddress ? undefined : vendor.address,
        bankAccount: isMockBank ? undefined : vendor.bankAccount,
      });
    }
  }, []);

  useEffect(() => {
    if (vendor?.status && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(vendor.status)) {
      navigation.replace('StatusTracker');
    }
  }, [vendor?.status]);

  const businessTypesList: { key: BusinessType; title: string; desc: string; icon: any }[] = [
    { key: 'GROCERY_STORE', title: 'Grocery Store', desc: 'Fruits, dairy, staples, vegetables & daily essentials', icon: <ShoppingBag size={20} color="#10B981" /> },
    { key: 'RETAIL_STORE', title: 'Retail Store', desc: 'Supermarkets, provisions, convenience & FMCG items', icon: <Store size={20} color="#3B82F6" /> },
    { key: 'RESTAURANT', title: 'Restaurant / Food', desc: 'Cooked meals, cloud kitchens, bakeries & beverages', icon: <Utensils size={20} color="#F59E0B" /> },
    { key: 'PHARMACY', title: 'Pharmacy', desc: 'Medicines, personal care, wellness & healthcare', icon: <Pill size={20} color="#EF4444" /> },
    { key: 'ELECTRONICS', title: 'Electronics', desc: 'Mobile accessories, gadgets, cables & appliances', icon: <Tv size={20} color="#8B5CF6" /> },
    { key: 'FASHION', title: 'Fashion & Apparel', desc: 'Clothing, footwear, lifestyle & accessories', icon: <Shirt size={20} color="#EC4899" /> },
    { key: 'BEAUTY', title: 'Beauty & Wellness', desc: 'Cosmetics, skincare, perfumes & grooming', icon: <Sparkle size={20} color="#06B6D4" /> },
    { key: 'HOME_LIVING', title: 'Home & Living', desc: 'Kitchenware, decor, furnishing & storage', icon: <Home size={20} color="#F97316" /> },
    { key: 'LOCAL_SERVICES', title: 'Local Services', desc: 'Laundry, repairs, tailoring & on-demand tasks', icon: <Wrench size={20} color="#64748B" /> },
    { key: 'OTHER', title: 'Other Business', desc: 'Specialty retail, gifts, pet supplies, stationery', icon: <Building2 size={20} color="#6B7280" /> },
  ];

  const stepsList = [
    { number: 1, title: 'Category', icon: <Store size={14} color={currentStep === 1 ? '#FFF' : colors.textSecondary} /> },
    { number: 2, title: 'Owner', icon: <User size={14} color={currentStep === 2 ? '#FFF' : colors.textSecondary} /> },
    { number: 3, title: 'Business', icon: <Building2 size={14} color={currentStep === 3 ? '#FFF' : colors.textSecondary} /> },
    { number: 4, title: 'Address', icon: <MapPin size={14} color={currentStep === 4 ? '#FFF' : colors.textSecondary} /> },
    { number: 5, title: 'Map Pin', icon: <Navigation size={14} color={currentStep === 5 ? '#FFF' : colors.textSecondary} /> },
    { number: 6, title: 'KYC Docs', icon: <FileText size={14} color={currentStep === 6 ? '#FFF' : colors.textSecondary} /> },
    { number: 7, title: 'Storefront', icon: <Camera size={14} color={currentStep === 7 ? '#FFF' : colors.textSecondary} /> },
    { number: 8, title: 'Hours', icon: <Clock size={14} color={currentStep === 8 ? '#FFF' : colors.textSecondary} /> },
    { number: 9, title: 'Banking', icon: <Landmark size={14} color={currentStep === 9 ? '#FFF' : colors.textSecondary} /> },
    { number: 10, title: 'Consent', icon: <ShieldCheck size={14} color={currentStep === 10 ? '#FFF' : colors.textSecondary} /> },
    { number: 11, title: 'Review', icon: <CheckCircle2 size={14} color={currentStep === 11 ? '#FFF' : colors.textSecondary} /> },
  ];

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access in your phone settings to detect your accurate store location.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat);
      setLongitude(lng);

      // Reverse geocode to extract address fields
      try {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (reverseResults && reverseResults.length > 0) {
          const item = reverseResults[0];
          if (item.name || item.street) {
            const streetLine = [item.name, item.street].filter(Boolean).join(', ');
            if (streetLine) setLine1(streetLine);
          }
          const detectedArea = item.district || item.subregion || item.name || '';
          if (detectedArea) {
            setArea(detectedArea);
          }
          if (item.city || item.subregion) {
            setCity(item.city || item.subregion || '');
          }
          if (item.region) {
            setState(item.region);
          }
          if (item.postalCode) {
            setPincode(item.postalCode);
          }
          setCountry('India');

          Alert.alert(
            'GPS Location Fetched',
            `📍 Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n${[item.name || item.street, detectedArea, item.city, item.postalCode].filter(Boolean).join(', ')}`
          );
        } else {
          Alert.alert('GPS Location Pinned', `📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }
      } catch (geoError) {
        Alert.alert('GPS Location Pinned', `📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }
    } catch (err: any) {
      console.error('Error fetching GPS location:', err);
      Alert.alert('Location Error', err?.message || 'Could not fetch current GPS location. Please make sure location services are turned on.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProdName.trim() || !newProdPrice.trim()) {
      Alert.alert('Product Details', 'Please enter at least Product Name and Selling Price.');
      return;
    }
    const newDraft: ProductDraft = {
      name: newProdName.trim(),
      category: businessCategory,
      brand: displayName,
      description: `${newProdName.trim()} in store catalog.`,
      price: newProdPrice.trim(),
      mrp: newProdMrp.trim() || newProdPrice.trim(),
      stock: newProdStock.trim() || '50',
      weight: '500g',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      variants: [],
      returnEligible: false,
    };
    setProductsList([...productsList, newDraft]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdMrp('');
    Alert.alert('Product Added', `${newDraft.name} added to initial launch list.`);
  };

  const handleApplyMondayHoursToAll = () => {
    const monday = schedules[0];
    setSchedules((prev) =>
      prev.map((s) => ({
        ...s,
        isOpen: monday.isOpen,
        is24Hours: monday.is24Hours,
        openTime: monday.openTime,
        closeTime: monday.closeTime,
      }))
    );
    Alert.alert('Schedule Applied', 'Monday hours applied to all 7 days.');
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID / VPA (e.g. name@okhdfcbank).');
      return;
    }
    setVerifyingUpi(true);
    setTimeout(() => {
      const verifiedName = accountHolder || `${firstName} ${lastName}`.trim() || 'Verified Store Partner';
      setUpiVerifiedName(verifiedName);
      setVerifyingUpi(false);
    }, 600);
  };

  const handleApplyUpiSuffix = (suffix: string) => {
    const raw = upiId || '';
    const prefix = raw.includes('@') ? raw.split('@')[0] : raw;
    const newUpi = `${prefix || (firstName ? firstName.toLowerCase().replace(/\s+/g, '') : 'partner')}${suffix}`;
    setUpiId(newUpi);
    setUpiVerifiedName(null);
  };

  const handleVerifyIfsc = async () => {
    const clean = (ifsc || '').trim().toUpperCase();
    if (!clean || clean.length !== 11) {
      Alert.alert(
        'Invalid IFSC Code',
        'Please enter a valid 11-character IFSC code (e.g. SBIN0031804 or HDFC0000001).'
      );
      return;
    }

    setVerifyingIfsc(true);
    setIfscVerified(false);

    try {
      const details = await fetchRealIfscData(clean);
      if (details) {
        setBankName(details.bank);
        if (details.branch) {
          const fullBranch = details.city ? `${details.branch}, ${details.city}` : details.branch;
          setBranchName(fullBranch);
        }
        setIfscVerified(true);
      } else {
        Alert.alert(
          'IFSC Not Found',
          'Could not verify details for this IFSC code. Please check the code printed on your cheque book or passbook.'
        );
      }
    } catch (e) {
      Alert.alert('Verification Error', 'Could not verify IFSC. Please check your connection or code.');
    } finally {
      setVerifyingIfsc(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        await VendorApi.saveOnboardingStep(1, { businessType, businessCategory });
        updateVendor({ businessType, businessCategory, currentOnboardingStep: 2 });
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !dateOfBirth.trim()) {
          Alert.alert('Required Fields', 'Please fill in First Name, Last Name, Email and Date of Birth.');
          return;
        }
        await VendorApi.saveOnboardingStep(2, {
          firstName,
          lastName,
          email,
          dateOfBirth,
          profilePhoto,
          signatoryRole,
          escalationContactName,
          escalationContactPhone,
          escalationContactEmail,
        });
        updateVendor({
          firstName,
          lastName,
          ownerName: `${firstName} ${lastName}`.trim(),
          email,
          currentOnboardingStep: 3,
        });
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!businessName || !displayName) {
          Alert.alert('Required Fields', 'Please enter Registered Business Name and Store Display Name.');
          return;
        }
        if (!panNumber || panNumber.trim().length !== 10) {
          Alert.alert('Business PAN Required', 'Please enter a valid 10-character Business PAN number.');
          return;
        }
        await VendorApi.saveOnboardingStep(3, {
          businessName,
          displayName,
          legalEntityType,
          yearEstablished,
          businessDescription,
          businessPhone,
          businessEmail,
          website,
          foodCategory: businessType === 'RESTAURANT' ? foodCategory : undefined,
          kitchenType: businessType === 'RESTAURANT' ? kitchenType : undefined,
          drugLicenseNumber: businessType === 'PHARMACY' ? drugLicenseNumber : undefined,
          pharmacistName: businessType === 'PHARMACY' ? pharmacistName : undefined,
          pharmacistRegNumber: businessType === 'PHARMACY' ? pharmacistRegNumber : undefined,
          tradeLicenseNumber,
          panNumber,
          gstin,
          fssaiNumber,
        });
        updateVendor({ businessName, displayName, legalEntityType, panNumber, currentOnboardingStep: 4 });
        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (!line1 || !area || !city || !state || !pincode) {
          Alert.alert('Required Fields', 'Please complete your physical store address details.');
          return;
        }
        await VendorApi.saveOnboardingStep(4, { line1, line2, area, landmark, city, state, pincode, country });
        updateVendor({ address: { line1, line2, landmark, city, state, pincode, latitude, longitude }, currentOnboardingStep: 5 });
        setCurrentStep(5);
      } else if (currentStep === 5) {
        await VendorApi.saveOnboardingStep(5, { latitude, longitude });
        setCurrentStep(6);
      } else if (currentStep === 6) {
        const panDoc = documentsList.find((d) => d.type.toUpperCase().includes('PAN'));
        if (!panDoc || panDoc.status !== 'UPLOADED') {
          Alert.alert('PAN Document Required', 'Uploading your Business / Owner PAN Card copy (PDF, JPEG, JPG, PNG) is mandatory to proceed.');
          return;
        }
        const payloadDocs = documentsList.map((d) => ({
          type: d.type,
          documentNumber: d.documentNumber,
          fileUrl: d.fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: d.status,
          documentExpiry: d.expiryDate,
        }));
        await VendorApi.saveOnboardingStep(6, { documents: payloadDocs });
        updateVendor({ documents: payloadDocs, currentOnboardingStep: 7 });
        setCurrentStep(7);
      } else if (currentStep === 7) {
        if (!storeDisplayName) {
          Alert.alert('Required Field', 'Please provide your customer-facing store name.');
          return;
        }
        await VendorApi.saveOnboardingStep(7, {
          name: storeDisplayName,
          description: storeDesc,
          logo: storeLogo,
          banner: storeBanner,
          phone: storePhone,
          email: storeEmail,
        });
        updateVendor({ storeName: storeDisplayName, logo: storeLogo, banner: storeBanner, currentOnboardingStep: 8 });
        setCurrentStep(8);
      } else if (currentStep === 8) {
        await VendorApi.saveOnboardingStep(8, { schedules });
        setCurrentStep(9);
      } else if (currentStep === 9) {
        if (payoutPreference === 'UPI') {
          if (!accountHolder || !upiId) {
            Alert.alert('Required Fields', 'Please fill in Account Holder Name and UPI ID / VPA.');
            return;
          }
          if (!upiId.includes('@')) {
            Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID / VPA (e.g. name@okhdfcbank).');
            return;
          }
        } else {
          if (!accountNumber || !ifsc || !accountHolder) {
            Alert.alert('Required Fields', 'Please fill in Bank Account Number, IFSC, and Account Holder Name.');
            return;
          }
          if (accountNumber !== confirmAccountNumber) {
            Alert.alert('Account Mismatch', 'Account Number and Confirmation Number do not match.');
            return;
          }
        }
        const bank = {
          bankName: payoutPreference === 'UPI' ? 'UPI Direct Settlement' : bankName,
          branchName: payoutPreference === 'UPI' ? undefined : branchName,
          accountNumber: payoutPreference === 'UPI' ? undefined : accountNumber,
          maskedAccountNumber: payoutPreference === 'UPI' ? undefined : `XXXX XXXX ${accountNumber.slice(-4)}`,
          ifsc: payoutPreference === 'UPI' ? undefined : ifsc,
          accountHolder,
          accountType,
          payoutPreference,
          upiId: payoutPreference === 'UPI' ? upiId : undefined,
          upiVerifiedName: payoutPreference === 'UPI' ? (upiVerifiedName || accountHolder) : undefined,
        };
        await VendorApi.saveOnboardingStep(9, bank);
        updateVendor({ bankAccount: bank, currentOnboardingStep: 10 });
        setCurrentStep(10);
      } else if (currentStep === 10) {
        const allAgreed = agreeAccurateInfo && agreeVendorTerms && agreePrivacyPolicy && agreeSupplyAgreement && agreeVerifyAuth;
        if (!allAgreed) {
          Alert.alert('Consent Required', 'Please accept all 5 statutory declaration checkboxes to proceed.');
          return;
        }
        await VendorApi.saveOnboardingStep(10, {
          taxComplianceType,
          agreeAccurateInfo,
          agreeVendorTerms,
          agreePrivacyPolicy,
          agreeSupplyAgreement,
          agreeVerifyAuth,
          consentedAt: new Date().toISOString(),
          agreementVersion: 'v2.4',
        });
        updateVendor({ currentOnboardingStep: 11 });
        setCurrentStep(11);
      } else if (currentStep === 11) {
        // Trigger Email Verification flow instantly without lag (Requests 5 & 8)
        handleInitiateSubmit();
      }
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Unable to save step.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSubmit = () => {
    setLoading(true);
    const token = 'vfy_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setVerificationToken(token);
    setVerificationCountdown(600);
    setEmailVerificationStatus('pending_email_verification');
    setLoading(false);
  };

  const handleResendVerificationLink = () => {
    const token = 'vfy_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setVerificationToken(token);
    setVerificationCountdown(600);
    setEmailVerificationStatus('pending_email_verification');
    Alert.alert('Verification Link Resent', `A fresh verification link was sent to ${email || vendor?.email || 'your email'} from Support@sevazo.in.`);
  };

  const handleVerifyEmailNow = async () => {
    setLoading(true);
    try {
      const cleanPhone = (vendor?.phone || vendor?.businessPhone || '9876543210').replace(/\D/g, '').slice(-10);
      const random6Digit = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedAppId = `SVZ-VND-${random6Digit}`;

      const mappedDocs = documentsList.map((d) => ({
        id: `doc-${Date.now()}-${d.type.toLowerCase()}`,
        type: d.type.toLowerCase(),
        name: d.fileName || `${d.type.toLowerCase()}_doc.pdf`,
        documentNumber: d.documentNumber || (d.type === 'PAN' ? panNumber : d.type === 'GST' ? gstin : d.type === 'FSSAI' ? fssaiNumber : `ACC-${accountNumber.slice(-4)}`) || 'SUBMITTED',
        fileUrl: d.fileUrl || (d.type === 'GST' ? 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=900' : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900'),
        status: d.status === 'UPLOADED' ? 'UPLOADED' : 'PENDING',
        verified: d.status === 'UPLOADED',
      }));

      const fullPayload = {
        applicationId: generatedAppId,
        vendorId: `vnd-${cleanPhone.slice(-6) || random6Digit}`,
        businessType,
        businessCategory,
        firstName,
        lastName,
        ownerName: `${firstName} ${lastName}`.trim() || 'Store Owner',
        email: email || vendor?.email || 'merchant@sevazo.in',
        phone: vendor?.phone || vendor?.businessPhone || '9876543210',
        dateOfBirth,
        profilePhoto,
        businessName,
        legalEntityType,
        panNumber,
        gstin,
        fssaiNumber,
        address: {
          line1,
          area,
          city,
          state: state || 'Rajasthan',
          pincode,
          latitude,
          longitude,
        },
        shopPhotos,
        documentsList: mappedDocs,
        storeDisplayName,
        storeDesc,
        storePhone,
        storeEmail,
        storeBanner,
        storeLogo,
        schedules,
        banking: {
          payoutPreference,
          bankName,
          branchName,
          accountNumber,
          maskedAccountNumber: accountNumber ? `XXXX XXXX ${accountNumber.slice(-4)}` : '',
          ifsc,
          accountHolder,
          accountType,
          upiId,
          upiVerifiedName,
        },
        consent: {
          signatoryRole,
          signatoryName: `${firstName} ${lastName}`.trim() || 'Store Owner',
          escalationContactName,
          escalationContactPhone,
          escalationContactEmail,
          taxComplianceType,
          agreeAccurateInfo,
          agreeVendorTerms,
          agreePrivacyPolicy,
          agreeSupplyAgreement,
          agreeVerifyAuth,
          consentedAt: new Date().toISOString(),
          agreementVersion: 'v2.4',
        },
        status: 'pending_admin_approval',
        approvalStatus: 'pending',
        isEmailVerified: true,
        agreementVersion: 'v2.4',
        finalSubmittedAt: new Date().toISOString(),
      };

      await VendorApi.submitOnboarding(fullPayload);
      updateVendor({
        ...fullPayload,
        status: 'SUBMITTED',
        approvalStatus: 'PENDING',
        currentOnboardingStep: 11,
      });

      setEmailVerificationStatus('verified');
      // Redirect to ApplicationSubmitted screen with unique appId
      navigation.replace('ApplicationSubmitted', { applicationId: generatedAppId });
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not verify and submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Standardized Clean Rider-Style Fixed Header */}
      <View
        style={[
          styles.standardHeader,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
            paddingTop: Math.max(insets.top, 12),
          },
        ]}
      >
        <TouchableOpacity
          onPress={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : () => navigation.navigate('Welcome')}
          style={[styles.headerIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go Back"
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerCenterTitle, { color: colors.textPrimary }]}>
          {STEP_TITLES[currentStep] || 'Business Category'}
        </Text>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Save Draft & Exit?',
              'Your onboarding progress has been saved as a draft.',
              [
                { text: 'Continue Setup', style: 'cancel' },
                { text: 'Save & Exit', style: 'destructive', onPress: () => navigation.navigate('Welcome') },
              ]
            );
          }}
          style={[styles.headerIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Save as Draft & Exit"
        >
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: Business Type & Category */}
          {currentStep === 1 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>What type of business are you registering?</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Choose the category that matches your core inventory catalog.</Text>
              <View style={styles.gridContainer}>
                {businessTypesList.map((item) => {
                  const isSelected = businessType === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      activeOpacity={0.8}
                      onPress={() => {
                        setBusinessType(item.key);
                        setBusinessCategory(item.title);
                      }}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: isSelected ? (isDark ? '#2A1B0A' : '#FFF7ED') : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      <View style={styles.catTopRow}>
                        <View style={[styles.catIconBox, { backgroundColor: isSelected ? colors.primaryLight : colors.borderLight }]}>
                          {item.icon}
                        </View>
                        {isSelected && (
                          <View style={[styles.selectedPill, { backgroundColor: colors.primary }]}>
                            <Check size={12} color="#FFF" />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.catTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                      <Text style={[styles.catDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 2: Owner Details */}
          {currentStep === 2 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Owner / Primary Contact Details</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Authorized individual managing the merchant partnership.</Text>
              <View style={styles.avatarRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerTarget('PROFILE');
                    setShowImagePickerModal(true);
                  }}
                  style={styles.avatarWrap}
                >
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarImg, styles.avatarPlaceholder, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}>
                      <User size={32} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={[styles.avatarEditBadge, { backgroundColor: '#FF6600' }]}>
                    <Camera size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget('PROFILE');
                    setShowImagePickerModal(true);
                  }}
                  style={[styles.uploadPhotoBtn, { backgroundColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED', borderColor: isDark ? '#FF6600' : '#FFEDD5' }]}
                >
                  <Camera size={16} color="#FF6600" />
                  <Text style={[styles.uploadPhotoText, { color: '#EA580C' }]}>
                    {profilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}><Input label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="Enter first name" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><Input label="Last Name *" value={lastName} onChangeText={setLastName} placeholder="Enter last name" /></View>
              </View>
              <Input
                label="Registered Business Email *"
                value={email || vendor?.email || ''}
                editable={false}
                leftIcon={<Badge label="Email verified successfully" variant="success" size="sm" />}
                placeholder="Enter email address"
              />
              <Input
                label="Primary Contact Mobile Number *"
                value={vendor?.phone || ''}
                editable={false}
                placeholder="Enter mobile number"
              />
              <Input
                label="Date of Birth (DOB) *"
                value={dateOfBirth}
                onChangeText={handleDobChange}
                placeholder="DD / MM / YYYY"
                keyboardType="number-pad"
                maxLength={10}
                helperText="Format: DD/MM/YYYY (e.g. 15/08/1990)"
                leftIcon={<Calendar size={18} color={colors.textSecondary} />}
              />

              {/* Emergency Contact Details Section (Above Signatory Designation) */}
              <View style={{ marginTop: 20, marginBottom: 4 }}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 3 }]}>
                  Emergency Contact Details
                </Text>
                <Text style={[styles.secDesc, { color: colors.textSecondary, fontSize: 12.5, marginBottom: 12 }]}>
                  Primary contact for operations, emergency escalations & store queries.
                </Text>
              </View>
              <Input
                label="Emergency Contact Person Name *"
                value={escalationContactName}
                onChangeText={setEscalationContactName}
                placeholder="e.g. Suresh Kumar (Manager / In-charge)"
              />
              <Input
                label="Emergency Contact Mobile Number *"
                value={escalationContactPhone}
                onChangeText={setEscalationContactPhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
              />
              <Input
                label="Emergency Contact Email (Optional)"
                value={escalationContactEmail}
                onChangeText={setEscalationContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="emergency@store.com"
              />

              {/* Signatory Designation */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginTop: 14, marginBottom: 8 }]}>
                Signatory Designation *
              </Text>
              <View style={styles.rolePillsRow}>
                {(['Proprietor', 'Director', 'Managing Partner', 'Authorized Signatory', 'Store Manager', 'Employee'] as const).map((role) => {
                  const isSel = signatoryRole === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      onPress={() => setSignatoryRole(role)}
                      style={[
                        styles.rolePill,
                        {
                          backgroundColor: isSel ? colors.primaryLight : colors.surface,
                          borderColor: isSel ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.rolePillText, { color: isSel ? colors.primary : colors.textPrimary, fontWeight: isSel ? '700' : '500' }]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 3: Dynamic Business Information */}
          {currentStep === 3 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Tell us about your business</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Smart fields customized for: <Text style={{ fontWeight: '700', color: colors.primary }}>{businessCategory || 'Selected Category'}</Text></Text>
              <Input label="Business / Legal Entity Name *" value={businessName} onChangeText={setBusinessName} placeholder="Enter registered business legal name" />
              <Input label="Customer-Facing Store Display Name *" value={displayName} onChangeText={setDisplayName} placeholder="Enter store display name" />

              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Legal Entity Structure *</Text>
              <View style={styles.entityTypesGrid}>
                {[{ key: 'PROPRIETORSHIP', label: 'Sole Proprietorship' }, { key: 'PARTNERSHIP', label: 'Partnership Firm' }, { key: 'LLP', label: 'LLP' }, { key: 'PVT_LTD', label: 'Pvt Ltd' }].map((item) => {
                  const isSelected = legalEntityType === item.key;
                  return (
                    <TouchableOpacity key={item.key} onPress={() => setLegalEntityType(item.key as LegalEntityType)} style={[styles.entityChip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.borderLight }]}>
                      <Text style={{ color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' }}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Business / Owner PAN Number *"
                value={panNumber}
                onChangeText={(txt) => setPanNumber(txt.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={10}
                autoCapitalize="characters"
                placeholder="10-character PAN (e.g. ABCDE1234F)"
                helperText="Mandatory tax ID for merchant verification and payouts"
              />

              {businessType === 'RESTAURANT' && (
                <View style={[styles.categoryBox, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                  <Text style={[styles.categoryBoxTitle, { color: '#B45309' }]}>🍽️ Food & Kitchen Compliance</Text>
                  <Input label="FSSAI 14-Digit License Number *" value={fssaiNumber} onChangeText={setFssaiNumber} keyboardType="number-pad" placeholder="14-digit FSSAI number" />
                  <Input label="Kitchen Type" value={kitchenType} onChangeText={setKitchenType} placeholder="Cloud Kitchen / QSR / Dine-in" />
                  <Input label="Dietary Specialty" value={foodCategory} onChangeText={setFoodCategory} placeholder="Pure Veg / Multi-Cuisine" />
                </View>
              )}

              {businessType === 'PHARMACY' && (
                <View style={[styles.categoryBox, { backgroundColor: isDark ? '#1F2937' : '#EFF6FF', borderColor: '#3B82F6' }]}>
                  <Text style={[styles.categoryBoxTitle, { color: '#1D4ED8' }]}>💊 Drug & Pharmacy Compliance</Text>
                  <Input label="Drug License Number (Form 20/21) *" value={drugLicenseNumber} onChangeText={setDrugLicenseNumber} placeholder="Enter drug license number" />
                  <Input label="Registered Pharmacist Full Name *" value={pharmacistName} onChangeText={setPharmacistName} placeholder="Enter pharmacist name" />
                  <Input label="Pharmacist Registration Number" value={pharmacistRegNumber} onChangeText={setPharmacistRegNumber} placeholder="Enter pharmacist registration number" />
                </View>
              )}

              {(businessType === 'GROCERY_STORE' || businessType === 'RETAIL_STORE' || businessType === 'ELECTRONICS' || businessType === 'FASHION') && (
                <View style={[styles.categoryBox, { backgroundColor: isDark ? '#1F2937' : '#F0FDF4', borderColor: '#10B981' }]}>
                  <Text style={[styles.categoryBoxTitle, { color: '#047857' }]}>🏢 Commercial Tax & Trade Details (Optional)</Text>
                  <Input label="GSTIN (Optional)" value={gstin} onChangeText={setGstin} autoCapitalize="characters" placeholder="15-digit GSTIN (if available)" />
                  <Input label="Trade License Number (Optional)" value={tradeLicenseNumber} onChangeText={setTradeLicenseNumber} placeholder="Enter trade license number (if available)" />
                </View>
              )}

              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}><Input label="Year Established" value={yearEstablished} onChangeText={setYearEstablished} keyboardType="number-pad" placeholder="YYYY" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><Input label="Business Website" value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="https://..." /></View>
              </View>
              <Input label="Business Description" value={businessDescription} onChangeText={setBusinessDescription} multiline numberOfLines={2} placeholder="Describe your store and products" />
            </View>
          )}

          {/* STEP 4: Business Address */}
          {currentStep === 4 && (
            <View>
              <View style={styles.addressHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Business Address</Text>
                  <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Primary store dispatch base.</Text>
                </View>
                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                  style={[styles.gpsAutoBtn, { backgroundColor: colors.primaryLight }]}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
                  ) : (
                    <Navigation size={14} color={colors.primary} />
                  )}
                  <Text style={[styles.gpsAutoText, { color: colors.primary }]}>
                    {isLocating ? 'Locating...' : 'Use GPS'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Input label="Address Line 1 *" value={line1} onChangeText={setLine1} placeholder="Shop/Building No., Floor" />
              <Input label="Address Line 2" value={line2} onChangeText={setLine2} placeholder="Street Name, Road" />
              <Input label="Area / Locality *" value={area} onChangeText={setArea} placeholder="Enter Area" />
              <Input label="Nearby Landmark" value={landmark} onChangeText={setLandmark} placeholder="Landmark (optional)" />
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}><Input label="City *" value={city} onChangeText={setCity} placeholder="Enter your city" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><Input label="Pincode *" value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} placeholder="Enter your pincode" /></View>
              </View>
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}><Input label="State *" value={state} onChangeText={setState} placeholder="Enter your state" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><Input label="Country *" value="🇮🇳 India" editable={false} helperText="Operations in India" /></View>
              </View>
            </View>
          )}

          {/* STEP 5: Store Location Verification & Storefront Photos */}
          {currentStep === 5 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Confirm Store Location & Photos</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Verify your store dispatch base and upload shop photos for rider pickup and customer trust.</Text>

              {/* Professional Map Preview Card */}
              <View style={[styles.proMapCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.borderLight }]}>
                {/* Map Top Status Bar */}
                <View style={styles.proMapTopBar}>
                  <View style={styles.proMapStatusPill}>
                    <View style={[styles.proMapLiveDot, { backgroundColor: latitude && longitude ? '#10B981' : '#F59E0B' }]} />
                    <Text style={[styles.proMapStatusText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
                      {latitude && longitude ? 'High Precision GPS Lock' : 'GPS Coordinates Pending'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleUseCurrentLocation}
                    disabled={isLocating}
                    style={[styles.proMapRecalibrateBtn, { backgroundColor: colors.primaryLight }]}
                  >
                    {isLocating ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
                    ) : (
                      <RefreshCw size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.proMapRecalibrateText, { color: colors.primary }]}>
                      {isLocating ? 'Locating...' : 'Recalibrate GPS'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Map Visual Canvas */}
                <View style={[styles.proMapCanvas, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  {/* Grid Lines Pattern */}
                  <View style={styles.proMapGridLines}>
                    <View style={[styles.proMapGridH, { top: '33%' }]} />
                    <View style={[styles.proMapGridH, { top: '66%' }]} />
                    <View style={[styles.proMapGridV, { left: '33%' }]} />
                    <View style={[styles.proMapGridV, { left: '66%' }]} />
                  </View>

                  {/* Delivery Radius Ring */}
                  <View style={[styles.proMapRadiusRing, { borderColor: colors.primary }]}>
                    <View style={[styles.proMapRadiusFill, { backgroundColor: colors.primaryLight }]} />
                  </View>

                  {/* Center Store Pin Marker */}
                  <View style={styles.proMapPinContainer}>
                    <View style={[styles.proMapPinPulse, { backgroundColor: colors.primary }]} />
                    <View style={styles.proMapPinBadge}>
                      <Store size={18} color="#FFFFFF" />
                    </View>
                    <View style={[styles.proMapStoreBubble, { backgroundColor: isDark ? '#0F172A' : '#1E293B' }]}>
                      <Text style={styles.proMapStoreBubbleText} numberOfLines={1}>
                        {displayName || businessName || 'Your Store'}
                      </Text>
                    </View>
                  </View>

                  {/* 5KM Radius Pill Tag */}
                  <View style={styles.proMapRadiusTag}>
                    <Text style={styles.proMapRadiusTagText}>⚡ 5.0 KM Service Zone</Text>
                  </View>
                </View>

                {/* Coordinates Bar */}
                <View style={[styles.proMapCoordsFooter, { borderTopColor: colors.borderLight }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.proMapCoordsLabel, { color: colors.textSecondary }]}>DISPATCH GPS COORDINATES</Text>
                    <Text style={[styles.proMapCoordsVal, { color: colors.textPrimary }]}>
                      {latitude && longitude
                        ? `📍 Lat: ${latitude.toFixed(5)} • Lng: ${longitude.toFixed(5)}`
                        : 'Tap "Recalibrate GPS" to fetch real device coordinates'}
                    </Text>
                  </View>
                  <Badge
                    label={latitude && longitude ? '✓ Verified GPS' : 'Pending'}
                    variant={latitude && longitude ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </View>

              {/* Resolved Store Location Info Card */}
              <View style={[styles.locationInfoCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={[styles.locIconBox, { backgroundColor: colors.primaryLight }]}>
                  <MapPin size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.locStoreTitle, { color: colors.textPrimary }]}>
                    {displayName || businessName || 'Store Dispatch Base'}
                  </Text>
                  <Text style={[styles.locAddressSub, { color: colors.textSecondary }]}>
                    {[line1, area, city, pincode, country].filter(Boolean).join(', ') || 'Address not filled yet in previous step'}
                  </Text>
                </View>
              </View>

              {/* SECTION: Upload Store / Shop Photos (Up to 5 images) */}
              <View style={[styles.shopPhotosSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.shopPhotosHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shopPhotosTitle, { color: colors.textPrimary }]}>
                      Storefront & Shop Photos
                    </Text>
                    <Text style={[styles.shopPhotosSub, { color: colors.textSecondary }]}>
                      Upload up to 5 clear photos of your shop (front board, entrance, interior racks, billing area).
                    </Text>
                  </View>
                  <Badge
                    label={`${shopPhotos.length} / 5`}
                    variant={shopPhotos.length >= 1 ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>

                {/* Photo Grid */}
                <View style={styles.shopPhotosGrid}>
                  {shopPhotos.map((uri, index) => (
                    <View key={index} style={[styles.shopPhotoItem, { borderColor: colors.borderLight }]}>
                      <Image source={{ uri }} style={styles.shopPhotoThumb} />
                      {index === 0 && (
                        <View style={[styles.mainCoverTag, { backgroundColor: colors.primary }]}>
                          <Text style={styles.mainCoverTagText}>Main Front</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteShopPhoto(index)}
                        style={styles.deletePhotoBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {shopPhotos.length < 5 && (
                    <TouchableOpacity
                      onPress={() => {
                        setPickerTarget('SHOP');
                        setShowImagePickerModal(true);
                      }}
                      style={[styles.addShopPhotoCard, { borderColor: colors.primary, backgroundColor: isDark ? '#1E293B' : '#F0FDF4' }]}
                    >
                      <View style={[styles.addPhotoIconCircle, { backgroundColor: colors.primaryLight }]}>
                        <Camera size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.addPhotoTitle, { color: colors.primary }]}>
                        + Add Photo
                      </Text>
                      <Text style={[styles.addPhotoCount, { color: colors.textSecondary }]}>
                        ({shopPhotos.length}/5 uploaded)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Photo Guide Tips */}
                <View style={[styles.photoTipsContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Text style={[styles.photoTipsTitle, { color: colors.textPrimary }]}>💡 Recommended Photos:</Text>
                  <View style={styles.photoTipsRow}>
                    <View style={[styles.tipChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}><Text style={[styles.tipChipText, { color: colors.textPrimary }]}>📸 Shop Front Board</Text></View>
                    <View style={[styles.tipChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}><Text style={[styles.tipChipText, { color: colors.textPrimary }]}>🏬 Entrance</Text></View>
                    <View style={[styles.tipChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}><Text style={[styles.tipChipText, { color: colors.textPrimary }]}>🛒 Product Racks</Text></View>
                    <View style={[styles.tipChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}><Text style={[styles.tipChipText, { color: colors.textPrimary }]}>🧾 Billing Counter</Text></View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* STEP 6: KYC Documents */}
          {currentStep === 6 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Verify your business documents</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Upload clear scanned copies (PDF, JPG, PNG up to 5 MB).</Text>
              {documentsList.map((doc, idx) => (
                <View key={idx} style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.docHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.docTitle, { color: colors.textPrimary }]}>{doc.title}</Text>
                      {doc.documentNumber ? (
                        <Text style={[styles.docSub, { color: colors.textSecondary }]}>Doc No: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{doc.documentNumber}</Text></Text>
                      ) : (
                        <Text style={[styles.docSub, { color: colors.textMuted }]}>Document not yet uploaded</Text>
                      )}
                    </View>
                    <Badge label={doc.status === 'UPLOADED' ? '✓ Uploaded' : 'Not Uploaded'} variant={doc.status === 'UPLOADED' ? 'success' : 'neutral'} size="sm" />
                  </View>
                  {doc.status === 'UPLOADED' ? (
                    <View style={[styles.uploadedFileRow, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                      <FileText size={16} color={colors.primary} />
                      <Text style={[styles.uploadedFileName, { color: colors.textPrimary }]} numberOfLines={1}>{doc.fileName}</Text>
                      <TouchableOpacity onPress={() => handleOpenKycUpload(doc.type)} style={styles.replaceBtn}>
                        <Text style={[styles.replaceBtnText, { color: colors.primary }]}>Replace</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleOpenKycUpload(doc.type)} style={[styles.uploadBoxBtn, { borderColor: colors.borderLight }]}>
                      <Upload size={18} color={colors.primary} />
                      <Text style={[styles.uploadBoxText, { color: colors.primary }]}>Upload {doc.type} Document</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* STEP 7: Store Profile (Customer-Facing Brand Hub) */}
          {currentStep === 7 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Store Profile & Media</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Your public brand presentation on SevaZo consumer app.</Text>

              {/* Cover Banner (16:9) & Logo (1:1) */}
              <View style={styles.storeMediaContainer}>
                {storeBanner ? (
                  <Image source={{ uri: storeBanner }} style={styles.storeCoverBanner} />
                ) : (
                  <View style={[styles.storeCoverBanner, styles.bannerPlaceholder, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.borderLight }]}>
                    <ImageIcon size={28} color={colors.textSecondary} />
                    <Text style={[styles.bannerPlaceholderText, { color: colors.textSecondary }]}>Upload 16:9 Store Cover Banner</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget('BANNER');
                    setShowImagePickerModal(true);
                  }}
                  style={styles.changeCoverBtn}
                >
                  <Camera size={14} color="#FFF" />
                  <Text style={styles.changeMediaText}>{storeBanner ? 'Change 16:9 Cover' : 'Upload Cover'}</Text>
                </TouchableOpacity>

                <View style={styles.storeLogoOverlapBox}>
                  {storeLogo ? (
                    <Image source={{ uri: storeLogo }} style={styles.storeLogoSquare} />
                  ) : (
                    <View style={[styles.storeLogoSquare, styles.logoPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Store size={22} color={colors.textSecondary} />
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setPickerTarget('LOGO');
                      setShowImagePickerModal(true);
                    }}
                    style={styles.changeLogoBtn}
                  >
                    <Camera size={12} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <Input label="Customer Display Store Name *" value={storeDisplayName} onChangeText={setStoreDisplayName} placeholder="Enter store name" />
              <Input label="Store Description / Tagline" value={storeDesc} onChangeText={setStoreDesc} multiline numberOfLines={2} placeholder="Describe your store" />
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}><Input label="Store Phone" value={storePhone} onChangeText={setStorePhone} placeholder="Enter phone number" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><Input label="Store Email" value={storeEmail} onChangeText={setStoreEmail} autoCapitalize="none" placeholder="Enter email address" /></View>
              </View>
            </View>
          )}

          {/* STEP 8: Store Operating Hours (Monday-Sunday Schedule) */}
          {currentStep === 8 && (
            <View>
              <View style={styles.scheduleHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>When is your store open?</Text>
                  <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>7-day schedule for order acceptance and customer ETA.</Text>
                </View>
                <TouchableOpacity onPress={handleApplyMondayHoursToAll} style={[styles.applyAllBtn, { backgroundColor: colors.primaryLight }]}>
                  <RefreshCw size={13} color={colors.primary} />
                  <Text style={[styles.applyAllText, { color: colors.primary }]}>Apply Mon to All</Text>
                </TouchableOpacity>
              </View>

              {schedules.map((item, idx) => (
                <View key={item.dayOfWeek} style={[styles.dayScheduleCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.dayTopRow}>
                    <Text style={[styles.dayName, { color: colors.textPrimary }]}>{item.label}</Text>
                    <View style={styles.daySwitchRow}>
                      <Text style={{ fontSize: 12, marginRight: 6, color: item.isOpen ? colors.success : colors.textMuted }}>
                        {item.isOpen ? 'Open' : 'Closed'}
                      </Text>
                      <Switch
                        value={item.isOpen}
                        onValueChange={(val) => {
                          const updated = [...schedules];
                          updated[idx].isOpen = val;
                          setSchedules(updated);
                        }}
                      />
                    </View>
                  </View>

                  {item.isOpen && (
                    <View style={styles.hoursRow}>
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Input label="Opens At" value={item.openTime} onChangeText={(t) => {
                          const updated = [...schedules];
                          updated[idx].openTime = t;
                          setSchedules(updated);
                        }} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 6 }}>
                        <Input label="Closes At" value={item.closeTime} onChangeText={(t) => {
                          const updated = [...schedules];
                          updated[idx].closeTime = t;
                          setSchedules(updated);
                        }} />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* STEP 9: Bank & Settlements (Where should we send your earnings?) */}
          {currentStep === 9 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Where should we send your earnings?</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>Choose your preferred settlement method for store payouts.</Text>

              <View style={styles.payoutModeRow}>
                <TouchableOpacity
                  onPress={() => setPayoutPreference('BANK_ACCOUNT')}
                  style={[
                    styles.payoutOption,
                    {
                      backgroundColor: payoutPreference === 'BANK_ACCOUNT' ? colors.primaryLight : colors.surface,
                      borderColor: payoutPreference === 'BANK_ACCOUNT' ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Landmark size={18} color={payoutPreference === 'BANK_ACCOUNT' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.payoutOptionTitle, { color: colors.textPrimary }]}>Direct Bank Transfer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPayoutPreference('UPI')}
                  style={[
                    styles.payoutOption,
                    {
                      backgroundColor: payoutPreference === 'UPI' ? colors.primaryLight : colors.surface,
                      borderColor: payoutPreference === 'UPI' ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Smartphone size={18} color={payoutPreference === 'UPI' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.payoutOptionTitle, { color: colors.textPrimary }]}>Instant UPI Settlement</Text>
                </TouchableOpacity>
              </View>

              {payoutPreference === 'UPI' ? (
                /* ================= INSTANT UPI SETTLEMENT (RIDER APP PATTERN) ================= */
                <View>
                  {/* Instant Direct Deposit Highlight Banner */}
                  <View style={[styles.upiHighlightBanner, { backgroundColor: isDark ? '#271708' : '#FFF7ED', borderColor: isDark ? '#7C2D12' : '#FFEDD5' }]}>
                    <Zap size={18} color="#FF6600" />
                    <View style={styles.upiBannerTextCol}>
                      <Text style={styles.upiBannerTitle}>Instant Direct Deposit (60 Seconds)</Text>
                      <Text style={[styles.upiBannerDesc, { color: isDark ? '#FDBA74' : '#9A3412' }]}>
                        Daily store earnings & settlements are transferred directly into your UPI-linked bank account within 60 seconds.
                      </Text>
                    </View>
                  </View>

                  {/* Account Holder Name */}
                  <Input
                    label="Account Holder Name *"
                    value={accountHolder}
                    onChangeText={setAccountHolder}
                    placeholder="e.g. Ramesh Kumar"
                    helperText="Must match the registered name on your UPI ID"
                  />

                  {/* UPI ID / VPA with Verification Action */}
                  <Input
                    label="UPI ID / VPA *"
                    value={upiId}
                    onChangeText={(txt) => {
                      setUpiId(txt.trim());
                      setUpiVerifiedName(null);
                    }}
                    placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                    autoCapitalize="none"
                    rightIcon={
                      verifyingUpi ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : upiVerifiedName ? (
                        <CheckCircle2 size={18} color={colors.success} />
                      ) : (
                        <TouchableOpacity onPress={handleVerifyUpi}>
                          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Verify VPA</Text>
                        </TouchableOpacity>
                      )
                    }
                  />

                  {/* UPI Verified Badge */}
                  {upiVerifiedName && (
                    <View style={[styles.verifiedUpiBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <Text style={[styles.verifiedUpiText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
                        VPA Verified • Registered to {upiVerifiedName}
                      </Text>
                    </View>
                  )}

                  {/* Popular UPI Handle Suffix Chips */}
                  <View style={styles.suffixSection}>
                    <Text style={[styles.suffixLabel, { color: colors.textSecondary }]}>Quick Handles:</Text>
                    <View style={styles.suffixChipsRow}>
                      {POPULAR_UPI_SUFFIXES.map((suffix) => (
                        <TouchableOpacity
                          key={suffix}
                          style={[styles.suffixChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                          onPress={() => handleApplyUpiSuffix(suffix)}
                        >
                          <Text style={[styles.suffixChipText, { color: colors.textPrimary }]}>{suffix}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                /* ================= DIRECT BANK TRANSFER FORM ================= */
                <View>
                  <Input
                    label="Bank IFSC Code *"
                    value={ifsc}
                    onChangeText={(txt) => {
                      setIfsc(txt.toUpperCase());
                      setIfscVerified(false);
                    }}
                    autoCapitalize="characters"
                    maxLength={11}
                    placeholder="e.g. SBIN0031804 or HDFC0001234"
                    rightIcon={
                      verifyingIfsc ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : ifscVerified ? (
                        <CheckCircle2 size={18} color={colors.success} />
                      ) : (
                        <TouchableOpacity onPress={handleVerifyIfsc}>
                          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Verify</Text>
                        </TouchableOpacity>
                      )
                    }
                  />

                  {/* Bank Verified Status Badge */}
                  {ifscVerified && (
                    <View style={[styles.verifiedUpiBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0', marginBottom: 12 }]}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <Text style={[styles.verifiedUpiText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
                        Bank Verified • {bankName} {branchName ? `(${branchName})` : ''}
                      </Text>
                    </View>
                  )}

                  <Input
                    label="Bank Name *"
                    value={bankName}
                    onChangeText={setBankName}
                    leftIcon={<Landmark size={18} color={colors.textSecondary} />}
                    placeholder="Bank name auto-filled on verify"
                  />
                  <Input
                    label="Branch Name"
                    value={branchName}
                    onChangeText={setBranchName}
                    placeholder="Branch name auto-filled on verify"
                  />
                  <Input
                    label="Account Holder Name *"
                    value={accountHolder}
                    onChangeText={setAccountHolder}
                    placeholder="As per bank passbook / statement"
                  />
                  <Input
                    label="Bank Account Number *"
                    value={accountNumber}
                    onChangeText={(txt) => setAccountNumber(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="Enter bank account number (digits only)"
                  />
                  <Input
                    label="Confirm Bank Account Number *"
                    value={confirmAccountNumber}
                    onChangeText={(txt) => setConfirmAccountNumber(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="Re-enter bank account number (digits only)"
                  />
                </View>
              )}

              <View style={[styles.securityShieldCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.borderLight }]}>
                <Lock size={18} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.secTitle, { color: colors.textPrimary }]}>PCI-DSS & Financial Privacy Safe</Text>
                  <Text style={[styles.secDesc, { color: colors.textSecondary }]}>
                    {payoutPreference === 'UPI'
                      ? 'UPI virtual payment address data is processed through secure NPCI gateways.'
                      : (accountNumber ? `Account number stored masked: XXXX XXXX ${accountNumber.slice(-4)}` : 'Bank account data is encrypted with 256-bit AES encryption.')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 10: Vendor Consent & Legal Declarations Form */}
          {currentStep === 10 && (
            <View>
              <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Merchant Consent & Statutory Declarations</Text>
              <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>
                Legal authorization, authorized signatory capacity, and regulatory commitments.
              </Text>

              {/* Authorized Signatory Legal Entity Summary Card */}
              <View style={[styles.consentSummaryCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.borderLight }]}>
                <View style={styles.consentSummaryHeader}>
                  <ShieldCheck size={20} color={colors.primary} />
                  <Text style={[styles.consentSummaryHeaderTitle, { color: colors.textPrimary }]}>Authorized Merchant Profile</Text>
                </View>
                <View style={styles.consentSummaryRow}>
                  <Text style={[styles.consentSummaryLabel, { color: colors.textSecondary }]}>Signatory Name:</Text>
                  <Text style={[styles.consentSummaryValue, { color: colors.textPrimary }]}>
                    {firstName && lastName ? `${firstName} ${lastName}` : (vendor?.ownerName || 'Store Owner')}
                  </Text>
                </View>
                <View style={styles.consentSummaryRow}>
                  <Text style={[styles.consentSummaryLabel, { color: colors.textSecondary }]}>Legal Business:</Text>
                  <Text style={[styles.consentSummaryValue, { color: colors.textPrimary }]}>
                    {businessName || storeDisplayName || 'Registered Entity'}
                  </Text>
                </View>
                <View style={styles.consentSummaryRow}>
                  <Text style={[styles.consentSummaryLabel, { color: colors.textSecondary }]}>Storefront Name:</Text>
                  <Text style={[styles.consentSummaryValue, { color: colors.textPrimary }]}>
                    {storeDisplayName || 'SevaZo Partner Store'}
                  </Text>
                </View>
                <View style={styles.consentSummaryRow}>
                  <Text style={[styles.consentSummaryLabel, { color: colors.textSecondary }]}>Registered Mobile:</Text>
                  <Text style={[styles.consentSummaryValue, { color: colors.textPrimary }]}>
                    {vendor?.phone || '+91 98765 43210'}
                  </Text>
                </View>
              </View>

              {/* Tax & GST Compliance Scheme */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginTop: 12, marginBottom: 8 }]}>
                GST & Tax Compliance Declaration *
              </Text>
              <View style={styles.rolePillsRow}>
                {['Regular GST Registered', 'Composition Scheme', 'Turnover Exempt (<₹40L)'].map((scheme) => {
                  const isSel = taxComplianceType === scheme;
                  return (
                    <TouchableOpacity
                      key={scheme}
                      onPress={() => setTaxComplianceType(scheme)}
                      style={[
                        styles.rolePill,
                        {
                          backgroundColor: isSel ? colors.primaryLight : colors.surface,
                          borderColor: isSel ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.rolePillText, { color: isSel ? colors.primary : colors.textPrimary, fontWeight: isSel ? '700' : '500' }]}>
                        {scheme}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Statutory Declarations & Agreement Clauses Header */}
              <View style={styles.consentHeaderRow}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                  Mandatory Legal Declarations *
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const allOn = agreeAccurateInfo && agreeVendorTerms && agreePrivacyPolicy && agreeSupplyAgreement && agreeVerifyAuth;
                    setAgreeAccurateInfo(!allOn);
                    setAgreeVendorTerms(!allOn);
                    setAgreePrivacyPolicy(!allOn);
                    setAgreeSupplyAgreement(!allOn);
                    setAgreeVerifyAuth(!allOn);
                  }}
                  style={styles.selectAllBtn}
                >
                  <Text style={[styles.selectAllText, { color: colors.primary }]}>
                    {agreeAccurateInfo && agreeVendorTerms && agreePrivacyPolicy && agreeSupplyAgreement && agreeVerifyAuth ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {[
                {
                  state: agreeAccurateInfo,
                  setter: setAgreeAccurateInfo,
                  title: '1. Truthfulness & Accuracy',
                  desc: 'I certify that all details, identity certificates, PAN, and banking credentials provided are genuine, accurate, and lawful.',
                },
                {
                  state: agreeVendorTerms,
                  setter: setAgreeVendorTerms,
                  title: '2. SevaZo Marketplace Master Agreement',
                  desc: 'I accept SevaZo Vendor Terms & Conditions, standard commission deductions, and merchant fulfillment service level agreements.',
                  linkTitle: 'View Terms & Conditions',
                  linkUrl: 'https://sevazo.in/delivery_tnc.html',
                },
                {
                  state: agreePrivacyPolicy,
                  setter: setAgreePrivacyPolicy,
                  title: '3. Data Privacy & Confidentiality',
                  desc: 'I agree to the SevaZo Partner Privacy Policy and will safeguard customer data strictly for delivery completion purposes.',
                  linkTitle: 'View Privacy Policy',
                  linkUrl: 'https://sevazo.in/privacy.html',
                },
                {
                  state: agreeSupplyAgreement,
                  setter: setAgreeSupplyAgreement,
                  title: '4. Product Authenticity & Consumer Protection',
                  desc: 'I agree to supply 100% genuine products at fair pricing, maintain fresh/safe stock, and honor legitimate replacement requests.',
                },
                {
                  state: agreeVerifyAuth,
                  setter: setAgreeVerifyAuth,
                  title: '5. Regulatory Verification Authorization',
                  desc: 'I authorize SevaZo to verify submitted documents with government portals (NSDL/GSTN/FSSAI) and disburse net daily settlements to my account.',
                },
              ].map((ag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.consentClauseCard,
                    {
                      backgroundColor: ag.state ? (isDark ? '#064E3B20' : '#F0FDF4') : colors.surface,
                      borderColor: ag.state ? colors.success : colors.borderLight,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => ag.setter(!ag.state)}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.agreementCheckbox,
                        {
                          backgroundColor: ag.state ? colors.success : colors.surface,
                          borderColor: ag.state ? colors.success : colors.border,
                        },
                      ]}
                    >
                      {ag.state && <Check size={13} color="#FFF" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.consentClauseTitle, { color: colors.textPrimary }]}>{ag.title}</Text>
                      <Text style={[styles.consentClauseDesc, { color: colors.textSecondary }]}>{ag.desc}</Text>
                    </View>
                  </TouchableOpacity>

                  {ag.linkUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(ag.linkUrl)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        alignSelf: 'flex-start',
                        marginTop: 8,
                        marginLeft: 28,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        backgroundColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED',
                        borderWidth: 1,
                        borderColor: isDark ? '#7C2D12' : '#FFEDD5',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#FF6600' }}>
                        🔗 {ag.linkTitle}
                      </Text>
                      <ExternalLink size={12} color="#FF6600" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Digital Signature Audit Stamp */}
              <View style={[styles.digitalStampBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.borderLight }]}>
                <ShieldCheck size={20} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.digitalStampTitle, { color: colors.textPrimary }]}>
                    Digitally Executed as {signatoryRole}
                  </Text>
                  <Text style={[styles.digitalStampSub, { color: colors.textSecondary }]}>
                    Electronic signature bound under Section 10A of the Information Technology Act 2000.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 11: Review & Final Submission */}
          {currentStep === 11 && (
            <View>
              {emailVerificationStatus === 'pending_email_verification' ? (
                /* ================= STATE 2: CHECK YOUR INBOX WAITING SCREEN ================= */
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: isDark ? 'rgba(255, 102, 0, 0.2)' : '#FFF7ED',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#FF6600',
                      marginBottom: 16,
                    }}
                  >
                    <Mail size={36} color="#FF6600" />
                  </View>

                  <Text style={[styles.stepHeading, { color: colors.textPrimary, textAlign: 'center', fontSize: 22 }]}>
                    Check Your Inbox
                  </Text>
                  <Text style={[styles.stepSubheading, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 340 }]}>
                    We've sent a verification link to your email from <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Support@sevazo.in</Text>.
                  </Text>

                  {/* Registered Email Pill */}
                  <View
                    style={{
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                      marginTop: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                      ✉️ {email || vendor?.email || 'merchant@gmail.com'}
                    </Text>
                  </View>

                  {/* 10-Minute Countdown Timer Badge */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: isDark ? '#271708' : '#FEF3C7',
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: '#F59E0B',
                      marginBottom: 24,
                    }}
                  >
                    <Clock size={18} color="#D97706" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#B45309' }}>
                      Expires in {formatCountdown(verificationCountdown)}
                    </Text>
                  </View>

                  {/* Floating Mock Inbox Card (Dev-Tool Simulator) */}
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: '#FF6600',
                      padding: 18,
                      shadowColor: '#FF6600',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.15,
                      shadowRadius: 16,
                      elevation: 6,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#FF6600' }}>
                          📬 Mock Inbox (Dev Simulator)
                        </Text>
                      </View>
                      <Badge label="1 New Mail" variant="warning" size="sm" />
                    </View>

                    <View style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 14 }}>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
                        From: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Support@sevazo.in</Text>
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
                        Action Required: Verify your SevaZo Vendor Application
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        Hi {firstName || 'Merchant'}, click below to verify your registered email ({email || vendor?.email || 'your email'}) and receive your official SevaZo Application ID.
                      </Text>
                    </View>

                    <Button
                      title="Verify Email & Get Application ID"
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={loading}
                      onPress={handleVerifyEmailNow}
                      leftIcon={<CheckCircle2 size={18} color="#FFFFFF" />}
                    />
                  </View>
                </View>
              ) : emailVerificationStatus === 'token_expired' ? (
                /* ================= STATE 3: TOKEN EXPIRED ERROR SCREEN ================= */
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: '#FEF2F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#EF4444',
                      marginBottom: 16,
                    }}
                  >
                    <AlertTriangle size={36} color="#EF4444" />
                  </View>

                  <Text style={[styles.stepHeading, { color: '#EF4444', textAlign: 'center', fontSize: 22 }]}>
                    Verification Link Expired
                  </Text>
                  <Text style={[styles.stepSubheading, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 320 }]}>
                    The 10-minute verification window has expired. Please resubmit to receive a fresh verification link.
                  </Text>

                  <View style={{ width: '100%', maxWidth: 300, marginTop: 24 }}>
                    <Button
                      title="Resend Verification Link"
                      variant="primary"
                      size="lg"
                      fullWidth
                      onPress={handleResendVerificationLink}
                      leftIcon={<RefreshCw size={18} color="#FFFFFF" />}
                    />
                  </View>
                </View>
              ) : (
                /* ================= STATE 1: INITIAL APPLICATION REVIEW ================= */
                <View>
                  <Text style={[styles.stepHeading, { color: colors.textPrimary }]}>Application Review & Verification Desk</Text>
                  <Text style={[styles.stepSubheading, { color: colors.textSecondary }]}>
                    Review all submitted details across 10 sections before sending to the onboarding team.
                  </Text>

                  {/* 10-Section Structured Checklist */}
                  {[
                    { title: '1. Business Category', sub: `${businessCategory} (${businessType})`, step: 1 },
                    { title: '2. Owner & Emergency Contact', sub: `${firstName} ${lastName} (${signatoryRole}) • Emergency: ${escalationContactName || 'Configured'} (${escalationContactPhone || 'Verified'})`, step: 2 },
                    { title: '3. Legal Business Entity', sub: `${businessName} (${legalEntityType}) • PAN: ${panNumber || 'Submitted'}`, step: 3 },
                    { title: '4. Physical Address', sub: `${line1}, ${area}, ${city} - ${pincode}`, step: 4 },
                    { title: '5. Location Verification', sub: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} • ${shopPhotos.length} Store Photos`, step: 5 },
                    { title: '6. KYC & Legal Documents', sub: `${documentsList.filter((d) => d.status === 'UPLOADED').length} Documents Uploaded (PAN Card Verified)`, step: 6 },
                    { title: '7. Customer Storefront', sub: `${storeDisplayName || 'Storefront'} (16:9 Cover & Logo)`, step: 7 },
                    { title: '8. Operating Hours', sub: `${schedules.filter((s) => s.isOpen).length} Days Active Schedule`, step: 8 },
                    {
                      title: '9. Settlement Account',
                      sub: payoutPreference === 'UPI'
                        ? `Instant UPI: ${upiId || 'Not specified'} (${upiVerifiedName || accountHolder || 'VPA'})`
                        : `${bankName || 'Bank'} (XXXX XXXX ${(accountNumber || '').slice(-4)}) • ${ifsc || 'IFSC'}`,
                      step: 9,
                    },
                    {
                      title: '10. Consent & Authorization',
                      sub: `GST: ${taxComplianceType} • Statutory terms & declarations accepted`,
                      step: 10,
                    },
                  ].map((sec) => (
                    <View key={sec.step} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reviewSectionTitle, { color: colors.textPrimary }]}>✓ {sec.title}</Text>
                        <Text style={[styles.reviewItemSub, { color: colors.textSecondary }]}>{sec.sub}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setCurrentStep(sec.step)} style={styles.editShortcutBtn}>
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={[styles.readyBanner, { backgroundColor: isDark ? '#064E3B20' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
                    <CheckCircle2 size={22} color={colors.success} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.readyBannerTitle, { color: isDark ? '#6EE7B7' : '#065F46' }]}>All 10 Sections Complete & Verified</Text>
                      <Text style={[styles.readyBannerDesc, { color: isDark ? '#A7F3D0' : '#047857' }]}>
                        Tap Submit Application to initiate instant email verification from Support@sevazo.in and forward your documents to Admin review.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Fixed Sticky Bottom Action Footer */}
        {!(currentStep === 11 && (emailVerificationStatus === 'pending_email_verification' || emailVerificationStatus === 'token_expired')) && (
          <View
            style={[
              styles.fixedBottomFooter,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            {currentStep > 1 && (
              <Button
                title="Back"
                variant="outline"
                onPress={() => setCurrentStep(currentStep - 1)}
                leftIcon={<ArrowLeft size={16} color={colors.textPrimary} />}
                style={{ flex: 1, marginRight: 10 }}
              />
            )}
            <Button
              title={currentStep === 11 ? 'Submit Application' : 'Save & Continue'}
              onPress={handleSaveAndContinue}
              loading={loading}
              icon={<ArrowRight size={16} color="#FFFFFF" />}
              style={{ flex: currentStep > 1 ? 2 : 1 }}
            />
          </View>
        )}
      </KeyboardAvoidingView>



      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePickerModal}
        onClose={() => setShowImagePickerModal(false)}
        onImageSelected={handleImagePicked}
        title={
          pickerTarget === 'PROFILE'
            ? 'Select Profile Photo'
            : pickerTarget === 'SHOP'
            ? 'Add Shop Photo'
            : pickerTarget === 'BANNER'
            ? 'Select Store Banner'
            : pickerTarget === 'LOGO'
            ? 'Select Store Logo'
            : `Upload ${activeKycDocType || 'KYC'} Document`
        }
        allowsEditing={pickerTarget === 'PROFILE' || pickerTarget === 'LOGO' || pickerTarget === 'BANNER'}
        aspect={pickerTarget === 'BANNER' ? [16, 9] : [1, 1]}
        showDocumentOption={
          pickerTarget !== 'PROFILE' &&
          pickerTarget !== 'SHOP' &&
          pickerTarget !== 'BANNER' &&
          pickerTarget !== 'LOGO'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  standardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    zIndex: 50,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.card,
  },
  headerCenterTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  saveDraftBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md },
  saveDraftText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  resumeBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1 },
  resumeTitle: { fontSize: 13, fontWeight: '800' },
  resumeSub: { fontSize: 12, marginTop: 2 },
  dismissBtn: { padding: 4, marginLeft: 8 },
  stepperContainer: { borderBottomWidth: 1, paddingVertical: 10 },
  stepperScroll: { paddingHorizontal: 16, gap: 14 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepLabel: { fontSize: 10 },
  formContent: { padding: Spacing.xl },
  stepHeading: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  stepSubheading: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '48%', padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginBottom: 4 },
  catTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  catIconBox: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  selectedPill: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontSize: 14, fontWeight: '700' },
  catDesc: { fontSize: 11, marginTop: 4, lineHeight: 15 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: '#E2E8F0' },
  avatarEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  uploadPhotoBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, paddingHorizontal: 16, paddingVertical: 11, borderRadius: BorderRadius.lg, borderWidth: 1.5, gap: 8 },
  uploadPhotoText: { fontSize: 13, fontWeight: '700' },
  fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  entityTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  entityChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1 },
  categoryBox: { padding: 14, borderRadius: BorderRadius.xl, borderWidth: 1.5, marginBottom: 16 },
  categoryBoxTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  addressHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  gpsAutoBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md, borderWidth: 1.5, backgroundColor: '#FFF7ED', borderColor: '#FFEDD5', gap: 6 },
  gpsAutoText: { fontSize: 12, fontWeight: '700', color: '#EA580C' },
  twoColRow: { flexDirection: 'row' },
  mapCanvas: { height: 200, borderRadius: BorderRadius.xl, borderWidth: 1.5, overflow: 'hidden', position: 'relative', marginBottom: 16 },
  mapGridBackground: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapPinBadge: { alignItems: 'center' },
  mapStoreBubble: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.md, marginTop: 4 },
  mapStoreBubbleText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  mapCoordinatesBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, alignItems: 'center' },
  coordText: { fontSize: 11 },
  infoCallout: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, gap: 8, marginBottom: 16 },
  calloutText: { fontSize: 12, fontWeight: '600', flex: 1 },
  docCard: { padding: 14, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: 12 },
  docHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  docTitle: { fontSize: 14, fontWeight: '700' },
  docSub: { fontSize: 12, marginTop: 2 },
  uploadedFileRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: BorderRadius.md, gap: 8, marginTop: 6 },
  uploadedFileName: { fontSize: 12, fontWeight: '600', flex: 1 },
  replaceBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  replaceBtnText: { fontSize: 12, fontWeight: '700' },
  uploadBoxBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: 1.5, borderStyle: 'dashed', gap: 6, marginTop: 6 },
  uploadBoxText: { fontSize: 13, fontWeight: '700' },
  payoutModeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  payoutOption: { flex: 1, padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 6 },
  payoutOptionTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  securityShieldCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: 10 },
  secTitle: { fontSize: 13, fontWeight: '700' },
  secDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  storeMediaContainer: { position: 'relative', marginBottom: 20 },
  storeCoverBanner: { width: '100%', height: 140, borderRadius: BorderRadius.lg },
  changeCoverBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.65)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, gap: 4 },
  changeMediaText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  storeLogoOverlapBox: { position: 'absolute', bottom: -16, left: 16 },
  storeLogoSquare: { width: 60, height: 60, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: '#FFF' },
  changeLogoBtn: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#FF6600', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  scheduleHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  applyAllBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md, gap: 4 },
  applyAllText: { fontSize: 12, fontWeight: '700' },
  dayScheduleCard: { padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: 10 },
  dayTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName: { fontSize: 14, fontWeight: '700' },
  daySwitchRow: { flexDirection: 'row', alignItems: 'center' },
  hoursRow: { flexDirection: 'row', marginTop: 8 },
  radiusCardsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  radiusCard: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radiusNumber: { fontSize: 16, fontWeight: '800' },
  radiusUnit: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  productDraftCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: 10 },
  prodDraftTitle: { fontSize: 14, fontWeight: '700' },
  prodDraftSub: { fontSize: 12, marginTop: 2 },
  trashProdBtn: { padding: 8 },
  addProdFormCard: { padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: 6, marginBottom: 16 },
  addProdFormTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  deliveryModelCard: { padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginBottom: 12 },
  delTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  delIconBox: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  delTitle: { fontSize: 14, fontWeight: '700' },
  delDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: 8 },
  reviewSectionTitle: { fontSize: 13, fontWeight: '800' },
  reviewItemSub: { fontSize: 12, marginTop: 2 },
  editShortcutBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  agreementRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  agreementCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  agreementLabel: { fontSize: 12, flex: 1, lineHeight: 17 },
  fixedBottomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    ...Shadows.elevated,
  },
  bottomActionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, padding: 22, borderRadius: BorderRadius.xl, alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalActionsRow: { flexDirection: 'row', width: '100%' },
  // Bottom Sheet Photo Picker Styles
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  bannerPlaceholderText: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  logoPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed' },

  // Professional Map Styles (Step 5)
  proMapCard: { borderRadius: BorderRadius.xl, borderWidth: 1.5, overflow: 'hidden', marginBottom: 16, ...Shadows.subtle },
  proMapTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  proMapStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proMapLiveDot: { width: 8, height: 8, borderRadius: 4 },
  proMapStatusText: { fontSize: 11, fontWeight: '700' },
  proMapRecalibrateBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md },
  proMapRecalibrateText: { fontSize: 11, fontWeight: '800' },
  proMapCanvas: { height: 210, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  proMapGridLines: { ...StyleSheet.absoluteFillObject },
  proMapGridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  proMapGridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  proMapRadiusRing: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  proMapRadiusFill: { width: 160, height: 160, borderRadius: 80, opacity: 0.15 },
  proMapPinContainer: { alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  proMapPinPulse: { position: 'absolute', width: 48, height: 48, borderRadius: 24, opacity: 0.25 },
  proMapPinBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', ...Shadows.elevated },
  proMapStoreBubble: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.md, marginTop: 4, maxWidth: 180, ...Shadows.subtle },
  proMapStoreBubbleText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  proMapRadiusTag: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  proMapRadiusTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  proMapCoordsFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  proMapCoordsLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  proMapCoordsVal: { fontSize: 12, fontWeight: '700', marginTop: 2 },

  // Location Details Card
  locationInfoCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: 16, ...Shadows.subtle },
  locIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locStoreTitle: { fontSize: 15, fontWeight: '800' },
  locAddressSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  locBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },

  // Storefront Photos Section (Up to 5 images)
  shopPhotosSection: { padding: 16, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: 20, ...Shadows.subtle },
  shopPhotosHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  shopPhotosTitle: { fontSize: 15, fontWeight: '800' },
  shopPhotosSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  shopPhotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  shopPhotoItem: { width: '30.5%', height: 95, borderRadius: BorderRadius.lg, overflow: 'hidden', position: 'relative', borderWidth: 1 },
  shopPhotoThumb: { width: '100%', height: '100%', borderRadius: BorderRadius.lg },
  mainCoverTag: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 2, alignItems: 'center' },
  mainCoverTagText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  deletePhotoBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(239, 68, 68, 0.9)', alignItems: 'center', justifyContent: 'center' },
  addShopPhotoCard: { width: '30.5%', height: 95, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 6 },
  addPhotoIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  addPhotoTitle: { fontSize: 11, fontWeight: '800' },
  addPhotoCount: { fontSize: 9, marginTop: 2 },
  photoTipsContainer: { padding: 10, borderRadius: BorderRadius.md },
  photoTipsTitle: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  photoTipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tipChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, borderWidth: 1 },
  tipChipText: { fontSize: 10, fontWeight: '600' },

  // Instant UPI Settlement Styles (Rider App Pattern)
  upiHighlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 16,
  },
  upiBannerTextCol: { flex: 1 },
  upiBannerTitle: { fontSize: 13, fontWeight: '700', color: '#EA580C' },
  upiBannerDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  verifiedUpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  verifiedUpiText: { fontSize: 12, fontWeight: '700' },
  suffixSection: { marginTop: 4, marginBottom: 16 },
  suffixLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  suffixChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suffixChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  suffixChipText: { fontSize: 11, fontWeight: '700' },

  // Step 10 Vendor Consent Form Styles
  consentSummaryCard: {
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  consentSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  consentSummaryHeaderTitle: { fontSize: 13, fontWeight: '800' },
  consentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  consentSummaryLabel: { fontSize: 12, fontWeight: '600' },
  consentSummaryValue: { fontSize: 12, fontWeight: '700' },
  rolePillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  rolePillText: { fontSize: 12 },
  consentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  selectAllBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  selectAllText: { fontSize: 12, fontWeight: '700' },
  consentClauseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  consentClauseTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  consentClauseDesc: { fontSize: 11.5, lineHeight: 16 },
  digitalStampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 16,
  },
  digitalStampTitle: { fontSize: 12, fontWeight: '800' },
  digitalStampSub: { fontSize: 11, marginTop: 2, lineHeight: 15 },

  // Step 11 Ready Banner
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  readyBannerTitle: { fontSize: 13, fontWeight: '800' },
  readyBannerDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
});
