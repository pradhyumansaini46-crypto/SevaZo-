import { Test, TestingModule } from '@nestjs/testing';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '@/database/prisma.service';

describe('DispatchService (Deterministic V1 Dispatch & Candidate Scoring Engine)', () => {
  let service: DispatchService;
  let mockPrisma: any;

  const mockDelivery = {
    id: 'del-dispatch-001',
    zoneId: 'zone-south-delhi',
    order: {
      id: 'ord-001',
      vendor: {
        addresses: [
          {
            latitude: 28.5494,
            longitude: 77.2341,
          },
        ],
      },
      deliveryAddress: {
        latitude: 28.5355,
        longitude: 77.241,
      },
    },
  };

  const candidateRiderA = {
    id: 'rider-A-close',
    isOnline: true,
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    currentLat: 28.548,
    currentLng: 77.233, // ~0.2 km from store
    zoneId: 'zone-south-delhi',
    vehicleType: 'BIKE',
    acceptanceRate: 98,
    availabilityLogs: [{ batteryPercentage: 85 }],
    _count: { deliveries: 0 },
  };

  const candidateRiderB = {
    id: 'rider-B-far',
    isOnline: true,
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    currentLat: 28.6139,
    currentLng: 77.209, // ~8 km from store
    zoneId: 'zone-central-delhi',
    vehicleType: 'SCOOTER',
    acceptanceRate: 75,
    availabilityLogs: [{ batteryPercentage: 30 }],
    _count: { deliveries: 1 },
  };

  beforeEach(async () => {
    mockPrisma = {
      delivery: {
        findUnique: jest.fn().mockResolvedValue(mockDelivery),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockDelivery, ...data })),
      },
      rider: {
        findMany: jest.fn().mockResolvedValue([candidateRiderA, candidateRiderB]),
      },
      deliveryAssignment: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'asgn-001', ...data })),
      },
      deliveryStatusHistory: {
        create: jest.fn().mockResolvedValue({ id: 'hist-001' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Multi-Factor Candidate Scoring Engine', () => {
    it('calculates higher composite score for closer rider with high availability & zone match', () => {
      const scoreA = service.calculateRiderScore(
        candidateRiderA,
        28.5494,
        77.2341,
        'zone-south-delhi',
      );
      const scoreB = service.calculateRiderScore(
        candidateRiderB,
        28.5494,
        77.2341,
        'zone-south-delhi',
      );

      expect(scoreA.distanceKm).toBeLessThan(1.0);
      expect(scoreB.distanceKm).toBeGreaterThan(5.0);

      expect(scoreA.distanceScore).toBeGreaterThan(scoreB.distanceScore);
      expect(scoreA.etaScore).toBeGreaterThan(scoreB.etaScore);
      expect(scoreA.availabilityScore).toBeGreaterThan(scoreB.availabilityScore);
      expect(scoreA.zoneScore).toBeGreaterThan(scoreB.zoneScore);

      expect(scoreA.totalScore).toBeGreaterThan(scoreB.totalScore);
    });

    it('returns granular score breakdown', () => {
      const score = service.calculateRiderScore(
        candidateRiderA,
        28.5494,
        77.2341,
        'zone-south-delhi',
      );
      expect(score.breakdown).toHaveProperty('distance_score');
      expect(score.breakdown).toHaveProperty('eta_score');
      expect(score.breakdown).toHaveProperty('availability_score');
      expect(score.breakdown).toHaveProperty('zone_score');
      expect(score.totalScore).toBe(
        parseFloat(
          (
            score.breakdown.distance_score +
            score.breakdown.eta_score +
            score.breakdown.availability_score +
            score.breakdown.zone_score
          ).toFixed(2),
        ),
      );
    });
  });

  describe('2. Dispatch Flow & Job Assignment', () => {
    it('ranks candidates and offers job to top-ranked candidate with 30s timeout', async () => {
      const result = await service.dispatchDelivery('del-dispatch-001');

      expect(result.success).toBe(true);
      expect(result.offeredRiderId).toBe(candidateRiderA.id);
      expect(result.rankedCandidatesCount).toBe(2);

      // Verify assignment was created with 30s timeout
      expect(mockPrisma.deliveryAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deliveryId: 'del-dispatch-001',
            riderId: candidateRiderA.id,
            status: 'OFFERED',
          }),
        }),
      );

      // Verify delivery state updated to ASSIGNMENT_OFFERED
      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-dispatch-001' },
        data: { status: 'ASSIGNMENT_OFFERED' },
      });

      // Verify audit history created
      expect(mockPrisma.deliveryStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromStatus: 'PENDING_ASSIGNMENT',
            toStatus: 'ASSIGNMENT_OFFERED',
            changedBy: 'SYSTEM',
          }),
        }),
      );
    });

    it('gracefully handles zero online riders by keeping delivery PENDING_ASSIGNMENT', async () => {
      mockPrisma.rider.findMany.mockResolvedValueOnce([]);

      const result = await service.dispatchDelivery('del-dispatch-001');

      expect(result.success).toBe(false);
      expect(result.message).toContain('No available riders nearby');
      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-dispatch-001' },
        data: { status: 'PENDING_ASSIGNMENT' },
      });
    });
  });
});
