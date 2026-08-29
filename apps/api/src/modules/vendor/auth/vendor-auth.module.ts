import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VendorAuthService } from './vendor-auth.service';
import { VendorAuthController } from './vendor-auth.controller';
import { VendorAuthGuard } from '../common/vendor-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'sevazo-super-secret-jwt-key-change-in-production-2026',
        ),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [VendorAuthController],
  providers: [VendorAuthService, VendorAuthGuard],
  exports: [VendorAuthService, VendorAuthGuard, JwtModule],
})
export class VendorAuthModule {}
