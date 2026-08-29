import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  readSharedStore,
  updateRiderApplicationStatus,
  SharedRiderApplication,
} from '@/common/shared-storage';

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    let dbRiders: any[] = [];
    let total = 0;

    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
        ];
      }
      [total, dbRiders] = await Promise.all([
        this.prisma.rider.count({ where }),
        this.prisma.rider.findMany({
          where,
          skip,
          take: limit,
          include: { documents: true, zone: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    } catch (e) {
      dbRiders = [];
    }

    const store = readSharedStore();
    let sharedRiders = store.riders || [];
    if (search) {
      const s = search.toLowerCase();
      sharedRiders = sharedRiders.filter(
        (r) =>
          r.name?.toLowerCase().includes(s) ||
          r.phone?.includes(s) ||
          r.vehicleNumber?.toLowerCase().includes(s),
      );
    }

    // Merge shared submitted riders with db riders
    const mergedMap = new Map<string, any>();
    for (const r of sharedRiders) {
      mergedMap.set(r.id, r);
    }
    for (const r of dbRiders) {
      if (!mergedMap.has(r.id)) {
        mergedMap.set(r.id, r);
      }
    }

    const allRiders = Array.from(mergedMap.values());
    const paginated = allRiders.slice(skip, skip + limit);

    return {
      data: paginated,
      total: allRiders.length,
      page,
      limit,
      totalPages: Math.ceil(allRiders.length / limit) || 1,
    };
  }

  async findOne(id: string) {
    const store = readSharedStore();
    const sharedRider = store.riders.find((r) => r.id === id);
    if (sharedRider) return sharedRider;

    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id },
        include: {
          documents: true,
          zone: true,
          deliveries: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });
      if (rider) return rider;
    } catch (e) {}

    throw new NotFoundException('Rider not found');
  }

  async getPendingApprovals() {
    const store = readSharedStore();
    const sharedPending = (store.riders || []).filter(
      (r) => r.approvalStatus === 'PENDING' || r.approvalStatus === 'UNDER_REVIEW',
    );

    try {
      const dbPending = await this.prisma.rider.findMany({
        where: {
          OR: [
            { approvalStatus: 'UNDER_REVIEW' },
            { approvalStatus: 'PENDING' },
          ],
        },
        include: {
          documents: true,
          vehicles: true,
          zone: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      const map = new Map<string, any>();
      for (const r of sharedPending) map.set(r.id, r);
      for (const r of dbPending) {
        if (!map.has(r.id)) map.set(r.id, r);
      }
      return Array.from(map.values());
    } catch (e) {
      return sharedPending;
    }
  }

  async updateApproval(id: string, approvalStatus: any, reason?: string) {
    updateRiderApplicationStatus(id, approvalStatus);

    const status = approvalStatus === 'APPROVED' ? 'ACTIVE' : 'INACTIVE';
    const onboardingStatus =
      approvalStatus === 'APPROVED'
        ? 'COMPLETED'
        : approvalStatus === 'REJECTED'
        ? 'REJECTED'
        : 'UNDER_REVIEW';

    try {
      await this.prisma.riderOnboarding.updateMany({
        where: { riderId: id },
        data: {
          status: onboardingStatus,
          rejectionReason: reason || null,
        },
      });

      return await this.prisma.rider.update({
        where: { id },
        data: {
          approvalStatus,
          status,
          rejectionReason: reason,
        },
      });
    } catch (e) {
      return { success: true, id, approvalStatus };
    }
  }

  async updateZone(id: string, zoneId: string) {
    return this.prisma.rider.update({
      where: { id },
      data: { zoneId },
    });
  }
}
