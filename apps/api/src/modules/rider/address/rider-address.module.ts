import { Module } from '@nestjs/common';
import { RiderAddressController } from './rider-address.controller';
import { RiderAddressService } from './rider-address.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderAddressController],
  providers: [RiderAddressService],
  exports: [RiderAddressService],
})
export class RiderAddressModule {}
