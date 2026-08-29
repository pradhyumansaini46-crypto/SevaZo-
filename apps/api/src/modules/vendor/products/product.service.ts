import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async listProducts(vendorId: string, categoryId?: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        vendorId,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProduct(vendorId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, vendorId },
      include: {
        category: true,
        images: true,
        variants: true,
        inventories: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(vendorId: string, dto: any) {
    const store = await this.prisma.store.findFirst({ where: { vendorId } });
    const slug = (dto.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const sku = dto.sku || `SKU-${Date.now().toString().slice(-6)}`;
    const price = parseFloat(dto.price) || 0;
    const compareAtPrice = dto.compareAtPrice ? parseFloat(dto.compareAtPrice) : null;
    const costPrice = dto.costPrice ? parseFloat(dto.costPrice) : null;
    const taxRate = dto.taxRate ? parseFloat(dto.taxRate) : 0;
    const weightGrams = dto.weightGrams ? parseInt(dto.weightGrams, 10) : null;
    const stock = parseInt(dto.stock, 10) || 0;

    const product = await this.prisma.product.create({
      data: {
        vendorId,
        storeId: store ? store.id : null,
        name: dto.name,
        slug,
        description: dto.description || '',
        categoryId: dto.categoryId,
        price,
        compareAtPrice,
        costPrice,
        taxRate,
        hsnCode: dto.hsnCode || null,
        weightGrams,
        sku,
        stock,
        unit: dto.unit || 'piece',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        tags: dto.tags || [],
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    // Create primary image if provided
    if (dto.imageUrl) {
      await this.prisma.productImage.create({
        data: {
          productId: product.id,
          url: dto.imageUrl,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    // Initialize 5-State Inventory record
    if (store) {
      await this.prisma.inventory.create({
        data: {
          storeId: store.id,
          productId: product.id,
          sku: product.sku,
          physicalStock: stock,
          reservedStock: 0,
          availableStock: stock,
          damagedStock: 0,
          soldStock: 0,
          lowStockThreshold: 5,
          isLowStock: stock <= 5,
        },
      });
    }

    return this.getProduct(vendorId, product.id);
  }

  async updateProduct(vendorId: string, id: string, dto: any) {
    await this.getProduct(vendorId, id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.price !== undefined && { price: parseFloat(dto.price) }),
        ...(dto.compareAtPrice !== undefined && {
          compareAtPrice: dto.compareAtPrice ? parseFloat(dto.compareAtPrice) : null,
        }),
        ...(dto.costPrice !== undefined && {
          costPrice: dto.costPrice ? parseFloat(dto.costPrice) : null,
        }),
        ...(dto.taxRate !== undefined && { taxRate: parseFloat(dto.taxRate) }),
        ...(dto.hsnCode !== undefined && { hsnCode: dto.hsnCode }),
        ...(dto.weightGrams !== undefined && {
          weightGrams: dto.weightGrams ? parseInt(dto.weightGrams, 10) : null,
        }),
        ...(dto.stock !== undefined && { stock: parseInt(dto.stock, 10) }),
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.tags && { tags: dto.tags }),
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  async deleteProduct(vendorId: string, id: string) {
    await this.getProduct(vendorId, id);
    return this.prisma.product.delete({ where: { id } });
  }
}
