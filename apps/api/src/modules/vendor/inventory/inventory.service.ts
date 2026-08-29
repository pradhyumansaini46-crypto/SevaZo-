import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { InventoryTransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(vendorId: string) {
    const store = await this.prisma.store.findFirst({ where: { vendorId } });
    if (!store) return [];

    return this.prisma.inventory.findMany({
      where: { storeId: store.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
        variant: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getLowStock(vendorId: string) {
    const store = await this.prisma.store.findFirst({ where: { vendorId } });
    if (!store) return [];

    return this.prisma.inventory.findMany({
      where: {
        storeId: store.id,
        isLowStock: true,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        variant: true,
      },
      orderBy: { availableStock: 'asc' },
    });
  }

  /**
   * Universal 5-state stock transaction engine
   * Formula: available_stock = physical_stock - reserved_stock - damaged_stock
   */
  async processInventoryTransaction(
    storeId: string,
    productId: string,
    variantId: string | null,
    sku: string,
    type: InventoryTransactionType,
    quantityChange: number,
    referenceId?: string,
    notes?: string,
  ) {
    // 1. Fetch or create inventory record
    let inv = await this.prisma.inventory.findUnique({
      where: {
        storeId_productId_sku: {
          storeId,
          productId,
          sku,
        },
      },
    });

    if (!inv) {
      inv = await this.prisma.inventory.create({
        data: {
          storeId,
          productId,
          variantId,
          sku,
          physicalStock: 0,
          reservedStock: 0,
          availableStock: 0,
          damagedStock: 0,
          soldStock: 0,
          lowStockThreshold: 5,
          isLowStock: true,
        },
      });
    }

    const previousStock = inv.availableStock;
    let newPhysical = inv.physicalStock;
    let newReserved = inv.reservedStock;
    let newDamaged = inv.damagedStock;
    let newSold = inv.soldStock;

    switch (type) {
      case 'PURCHASE': // Inward distributor stock
        newPhysical += quantityChange;
        break;

      case 'ADJUSTMENT': // Physical audit count adjustment
        newPhysical = Math.max(0, newPhysical + quantityChange);
        break;

      case 'RESERVATION': // Customer order placed
        if (inv.availableStock < quantityChange) {
          throw new BadRequestException(`Insufficient stock for SKU ${sku}. Available: ${inv.availableStock}`);
        }
        newReserved += quantityChange;
        break;

      case 'RELEASE': // Customer order cancelled
        newReserved = Math.max(0, newReserved - quantityChange);
        break;

      case 'SALE': // Order picked up / completed
        newPhysical = Math.max(0, newPhysical - quantityChange);
        newReserved = Math.max(0, newReserved - quantityChange);
        newSold += quantityChange;
        break;

      case 'RETURN': // Customer return restocked
        newPhysical += quantityChange;
        newSold = Math.max(0, newSold - quantityChange);
        break;

      case 'DAMAGE': // Spoiled / expired / damaged stock
        newDamaged += quantityChange;
        break;

      default:
        newPhysical = Math.max(0, newPhysical + quantityChange);
    }

    // Formula: available_stock = physical_stock - reserved_stock - damaged_stock
    const newAvailable = Math.max(0, newPhysical - newReserved - newDamaged);
    const isLowStock = newAvailable <= inv.lowStockThreshold;

    // 2. Update Inventory record
    const updatedInv = await this.prisma.inventory.update({
      where: { id: inv.id },
      data: {
        physicalStock: newPhysical,
        reservedStock: newReserved,
        availableStock: newAvailable,
        damagedStock: newDamaged,
        soldStock: newSold,
        isLowStock,
      },
    });

    // 3. Sync Product / Variant stock field
    if (variantId) {
      await this.prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: newAvailable },
      });
    } else {
      await this.prisma.product.update({
        where: { id: productId },
        data: { stock: newAvailable },
      });
    }

    // 4. Create immutable audit transaction
    const transaction = await this.prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        storeId,
        productId,
        variantId,
        type,
        quantityChange,
        previousStock,
        newStock: newAvailable,
        referenceId: referenceId || null,
        notes: notes || null,
      },
    });

    return {
      inventory: updatedInv,
      transaction,
    };
  }

  async adjustStock(
    vendorId: string,
    dto: {
      productId: string;
      variantId?: string;
      quantityChange: number;
      type: InventoryTransactionType;
      notes?: string;
    },
  ) {
    const store = await this.prisma.store.findFirst({ where: { vendorId } });
    if (!store) throw new NotFoundException('Store not found');

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let sku = product.sku;
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) throw new NotFoundException('Variant not found');
      sku = variant.sku;
    }

    return this.processInventoryTransaction(
      store.id,
      dto.productId,
      dto.variantId || null,
      sku,
      dto.type || 'ADJUSTMENT',
      dto.quantityChange,
      undefined,
      dto.notes,
    );
  }

  async listTransactions(vendorId: string) {
    const store = await this.prisma.store.findFirst({ where: { vendorId } });
    if (!store) return [];

    return this.prisma.inventoryTransaction.findMany({
      where: { storeId: store.id },
      include: {
        product: true,
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
