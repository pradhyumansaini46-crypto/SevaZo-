import { Module } from '@nestjs/common';
import { RiderDocumentController, RiderVehicleDocumentController } from './rider-document.controller';
import { RiderDocumentService } from './rider-document.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderDocumentController, RiderVehicleDocumentController],
  providers: [RiderDocumentService],
  exports: [RiderDocumentService],
})
export class RiderDocumentModule {}
