import { Test, TestingModule } from '@nestjs/testing';
import { RiderDeliveryService } from '../deliveries/rider-delivery.service';
import { DeliveryProofService } from '../proof/delivery-proof.service';
import { RiderEarningsService } from '../earnings/rider-earnings.service';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Rider Multi-Tenant Ownership & IDOR Protection Suite', () => {
  let deliveryService: RiderDeliveryService;
  let proofService: DeliveryProofService;
  let earningsService: RiderEarningsService;

  const RIDER_A = 'rider-AAA-111';
  const RIDER_B = 'rider-BBB-222';

  const deliveryA = {
    id: 'del-A-101',
    riderId: RIDER_A,
    status: 'IN_TRANSIT',
    orderId: 'ord-A-101',
    deliveryFee: 45,
    distanceKm: 4.0,
    order: {
      total: 500,
      paymentMethod: 'ONLINE',
      customer: { id: 'cust-1', name: 'Rahul', phone: '9999999999' },
      vendor: { businessName: 'Store A', ownerName: 'Owner A', phone: '8888888888', addresses: [] },
      deliveryAddress: {},
      items: [],
    },
    proofs: [],
    statusHistory: [],
  };

  const earningA = {
    id: 'earn-A-101',
    riderId: RIDER_A,
    amount: 58.0,
    status: 'AVAILABLE',
  };

  beforeEach(async () => {
    const mockPrisma = {
      delivery: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'del-A-101' && where.riderId === RIDER_A) {
            return Promise.resolve(deliveryA);
          }
          return Promise.resolve(null); // IDOR Defense: Returns null if riderId does not match!
        }),
      },
      riderEarning: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where.riderId === RIDER_A) return Promise.resolve([earningA]);
          return Promise.resolve([]); // IDOR Defense: Rider B gets empty list
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          if (where.riderId === RIDER_A) return Promise.resolve(1);
          return Promise.resolve(0);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiderDeliveryService,
        DeliveryProofService,
        RiderEarningsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    deliveryService = module.get<RiderDeliveryService>(RiderDeliveryService);
    proofService = module.get<DeliveryProofService>(DeliveryProofService);
    earningsService = module.get<RiderEarningsService>(RiderEarningsService);
  });

  describe('1. Active Delivery Scoping & IDOR Defense', () => {
    it('allows Rider A to access assigned delivery details', async () => {
      const details = await deliveryService.getDeliveryDetails(RIDER_A, 'del-A-101');
      expect(details).toBeDefined();
      expect(details.riderId).toBe(RIDER_A);
    });

    it('blocks Rider B from accessing Rider A assigned delivery', async () => {
      await expect(deliveryService.getDeliveryDetails(RIDER_B, 'del-A-101')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('2. Drop & Proof Submission IDOR Defense', () => {
    it('blocks Rider B from submitting delivery proof or completing Rider A delivery', async () => {
      await expect(
        proofService.submitDeliveryProof(RIDER_B, 'del-A-101', { otp: '1234' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. Earnings Ledger Tenant Isolation', () => {
    it('guarantees Rider B cannot access Rider A earnings ledger', async () => {
      const ledgerB = await earningsService.getEarningsLedger(RIDER_B);
      expect(ledgerB.data).toHaveLength(0);
      expect(ledgerB.data.some((e) => e.id === 'earn-A-101')).toBe(false);
    });
  });
});
