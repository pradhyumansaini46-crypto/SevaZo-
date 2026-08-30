import { z } from 'zod';
import { phoneSchema } from './authValidation';

// Helper to check for dummy repetitive strings
const isDummyRepetitive = (val: string): boolean => {
  const clean = val.replace(/[\s-]/g, '');
  if (!clean || clean.length < 4) return true;
  // All same characters (e.g. 111111111111 or AAAAAAAAAA)
  if (/^(.)\1+$/.test(clean)) return true;
  // Common dummy sequences
  const dummyList = [
    '123456789012',
    '987654321098',
    '1234567890',
    'ABCDE1234F',
    'XXXXX1234X',
    '0123456789',
    '000000000000',
    '999999999999',
    'DL0000000000000',
  ];
  return dummyList.includes(clean.toUpperCase());
};

/**
 * Step 1: Personal Information & Emergency Contact Schema (Merged)
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name should only contain letters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name should only contain letters'),
  profilePhoto: z.string().min(1, 'Profile photo is required. Please upload a clear photo of yourself.'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((dateStr) => {
      const birthDate = new Date(dateStr);
      if (isNaN(birthDate.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'You must be at least 18 years old to register as a delivery rider'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  // Emergency Contact fields (Merged)
  emergencyContactName: z
    .string()
    .min(2, 'Emergency contact full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Contact name should only contain letters'),
  emergencyRelationship: z
    .string()
    .min(2, 'Relationship is required (e.g. Father, Mother, Spouse, Brother)'),
  emergencyPhone: phoneSchema,
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

/**
 * Step 2: Residential Address Schema (Manual Entry Only)
 */
export const addressSchema = z.object({
  addressLine1: z.string().min(3, 'Address Line 1 is required (min 3 characters)'),
  addressLine2: z.string().optional().or(z.literal('')),
  locality: z.string().min(2, 'Locality / Area is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z
    .string()
    .length(6, 'Postal Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Postal Code must contain only numbers')
    .refine((val) => !isDummyRepetitive(val), 'Enter a valid postal code'),
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * Emergency Contact Schema
 */
export const emergencyContactSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Contact full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters'),
  relationship: z
    .string()
    .min(2, 'Relationship is required (e.g. Father, Mother, Spouse, Brother)'),
  mobileNumber: phoneSchema,
});

export type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>;

/**
 * Step 3: Identity & Driving Licence Verification Schema (Merged with Strict Validation)
 */
export const identitySchema = z
  .object({
    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid 10-character Indian PAN (e.g. ABCDE1234F)')
      .refine(
        (val) => ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'].includes(val.charAt(3)),
        '4th character of PAN must be a valid entity code (e.g. P for Individual)'
      )
      .refine((val) => !isDummyRepetitive(val), 'Invalid or dummy PAN number entered'),
    idType: z.enum(['AADHAAR', 'VOTER_ID', 'PASSPORT']),
    idNumber: z.string().trim().min(4, 'Enter a valid ID number'),
    frontImage: z.string().min(1, 'Front photo of government ID is required'),
    backImage: z.string().min(1, 'Back photo of government ID is required'),
    // Driving Licence fields (Merged)
    isBicycle: z.boolean().optional(),
    licenseNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    licenseFrontImage: z.string().optional(),
    licenseBackImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.idType === 'AADHAAR') {
      const clean = data.idNumber.replace(/[\s-]/g, '');
      if (!/^[2-9]\d{11}$/.test(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idNumber'],
          message: 'Aadhaar must be a valid 12-digit number starting with 2-9',
        });
      } else if (isDummyRepetitive(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idNumber'],
          message: 'Dummy or repetitive Aadhaar numbers are not allowed',
        });
      }
    } else if (data.idType === 'VOTER_ID') {
      const clean = data.idNumber.trim().toUpperCase();
      if (!/^[A-Z]{3}[0-9]{7}$/.test(clean) && !/^[A-Z0-9]{8,14}$/.test(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idNumber'],
          message: 'Enter a valid Voter ID / EPIC number (e.g. ABC1234567)',
        });
      }
    } else if (data.idType === 'PASSPORT') {
      const clean = data.idNumber.trim().toUpperCase();
      if (!/^[A-Z][0-9]{7,8}$/.test(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idNumber'],
          message: 'Enter a valid Indian Passport number (e.g. A1234567)',
        });
      }
    }

    if (!data.isBicycle) {
      if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['licenseNumber'],
          message: 'Valid Driving Licence number is required',
        });
      } else {
        const dlClean = data.licenseNumber.replace(/[\s-]/g, '').toUpperCase();
        // Indian DL format: 2-letter state code + 2-digit RTO + 4-digit Year + 7-digit unique number (Total 15 chars)
        const isStandardDl = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(dlClean) || /^[A-Z]{2}[0-9]{13}$/.test(dlClean) || dlClean.length >= 10;
        if (!isStandardDl || isDummyRepetitive(dlClean)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['licenseNumber'],
            message: 'Invalid Driving Licence format (e.g. DL1420110012345)',
          });
        }
      }

      if (!data.expiryDate || data.expiryDate.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiryDate'],
          message: 'Licence expiry date is required (YYYY-MM-DD)',
        });
      } else {
        const exp = new Date(data.expiryDate);
        const today = new Date();
        if (isNaN(exp.getTime()) || exp < today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['expiryDate'],
            message: 'Driving Licence has expired. Please enter a valid non-expired date.',
          });
        }
      }

      if (!data.licenseFrontImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['licenseFrontImage'],
          message: 'Front photo of driving licence is required',
        });
      }
      if (!data.licenseBackImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['licenseBackImage'],
          message: 'Back photo of driving licence is required',
        });
      }
    }
  });

export type IdentityFormValues = z.infer<typeof identitySchema>;

/**
 * Driving Licence Schema
 */
export const drivingLicenceSchema = z.object({
  licenseNumber: z
    .string()
    .min(5, 'Valid Driving Licence number is required')
    .regex(/^[A-Z0-9\s-]+$/i, 'Invalid Driving Licence format'),
  expiryDate: z.string().min(4, 'Licence expiry date is required (YYYY-MM-DD)'),
  frontImage: z.string().min(1, 'Front photo of driving licence is required'),
  backImage: z.string().min(1, 'Back photo of driving licence is required'),
});

export type DrivingLicenceFormValues = z.infer<typeof drivingLicenceSchema>;

/**
 * Step 4: Vehicle Registration & Documents Schema (Merged)
 */
export const vehicleSchema = z
  .object({
    vehicleType: z.enum(['MOTORCYCLE', 'SCOOTER', 'BICYCLE', 'CAR', 'OTHER']),
    ownershipType: z.enum(['OWNED', 'FAMILY', 'RENTED', 'COMPANY']),
    make: z.string().optional(),
    model: z.string().optional(),
    manufacturingYear: z.string().optional(),
    color: z.string().min(1, 'Vehicle color is required'),
    registrationNumber: z.string().optional(),
    bicycleType: z.enum(['STANDARD', 'ELECTRIC', 'CARGO']).optional(),
    bicycleBrand: z.string().optional(),
    bicycleModel: z.string().optional(),
    // Vehicle Document fields (Merged)
    rcNumber: z.string().optional(),
    rcImage: z.string().optional(),
    insuranceNumber: z.string().optional(),
    insuranceExpiry: z.string().optional(),
    insuranceImage: z.string().optional(),
    pucImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.vehicleType !== 'BICYCLE') {
      if (!data.make || data.make.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['make'],
          message: 'Vehicle make / brand is required (min 2 chars)',
        });
      }
      if (!data.model || data.model.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['model'],
          message: 'Vehicle model is required',
        });
      }
      if (!data.manufacturingYear || !/^\d{4}$/.test(data.manufacturingYear)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['manufacturingYear'],
          message: 'Enter a valid 4-digit year (e.g. 2022)',
        });
      }
      if (!data.registrationNumber || data.registrationNumber.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['registrationNumber'],
          message: 'Vehicle registration number is required (e.g. DL 01 AB 1234)',
        });
      }
      if (!data.rcImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rcImage'],
          message: 'RC document upload is required',
        });
      }
      if (!data.insuranceNumber || data.insuranceNumber.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['insuranceNumber'],
          message: 'Insurance policy number is required',
        });
      }
      if (!data.insuranceExpiry || data.insuranceExpiry.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['insuranceExpiry'],
          message: 'Insurance expiry date is required (YYYY-MM-DD)',
        });
      }
      if (!data.insuranceImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['insuranceImage'],
          message: 'Insurance policy document upload is required',
        });
      }
    } else {
      if (!data.bicycleBrand || data.bicycleBrand.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bicycleBrand'],
          message: 'Bicycle brand is required (e.g. Hero, Firefox, Trek)',
        });
      }
    }
  });

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

/**
 * Step 5: Banking & Payout Schema
 */
export const bankingSchema = z
  .object({
    preferredPayoutMethod: z.enum(['BANK_ACCOUNT', 'UPI']),
    accountHolder: z
      .string()
      .min(2, 'Account holder name must match bank / UPI records')
      .regex(/^[a-zA-Z\s.]+$/, 'Name should only contain letters'),
    accountNumber: z.string().optional(),
    confirmAccountNumber: z.string().optional(),
    ifsc: z.string().optional(),
    bankName: z.string().optional(),
    upiId: z.string().optional(),
    chequePassbookImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.preferredPayoutMethod === 'UPI') {
      if (!data.upiId || !/^[\w.-]+@[\w.-]+$/.test(data.upiId.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['upiId'],
          message: 'Valid UPI ID is required (e.g. mobile@paytm or name@okhdfcbank)',
        });
      }
    } else {
      if (!data.accountNumber || !/^\d{9,18}$/.test(data.accountNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountNumber'],
          message: 'Bank account number must be between 9 and 18 digits',
        });
      }
      if (!data.confirmAccountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmAccountNumber'],
          message: 'Please re-enter to confirm account number',
        });
      } else if (data.accountNumber !== data.confirmAccountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmAccountNumber'],
          message: 'Account numbers do not match',
        });
      }
      if (!data.ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc.toUpperCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ifsc'],
          message: 'Valid 11-digit IFSC code required (e.g. HDFC0001234)',
        });
      }
      if (!data.bankName || data.bankName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name & branch is required',
        });
      }
    }
  });

export type BankingFormValues = z.infer<typeof bankingSchema>;

/**
 * Vehicle Documents Schema (Maintained for backward compatibility)
 */
export const vehicleDocumentsSchema = z.object({
  rcNumber: z.string().min(4, 'Registration Certificate number is required'),
  rcImage: z.string().min(1, 'RC photo is required'),
  insuranceNumber: z.string().min(4, 'Insurance policy number is required'),
  insuranceExpiry: z.string().min(4, 'Insurance expiry date is required'),
  insuranceImage: z.string().min(1, 'Insurance document photo is required'),
  pucImage: z.string().optional(),
});

export type VehicleDocumentsFormValues = z.infer<typeof vehicleDocumentsSchema>;

/**
 * Step 6: Service Area & Delivery Preferences (Merged)
 */
export const deliveryPreferencesSchema = z.object({
  city: z.string().min(2, 'City is required'),
  zone: z.string().min(2, 'Operational zone is required'),
  locality: z.string().min(2, 'Primary locality is required'),
  preferredHubs: z.array(z.string()).min(1, 'Select at least one preferred delivery hub'),
  maxDistanceKm: z.number().min(1).max(25),
  acceptHeavyItems: z.boolean(),
  acceptSpecialHandling: z.boolean(),
  categories: z.array(z.string()).min(1, 'Select at least one delivery category'),
});

export type DeliveryPreferencesFormValues = z.infer<typeof deliveryPreferencesSchema>;

// Backward compatibility alias
export const serviceAreaSchema = deliveryPreferencesSchema;
export type ServiceAreaFormValues = DeliveryPreferencesFormValues;

/**
 * Step 7: Working Hours & Availability Schema
 */
export const availabilitySchema = z.object({
  weeklySchedule: z.record(
    z.object({
      enabled: z.boolean(),
      slots: z.array(z.string()),
    })
  ),
});

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

/**
 * Step 8: Rider Consent & Declaration Form Schema
 */
export const consentSchema = z.object({
  codeOfConductAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to Sevazo Rider Code of Conduct' }),
  }),
  safetyGuidelinesAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to Traffic and Safety Guidelines' }),
  }),
  zeroTolerancePolicyAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Zero Tolerance Policy on Substance and Harassment' }),
  }),
  backgroundCheckAgreed: z.literal(true, {
    errorMap: () => ({ message: 'Consent for identity and background verification is required' }),
  }),
  dataConsentAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to Data Privacy & Location Tracking Terms' }),
  }),
  declarationConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that all provided details are true and accurate' }),
  }),
  signatureName: z
    .string()
    .min(2, 'Digital signature (Full Legal Name) is required')
    .regex(/^[a-zA-Z\s.]+$/, 'Signature must contain your legal name in letters'),
});

export type ConsentFormValues = z.infer<typeof consentSchema>;
