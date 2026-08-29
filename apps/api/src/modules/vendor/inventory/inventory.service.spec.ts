import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '@/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InventoryService (5-State Stock Formula & Transaction Engine)', () => {
  let service: InventoryService;
  let mockPrisma: any;

  const mockInventoryRecord = {
    id: 'inv-123',
    storeId: 'store-001',
    productId: 'prod-001',
    variantId: null,
    sku: 'SKU-APPLE-01',
    physicalStock: 100,
    reservedStock: 10,
    availableStock: 85, // 100 - 10 - 5 = 85
    damagedStock: 5,
    soldStock: 50,
    lowStockThreshold: 10,
    isLowStock: false,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      store: {
        findFirst: jest.fn().mockResolvedValue({ id: 'store-001', vendorId: 'vendor-001' }),
      },
      product: {
        findFirst: jest.fn().mockResolvedValue({ id: 'prod-001', sku: 'SKU-APPLE-01', vendorId: 'vendor-001' }),
        update: jest.fn().mockResolvedValue({}),
      },
      productVariant: {
        update: jest.fn().mockResolvedValue({}),
      },
      inventory: {
        findUnique: jest.fn().mockResolvedValue({ ...mockInventoryRecord }),
        create: jest.fn().mockResolvedValue({ ...mockInventoryRecord }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockInventoryRecord, ...data })),
        findMany: jest.fn().mockResolvedValue([mockInventoryRecord]),
      },
      inventoryTransaction: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tx-001', ...data })),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Universal 5-State Stock Formula Enforcement', () => {
    it('PURCHASE: inward inventory increases physicalStock and availableStock', async () => {
      const result = await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'PURCHASE',
        50,
      );

      // Previous: physical 100, reserved 10, damaged 5
      // New: physical 150 -> available = 150 - 10 - 5 = 135
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            physicalStock: 150,
            availableStock: 135,
          }),
        }),
      );
      expect(result.transaction.type).toBe('PURCHASE');
    });

    it('RESERVATION: reserves stock when availableStock is sufficient', async () => {
      // Current availableStock is 85; reserve 20
      await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'RESERVATION',
        20,
      );

      // New reserved: 10 + 20 = 30 -> available = 100 - 30 - 5 = 65
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reservedStock: 30,
            availableStock: 65,
          }),
        }),
      );
    });

    it('RESERVATION: throws BadRequestException when availableStock is insufficient', async () => {
      // Current available is 85; trying to reserve 100 must fail
      await expect(
        service.processInventoryTransaction(
          'store-001',
          'prod-001',
          null,
          'SKU-APPLE-01',
          'RESERVATION',
          100,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('RELEASE: releases reserved stock back to availableStock upon order cancellation', async () => {
      // Release 5 from reserved
      await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'RELEASE',
        5,
      );

      // New reserved: 10 - 5 = 5 -> available = 100 - 5 - 5 = 90
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reservedStock: 5,
            availableStock: 90,
          }),
        }),
      );
    });

    it('DAMAGE: records spoiled/damaged stock and reduces availableStock', async () => {
      // 10 damaged
      await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'DAMAGE',
        10,
      );

      // New damaged: 5 + 10 = 15 -> available = 100 - 10 - 15 = 75
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            damagedStock: 15,
            availableStock: 75,
          }),
        }),
      );
    });

    it('SALE: deducts both physicalStock and reservedStock, increases soldStock', async () => {
      // Customer order completed/picked up: 5 units
      await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'SALE',
        5,
      );

      // New physical: 100 - 5 = 95, new reserved: 10 - 5 = 5, sold: 50 + 5 = 55
      // Available = 95 - 5 - 5 = 85
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            physicalStock: 95,
            reservedStock: 5,
            soldStock: 55,
            availableStock: 85,
          }),
        }),
      );
    });

    it('LOW STOCK: flags isLowStock when available drops to or below lowStockThreshold', async () => {
      mockPrisma.inventory.findUnique.mockResolvedValueOnce({
        ...mockInventoryRecord,
        physicalStock: 15,
        reservedStock: 0,
        damagedStock: 0,
        availableStock: 15,
        lowStockThreshold: 10,
      });

      // Damage 8 units -> available drops to 7 <= 10
      await service.processInventoryTransaction(
        'store-001',
        'prod-001',
        null,
        'SKU-APPLE-01',
        'DAMAGE',
        8,
      );

      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isLowStock: true,
          }),
        }),
      );
    });
  });

  describe('2. Stock Adjustment Input Verification', () => {
    it('throws NotFoundException if product does not belong to vendor', async () => {
      mockPrisma.product.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.adjustStock('vendor-001', {
          productId: 'unowned-prod',
          quantityChange: 10,
          type: 'ADJUSTMENT',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
