import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  readSharedStore,
  updateVendorApplicationStatus,
  SharedVendorApplication,
} from '@/common/shared-storage';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    let dbVendors: any[] = [];
    let total = 0;

    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { businessName: { contains: search, mode: 'insensitive' } },
          { ownerName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      [total, dbVendors] = await Promise.all([
        this.prisma.vendor.count({ where }),
        this.prisma.vendor.findMany({
          where,
          skip,
          take: limit,
          include: { addresses: true, documents: true, stores: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    } catch (e) {
      dbVendors = [];
    }

    const store = readSharedStore();
    let sharedVendors = store.vendors || [];
    if (search) {
      const s = search.toLowerCase();
      sharedVendors = sharedVendors.filter(
        (v) =>
          v.storeName?.toLowerCase().includes(s) ||
          v.ownerName?.toLowerCase().includes(s) ||
          v.phone?.includes(s) ||
          v.email?.toLowerCase().includes(s),
      );
    }

    const mergedMap = new Map<string, any>();
    for (const v of sharedVendors) mergedMap.set(v.id, v);
    for (const v of dbVendors) {
      if (!mergedMap.has(v.id)) mergedMap.set(v.id, v);
    }

    const allVendors = Array.from(mergedMap.values());
    const paginated = allVendors.slice(skip, skip + limit);

    return {
      data: paginated,
      total: allVendors.length,
      page,
      limit,
      totalPages: Math.ceil(allVendors.length / limit) || 1,
    };
  }

  async findOne(id: string) {
    const store = readSharedStore();
    const sharedVendor = store.vendors.find((v) => v.id === id);
    if (sharedVendor) return sharedVendor;

    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id },
        include: {
          addresses: true,
          documents: true,
          bankAccounts: true,
          stores: { include: { businessHours: true } },
          products: { take: 10 },
          orders: { take: 10, orderBy: { createdAt: 'desc' } },
          settlements: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      });
      if (vendor) return vendor;
    } catch (e) {}

    throw new NotFoundException('Vendor not found');
  }

  async updateApproval(id: string, approvalStatus: any, reason?: string) {
    const normStatus = (approvalStatus || '').toLowerCase();
    updateVendorApplicationStatus(id, normStatus as any);

    const status = approvalStatus === 'APPROVED' ? 'APPROVED' : approvalStatus === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW';
    try {
      return await this.prisma.vendor.update({
        where: { id },
        data: {
          status,
          rejectionReason: reason,
        },
      });
    } catch (e) {
      return { success: true, id, approvalStatus };
    }
  }

  async updateCommission(id: string, commissionRate: number) {
    return this.prisma.vendor.update({
      where: { id },
      data: { commissionRate },
    });
  }
}
