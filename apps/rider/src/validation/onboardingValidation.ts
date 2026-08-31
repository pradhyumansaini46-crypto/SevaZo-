import { z } from 'zod';
import { phoneSchema } from './authValidation';

/**
 * Utility to check for dummy or repetitive strings like "1111111111", "1234567890", "0000000000"
 */
function isDummyRepetitive(val: string): boolean {
  if (!val) return true;
  const clean = val.replace(/[\s-]/g, '');
  if (/^(\w)\1+$/.test(clean)) return true; // All identical characters
  if (clean === '1234567890' || clean === '0123456789' || clean === '123456789012') return true;
  return false;
}

/**
 * Robust flexible date parser for Indian formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.)
 */
export function parseFlexibleDate(dateStr?: string | null): {
  isValid: boolean;
  isFuture: boolean;
  date?: Date;
  formatted?: string;
  error?: string;
} {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, isFuture: false, error: 'Date is required' };
  }

  const clean = dateStr.trim().replace(/[\.\s]/g, '-').replace(/\//g, '-');
  const parts = clean.split('-');

  let year: number;
  let month: number;
  let day: number;

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else if (parts[2].length === 2) {
      // DD-MM-YY -> 20YY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = 2000 + parseInt(parts[2], 10);
    } else {
      return { isValid: false, isFuture: false, error: 'Enter date as DD/MM/YYYY or YYYY-MM-DD' };
    }
  } else if (/^\d{8}$/.test(clean)) {
    // 8 digits: e.g. 25122030 (DDMMYYYY) or 20301225 (YYYYMMDD)
    if (parseInt(clean.slice(0, 4), 10) >= 2020) {
      year = parseInt(clean.slice(0, 4), 10);
      month = parseInt(clean.slice(4, 6), 10);
      day = parseInt(clean.slice(6, 8), 10);
    } else {
      day = parseInt(clean.slice(0, 2), 10);
      month = parseInt(clean.slice(2, 4), 10);
      year = parseInt(clean.slice(4, 8), 10);
    }
  } else {
    // Attempt standard Date parsing
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return { isValid: false, isFuture: false, error: 'Enter date as DD/MM/YYYY or YYYY-MM-DD' };
    }
    year = parsed.getFullYear();
    month = parsed.getMonth() + 1;
    day = parsed.getDate();
  }

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, isFuture: false, error: 'Invalid date values' };
  }

  // Days in month validation
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    return { isValid: false, isFuture: false, error: `Day must be between 1 and ${daysInMonth}` };
  }

  const parsedDate = new Date(year, month - 1, day, 23, 59, 59);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const isFuture = parsedDate.getTime() >= now.getTime();

  return {
    isValid: true,
    isFuture,
    date: parsedDate,
    formatted,
  };
}

/**
 * Step 1: Personal Information Schema
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name should only contain letters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Last name should only contain letters'),
  profilePhoto: z.string().min(1, 'Profile photo is required. Please upload a clear headshot.'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birth = new Date(date);
      if (isNaN(birth.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'You must be at least 18 years old to register as a delivery rider'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: phoneSchema,
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  // Integrated Emergency Contact
  emergencyContactName: z
    .string()
    .min(2, 'Emergency contact full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters'),
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
        const isStandardDl =
          /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(dlClean) ||
          /^[A-Z]{2}[0-9]{13}$/.test(dlClean) ||
          dlClean.length >= 10;
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
          message: 'Licence expiry date is required (e.g. DD/MM/YYYY or YYYY-MM-DD)',
        });
      } else {
        const parsed = parseFlexibleDate(data.expiryDate);
        if (!parsed.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['expiryDate'],
            message: parsed.error || 'Enter a valid expiry date (e.g. DD/MM/YYYY or YYYY-MM-DD)',
          });
        } else if (!parsed.isFuture) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['expiryDate'],
            message: 'Driving Licence has expired. Please enter a valid future expiry date.',
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
  expiryDate: z
    .string()
    .min(4, 'Licence expiry date is required')
    .refine((val) => parseFlexibleDate(val).isValid, 'Enter a valid date (e.g. DD/MM/YYYY or YYYY-MM-DD)')
    .refine((val) => parseFlexibleDate(val).isFuture, 'Driving Licence has expired. Enter a future date.'),
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
      if (!data.registrationNumber || data.registrationNumber.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['registrationNumber'],
          message: 'Vehicle registration number is required (e.g. DL01AB1234)',
        });
      } else {
        const regClean = data.registrationNumber.replace(/[\s-]/g, '').toUpperCase();
        if (regClean.length < 6 || isDummyRepetitive(regClean)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['registrationNumber'],
            message: 'Invalid registration number entered (e.g. DL-01-AB-1234)',
          });
        }
      }
      if (!data.rcNumber || data.rcNumber.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rcNumber'],
          message: 'RC number is required',
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
          message: 'Insurance expiry date is required (e.g. DD/MM/YYYY or YYYY-MM-DD)',
        });
      } else {
        const parsed = parseFlexibleDate(data.insuranceExpiry);
        if (!parsed.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['insuranceExpiry'],
            message: parsed.error || 'Enter a valid expiry date (e.g. DD/MM/YYYY or YYYY-MM-DD)',
          });
        } else if (!parsed.isFuture) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['insuranceExpiry'],
            message: 'Insurance policy has expired. Please enter a valid future expiry date.',
          });
        }
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
 * Step 5: Bank Details Schema
 */
export const bankingSchema = z
  .object({
    preferredPayoutMethod: z.enum(['BANK_ACCOUNT', 'BANK_TRANSFER', 'UPI']),
    accountHolder: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    confirmAccountNumber: z.string().optional(),
    ifsc: z.string().optional(),
    ifscCode: z.string().optional(),
    bankName: z.string().optional(),
    accountType: z.enum(['SAVINGS', 'CURRENT']).optional(),
    chequeImage: z.string().optional(),
    upiId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isBank = data.preferredPayoutMethod === 'BANK_ACCOUNT' || data.preferredPayoutMethod === 'BANK_TRANSFER';
    if (isBank) {
      const accNum = data.accountNumber;
      const confirmAccNum = data.confirmAccountNumber;
      const ifsc = (data.ifsc || data.ifscCode || '').trim().toUpperCase();

      if (!accNum || accNum.length < 8 || accNum.length > 20 || !/^\d+$/.test(accNum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountNumber'],
          message: 'Valid bank account number is required (8-20 digits)',
        });
      }
      if (confirmAccNum !== undefined && accNum !== confirmAccNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmAccountNumber'],
          message: 'Bank account numbers do not match',
        });
      }
      if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ifsc'],
          message: 'Valid 11-character IFSC code is required (e.g. HDFC0001234)',
        });
      }
    }
  });

export type BankingFormValues = z.infer<typeof bankingSchema>;
export const bankDetailsSchema = bankingSchema;
export type BankDetailsFormValues = BankingFormValues;

/**
 * Step 6: Delivery & Category Preferences Schema
 */
export const deliveryPreferencesSchema = z.object({
  city: z.string(),
  zone: z.string(),
  locality: z.string(),
  preferredHubs: z.array(z.string()),
  maxDistanceKm: z.number(),
  acceptHeavyItems: z.boolean(),
  acceptSpecialHandling: z.boolean(),
  categories: z.array(z.string()),
});

export type DeliveryPreferencesFormValues = z.infer<typeof deliveryPreferencesSchema>;
export const preferencesSchema = deliveryPreferencesSchema;
export type PreferencesFormValues = DeliveryPreferencesFormValues;

/**
 * Step 7: Working Hours & Availability Shift Schema
 */
export const workingHoursSchema = z.object({
  preferredShift: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FLEXIBLE']),
  workingDays: z.array(z.string()).min(1, 'Please select at least one working day'),
  maxHoursPerDay: z.number().min(2).max(14),
  isFullTime: z.boolean(),
});

export type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

/**
 * Step 8: Rider Consent & Declaration Form Schema
 */
export const consentSchema = z.object({
  codeOfConductAgreed: z.boolean(),
  safetyGuidelinesAgreed: z.boolean(),
  zeroTolerancePolicyAgreed: z.boolean(),
  backgroundCheckAgreed: z.boolean(),
  dataConsentAgreed: z.boolean(),
  declarationConfirmed: z.boolean(),
  signatureName: z.string().min(2, 'Please type your full legal name as digital signature'),
});

export type ConsentFormValues = z.infer<typeof consentSchema>;

/**
 * Individual Standalone Schemas
 */
export const vehicleDocumentsSchema = z.object({
  rcNumber: z.string().min(5, 'RC number is required (e.g. DL-01-AB-1234)'),
  rcImage: z.string().min(1, 'Registration Certificate photo is required'),
  insuranceNumber: z.string().min(4, 'Insurance policy number is required'),
  insuranceExpiry: z
    .string()
    .min(4, 'Insurance expiry date is required')
    .refine((val) => parseFlexibleDate(val).isValid, 'Enter a valid date (e.g. DD/MM/YYYY or YYYY-MM-DD)')
    .refine((val) => parseFlexibleDate(val).isFuture, 'Insurance policy has expired. Enter a future date.'),
  insuranceImage: z.string().min(1, 'Insurance policy photo is required'),
  pucImage: z.string().optional(),
});

export type VehicleDocumentsFormValues = z.infer<typeof vehicleDocumentsSchema>;
