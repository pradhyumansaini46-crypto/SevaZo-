import { Module } from '@nestjs/common';
import { RiderAssignmentController } from './rider-assignment.controller';
import { RiderAssignmentService } from './rider-assignment.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [PrismaModule, RiderAuthModule, DispatchModule],
  controllers: [RiderAssignmentController],
  providers: [RiderAssignmentService],
  exports: [RiderAssignmentService],
})
export class AssignmentModule {}
