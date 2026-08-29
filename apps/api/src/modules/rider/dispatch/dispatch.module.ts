import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
