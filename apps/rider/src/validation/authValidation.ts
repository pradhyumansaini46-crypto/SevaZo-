import { z } from 'zod';

/**
 * Zod validation schemas for Rider Authentication
 */

export const phoneSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(10, 'Mobile number must not exceed 10 digits')
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number');

export const loginSchema = z.object({
  phone: phoneSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  phone: phoneSchema,
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpStringSchema = z
  .string()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only numbers');

export const otpSchema = z.object({
  otp: otpStringSchema,
});

export type OtpFormValues = z.infer<typeof otpSchema>;
