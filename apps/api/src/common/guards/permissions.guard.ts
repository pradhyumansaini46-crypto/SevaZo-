import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      throw new ForbiddenException('User context missing');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!admin || !admin.role) {
      throw new ForbiddenException('Admin role not assigned');
    }

    // SuperAdmin bypasses all permission checks
    if (['SUPER_ADMIN', 'super-admin'].includes(admin.role.slug)) {
      return true;
    }

    const userPermissions = new Set(
      admin.role.permissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
    );

    const hasPermission = requiredPermissions.every((perm) => userPermissions.has(perm));
    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
