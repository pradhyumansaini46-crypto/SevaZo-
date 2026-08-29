import { Test, TestingModule } from '@nestjs/testing';
import { RiderEarningsService } from './rider-earnings.service';
import { PrismaService } from '@/database/prisma.service';

describe('RiderEarningsService (Formula & Ledger Accounting Engine)', () => {
  let service: RiderEarningsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      rider: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'rider-001',
          totalEarnings: 14500,
          walletBalance: 2450,
          deliveriesCount: 180,
        }),
      },
      riderEarning: {
        aggregate: jest.fn().mockImplementation(({ where }) => {
          if (where.createdAt?.gte) {
            return Promise.resolve({
              _sum: { amount: 840 },
              _count: { id: 12 },
            });
          }
          return Promise.resolve({ _sum: { amount: 0 }, _count: { id: 0 } });
        }),
        count: jest.fn().mockResolvedValue(12),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiderEarningsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RiderEarningsService>(RiderEarningsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Centralized Earnings Formula Calculation', () => {
    it('calculates standard fare for trip under base 2.0 km without surge', () => {
      const result = service.calculateDeliveryEarnings({
        distanceKm: 1.5,
        baseFee: 35.0,
        surgeMultiplier: 1.0,
      });

      expect(result.baseFee).toBe(35.0);
      expect(result.distanceFee).toBe(0.0); // 1.5km <= 2km base
      expect(result.surgeFee).toBe(0.0);
      expect(result.netEarnings).toBe(35.0);
      expect(result.breakdownFormula).toContain('₹35 (Base)');
    });

    it('calculates distance fee for trips exceeding 2.0 km', () => {
      // 5.0 km trip: billable = 3.0 km * ₹6.5 = ₹19.5
      const result = service.calculateDeliveryEarnings({
        distanceKm: 5.0,
        baseFee: 35.0,
        surgeMultiplier: 1.0,
      });

      expect(result.distanceFee).toBe(19.5);
      expect(result.netEarnings).toBe(54.5); // 35 + 19.5
    });

    it('applies surge multiplier to (base + distance)', () => {
      // 4.0 km trip: base 35 + (2.0km * 6.5 = 13) = 48
      // 1.5x surge: surge fee = 0.5 * 48 = 24
      const result = service.calculateDeliveryEarnings({
        distanceKm: 4.0,
        baseFee: 35.0,
        surgeMultiplier: 1.5,
      });

      expect(result.distanceFee).toBe(13.0);
      expect(result.surgeFee).toBe(24.0);
      expect(result.netEarnings).toBe(72.0); // 48 + 24
    });

    it('adds bonus and deducts penalty cleanly', () => {
      const result = service.calculateDeliveryEarnings({
        distanceKm: 2.0,
        baseFee: 35.0,
        bonusAmount: 20.0,
        penaltyAmount: 10.0,
      });

      expect(result.bonus).toBe(20.0);
      expect(result.penalty).toBe(10.0);
      expect(result.netEarnings).toBe(45.0); // 35 + 20 - 10
    });
  });

  describe('2. Earnings Summary Aggregations', () => {
    it('aggregates wallet balance, today, and weekly earnings', async () => {
      const summary = await service.getEarningsSummary('rider-001');

      expect(summary.walletBalance).toBe(2450);
      expect(summary.totalLifetimeEarnings).toBe(14500);
      expect(summary.totalDeliveries).toBe(180);
      expect(summary.today.amount).toBe(840);
      expect(summary.today.tripsCount).toBe(12);
    });
  });
});
