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
export class RiderAuthGuard implements CanActivate {
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

      let rider: any = null;
      try {
        rider = await this.prisma.rider.findUnique({
          where: { id: payload.sub },
          include: {
            documents: true,
            vehicles: true,
            zone: true,
          },
        });
      } catch (dbError) {
        // Fallback for standalone/mock mode
        rider = {
          id: payload.sub,
          phone: payload.phone,
          name: `Rider ${payload.phone?.slice(-4) || 'Partner'}`,
          status: 'INACTIVE',
          approvalStatus: 'PENDING',
        };
      }

      if (!rider) {
        rider = {
          id: payload.sub,
          phone: payload.phone,
          name: `Rider ${payload.phone?.slice(-4) || 'Partner'}`,
          status: 'INACTIVE',
          approvalStatus: 'PENDING',
        };
      }

      request.rider = rider;
      return true;
    } catch (err: any) {
      console.error('RIDER AUTH GUARD VERIFY ERROR:', err.message || err);
      throw new UnauthorizedException('Invalid or expired rider session');
    }
  }
}
