import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class VendorProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        documents: true,
        bankAccounts: true,
        addresses: true,
        stores: {
          include: {
            businessHours: true,
            category: true,
          },
        },
      },
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updatePersonalProfile(vendorId: string, dto: any) {
    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(dto.ownerName && { ownerName: dto.ownerName }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
        ...(dto.avatar && { avatar: dto.avatar }),
      },
    });
  }

  async updateBusinessProfile(vendorId: string, dto: any) {
    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(dto.businessName && { businessName: dto.businessName }),
        ...(dto.legalEntityType && { legalEntityType: dto.legalEntityType }),
      },
    });
  }
}
