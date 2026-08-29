import { Module } from '@nestjs/common';
import { RiderAvailabilityController } from './rider-availability.controller';
import { RiderAvailabilityService } from './rider-availability.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderAvailabilityController],
  providers: [RiderAvailabilityService],
  exports: [RiderAvailabilityService],
})
export class RiderAvailabilityModule {}
