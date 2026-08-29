import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/database/prisma.service';

describe('AuthService (RBAC & MFA Tests)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    adminUser: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn().mockImplementation((key: string, defaultValue: any) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should authenticate valid admin credentials and return JWT tokens', async () => {
    const rawPassword = 'Admin@123456';
    const hash = await bcrypt.hash(rawPassword, 10);

    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@sevazo.com',
      passwordHash: hash,
      name: 'Super Admin',
      status: 'ACTIVE',
      mfaEnabled: false,
      role: {
        id: 'role-1',
        name: 'Super Administrator',
        slug: 'SUPER_ADMIN',
        permissions: [{ permission: { module: 'users', action: 'read' } }],
      },
    });

    const result = await service.login({
      email: 'admin@sevazo.com',
      password: rawPassword,
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    if ('user' in result) {
      expect(result.user.email).toBe('admin@sevazo.com');
    }
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    const hash = await bcrypt.hash('CorrectPassword', 10);

    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@sevazo.com',
      passwordHash: hash,
      status: 'ACTIVE',
    });

    await expect(
      service.login({ email: 'admin@sevazo.com', password: 'WrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should require MFA challenge if mfaEnabled is true', async () => {
    const rawPassword = 'Admin@123456';
    const hash = await bcrypt.hash(rawPassword, 10);

    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@sevazo.com',
      passwordHash: hash,
      name: 'Super Admin',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      role: { id: 'role-1', slug: 'SUPER_ADMIN', permissions: [] },
    });

    const result = await service.login({
      email: 'admin@sevazo.com',
      password: rawPassword,
    });

    expect(result).toHaveProperty('requiresMfa', true);
    expect(result).toHaveProperty('mfaToken');
  });
});
