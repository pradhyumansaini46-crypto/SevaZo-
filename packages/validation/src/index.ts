import { z } from 'zod';

// 1. AUTH SCHEMAS
export const AdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const VerifyMfaSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'MFA code must be exactly 6 digits').regex(/^\d+$/, 'MFA code must contain only numbers'),
});
export type VerifyMfaInput = z.infer<typeof VerifyMfaSchema>;

// 2. VENDOR APPROVAL SCHEMAS
export const ReviewVendorKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  rejectionReason: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});
export type ReviewVendorKycInput = z.infer<typeof ReviewVendorKycSchema>;

// 3. RIDER APPROVAL SCHEMAS
export const ReviewRiderKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  rejectionReason: z.string().optional(),
});
export type ReviewRiderKycInput = z.infer<typeof ReviewRiderKycSchema>;

// 4. CATALOG SCHEMAS
export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const CreateBrandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  logo: z.string().url().optional(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;

export const ModerateProductSchema = z.object({
  isApproved: z.boolean(),
  isActive: z.boolean().optional(),
  moderationNotes: z.string().optional(),
});
export type ModerateProductInput = z.infer<typeof ModerateProductSchema>;

// 5. ORDER MANAGEMENT SCHEMAS
export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
  notes: z.string().optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// 6. FINANCE SCHEMAS
export const ProcessRefundSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive('Refund amount must be greater than zero'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  status: z.enum(['APPROVED', 'REJECTED']),
});
export type ProcessRefundInput = z.infer<typeof ProcessRefundSchema>;

export const ApproveSettlementSchema = z.object({
  settlementId: z.string().uuid(),
  notes: z.string().optional(),
});
export type ApproveSettlementInput = z.infer<typeof ApproveSettlementSchema>;

// 7. COUPON SCHEMAS
export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FLAT_AMOUNT', 'FREE_DELIVERY']),
  value: z.number().positive(),
  minOrderValue: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;

// 8. SYSTEM SETTINGS SCHEMAS
export const UpdatePlatformSettingsSchema = z.object({
  platformName: z.string().min(2),
  supportEmail: z.string().email(),
  supportPhone: z.string(),
  defaultDeliveryFee: z.number().nonnegative(),
  defaultCommissionRate: z.number().min(0).max(100),
  taxRatePercentage: z.number().min(0).max(100),
  currencyCode: z.string().length(3).default('INR'),
  operationalRadiusKm: z.number().positive().default(25),
});
export type UpdatePlatformSettingsInput = z.infer<typeof UpdatePlatformSettingsSchema>;
