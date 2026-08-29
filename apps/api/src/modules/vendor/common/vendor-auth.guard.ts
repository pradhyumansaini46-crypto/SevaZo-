import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class VendorAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization Bearer header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = this.config.get<string>(
        'JWT_SECRET',
        'sevazo-super-secret-jwt-key-change-in-production-2026',
      );
      const payload = this.jwtService.verify(token, { secret });

      const vendor = await this.prisma.vendor.findUnique({
        where: { id: payload.sub },
        include: {
          documents: true,
          bankAccounts: true,
          addresses: true,
          stores: {
            include: {
              businessHours: true,
            },
          },
        },
      });

      if (!vendor) {
        throw new UnauthorizedException('Vendor profile not found');
      }

      if (vendor.status === 'SUSPENDED') {
        throw new UnauthorizedException('Vendor account has been temporarily suspended');
      }

      request.vendor = vendor;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }
  }
}
