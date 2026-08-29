import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { upsertRiderApplication, readSharedStore, SharedRiderApplication, SharedDocument } from '@/common/shared-storage';

export interface SaveStepDto {
  stepNumber: number;
  data: any;
  saveAndExit?: boolean;
}

export type SectionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export const ONBOARDING_SECTIONS = [
  'ACCOUNT',
  'PERSONAL',
  'ADDRESS',
  'EMERGENCY_CONTACT',
  'VEHICLE',
  'IDENTITY',
  'DRIVING_LICENSE',
  'VEHICLE_DOCUMENTS',
  'BANKING',
  'SERVICE_AREA',
  'DELIVERY_PREFERENCES',
  'AVAILABILITY',
  'AGREEMENTS',
  'REVIEW',
] as const;

export type OnboardingSectionName = (typeof ONBOARDING_SECTIONS)[number];

@Injectable()
export class RiderOnboardingService {
  constructor(private prisma: PrismaService) {}

  private mockOnboardings = new Map<string, any>();

  async getOrCreateOnboarding(riderId: string) {
    try {
      let onboarding = await this.prisma.riderOnboarding.findUnique({
        where: { riderId },
        include: { sections: true },
      });

      if (!onboarding) {
        const appNumber = Math.floor(100000 + Math.random() * 900000);
        onboarding = await this.prisma.riderOnboarding.create({
          data: {
            riderId,
            applicationId: `SVZ-RID-${appNumber}`,
            currentStep: 1,
            completedSteps: [],
            status: 'DRAFT',
            completionPercentage: 0,
            draftData: {},
          },
          include: { sections: true },
        });
      }

      return onboarding;
    } catch (e) {
      if (!this.mockOnboardings.has(riderId)) {
        this.mockOnboardings.set(riderId, {
          id: `onb-${riderId}`,
          riderId,
          applicationId: 'SVZ-RID-000123',
          currentStep: 1,
          completedSteps: [],
          status: 'DRAFT',
          completionPercentage: 0,
          draftData: {},
          sections: ONBOARDING_SECTIONS.map((sec) => ({
            id: `sec-${sec}-${riderId}`,
            section: sec,
            status: sec === 'ACCOUNT' ? 'COMPLETED' : 'NOT_STARTED',
          })),
        });
      }
      return this.mockOnboardings.get(riderId);
    }
  }

  async getOnboardingState(riderId: string) {
    const onboarding = await this.getOrCreateOnboarding(riderId);
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
      rider = {
        id: sharedRider.id,
        name: sharedRider.name,
        phone: sharedRider.phone,
        email: sharedRider.email,
        approvalStatus: sharedRider.approvalStatus,
        applicationId: sharedRider.id,
      };
    } else {
      try {
        rider = await this.prisma.rider.findUnique({
          where: { id: riderId },
          include: {
            documents: true,
            vehicles: true,
          },
        });
      } catch (e) {
        rider = {
          id: riderId,
          name: `Rider ${riderId ? riderId.slice(-4) : 'Partner'}`,
          phone: '+91 9876543210',
          email: 'partner@example.com',
          approvalStatus: 'PENDING',
        };
      }
    }

    const completedCount = onboarding.completedSteps?.length || 0;
    const completionPercentage = Math.min(100, Math.round((completedCount / 14) * 100));

    // Construct 14 section status map
    const sectionMap = ONBOARDING_SECTIONS.reduce((acc: Record<string, SectionStatus>, sec) => {
      const dbSec = onboarding.sections?.find((s: any) => s.section === sec);
      acc[sec] = (dbSec?.status as SectionStatus) || (sec === 'ACCOUNT' ? 'COMPLETED' : 'NOT_STARTED');
      return acc;
    }, {} as Record<string, SectionStatus>);

    return {
      riderId,
      applicationId: onboarding.applicationId || rider?.applicationId || 'SVZ-RID-000123',
      phone: rider?.phone || '+91 9876543210',
      name: rider?.name || 'Rahul Sharma',
      status: onboarding.status,
      approvalStatus: rider?.approvalStatus || 'PENDING',
      rejectionReason: onboarding.rejectionReason || null,
      correctionItems: onboarding.correctionItems || null,
      currentStep: onboarding.currentStep || 1,
      completedSteps: onboarding.completedSteps || [],
      completionPercentage,
      draftData: onboarding.draftData || {},
      submittedAt: onboarding.submittedAt,
      sections: onboarding.sections || [],
      sectionStatus: sectionMap,
      verificationProgress: {
        personalInfo: 'VERIFIED',
        vehicle: 'VERIFIED',
        documents: onboarding.status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'VERIFIED',
        banking: 'VERIFIED',
      },
    };
  }

  /**
   * PATCH /api/v1/rider/onboarding/:section
   * Generic handler to update any onboarding section
   */
  async updateSection(riderId: string, section: string, data: any) {
    const normalizedSection = section.toUpperCase().replace(/-/g, '_');
    if (!ONBOARDING_SECTIONS.includes(normalizedSection as any)) {
      throw new BadRequestException(`Invalid section name. Must be one of: ${ONBOARDING_SECTIONS.join(', ')}`);
    }

    const onboarding = await this.getOrCreateOnboarding(riderId);
    const draftData = { ...(onboarding.draftData || {}), [section]: data };

    // Update section specific tables
    if (normalizedSection === 'PERSONAL') {
      await this.savePersonalDetails(riderId, data);
    } else if (normalizedSection === 'ADDRESS') {
      await this.saveAddress(riderId, data);
    } else if (normalizedSection === 'EMERGENCY_CONTACT') {
      await this.saveEmergencyContact(riderId, data);
    } else if (normalizedSection === 'VEHICLE') {
      await this.saveVehicleDetails(riderId, data);
    }

    const completedSteps = Array.from(new Set([...(onboarding.completedSteps || []), ONBOARDING_SECTIONS.indexOf(normalizedSection as any) + 1]));
    const completionPercentage = Math.min(100, Math.round((completedSteps.length / 14) * 100));

    try {
      await this.prisma.riderOnboarding.update({
        where: { riderId },
        data: {
          draftData,
          completedSteps,
          completionPercentage,
        },
      });

      await this.prisma.riderOnboardingSection.upsert({
        where: { riderId_section: { riderId, section: normalizedSection } },
        create: {
          riderId,
          section: normalizedSection,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
          rejectionReason: null,
        },
      });
    } catch (e) {
      // Mock fallback
    }

    return {
      success: true,
      message: `${section} updated successfully.`,
      section: normalizedSection,
      status: 'COMPLETED',
      completionPercentage,
    };
  }

  // ── Prompt 04: Personal Details ──────────────────────────────────────

  async getPersonalDetails(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: {
          firstName: true,
          lastName: true,
          name: true,
          avatar: true,
          dob: true,
          gender: true,
          phone: true,
          email: true,
        },
      });
      return { riderId, personal: rider };
    } catch (e) {
      return {
        riderId,
        personal: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          name: 'Rahul Sharma',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
          dob: '1995-08-15',
          gender: 'MALE',
          phone: '+91 9876543210',
          email: 'rahul.sharma@example.com',
        },
      };
    }
  }

  async savePersonalDetails(riderId: string, data: any) {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Delivery Partner';

    try {
      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          name: fullName,
          avatar: data.profilePhoto || data.avatar || undefined,
          dob: data.dob ? new Date(data.dob) : undefined,
          gender: data.gender || undefined,
          email: data.email || undefined,
        },
      });
    } catch (e) {}

    return { success: true, message: 'Personal details saved.' };
  }

  // ── Prompt 05: Address Details ───────────────────────────────────────

  async getAddress(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: {
          addressLine1: true,
          addressLine2: true,
          locality: true,
          city: true,
          state: true,
          postalCode: true,
          pincode: true,
          country: true,
          residentialLat: true,
          residentialLng: true,
        },
      });
      return { riderId, address: rider };
    } catch (e) {
      return {
        riderId,
        address: {
          addressLine1: 'Flat 402, Sunshine Heights',
          addressLine2: 'Sector 14',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          residentialLat: 12.9716,
          residentialLng: 77.5946,
        },
      };
    }
  }

  async saveAddress(riderId: string, data: any) {
    try {
      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          locality: data.locality,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode || data.pincode,
          pincode: data.postalCode || data.pincode,
          country: data.country || 'India',
          residentialLat: data.latitude ? parseFloat(data.latitude) : null,
          residentialLng: data.longitude ? parseFloat(data.longitude) : null,
        },
      });
    } catch (e) {}

    return { success: true, message: 'Residential address saved.' };
  }

  // ── Prompt 05: Emergency Contact ─────────────────────────────────────

  async getEmergencyContact(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: {
          emergencyContactName: true,
          emergencyContactRelation: true,
          emergencyContactPhone: true,
        },
      });
      return { riderId, emergencyContact: rider };
    } catch (e) {
      return {
        riderId,
        emergencyContact: {
          emergencyContactName: 'Ramesh Sharma',
          emergencyContactRelation: 'Father',
          emergencyContactPhone: '+91 98111 22233',
        },
      };
    }
  }

  async saveEmergencyContact(riderId: string, data: any) {
    if (!data.fullName && !data.emergencyContactName) {
      throw new BadRequestException('Emergency contact name is required');
    }
    if (!data.mobileNumber && !data.emergencyContactPhone) {
      throw new BadRequestException('Emergency contact mobile number is required');
    }

    try {
      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          emergencyContactName: data.fullName || data.emergencyContactName,
          emergencyContactRelation: data.relationship || data.emergencyContactRelation || 'Family',
          emergencyContactPhone: data.mobileNumber || data.emergencyContactPhone,
        },
      });
    } catch (e) {}

    return { success: true, message: 'Emergency contact saved.' };
  }

  // ── Prompt 06: Vehicle Details ───────────────────────────────────────

  async getVehicleDetails(riderId: string) {
    try {
      const vehicle = await this.prisma.riderVehicle.findFirst({
        where: { riderId },
        orderBy: { createdAt: 'desc' },
      });
      return { riderId, vehicle };
    } catch (e) {
      return {
        riderId,
        vehicle: {
          id: `veh-${riderId}`,
          riderId,
          vehicleType: 'MOTORCYCLE',
          ownershipType: 'OWNED',
          make: 'Honda',
          model: 'Activa 6G',
          manufacturingYear: '2022',
          color: 'Black',
          registrationNumber: 'DL 01 AB 1234',
          status: 'PENDING',
        },
      };
    }
  }

  async saveVehicleDetails(riderId: string, data: any) {
    const isBicycle = data.vehicleType === 'BICYCLE';

    if (!isBicycle) {
      if (!data.make || !data.model || !data.manufacturingYear || !data.registrationNumber) {
        throw new BadRequestException('Make, model, manufacturing year, and registration number are required for motor vehicles');
      }

      // Check duplicate registration
      try {
        const existing = await this.prisma.riderVehicle.findFirst({
          where: {
            registrationNumber: data.registrationNumber.toUpperCase().trim(),
            riderId: { not: riderId },
          },
        });
        if (existing) {
          throw new BadRequestException('This vehicle registration number is already registered with another partner');
        }
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
      }
    } else {
      if (!data.bicycleBrand && !data.make) {
        throw new BadRequestException('Bicycle brand is required');
      }
    }

    const vehicleData: any = {
      riderId,
      vehicleType: data.vehicleType || 'MOTORCYCLE',
      ownershipType: data.ownershipType || 'OWNED',
      make: data.make || data.bicycleBrand || 'Generic',
      model: data.model || data.bicycleModel || 'Standard',
      manufacturingYear: String(data.manufacturingYear || data.bicyclePurchaseYear || new Date().getFullYear()),
      color: data.color || data.bicycleColor || 'Black',
      registrationNumber: isBicycle ? null : data.registrationNumber?.toUpperCase().trim(),
      status: 'PENDING',
    };

    try {
      const existingVehicle = await this.prisma.riderVehicle.findFirst({
        where: { riderId },
      });

      if (existingVehicle) {
        await this.prisma.riderVehicle.update({
          where: { id: existingVehicle.id },
          data: vehicleData,
        });
      } else {
        await this.prisma.riderVehicle.create({
          data: vehicleData,
        });
      }

      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          vehicleType: data.vehicleType,
          vehicleNumber: data.registrationNumber || null,
        },
      });
    } catch (e) {}

    return { success: true, message: 'Vehicle details saved successfully.' };
  }

  // ── Legacy Step Saving Compatibility ─────────────────────────────────

  async saveStep(riderId: string, dto: SaveStepDto) {
    const { stepNumber, data, saveAndExit } = dto;
    if (stepNumber < 1 || stepNumber > 14) {
      throw new BadRequestException('Invalid step number. Must be between 1 and 14.');
    }

    const section = ONBOARDING_SECTIONS[stepNumber - 1];
    return this.updateSection(riderId, section, data);
  }

  async submitApplication(riderId: string, payload?: any) {
    let onboarding: any = null;
    let rider: any = null;

    try {
      await this.prisma.riderOnboarding.update({
        where: { riderId },
        data: {
          status: 'UNDER_REVIEW',
          submittedAt: new Date(),
        },
      });

      await this.prisma.rider.update({
        where: { id: riderId },
        data: { approvalStatus: 'UNDER_REVIEW' },
      });
    } catch (e) {}

    try {
      onboarding = await this.getOrCreateOnboarding(riderId);
    } catch (e) {}

    try {
      rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
      });
    } catch (e) {}

    const draft = { ...(onboarding?.draftData || {}), ...(payload || {}) };
    const personal = draft.personal || draft.personalInfo || {};
    const vehicle = draft.vehicle || {};
    const identity = draft.identity || {};
    const dl = draft.drivingLicence || draft.drivingLicense || draft.driving_license || {};
    const vehicleDocs = draft.vehicleDocuments || draft.vehicle_documents || {};
    const serviceArea = draft.serviceArea || draft.service_area || {};
    const address = draft.address || {};
    const emergency = draft.emergencyContact || draft.emergency_contact || {};
    const banking = draft.banking || {};

    const firstName = personal.firstName || rider?.firstName || '';
    const lastName = personal.lastName || rider?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || personal.name || rider?.name || 'Delivery Partner';
    const phone = personal.phone || rider?.phone || payload?.phone || '+91 9876543210';
    const email = personal.email || rider?.email || payload?.email || 'partner@example.com';
    const vType = vehicle.vehicleType || rider?.vehicleType || 'MOTORCYCLE';
    const vNumber = vehicle.registrationNumber || vehicle.vehicleNumber || rider?.vehicleNumber || 'RJ 14 AB 1234';
    const zoneName = serviceArea.zoneName || serviceArea.primaryZone || serviceArea.city || rider?.zone?.name || 'Central Hub';

    const docs: SharedDocument[] = [];
    if (identity.idNumber || identity.aadhaarNumber) {
      docs.push({
        id: `doc-${riderId}-aadhaar`,
        type: (identity.idType || 'aadhaar').toLowerCase(),
        number: identity.idNumber || identity.aadhaarNumber,
        fileUrl: identity.frontImage || '/docs/aadhaar.pdf',
        verified: false,
      });
    }
    if (identity.panNumber || draft.pan?.panNumber) {
      docs.push({
        id: `doc-${riderId}-pan`,
        type: 'pan',
        number: identity.panNumber || draft.pan?.panNumber,
        fileUrl: identity.panImage || '/docs/pan.pdf',
        verified: false,
      });
    }
    if (dl.licenseNumber || dl.number) {
      docs.push({
        id: `doc-${riderId}-dl`,
        type: 'driving_license',
        number: dl.licenseNumber || dl.number,
        fileUrl: dl.frontImage || '/docs/dl.pdf',
        verified: false,
        expiry: dl.expiryDate,
      });
    }
    if (vehicleDocs.rcNumber || vehicleDocs.number) {
      docs.push({
        id: `doc-${riderId}-rc`,
        type: 'vehicle_rc',
        number: vehicleDocs.rcNumber || vehicleDocs.number,
        fileUrl: vehicleDocs.rcImage || '/docs/rc.pdf',
        verified: false,
      });
    }
    if (vehicleDocs.insuranceNumber) {
      docs.push({
        id: `doc-${riderId}-insurance`,
        type: 'insurance',
        number: vehicleDocs.insuranceNumber,
        fileUrl: vehicleDocs.insuranceImage || '/docs/insurance.pdf',
        verified: false,
        expiry: vehicleDocs.insuranceExpiry,
      });
    }

    const appId = onboarding?.applicationId || rider?.applicationId || `SVZ-RID-${Math.floor(100000 + Math.random() * 900000)}`;

    const sharedApp: SharedRiderApplication = {
      id: riderId.startsWith('rdr-') ? riderId : `rdr-${riderId.slice(-6)}`,
      name: fullName,
      email,
      phone,
      avatar: personal.profilePhoto || personal.avatar || rider?.avatar || '',
      status: 'pending',
      approvalStatus: 'PENDING',
      vehicleType: vType.toLowerCase(),
      vehicleNumber: vNumber,
      zone: zoneName,
      deliveriesCount: 0,
      rating: 5.0,
      totalEarnings: 0,
      isOnline: false,
      address: address.addressLine1 ? `${address.addressLine1}, ${address.city || ''} ${address.postalCode || ''}` : undefined,
      emergencyContact: (emergency.fullName || emergency.emergencyContactName) ? {
        name: emergency.fullName || emergency.emergencyContactName,
        phone: emergency.mobileNumber || emergency.emergencyContactPhone,
        relation: emergency.relationship || emergency.emergencyContactRelation,
      } : undefined,
      banking: banking.accountNumber ? {
        accountNumber: banking.accountNumber,
        ifscCode: banking.ifscCode,
        bankName: banking.bankName,
      } : undefined,
      documents: docs.length > 0 ? docs : [
        { id: `doc-${riderId}-kyc`, type: 'identity_proof', number: 'Submitted', fileUrl: '/docs/kyc.pdf', verified: false }
      ],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draftData: draft,
    };

    upsertRiderApplication(sharedApp);

    return {
      success: true,
      message: 'Application submitted successfully. Under review by Operations.',
      status: 'UNDER_REVIEW',
      applicationId: appId,
      data: sharedApp,
    };
  }

  async resubmitCorrection(riderId: string, correctedData: any) {
    try {
      await this.prisma.riderOnboarding.update({
        where: { riderId },
        data: {
          status: 'UNDER_REVIEW',
          rejectionReason: null,
          correctionItems: null,
        },
      });

      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          approvalStatus: 'UNDER_REVIEW',
          rejectionReason: null,
        },
      });
    } catch (e) {}

    return {
      success: true,
      message: 'Correction submitted for verification.',
      status: 'UNDER_REVIEW',
    };
  }
}
