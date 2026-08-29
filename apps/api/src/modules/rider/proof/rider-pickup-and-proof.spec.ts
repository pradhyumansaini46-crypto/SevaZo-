import { Test, TestingModule } from '@nestjs/testing';
import { RiderPickupService } from '../pickup/rider-pickup.service';
import { RiderDropService } from '../drop/rider-drop.service';
import { DeliveryProofService } from './delivery-proof.service';
import { RiderEarningsService } from '../earnings/rider-earnings.service';
import { PrismaService } from '@/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('Rider Pickup & Delivery Verification Lifecycle', () => {
  let pickupService: RiderPickupService;
  let dropService: RiderDropService;
  let proofService: DeliveryProofService;
  let mockPrisma: any;

  const mockDelivery = {
    id: 'del-flow-001',
    orderId: 'ord-flow-001',
    riderId: 'rider-001',
    status: 'RIDER_ACCEPTED',
    pickupOtp: '5678',
    deliveryOtp: '9123',
    verificationMode: 'ANY',
    deliveryFee: 40,
    distanceKm: 3.2,
    order: {
      id: 'ord-flow-001',
      orderNumber: 'SEV-ORD-FLOW-001',
      total: 620,
      paymentMethod: 'ONLINE',
      customer: { id: 'cust-01', name: 'Aakash Sharma', phone: '+91 9876543210' },
      deliveryAddress: { label: 'Home', address: 'B-12, Green Park' },
    },
  };

  beforeEach(async () => {
    mockPrisma = {
      delivery: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'del-flow-001' && where.riderId === 'rider-001') {
            return Promise.resolve({ ...mockDelivery, status: where.status || mockDelivery.status });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockDelivery, ...data })),
      },
      order: {
        update: jest.fn().mockResolvedValue({}),
      },
      rider: {
        update: jest.fn().mockResolvedValue({}),
      },
      deliveryProof: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'proof-001', ...data })),
        findMany: jest.fn().mockResolvedValue([]),
      },
      riderEarning: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'earn-001', ...data })),
      },
      deliveryStatusHistory: {
        create: jest.fn().mockResolvedValue({ id: 'hist-001' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiderPickupService,
        RiderDropService,
        DeliveryProofService,
        RiderEarningsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    pickupService = module.get<RiderPickupService>(RiderPickupService);
    dropService = module.get<RiderDropService>(RiderDropService);
    proofService = module.get<DeliveryProofService>(DeliveryProofService);
  });

  describe('1. Store Pickup Flow', () => {
    it('arriveAtVendor: marks rider arrived at vendor store', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RIDER_ACCEPTED',
      });

      const res = await pickupService.arriveAtVendor('rider-001', 'del-flow-001');
      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-flow-001' },
        data: { status: 'RIDER_AT_VENDOR' },
      });
      expect(res.status).toBe('RIDER_AT_VENDOR');
    });

    it('verifyPickup: verifies OTP and transitions delivery & order to IN_TRANSIT', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RIDER_AT_VENDOR',
      });

      const res = await pickupService.verifyPickup('rider-001', 'del-flow-001', {
        otp: '5678',
        itemsConfirmed: true,
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe('IN_TRANSIT');

      expect(mockPrisma.delivery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'IN_TRANSIT' }),
        }),
      );
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-flow-001' },
        data: { status: 'IN_TRANSIT' },
      });
    });

    it('verifyPickup: rejects invalid vendor OTP', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RIDER_AT_VENDOR',
      });

      // Override NODE_ENV to test non-dev rejection
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(
        pickupService.verifyPickup('rider-001', 'del-flow-001', { otp: '9999' }),
      ).rejects.toThrow(BadRequestException);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('2. Customer Delivery Flow & Completion', () => {
    it('arriveAtCustomer: marks rider reached doorstep', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'IN_TRANSIT',
      });

      const res = await dropService.arriveAtCustomer('rider-001', 'del-flow-001');
      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-flow-001' },
        data: { status: 'RIDER_AT_CUSTOMER' },
      });
      expect(res.status).toBe('RIDER_AT_CUSTOMER');
    });

    it('submitDeliveryProof: verifies customer OTP, marks DELIVERED, and credits wallet', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RIDER_AT_CUSTOMER',
      });

      const res = await proofService.submitDeliveryProof('rider-001', 'del-flow-001', {
        otp: '9123',
        photoUrl: 'https://storage.sevazo.com/proofs/drop.jpg',
      });

      expect(res.success).toBe(true);

      // Delivery updated to DELIVERED
      expect(mockPrisma.delivery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DELIVERED' }),
        }),
      );

      // Order updated to DELIVERED
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DELIVERED' }),
        }),
      );

      // Rider wallet & earnings incremented
      expect(mockPrisma.rider.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rider-001' },
          data: expect.objectContaining({
            deliveriesCount: { increment: 1 },
          }),
        }),
      );

      // Itemized ledger created
      expect(mockPrisma.riderEarning.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riderId: 'rider-001',
            deliveryId: 'del-flow-001',
            status: 'AVAILABLE',
          }),
        }),
      );
    });
  });
});
