import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ProductImageService {
  constructor(private prisma: PrismaService) {}

  async listImages(vendorId: string, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addImage(vendorId: string, productId: string, url: string, isPrimary = false) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!product) throw new NotFoundException('Product not found');

    if (isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url,
        isPrimary,
      },
    });
  }

  async setPrimary(vendorId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
    if (!image || image.product.vendorId !== vendorId) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    });

    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  async deleteImage(vendorId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
    if (!image || image.product.vendorId !== vendorId) {
      throw new NotFoundException('Image not found');
    }

    return this.prisma.productImage.delete({ where: { id: imageId } });
  }
}
