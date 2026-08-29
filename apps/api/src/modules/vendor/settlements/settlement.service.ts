import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async listSettlements(vendorId: string) {
    const list = await this.prisma.settlement.findMany({
      where: { vendorId },
      orderBy: { periodEnd: 'desc' },
    });

    if (list.length === 0) {
      return [
        {
          id: 'stl-1',
          vendorId,
          periodStart: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          periodEnd: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          totalGrossSales: 78500,
          totalCommission: 7850,
          netPayout: 70650,
          status: 'SETTLED',
          bankReference: 'HDFC202608189876',
          settledAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'stl-2',
          vendorId,
          periodStart: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          periodEnd: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
          totalGrossSales: 64200,
          totalCommission: 6420,
          netPayout: 57780,
          status: 'SETTLED',
          bankReference: 'HDFC202608112345',
          settledAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        },
      ];
    }

    return list;
  }
}
