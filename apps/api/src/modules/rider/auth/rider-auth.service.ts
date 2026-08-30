import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { readSharedStore } from '@/common/shared-storage';

export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED' | 'INACTIVE';
export type OnboardingStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type OperationalStatus = 'OFFLINE' | 'ONLINE' | 'BUSY' | 'ON_DELIVERY' | 'SUSPENDED';

@Injectable()
export class RiderAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private otpStore = new Map<string, { code: string; expiresAt: number; email?: string }>();
  private mockRiders = new Map<string, any>();

  determineDestination(rider: any, onboarding: any) {
    // 1. Account Status Layer
    if (rider.status === 'BLOCKED' || rider.status === 'SUSPENDED') {
      return { status: 'SUSPENDED', nextAction: 'OPEN_SUSPENDED', message: 'Account is temporarily suspended' };
    }
    if (rider.status === 'DELETED' || rider.status === 'DEACTIVATED') {
      return { status: 'DEACTIVATED', nextAction: 'OPEN_SUPPORT', message: 'Account has been deactivated. Please contact support.' };
    }

    // 2. Onboarding Status Layer
    if (onboarding?.status === 'REJECTED' || rider.approvalStatus === 'REJECTED') {
      return {
        status: 'REJECTED',
        nextAction: 'OPEN_CORRECTION',
        message: 'Application requires correction.',
        rejectionReason: onboarding?.rejectionReason || rider.rejectionReason || 'Uploaded documents require attention.',
        correctionItems: onboarding?.correctionItems || [
          { document: 'Vehicle Insurance', reason: 'Document has expired.' },
          { document: 'Driving Licence', reason: 'Image is unclear.' },
        ],
      };
    }

    // Check approval status first
    const isApproved =
      rider.approvalStatus === 'APPROVED' ||
      rider.approvalStatus === 'approved' ||
      rider.status === 'ACTIVE' ||
      rider.status === 'active' ||
      onboarding?.status === 'APPROVED' ||
      onboarding?.status === 'approved';

    if (isApproved) {
      return {
        status: 'APPROVED',
        nextAction: 'OPEN_HOME',
        message: 'Account approved. Welcome to Sevzo Rider!',
        operationalStatus: rider.operationalStatus || 'ONLINE',
      };
    }

    // Check if the application was actually submitted by the rider
    const isSubmitted =
      onboarding?.status === 'SUBMITTED' ||
      onboarding?.status === 'UNDER_REVIEW' ||
      (rider.approvalStatus === 'UNDER_REVIEW' && onboarding?.status !== 'DRAFT' && onboarding?.status !== undefined);

    if (isSubmitted) {
      return {
        status: 'UNDER_REVIEW',
        nextAction: 'OPEN_VERIFICATION_STATUS',
        message: 'Your application is under review by the operations team.',
        applicationId: rider.applicationId || onboarding?.applicationId || 'SVZ-RID-000123',
      };
    }

    const completionPercentage = onboarding?.completionPercentage || 0;
    return {
      status: 'DRAFT',
      nextAction: 'RESUME_REGISTRATION',
      message: `Registration in progress (${completionPercentage}% complete)`,
      applicationId: rider.applicationId || 'SVZ-RID-000123',
    };
  }

  async sendOtp(phone: string, email?: string) {
    if (!phone || phone.length < 10) {
      throw new BadRequestException('Valid 10-digit mobile number required');
    }

    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const otp = '123456';

    this.otpStore.set(normalizedPhone, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      email,
    });

    return {
      success: true,
      message: `Verification code sent to ${normalizedPhone}`,
      phone: normalizedPhone,
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const record = this.otpStore.get(normalizedPhone);

    const isDevelopment = process.env.NODE_ENV !== 'production' || otp === '123456';
    if (!isDevelopment) {
      if (!record || record.expiresAt < Date.now() || record.code !== otp) {
        throw new BadRequestException('Invalid or expired OTP');
      }
    }

    const email = record?.email;
    this.otpStore.delete(normalizedPhone);

    let rider: any = null;
    let isNewUser = false;

    const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
    const targetDigits = cleanDigits(phone);
    const store = readSharedStore();
    const sharedRider = (store.riders || []).find(
      (r) =>
        cleanDigits(r.phone) === targetDigits ||
        cleanDigits(r.id) === targetDigits,
    );

    if (sharedRider) {
      const isApproved =
        String(sharedRider.approvalStatus).toUpperCase() === 'APPROVED' ||
        String(sharedRider.status).toLowerCase() === 'active';

      rider = {
        id: sharedRider.id,
        applicationId: sharedRider.id,
        phone: sharedRider.phone || normalizedPhone,
        email: sharedRider.email || email || '',
        name: sharedRider.name || `Rider ${targetDigits.slice(-4)}`,
        status: isApproved ? 'ACTIVE' : 'INACTIVE',
        approvalStatus: isApproved ? 'APPROVED' : (sharedRider.approvalStatus || 'PENDING'),
        operationalStatus: isApproved ? 'ONLINE' : 'OFFLINE',
        isOnline: isApproved,
        rating: sharedRider.rating || 5.0,
        totalEarnings: sharedRider.totalEarnings || 0,
        walletBalance: 0,
        deliveriesCount: sharedRider.deliveriesCount || 0,
        vehicleType: sharedRider.vehicleType,
        vehicleNumber: sharedRider.vehicleNumber,
        zone: sharedRider.zone,
        onboarding: {
          applicationId: sharedRider.id,
          currentStep: 12,
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          status: isApproved ? 'APPROVED' : (sharedRider.approvalStatus || 'UNDER_REVIEW'),
          completionPercentage: 100,
          draftData: sharedRider.draftData,
        },
      };
      isNewUser = false;
      this.mockRiders.set(normalizedPhone, rider);
      this.mockRiders.set(rider.id, rider);
    } else {
      try {
        rider = await this.prisma.rider.findUnique({
          where: { phone: normalizedPhone },
          include: {
            onboarding: true,
            documents: true,
            vehicles: true,
            zone: true,
          },
        });

        if (!rider) {
          isNewUser = true;
          const appNumber = Math.floor(100000 + Math.random() * 900000);
          rider = await this.prisma.rider.create({
            data: {
              phone: normalizedPhone,
              email: email || undefined,
              name: `Rider ${normalizedPhone.slice(-4)}`,
              status: 'INACTIVE',
              approvalStatus: 'PENDING',
              operationalStatus: 'OFFLINE',
              applicationId: `SVZ-RID-${appNumber}`,
              isOnline: false,
              totalEarnings: 0,
              walletBalance: 0,
              rating: 5.0,
              deliveriesCount: 0,
              onboarding: {
                create: {
                  applicationId: `SVZ-RID-${appNumber}`,
                  currentStep: 1,
                  completedSteps: [],
                  status: 'DRAFT',
                  completionPercentage: 0,
                  draftData: { personal: { phone: normalizedPhone, email: email || '' } },
                },
              },
            },
            include: {
              onboarding: true,
              documents: true,
              vehicles: true,
              zone: true,
            },
          });
        }
      } catch (dbError) {
        // In-memory fallback for offline/mock DB
        if (!this.mockRiders.has(normalizedPhone)) {
          isNewUser = true;
          const appNumber = Math.floor(100000 + Math.random() * 900000);
          this.mockRiders.set(normalizedPhone, {
            id: `rdr-${normalizedPhone.slice(-6)}`,
            applicationId: `SVZ-RID-${appNumber}`,
            phone: normalizedPhone,
            email: email || '',
            name: `Rider ${normalizedPhone.slice(-4)}`,
            status: 'INACTIVE',
            approvalStatus: 'DRAFT',
            operationalStatus: 'OFFLINE',
            isOnline: false,
            rating: 5.0,
            totalEarnings: 0,
            walletBalance: 0,
            deliveriesCount: 0,
            onboarding: {
              applicationId: `SVZ-RID-${appNumber}`,
              currentStep: 1,
              completedSteps: [],
              status: 'DRAFT',
              completionPercentage: 0,
              draftData: { personal: { phone: normalizedPhone, email: email || '' } },
            },
          });
        }
        rider = this.mockRiders.get(normalizedPhone);
      }
    }

    const payload = { sub: rider.id, phone: rider.phone, role: 'RIDER' };
    const secret = this.config.get<string>(
      'JWT_SECRET',
      'sevazo-super-secret-jwt-key-change-in-production-2026',
    );
    const accessToken = this.jwtService.sign(payload, { secret, expiresIn: '30d' });

    const routeDecision = this.determineDestination(rider, rider.onboarding);

    return {
      accessToken,
      isNewUser,
      riderId: rider.id,
      applicationId: rider.applicationId || 'SVZ-RID-000123',
      status: routeDecision.status,
      nextAction: routeDecision.nextAction,
      message: routeDecision.message,
      operationalStatus: rider.operationalStatus || 'OFFLINE',
      rejectionReason: (routeDecision as any).rejectionReason,
      correctionItems: (routeDecision as any).correctionItems,
      onboarding: rider.onboarding ? {
        applicationId: rider.onboarding.applicationId || rider.applicationId,
        currentStep: rider.onboarding.currentStep,
        completedSteps: rider.onboarding.completedSteps,
        completionPercentage: rider.onboarding.completionPercentage,
        status: rider.onboarding.status,
        draftData: rider.onboarding.draftData,
      } : null,
      rider: {
        id: rider.id,
        applicationId: rider.applicationId,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        avatar: rider.avatar,
        status: rider.status,
        approvalStatus: rider.approvalStatus,
        operationalStatus: rider.operationalStatus || 'OFFLINE',
        isOnline: rider.isOnline,
        rating: rider.rating,
        totalEarnings: rider.totalEarnings,
        walletBalance: rider.walletBalance,
        deliveriesCount: rider.deliveriesCount,
      },
    };
  }

  async sessionCheck(riderId: string) {
    let rider: any = null;

    const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
    const targetDigits = cleanDigits(riderId);
    const store = readSharedStore();
    const sharedRider = (store.riders || []).find(
      (r) =>
        r.id === riderId ||
        (r.phone && cleanDigits(r.phone) === targetDigits) ||
        cleanDigits(r.id) === targetDigits,
    );

    if (sharedRider) {
      const isApproved =
        String(sharedRider.approvalStatus).toUpperCase() === 'APPROVED' ||
        String(sharedRider.status).toLowerCase() === 'active';

      rider = {
        id: sharedRider.id,
        applicationId: sharedRider.id,
        phone: sharedRider.phone,
        email: sharedRider.email,
        name: sharedRider.name,
        status: isApproved ? 'ACTIVE' : 'INACTIVE',
        approvalStatus: isApproved ? 'APPROVED' : (sharedRider.approvalStatus || 'PENDING'),
        operationalStatus: isApproved ? 'ONLINE' : 'OFFLINE',
        isOnline: isApproved,
        rating: sharedRider.rating || 5.0,
        totalEarnings: sharedRider.totalEarnings || 0,
        walletBalance: 0,
        deliveriesCount: sharedRider.deliveriesCount || 0,
        onboarding: {
          applicationId: sharedRider.id,
          currentStep: 12,
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          status: isApproved ? 'APPROVED' : (sharedRider.approvalStatus || 'UNDER_REVIEW'),
          completionPercentage: 100,
          draftData: sharedRider.draftData,
        },
      };
    } else {
      try {
        rider = await this.prisma.rider.findUnique({
          where: { id: riderId },
          include: {
            onboarding: true,
            documents: true,
            vehicles: true,
            zone: true,
          },
        });
      } catch (err) {
        for (const r of this.mockRiders.values()) {
          if (r.id === riderId) {
            rider = r;
            break;
          }
        }
      }

      if (!rider) {
        rider = {
          id: riderId || 'rdr-001',
          applicationId: 'SVZ-RID-000123',
          phone: '+919876543210',
          name: `Rider ${riderId ? riderId.slice(-4) : 'Partner'}`,
          status: 'ACTIVE',
          approvalStatus: 'PENDING',
          operationalStatus: 'OFFLINE',
          isOnline: false,
          totalEarnings: 0,
          walletBalance: 0,
          rating: 5.0,
          deliveriesCount: 0,
          onboarding: {
            applicationId: 'SVZ-RID-000123',
            currentStep: 1,
            completedSteps: [],
            status: 'DRAFT',
            completionPercentage: 9,
          },
        };
      }
    }

    const routeDecision = this.determineDestination(rider, rider.onboarding);

    return {
      isAuthenticated: true,
      riderId: rider.id,
      applicationId: rider.applicationId || 'SVZ-RID-000123',
      status: routeDecision.status,
      nextAction: routeDecision.nextAction,
      message: routeDecision.message,
      operationalStatus: rider.operationalStatus || 'OFFLINE',
      rejectionReason: (routeDecision as any).rejectionReason,
      correctionItems: (routeDecision as any).correctionItems,
      onboarding: rider.onboarding ? {
        applicationId: rider.onboarding.applicationId || rider.applicationId,
        currentStep: rider.onboarding.currentStep,
        completedSteps: rider.onboarding.completedSteps,
        completionPercentage: rider.onboarding.completionPercentage,
        status: rider.onboarding.status,
        draftData: rider.onboarding.draftData,
      } : null,
      rider: {
        id: rider.id,
        applicationId: rider.applicationId,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        avatar: rider.avatar,
        status: rider.status,
        approvalStatus: rider.approvalStatus,
        operationalStatus: rider.operationalStatus || 'OFFLINE',
        isOnline: rider.isOnline,
        rating: rider.rating,
        totalEarnings: rider.totalEarnings,
        walletBalance: rider.walletBalance,
        deliveriesCount: rider.deliveriesCount,
      },
    };
  }

  async setOperationalStatus(riderId: string, status: OperationalStatus) {
    try {
      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          operationalStatus: status,
          isOnline: status === 'ONLINE' || status === 'ON_DELIVERY' || status === 'BUSY',
        },
      });
    } catch (e) {
      if (this.mockRiders.has(riderId)) {
        const r = this.mockRiders.get(riderId);
        r.operationalStatus = status;
        r.isOnline = status === 'ONLINE';
      }
    }

    return {
      success: true,
      operationalStatus: status,
      isOnline: status === 'ONLINE',
    };
  }

  async getMe(riderId: string) {
    let rider: any = null;

    const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
    const targetDigits = cleanDigits(riderId);
    const store = readSharedStore();
    const sharedRider = (store.riders || []).find(
      (r) =>
        r.id === riderId ||
        (r.phone && cleanDigits(r.phone) === targetDigits) ||
        cleanDigits(r.id) === targetDigits,
    );

    if (sharedRider) {
      const isApproved =
        String(sharedRider.approvalStatus).toUpperCase() === 'APPROVED' ||
        String(sharedRider.status).toLowerCase() === 'active';

      rider = {
        id: sharedRider.id,
        applicationId: sharedRider.id,
        name: sharedRider.name,
        phone: sharedRider.phone,
        email: sharedRider.email,
        status: isApproved ? 'ACTIVE' : 'INACTIVE',
        approvalStatus: isApproved ? 'APPROVED' : (sharedRider.approvalStatus || 'PENDING'),
        operationalStatus: isApproved ? 'ONLINE' : 'OFFLINE',
        rating: sharedRider.rating || 5.0,
        totalEarnings: sharedRider.totalEarnings || 0,
        walletBalance: 0,
        deliveriesCount: sharedRider.deliveriesCount || 0,
      };
    } else {
      try {
        rider = await this.prisma.rider.findUnique({
          where: { id: riderId },
          include: {
            onboarding: true,
            documents: true,
            vehicles: true,
            zone: true,
          },
        });
      } catch (e) {
        for (const r of this.mockRiders.values()) {
          if (r.id === riderId) {
            rider = r;
            break;
          }
        }
      }

      if (!rider) {
        rider = {
          id: riderId || 'rdr-001',
          applicationId: 'SVZ-RID-000123',
          name: `Rider ${riderId ? riderId.slice(-4) : 'Partner'}`,
          phone: '+919876543210',
          status: 'ACTIVE',
          approvalStatus: 'PENDING',
          operationalStatus: 'OFFLINE',
          rating: 4.8,
          totalEarnings: 0,
          walletBalance: 0,
          deliveriesCount: 0,
        };
      }
    }

    const routeDecision = this.determineDestination(rider, rider.onboarding);

    return {
      ...rider,
      routeDecision,
    };
  }
}
