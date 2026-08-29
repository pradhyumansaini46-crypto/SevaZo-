import { Module } from '@nestjs/common';
import { RiderPreferencesController } from './rider-preferences.controller';
import { RiderPreferencesService } from './rider-preferences.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderPreferencesController],
  providers: [RiderPreferencesService],
  exports: [RiderPreferencesService],
})
export class RiderPreferencesModule {}
