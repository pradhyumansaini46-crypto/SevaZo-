import { Controller, Post, Get, Put, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerNotificationService } from './customer-notification.service';

@ApiTags('Customer 11. Notification Module')
@Controller('customer')
export class CustomerNotificationController {
  constructor(private service: CustomerNotificationService) {}

  @Post('devices/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register push notification device token (FCM/APNS)' })
  registerDevice(
    @Req() req: any,
    @Body('token') token: string,
    @Body('platform') platform: string,
    @Body('appVersion') appVersion?: string,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.registerDevice(customerId, token, platform, appVersion);
  }

  @Get('notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get in-app notification center' })
  getNotifications(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getNotifications(customerId);
  }

  @Put('notifications/:id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark single notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Put('notifications/read-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.markAllAsRead(customerId);
  }
}
