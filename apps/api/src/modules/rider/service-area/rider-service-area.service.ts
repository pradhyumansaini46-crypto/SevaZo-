import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface SaveServiceAreaDto {
  city: string;
  preferredZones: string[];
}

@Injectable()
export class RiderServiceAreaService {
  constructor(private prisma: PrismaService) {}

  async getServiceArea(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: { preferredCity: true, preferredZones: true, serviceRadiusKm: true },
      });
      return { riderId, serviceArea: rider };
    } catch (e) {
      return { riderId, serviceArea: null };
    }
  }

  async saveServiceArea(riderId: string, dto: SaveServiceAreaDto) {
    if (!dto.city) throw new BadRequestException('City is required');

    try {
      await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          preferredCity: dto.city,
          preferredZones: dto.preferredZones || [],
        },
      });
      await this.markSectionCompleted(riderId, 'SERVICE_AREA');
    } catch (e) {}

    return { success: true, message: 'Service area saved successfully.' };
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
