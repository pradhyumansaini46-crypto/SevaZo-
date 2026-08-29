import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { PrismaService } from '../src/database/prisma.service';

describe('PermissionsGuard (Strict RBAC & Least-Privilege Tests)', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let prisma: PrismaService;

  const mockPrisma = {
    adminUser: {
      findUnique: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    reflector = mockReflector as any;
    prisma = mockPrisma as any;
    guard = new PermissionsGuard(reflector, prisma);
  });

  const createMockContext = (userId: string) => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: userId } }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow Super Admin to bypass permission checks (Full Access)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['finance:write', 'roles:write']);
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-super',
      role: { slug: 'SUPER_ADMIN', permissions: [] },
    });

    const ctx = createMockContext('admin-super');
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should allow Finance Manager to access finance endpoints', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['finance:read']);
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-finance',
      role: {
        slug: 'FINANCE_MANAGER',
        permissions: [
          { permission: { module: 'finance', action: 'read' } },
          { permission: { module: 'finance', action: 'write' } },
        ],
      },
    });

    const ctx = createMockContext('admin-finance');
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should reject Finance Manager attempting to access Manage Products (Least Privilege)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['catalog:write']);
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-finance',
      role: {
        slug: 'FINANCE_MANAGER',
        permissions: [
          { permission: { module: 'finance', action: 'read' } },
        ],
      },
    });

    const ctx = createMockContext('admin-finance');
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should reject Support Agent attempting to manage Roles or Refunds', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['roles:write']);
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-support',
      role: {
        slug: 'SUPPORT_AGENT',
        permissions: [
          { permission: { module: 'users', action: 'read' } },
          { permission: { module: 'support', action: 'write' } },
        ],
      },
    });

    const ctx = createMockContext('admin-support');
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
