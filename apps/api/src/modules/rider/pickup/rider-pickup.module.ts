import { Module } from '@nestjs/common';
import { RiderPickupController } from './rider-pickup.controller';
import { RiderPickupService } from './rider-pickup.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderPickupController],
  providers: [RiderPickupService],
  exports: [RiderPickupService],
})
export class PickupModule {}
