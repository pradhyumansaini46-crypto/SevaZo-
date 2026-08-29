import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async listVariants(vendorId: string, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createVariant(vendorId: string, productId: string, dto: any) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!product) throw new NotFoundException('Product not found');

    const sku = dto.sku || `${product.sku}-${(dto.name || 'VAR').replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const price = parseFloat(dto.price) || product.price;
    const compareAtPrice = dto.compareAtPrice ? parseFloat(dto.compareAtPrice) : null;
    const costPrice = dto.costPrice ? parseFloat(dto.costPrice) : null;
    const weightGrams = dto.weightGrams ? parseInt(dto.weightGrams, 10) : null;
    const stock = parseInt(dto.stock, 10) || 0;

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        sku,
        price,
        compareAtPrice,
        costPrice,
        weightGrams,
        stock,
        attributes: dto.attributes || {},
      },
    });

    if (product.storeId) {
      await this.prisma.inventory.create({
        data: {
          storeId: product.storeId,
          productId,
          variantId: variant.id,
          sku,
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

    return variant;
  }

  async updateVariant(vendorId: string, variantId: string, dto: any) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant || variant.product.vendorId !== vendorId) {
      throw new NotFoundException('Product variant not found');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price !== undefined && { price: parseFloat(dto.price) }),
        ...(dto.stock !== undefined && { stock: parseInt(dto.stock, 10) }),
        ...(dto.attributes && { attributes: dto.attributes }),
      },
    });
  }

  async deleteVariant(vendorId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant || variant.product.vendorId !== vendorId) {
      throw new NotFoundException('Product variant not found');
    }

    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }
}
