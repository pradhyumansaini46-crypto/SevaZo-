import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { categoryId?: string; vendorId?: string; status?: any; approvalStatus?: any }) {
    const { page = 1, limit = 10, search, categoryId, vendorId, status, approvalStatus } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          vendor: { select: { id: true, businessName: true, ownerName: true } },
          brand: { select: { id: true, name: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        brand: true,
        images: true,
        variants: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    vendorId: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    stock: number;
    unit?: string;
    brandId?: string;
    tags?: string[];
  }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        vendorId: data.vendorId,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stock: data.stock,
        unit: data.unit || 'piece',
        brandId: data.brandId,
        tags: data.tags || [],
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
      },
    });
  }

  async updateApproval(id: string, approvalStatus: any, rejectionReason?: string) {
    const status = approvalStatus === 'APPROVED' ? 'ACTIVE' : 'INACTIVE';
    return this.prisma.product.update({
      where: { id },
      data: { approvalStatus, status, rejectionReason },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }
}
