import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RiderAuthController } from './rider-auth.controller';
import { RiderAuthService } from './rider-auth.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthGuard } from '../common/rider-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'sevazo-super-secret-jwt-key-change-in-production-2026',
        ),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RiderAuthController],
  providers: [RiderAuthService, RiderAuthGuard],
  exports: [RiderAuthService, RiderAuthGuard, JwtModule],
})
export class RiderAuthModule {}
