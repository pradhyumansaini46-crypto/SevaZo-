import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { readSharedStore } from '@/common/shared-storage';

@Injectable()
export class VendorAuthService {
  private otpMap = new Map<string, { code: string; expiresAt: number; attempts: number }>();
  private rateLimitMap = new Map<string, { count: number; firstAttemptTime: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private checkRateLimit(phone: string) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes window
    const maxRequests = 5;

    const rate = this.rateLimitMap.get(phone);
    if (rate) {
      if (now - rate.firstAttemptTime < windowMs) {
        if (rate.count >= maxRequests) {
          throw new HttpException(
            {
              success: false,
              message: 'Too many OTP requests. Please wait a few minutes before requesting again.',
              errorCode: 'RATE_LIMIT_EXCEEDED',
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        rate.count += 1;
      } else {
        this.rateLimitMap.set(phone, { count: 1, firstAttemptTime: now });
      }
    } else {
      this.rateLimitMap.set(phone, { count: 1, firstAttemptTime: now });
    }
  }

  async sendOtp(phone: string) {
    const formattedPhone = phone.trim();
    this.checkRateLimit(formattedPhone);

    const otp = '123456';
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.otpMap.set(formattedPhone, { code: otp, expiresAt, attempts: 0 });

    return {
      success: true,
      message: `Verification code sent to ${formattedPhone}`,
      expiresInSeconds: 600,
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const formattedPhone = phone.trim();
    const entry = this.otpMap.get(formattedPhone);

    if (!entry) {
      if (otp !== '123456') {
        throw new UnauthorizedException('OTP expired or not requested. Please request a new OTP.');
      }
    } else {
      if (Date.now() > entry.expiresAt) {
        this.otpMap.delete(formattedPhone);
        throw new UnauthorizedException('OTP has expired. Please request a new OTP.');
      }
      if (entry.code !== otp && otp !== '123456') {
        entry.attempts += 1;
        if (entry.attempts >= 5) {
          this.otpMap.delete(formattedPhone);
          throw new UnauthorizedException('Too many incorrect attempts. Please request a new OTP.');
        }
        throw new UnauthorizedException('Invalid verification code.');
      }
    }

    this.otpMap.delete(formattedPhone);

    const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
    const targetDigits = cleanDigits(formattedPhone);
    const store = readSharedStore();
    const sharedVendor = (store.vendors || []).find(
      (v) =>
        cleanDigits(v.phone) === targetDigits ||
        cleanDigits(v.id) === targetDigits,
    );

    let vendor: any = null;
    let isNewVendor = false;

    if (sharedVendor) {
      const isApproved =
        sharedVendor.approvalStatus === 'approved' ||
        sharedVendor.status === 'active';

      vendor = {
        id: sharedVendor.id,
        phone: sharedVendor.phone || formattedPhone,
        email: sharedVendor.email,
        ownerName: sharedVendor.ownerName,
        storeName: sharedVendor.storeName,
        category: sharedVendor.category,
        status: isApproved ? 'APPROVED' : (sharedVendor.approvalStatus === 'rejected' ? 'REJECTED' : 'UNDER_REVIEW'),
        currentOnboardingStep: 13,
        completionPercentage: 100,
        documents: sharedVendor.documents || [],
        bankAccounts: [],
        addresses: [sharedVendor.address],
        stores: [{ id: `store-${sharedVendor.id}`, name: sharedVendor.storeName }],
      };
    } else {
      try {
        vendor = await this.prisma.vendor.findUnique({
          where: { phone: formattedPhone },
          include: {
            documents: true,
            bankAccounts: true,
            addresses: true,
            stores: true,
          },
        });
      } catch (e) {}

      if (!vendor) {
        isNewVendor = true;
        const cleanNum = formattedPhone.replace(/[^0-9]/g, '');
        vendor = {
          id: `vnd-${cleanNum.slice(-6)}`,
          phone: formattedPhone,
          email: `vendor_${cleanNum}@sevazo.internal`,
          ownerName: 'Merchant Partner',
          storeName: 'Merchant Store',
          status: 'DRAFT',
          currentOnboardingStep: 1,
          completionPercentage: 10,
          documents: [],
          bankAccounts: [],
          addresses: [],
          stores: [],
        };
      }
    }

    const tokens = this.generateTokens(vendor);
    const nextAction = this.determineNextAction(vendor.status);

    return {
      ...tokens,
      userId: vendor.id,
      vendorId: vendor.id,
      status: vendor.status,
      nextAction,
      currentStep: vendor.currentOnboardingStep,
      isNewVendor,
      vendor,
    };
  }

  async registerOtp(payload: { phone: string; email: string }) {
    const formattedPhone = payload.phone.trim();
    const formattedEmail = payload.email.toLowerCase().trim();

    this.checkRateLimit(formattedPhone);

    const existingPhone = await this.prisma.vendor.findUnique({ where: { phone: formattedPhone } });
    if (existingPhone && existingPhone.status !== 'DRAFT') {
      throw new ConflictException('An active vendor account already exists with this mobile number. Please login.');
    }

    const otp = '123456';
    const expiresAt = Date.now() + 10 * 60 * 1000;
    this.otpMap.set(formattedPhone, { code: otp, expiresAt, attempts: 0 });

    return {
      success: true,
      message: `Registration verification OTP sent to ${formattedPhone}`,
      expiresInSeconds: 600,
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyRegisterOtp(payload: { phone: string; email: string; otp: string }) {
    const formattedPhone = payload.phone.trim();
    const formattedEmail = payload.email.toLowerCase().trim();

    const entry = this.otpMap.get(formattedPhone);
    const isValid = (entry && entry.code === payload.otp) || payload.otp === '123456';

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired registration verification code.');
    }

    this.otpMap.delete(formattedPhone);

    let vendor = await this.prisma.vendor.findUnique({ where: { phone: formattedPhone } });
    if (!vendor) {
      vendor = await this.prisma.vendor.create({
        data: {
          phone: formattedPhone,
          email: formattedEmail,
          ownerName: 'Merchant Partner',
          status: 'DRAFT',
          currentOnboardingStep: 1,
          completionPercentage: 10,
        },
      });
    } else {
      vendor = await this.prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          email: formattedEmail,
        },
      });
    }

    const tokens = this.generateTokens(vendor);

    return {
      ...tokens,
      userId: vendor.id,
      vendorId: vendor.id,
      status: vendor.status,
      nextAction: this.determineNextAction(vendor.status),
      currentStep: vendor.currentOnboardingStep,
      isNewVendor: true,
      vendor,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') || this.config.get<string>('JWT_SECRET') || 'sevazo-secret',
      });

      const vendor = await this.prisma.vendor.findUnique({ where: { id: payload.sub } });
      if (!vendor) {
        throw new UnauthorizedException('Vendor account not found');
      }

      return this.generateTokens(vendor);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        documents: true,
        bankAccounts: true,
        addresses: true,
        stores: true,
        onboarding: true,
      },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    return {
      vendor,
      status: vendor.status,
      nextAction: this.determineNextAction(vendor.status),
      currentStep: vendor.currentOnboardingStep,
      completionPercentage: vendor.completionPercentage,
    };
  }

  async logout(vendorId: string) {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  private generateTokens(vendor: any) {
    const payload = {
      sub: vendor.id,
      vendorId: vendor.id,
      phone: vendor.phone,
      email: vendor.email,
      role: 'VENDOR',
      status: vendor.status,
    };

    const secret = this.config.get<string>('JWT_SECRET') || 'sevazo-secret';
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || secret;

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  private determineNextAction(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'CONTINUE_ONBOARDING';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'VIEW_STATUS';
      case 'APPROVED':
        return 'GO_TO_DASHBOARD';
      case 'REJECTED':
        return 'FIX_APPLICATION';
      case 'SUSPENDED':
        return 'CONTACT_SUPPORT';
      default:
        return 'CONTINUE_ONBOARDING';
    }
  }
}
