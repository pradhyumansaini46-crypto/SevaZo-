import { Module } from '@nestjs/common';
import { RiderLocationController } from './rider-location.controller';
import { RiderLocationService } from './rider-location.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderLocationController],
  providers: [RiderLocationService],
  exports: [RiderLocationService],
})
export class LocationModule {}
