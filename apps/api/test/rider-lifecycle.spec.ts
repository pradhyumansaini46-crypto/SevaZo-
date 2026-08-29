import { RiderEarningsService } from '../src/modules/rider/earnings/rider-earnings.service';
import { DispatchService } from '../src/modules/rider/dispatch/dispatch.service';
import { RiderLocationService } from '../src/modules/rider/location/rider-location.service';

describe('Rider Phase Completion Criteria - 15 Milestone End-to-End Test Suite', () => {
  let earningsService: RiderEarningsService;
  let dispatchService: DispatchService;
  let locationService: RiderLocationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      rider: { update: jest.fn().mockResolvedValue({}) },
      deliveryLocationHistory: { create: jest.fn().mockResolvedValue({}) },
    };
    earningsService = new RiderEarningsService(mockPrisma);
    dispatchService = new DispatchService(mockPrisma);
    locationService = new RiderLocationService(mockPrisma);
  });

  // Milestone 13: Rider Earnings Formula Verification
  it('13. should calculate earnings correctly via formula: Base + Distance + Surge + Incentive + Bonus - Penalty', () => {
    const result = earningsService.calculateDeliveryEarnings({
      baseFee: 35.0,
      distanceKm: 5.0, // 3 billable km * 6.5 = 19.5
      surgeMultiplier: 1.2, // 20% surge on (35 + 19.5 = 54.5) => 10.9
      incentiveAmount: 15.0, // Rain incentive
      bonusAmount: 20.0, // Customer tip
      penaltyAmount: 5.0, // Delay penalty
    });

    expect(result.baseFee).toBe(35.0);
    expect(result.distanceFee).toBe(19.5);
    expect(result.surgeFee).toBe(10.9);
    expect(result.incentive).toBe(15.0);
    expect(result.bonus).toBe(20.0);
    expect(result.penalty).toBe(5.0);
    // 35 + 19.5 + 10.9 + 15 + 20 - 5 = 95.4
    expect(result.netEarnings).toBe(95.4);
  });

  // Milestone 5: V1 Dispatch Multi-Factor Scoring
  it('5. should score and rank rider candidates with composite weights', () => {
    const mockRider = {
      id: 'rider-001',
      currentLat: 28.6145,
      currentLng: 77.2095,
      zoneId: 'zone-south-delhi',
      vehicleType: 'BIKE',
      acceptanceRate: 98,
      _count: { deliveries: 0 },
      availabilityLogs: [{ batteryPercentage: 85 }],
    };

    const score = dispatchService.calculateRiderScore(
      mockRider,
      28.6139,
      77.2090,
      'zone-south-delhi',
    );

    expect(score.riderId).toBe('rider-001');
    expect(score.distanceKm).toBeLessThan(1.0);
    expect(score.breakdown.distance_score).toBeGreaterThan(30);
    expect(score.breakdown.eta_score).toBeGreaterThan(20);
    expect(score.breakdown.availability_score).toBeGreaterThan(20);
    expect(score.breakdown.zone_score).toBe(15);
    expect(score.totalScore).toBeGreaterThan(85);
  });

  // Milestone 14: Fast In-Memory/Redis GPS Ingestion
  it('14. should ingest live GPS telemetry into fast in-memory/Redis layer', async () => {
    const result = await locationService.ingestGpsPing('rider-100', {
      rider_id: 'rider-100',
      delivery_id: 'del-900',
      latitude: 28.62,
      longitude: 77.21,
      speed: 25.0,
      heading: 90,
      timestamp: Date.now(),
    });

    expect(result.cachedInRedis).toBe(true);
    const live = locationService.getLiveRiderLocation('rider-100');
    expect(live?.latitude).toBe(28.62);
    expect(live?.longitude).toBe(77.21);
    expect(live?.speed).toBe(25.0);
  });
});
