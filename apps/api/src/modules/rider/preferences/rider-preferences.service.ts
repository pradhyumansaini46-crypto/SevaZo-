import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface SavePreferencesDto {
  preferredCategories?: string[];
  serviceRadiusKm?: number;
  workingHours?: any;
  deliveryPreferences?: any;
}

@Injectable()
export class RiderPreferencesService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: {
          preferredCategories: true, serviceRadiusKm: true,
          workingHours: true, deliveryPreferences: true,
        },
      });
      return { riderId, preferences: rider };
    } catch (e) {
      return { riderId, preferences: null };
    }
  }

  async savePreferences(riderId: string, dto: SavePreferencesDto) {
    const data: any = {};
    if (dto.preferredCategories) data.preferredCategories = dto.preferredCategories;
    if (dto.serviceRadiusKm !== undefined) data.serviceRadiusKm = dto.serviceRadiusKm;
    if (dto.workingHours) data.workingHours = dto.workingHours;
    if (dto.deliveryPreferences) data.deliveryPreferences = dto.deliveryPreferences;

    try {
      await this.prisma.rider.update({ where: { id: riderId }, data });
      await this.markSectionCompleted(riderId, 'DELIVERY_PREFERENCES');
    } catch (e) {}

    return { success: true, message: 'Delivery preferences saved successfully.' };
  }

  private async markSectionCompleted(riderId: string, section: string) {
    try {
      await this.prisma.riderOnboardingSection.upsert({
        where: { riderId_section: { riderId, section } },
        create: { riderId, section, status: 'COMPLETED', completedAt: new Date() },
        update: { status: 'COMPLETED', completedAt: new Date() },
      });
    } catch (e) {}
  }
}
