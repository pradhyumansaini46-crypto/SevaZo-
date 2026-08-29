import { Module } from '@nestjs/common';
import { RiderServiceAreaController } from './rider-service-area.controller';
import { RiderServiceAreaService } from './rider-service-area.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderServiceAreaController],
  providers: [RiderServiceAreaService],
  exports: [RiderServiceAreaService],
})
export class RiderServiceAreaModule {}
