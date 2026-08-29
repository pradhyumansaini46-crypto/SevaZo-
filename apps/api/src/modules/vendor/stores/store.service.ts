import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async getStores(vendorId: string) {
    return this.prisma.store.findMany({
      where: { vendorId },
      include: {
        businessHours: true,
        category: true,
      },
    });
  }

  async getPrimaryStore(vendorId: string) {
    const store = await this.prisma.store.findFirst({
      where: { vendorId },
      include: {
        businessHours: true,
        category: true,
      },
    });
    if (!store) throw new NotFoundException('Store not found for this vendor');
    return store;
  }

  async updateStore(vendorId: string, storeId: string, dto: any) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, vendorId },
    });
    if (!store) throw new NotFoundException('Store not found');

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logo && { logo: dto.logo }),
        ...(dto.banner && { banner: dto.banner }),
        ...(dto.isOpen !== undefined && { isOpen: dto.isOpen }),
        ...(dto.isAcceptingOrders !== undefined && { isAcceptingOrders: dto.isAcceptingOrders }),
        ...(dto.prepTimeMinutes && { prepTimeMinutes: parseInt(dto.prepTimeMinutes, 10) }),
        ...(dto.deliveryRadiusKm && { deliveryRadiusKm: parseFloat(dto.deliveryRadiusKm) }),
      },
      include: {
        businessHours: true,
      },
    });
  }

  async updateBusinessHours(vendorId: string, storeId: string, hours: Array<any>) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, vendorId },
    });
    if (!store) throw new NotFoundException('Store not found');

    for (const h of hours) {
      await this.prisma.vendorBusinessHours.upsert({
        where: {
          storeId_dayOfWeek: {
            storeId,
            dayOfWeek: h.dayOfWeek,
          },
        },
        update: {
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        },
        create: {
          storeId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        },
      });
    }

    return this.prisma.vendorBusinessHours.findMany({ where: { storeId } });
  }
}
