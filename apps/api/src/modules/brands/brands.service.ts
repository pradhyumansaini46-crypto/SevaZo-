import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; slug: string; logo?: string; description?: string }) {
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.brand.update({ where: { id }, data });
  }
}
