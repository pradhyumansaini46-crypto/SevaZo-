import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { PrismaService } from '../src/database/prisma.service';

describe('AnalyticsService (Dashboard 12-Card Metrics Tests)', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    customer: { count: jest.fn().mockResolvedValue(14820) },
    vendor: { count: jest.fn().mockImplementation((args) => (args?.where ? 104 : 128)) },
    rider: { count: jest.fn().mockImplementation((args) => (args?.where ? 48 : 76)) },
    order: { count: jest.fn().mockResolvedValue(342) },
    refund: { count: jest.fn().mockResolvedValue(5) },
    settlement: { count: jest.fn().mockResolvedValue(18) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return complete 12 dashboard metric cards overview', async () => {
    const summary = await service.getDashboardSummary();

    expect(summary.totalCustomers).toBe(14820);
    expect(summary.totalVendors).toBe(128);
    expect(summary.activeVendors).toBe(104);
    expect(summary.totalRiders).toBe(76);
    expect(summary.onlineRiders).toBe(48);
    expect(summary.todayOrders).toBe(342);
    expect(summary).toHaveProperty('todayRevenue');
    expect(summary).toHaveProperty('pendingOrders');
    expect(summary).toHaveProperty('pendingVendorApprovals');
    expect(summary).toHaveProperty('pendingRiderApprovals');
    expect(summary).toHaveProperty('pendingRefunds');
    expect(summary).toHaveProperty('pendingSettlements');
  });
});
