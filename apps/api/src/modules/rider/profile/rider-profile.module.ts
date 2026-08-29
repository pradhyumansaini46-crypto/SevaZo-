import { Module } from '@nestjs/common';
import { RiderProfileController } from './rider-profile.controller';
import { RiderProfileService } from './rider-profile.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderProfileController],
  providers: [RiderProfileService],
  exports: [RiderProfileService],
})
export class RiderProfileModule {}
