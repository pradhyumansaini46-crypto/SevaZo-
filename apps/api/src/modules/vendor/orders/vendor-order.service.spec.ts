import { Test, TestingModule } from '@nestjs/testing';
import { VendorOrderService } from './vendor-order.service';
import { PrismaService } from '@/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VendorOrderService (Lifecycle State Machine & Delivery Guard)', () => {
  let service: VendorOrderService;
  let mockPrisma: any;

  const sampleOrder = {
    id: 'ord-101',
    orderNumber: 'SEV-ORD-101',
    vendorId: 'vnd-001',
    customerId: 'cust-001',
    status: 'PENDING',
    total: 540,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([sampleOrder]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'ord-101' && where.vendorId === 'vnd-001') {
            return Promise.resolve({ ...sampleOrder, status: where.status || sampleOrder.status });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ ...sampleOrder, ...data }),
        ),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { total: 1080 },
          _count: { id: 2 },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorOrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VendorOrderService>(VendorOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. State Machine Transitions', () => {
    it('acceptOrder: transitions order from PENDING to CONFIRMED', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'PENDING',
      });

      const updated = await service.acceptOrder('vnd-001', 'ord-101');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-101' },
        data: { status: 'CONFIRMED' },
      });
      expect(updated.status).toBe('CONFIRMED');
    });

    it('acceptOrder: rejects transition if order is not in PENDING status', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'CONFIRMED',
      });

      await expect(service.acceptOrder('vnd-001', 'ord-101')).rejects.toThrow(BadRequestException);
    });

    it('markPreparing: transitions order from CONFIRMED to PREPARING', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'CONFIRMED',
      });

      const updated = await service.markPreparing('vnd-001', 'ord-101');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-101' },
        data: { status: 'PREPARING' },
      });
      expect(updated.status).toBe('PREPARING');
    });

    it('markPreparing: throws if order is still PENDING (not yet confirmed)', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'PENDING',
      });

      await expect(service.markPreparing('vnd-001', 'ord-101')).rejects.toThrow(BadRequestException);
    });

    it('markReady: transitions order to READY_FOR_PICKUP', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'PREPARING',
      });

      const updated = await service.markReady('vnd-001', 'ord-101');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-101' },
        data: { status: 'READY_FOR_PICKUP' },
      });
      expect(updated.status).toBe('READY_FOR_PICKUP');
    });

    it('rejectOrder: cancels order and stamps cancelledBy: VENDOR', async () => {
      mockPrisma.order.findFirst.mockResolvedValueOnce({
        ...sampleOrder,
        status: 'PENDING',
      });

      const cancelled = await service.rejectOrder('vnd-001', 'ord-101', 'Out of stock ingredients');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-101' },
        data: {
          status: 'CANCELLED',
          cancelledBy: 'VENDOR',
          cancellationReason: 'Out of stock ingredients',
        },
      });
      expect(cancelled.status).toBe('CANCELLED');
    });
  });

  describe('2. Delivery Guard & IDOR Defense', () => {
    it('throws NotFoundException when accessing an order belonging to another vendor', async () => {
      // Order belongs to vnd-001; attempting access as vnd-999
      await expect(service.getOrderDetails('vnd-999', 'ord-101')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('never permits vendor to mark an order as DELIVERED', () => {
      // Confirm that the vendor service interface does not expose a delivery method
      expect((service as any).markDelivered).toBeUndefined();
      expect((service as any).completeDelivery).toBeUndefined();
    });
  });

  describe('3. Live Counter Telemetry', () => {
    it('aggregates live active pipeline across stage tabs', async () => {
      const stats = await service.getLiveStats('vnd-001');
      expect(stats).toHaveProperty('newOrders');
      expect(stats).toHaveProperty('acceptedOrders');
      expect(stats).toHaveProperty('preparingOrders');
      expect(stats).toHaveProperty('readyOrders');
      expect(stats).toHaveProperty('activePipeline');
      expect(stats).toHaveProperty('todaySales');
    });
  });
});
