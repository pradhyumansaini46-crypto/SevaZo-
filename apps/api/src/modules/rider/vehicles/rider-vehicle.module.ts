import { Module } from '@nestjs/common';
import { RiderVehicleController } from './rider-vehicle.controller';
import { RiderVehicleService } from './rider-vehicle.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderVehicleController],
  providers: [RiderVehicleService],
  exports: [RiderVehicleService],
})
export class RiderVehicleModule {}
