import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { adminUsers: true } },
      },
    });
  }

  async create(data: { name: string; slug: string; description?: string; permissionIds?: string[] }) {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: data.permissionIds.map((pId) => ({
          roleId: role.id,
          permissionId: pId,
        })),
      });
    }

    return role;
  }
}
