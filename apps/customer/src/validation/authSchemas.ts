import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Invalid mobile number length')
    .regex(/^[0-9+\s]+$/, 'Mobile number should only contain digits'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must only contain digits'),
});

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long'),
  lastName: z.string().max(50, 'Last name is too long').optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  dob: z
    .string()
    .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Date of Birth format must be DD/MM/YYYY')
    .optional()
    .or(z.literal('')),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().min(3, 'Address name is required'),
  city: z.string().min(2, 'City is required'),
});

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  line1: z.string().min(3, 'House/Flat/Building is required'),
  line2: z.string().min(3, 'Street/Area is required'),
  landmark: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z
    .string()
    .length(6, 'PIN Code must be 6 digits')
    .regex(/^[0-9]+$/, 'PIN Code must be numeric'),
  instructions: z.string().max(200, 'Instructions too long').optional().or(z.literal('')),
  isDefault: z.boolean().default(true),
});

export const termsSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Conditions' }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the Privacy Policy' }),
  }),
  marketingConsent: z.boolean().default(false),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type LocationFormValues = z.infer<typeof locationSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type TermsFormValues = z.infer<typeof termsSchema>;
