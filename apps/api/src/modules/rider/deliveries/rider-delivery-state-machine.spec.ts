import { Test, TestingModule } from '@nestjs/testing';
import { RiderDeliveryService } from './rider-delivery.service';
import { PrismaService } from '@/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RiderDeliveryService (State Machine & Exception Transitions)', () => {
  let service: RiderDeliveryService;
  let mockPrisma: any;

  const mockDelivery = {
    id: 'del-state-101',
    orderId: 'ord-state-101',
    riderId: 'rider-001',
    status: 'IN_TRANSIT',
    deliveryFee: 40,
    distanceKm: 3.5,
  };

  beforeEach(async () => {
    mockPrisma = {
      delivery: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'del-state-101' && where.riderId === 'rider-001') {
            return Promise.resolve({ ...mockDelivery, status: where.status || mockDelivery.status });
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([mockDelivery]),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockDelivery, ...data })),
      },
      order: {
        update: jest.fn().mockResolvedValue({}),
      },
      deliveryStatusHistory: {
        create: jest.fn().mockResolvedValue({ id: 'hist-001' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiderDeliveryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RiderDeliveryService>(RiderDeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Active In-Flight Deliveries & Scoping', () => {
    it('getActiveDelivery: finds active in-flight trip assigned to rider', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RIDER_ACCEPTED',
      });

      const active = await service.getActiveDelivery('rider-001');
      expect(active).toBeDefined();
      expect(active?.id).toBe('del-state-101');
    });

    it('getDeliveryDetails: throws NotFoundException if delivery belongs to another rider', async () => {
      await expect(service.getDeliveryDetails('rider-999', 'del-state-101')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('2. Controlled Exception Transitions', () => {
    it('markReturnRequired: transitions state to RETURN_REQUIRED and audits reason', async () => {
      const updated = await service.markReturnRequired(
        'rider-001',
        'del-state-101',
        'Customer unreachable at doorstep',
      );

      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-state-101' },
        data: { status: 'RETURN_REQUIRED' },
      });
      expect(mockPrisma.deliveryStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            toStatus: 'RETURN_REQUIRED',
            changedBy: 'RIDER',
          }),
        }),
      );
      expect(updated.status).toBe('RETURN_REQUIRED');
    });

    it('markReturned: transitions delivery & order to RETURNED if status was RETURN_REQUIRED', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'RETURN_REQUIRED',
      });

      const updated = await service.markReturned(
        'rider-001',
        'del-state-101',
        'Handed back to store manager',
      );

      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-state-101' },
        data: { status: 'RETURNED' },
      });
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-state-101' },
        data: { status: 'RETURNED' },
      });
      expect(updated.status).toBe('RETURNED');
    });

    it('markReturned: throws BadRequestException if status was not RETURN_REQUIRED', async () => {
      mockPrisma.delivery.findFirst.mockResolvedValueOnce({
        ...mockDelivery,
        status: 'IN_TRANSIT', // Invalid prior state
      });

      await expect(service.markReturned('rider-001', 'del-state-101')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('markFailed: marks delivery FAILED and logs audit entry', async () => {
      const updated = await service.markFailed(
        'rider-001',
        'del-state-101',
        'Vehicle breakdown mid-trip',
      );

      expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'del-state-101' },
        data: { status: 'FAILED' },
      });
      expect(updated.status).toBe('FAILED');
    });
  });
});
