import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderAssignmentService } from './rider-assignment.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 7. Assignment Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/assignments')
export class RiderAssignmentController {
  constructor(private assignmentService: RiderAssignmentService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get current pending delivery assignment offers with countdown timers' })
  getPendingOffers(@CurrentRider() rider: any) {
    return this.assignmentService.getPendingOffers(rider.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept incoming delivery assignment offer' })
  acceptOffer(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.assignmentService.acceptOffer(rider.id, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject incoming delivery assignment offer' })
  rejectOffer(
    @CurrentRider() rider: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.assignmentService.rejectOffer(rider.id, id, reason);
  }
}
