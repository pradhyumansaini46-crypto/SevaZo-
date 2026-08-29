import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../products/product.service';
import { InventoryService } from '../inventory/inventory.service';
import { VendorOrderService } from '../orders/vendor-order.service';
import { SettlementService } from '../settlements/settlement.service';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Multi-Tenant Vendor Ownership & IDOR Protection', () => {
  let productService: ProductService;
  let inventoryService: InventoryService;
  let orderService: VendorOrderService;
  let settlementService: SettlementService;

  const VENDOR_A = 'vendor-aaa-111';
  const VENDOR_B = 'vendor-bbb-222';

  const productA = {
    id: 'prod-aaa',
    vendorId: VENDOR_A,
    name: 'Vendor A Special Biryani',
    sku: 'SKU-VND-A-01',
    price: 350,
  };

  const orderA = {
    id: 'ord-aaa',
    vendorId: VENDOR_A,
    status: 'PENDING',
    total: 350,
  };

  const settlementA = {
    id: 'stl-aaa',
    vendorId: VENDOR_A,
    netPayout: 3150,
    status: 'SETTLED',
  };

  beforeEach(async () => {
    const mockPrisma = {
      product: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'prod-aaa' && where.vendorId === VENDOR_A) {
            return Promise.resolve(productA);
          }
          return Promise.resolve(null); // Denies access if vendorId does not match!
        }),
        update: jest.fn(),
        delete: jest.fn(),
      },
      store: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.vendorId === VENDOR_A) {
            return Promise.resolve({ id: 'store-aaa', vendorId: VENDOR_A });
          }
          return Promise.resolve({ id: 'store-bbb', vendorId: VENDOR_B });
        }),
      },
      inventory: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'ord-aaa' && where.vendorId === VENDOR_A) {
            return Promise.resolve(orderA);
          }
          return Promise.resolve(null); // Denies access if vendorId does not match!
        }),
      },
      settlement: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'stl-aaa' && where.vendorId === VENDOR_A) {
            return Promise.resolve(settlementA);
          }
          return Promise.resolve(null); // Denies access if vendorId does not match!
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where.vendorId === VENDOR_A) return Promise.resolve([settlementA]);
          return Promise.resolve([]);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        InventoryService,
        VendorOrderService,
        SettlementService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    inventoryService = module.get<InventoryService>(InventoryService);
    orderService = module.get<VendorOrderService>(VendorOrderService);
    settlementService = module.get<SettlementService>(SettlementService);
  });

  describe('1. Product Catalog Tenant Isolation', () => {
    it('allows Vendor A to retrieve their own product', async () => {
      const prod = await productService.getProduct(VENDOR_A, 'prod-aaa');
      expect(prod).toBeDefined();
      expect(prod.vendorId).toBe(VENDOR_A);
    });

    it('blocks Vendor B from accessing Vendor A product (IDOR Defense)', async () => {
      await expect(productService.getProduct(VENDOR_B, 'prod-aaa')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('blocks Vendor B from updating Vendor A product', async () => {
      await expect(
        productService.updateProduct(VENDOR_B, 'prod-aaa', { price: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('2. Order Management Tenant Isolation', () => {
    it('allows Vendor A to view and accept their order', async () => {
      const order = await orderService.getOrderDetails(VENDOR_A, 'ord-aaa');
      expect(order).toBeDefined();
      expect(order.vendorId).toBe(VENDOR_A);
    });

    it('blocks Vendor B from viewing Vendor A order (IDOR Defense)', async () => {
      await expect(orderService.getOrderDetails(VENDOR_B, 'ord-aaa')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('blocks Vendor B from accepting or altering Vendor A order', async () => {
      await expect(orderService.acceptOrder(VENDOR_B, 'ord-aaa')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('3. Inventory Adjustment Tenant Isolation', () => {
    it('blocks Vendor B from adjusting stock of Vendor A product', async () => {
      await expect(
        inventoryService.adjustStock(VENDOR_B, {
          productId: 'prod-aaa',
          quantityChange: 50,
          type: 'ADJUSTMENT',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('4. Financial Settlement Tenant Isolation', () => {
    it('guarantees Vendor B cannot see Vendor A settlement batches', async () => {
      const settlementsB = await settlementService.listSettlements(VENDOR_B);
      expect(settlementsB.some((s) => s.id === 'stl-aaa')).toBe(false);
      expect(settlementsB.every((s) => s.vendorId === VENDOR_B)).toBe(true);
    });
  });
});
