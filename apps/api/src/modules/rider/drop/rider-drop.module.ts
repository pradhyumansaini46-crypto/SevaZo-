import { Module } from '@nestjs/common';
import { RiderDropController } from './rider-drop.controller';
import { RiderDropService } from './rider-drop.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderDropController],
  providers: [RiderDropService],
  exports: [RiderDropService],
})
export class DropModule {}
