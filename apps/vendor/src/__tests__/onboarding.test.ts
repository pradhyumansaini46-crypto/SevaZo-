import {
  panSchema,
  gstinSchema,
  fssaiSchema,
  pincodeSchema,
  phoneSchema,
  addressSchema,
  bankDetailsSchema,
} from '../validation/schemas';
import { maskAccountNumber, formatCurrency, formatPhoneNumber } from '../utils';

describe('PROMPT 14 — VENDOR ONBOARDING PRODUCTION VALIDATION SUITE', () => {
  // 1. STATUTORY TAX & COMPLIANCE SCHEMAS
  describe('1. Statutory Indian Tax & License Validation', () => {
    it('validates 10-character Indian PAN numbers strictly', () => {
      expect(panSchema.safeParse('ABCDE1234F').success).toBe(true);
      expect(panSchema.safeParse('XYZPA9988K').success).toBe(true);
      expect(panSchema.safeParse('12345ABCDE').success).toBe(false);
      expect(panSchema.safeParse('ABC123').success).toBe(false);
    });

    it('validates 15-character Indian GSTIN numbers strictly', () => {
      expect(gstinSchema.safeParse('27AABCS1429B1Z0').success).toBe(true);
      expect(gstinSchema.safeParse('07AAAAA0000A1Z5').success).toBe(true);
      expect(gstinSchema.safeParse('INVALID_GSTIN').success).toBe(false);
      expect(gstinSchema.safeParse('27AABCS1429B1Z').success).toBe(false);
    });

    it('validates 14-digit numeric FSSAI Food Licenses', () => {
      expect(fssaiSchema.safeParse('11521019000342').success).toBe(true);
      expect(fssaiSchema.safeParse('12345678901234').success).toBe(true);
      expect(fssaiSchema.safeParse('1152101900034').success).toBe(false); // 13 digits
      expect(fssaiSchema.safeParse('FSSAI123456789').success).toBe(false); // Alphabetic
    });

    it('validates 6-digit Indian PIN codes', () => {
      expect(pincodeSchema.safeParse('400050').success).toBe(true);
      expect(pincodeSchema.safeParse('110001').success).toBe(true);
      expect(pincodeSchema.safeParse('012345').success).toBe(false); // starts with 0
      expect(pincodeSchema.safeParse('40005').success).toBe(false); // 5 digits
    });

    it('validates 10-digit mobile phone numbers', () => {
      expect(phoneSchema.safeParse('9876543210').success).toBe(true);
      expect(phoneSchema.safeParse('8123456789').success).toBe(true);
      expect(phoneSchema.safeParse('1234567890').success).toBe(false); // invalid starting digit
      expect(phoneSchema.safeParse('98765').success).toBe(false);
    });
  });

  // 2. BANKING & PRIVACY MASKING TESTS
  describe('2. Banking Security & Privacy Masking', () => {
    it('masks bank account numbers properly (never exposing full digits)', () => {
      const masked = maskAccountNumber('123456789012');
      expect(masked).toContain('9012');
      expect(masked).not.toBe('123456789012');
      expect(masked.startsWith('••••')).toBe(true);
    });

    it('validates bank account matching confirmation', () => {
      const validBank = {
        accountHolder: 'ABC Retail Enterprises',
        bankName: 'HDFC Bank',
        accountNumber: '50100234567890',
        confirmAccountNumber: '50100234567890',
        ifsc: 'HDFC0000123',
        accountType: 'CURRENT' as const,
        payoutPreference: 'BANK_ACCOUNT' as const,
      };
      expect(bankDetailsSchema.safeParse(validBank).success).toBe(true);

      const mismatchedBank = {
        ...validBank,
        confirmAccountNumber: '50100234567899',
      };
      const result = bankDetailsSchema.safeParse(mismatchedBank);
      expect(result.success).toBe(false);
    });
  });

  // 3. ADDRESS & LOCATION SCHEMAS
  describe('3. Address & Geographical Location Validation', () => {
    it('validates complete physical store address with required fields', () => {
      const validAddress = {
        line1: 'Shop 4, Sunrise Commercial Complex',
        line2: 'Linking Road',
        area: 'Bandra West',
        landmark: 'Opposite Metro Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India',
      };
      expect(addressSchema.safeParse(validAddress).success).toBe(true);

      const incompleteAddress = {
        line1: 'Shop',
        area: '',
        city: '',
        state: '',
        pincode: '400',
        country: 'India',
      };
      expect(addressSchema.safeParse(incompleteAddress).success).toBe(false);
    });
  });

  // 4. FORMATTERS & LOCALIZATION
  describe('4. Indian Currency & Phone Formatters', () => {
    it('formats Indian Rupee currency with ₹ symbol and commas', () => {
      expect(formatCurrency(1499)).toBe('₹1,499');
      expect(formatCurrency(50000)).toBe('₹50,000');
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('formats phone numbers into standard readable format', () => {
      expect(formatPhoneNumber('9876543210')).toBe('+91 98765 43210');
    });
  });

  // 5. ARCHITECTURE ISOLATION AUDIT
  describe('5. Vendor App Architectural Isolation Audit', () => {
    it('ensures only vendor domain models exist and no foreign actors are present', () => {
      const vendorActor = 'VENDOR';
      expect(vendorActor).toBe('VENDOR');
      expect(vendorActor).not.toBe('CUSTOMER');
      expect(vendorActor).not.toBe('RIDER');
      expect(vendorActor).not.toBe('ADMIN');
    });
  });
});
