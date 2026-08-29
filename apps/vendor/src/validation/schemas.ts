import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email is required');

export const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Please enter a valid 15-character GSTIN (e.g. 27AABCS1429B1Z0)'
  );

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid 10-character PAN (e.g. ABCDE1234F)');

export const fssaiSchema = z
  .string()
  .regex(/^\d{14}$/, 'FSSAI License must be exactly 14 digits');

export const ifscSchema = z
  .string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid 11-character IFSC code (e.g. HDFC0000123)');

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code');

export const ownerDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  dateOfBirth: z.string().min(8, 'Please enter Date of Birth (DD/MM/YYYY)'),
  profilePhoto: z.string().optional(),
});

export const businessInfoSchema = z.object({
  businessName: z.string().min(3, 'Registered legal business name is required'),
  displayName: z.string().min(2, 'Customer-facing store display name is required'),
  legalEntityType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PVT_LTD', 'OTHER']),
  yearEstablished: z.string().optional(),
  businessDescription: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
});

export const addressSchema = z.object({
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  area: z.string().min(2, 'Area / locality is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema,
  country: z.string().min(2, 'Country is required'),
});

export const bankDetailsSchema = z
  .object({
    accountHolder: z.string().min(3, 'Account holder name is required'),
    bankName: z.string().min(2, 'Bank name is required'),
    accountNumber: z.string().min(8, 'Bank account number must be at least 8 digits'),
    confirmAccountNumber: z.string().min(8, 'Please confirm your bank account number'),
    ifsc: ifscSchema,
    accountType: z.enum(['CURRENT', 'SAVINGS']),
    payoutPreference: z.enum(['BANK_ACCOUNT', 'UPI']),
    upiId: z.string().optional(),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber'],
  });

export type OwnerDetailsFormValues = z.infer<typeof ownerDetailsSchema>;
export type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;
