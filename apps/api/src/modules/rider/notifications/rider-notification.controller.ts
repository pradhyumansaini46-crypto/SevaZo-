import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderNotificationService } from './rider-notification.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 15. Notification Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/notifications')
export class RiderNotificationController {
  constructor(private notificationService: RiderNotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get rider inbox notifications and incentives alerts' })
  getNotifications(@CurrentRider() rider: any) {
    return this.notificationService.getNotifications(rider.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(
    @CurrentRider() rider: any,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(rider.id, id);
  }
}
