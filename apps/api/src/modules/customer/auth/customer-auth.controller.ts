import { Controller, Post, Get, Put, Patch, Delete, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerAuthService } from './customer-auth.service';

@ApiTags('Customer 1. Auth, Onboarding & Security Module')
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(private service: CustomerAuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP to mobile' })
  sendOtp(@Body('phone') phone: string) {
    return this.service.sendOtp(phone);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue session token' })
  verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.service.verifyOtp(phone, otp);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer profile' })
  getMe(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getMe(customerId);
  }

  @Put('profile')
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile' })
  updateProfile(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updateProfile(customerId, body);
  }

  // -------------------------------------------------------------
  // Onboarding & Resume APIs (Prompts 03, 10, 11)
  // -------------------------------------------------------------

  @Get('onboarding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer onboarding progress state' })
  getOnboardingState(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getOnboardingState(customerId);
  }

  @Put('onboarding')
  @Patch('onboarding')
  @Patch('onboarding/:section')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer onboarding step & progress' })
  updateOnboardingStep(
    @Req() req: any,
    @Param('section') section: string,
    @Body() body: any,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updateOnboardingStep(customerId, { ...body, section });
  }

  @Post('onboarding/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authoritative server-side completion and activation' })
  completeOnboarding(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.completeOnboarding(customerId, body);
  }

  // -------------------------------------------------------------
  // Customer Preferences APIs (Prompts 07 & 08)
  // -------------------------------------------------------------

  @Get('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer shopping preferences' })
  getPreferences(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getPreferences(customerId);
  }

  @Put('preferences')
  @Patch('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shopping preferences' })
  updatePreferences(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updatePreferences(customerId, body);
  }

  @Get('notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification settings' })
  getNotificationPreferences(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getNotificationPreferences(customerId);
  }

  @Put('notification-preferences')
  @Patch('notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification settings' })
  updateNotificationPreferences(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updateNotificationPreferences(customerId, body);
  }

  // -------------------------------------------------------------
  // Devices & Multi-Session Security (Prompts 01, 13)
  // -------------------------------------------------------------

  @Get('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List customer active devices' })
  getDevices(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getDevices(customerId);
  }

  @Post('devices/logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all other active devices' })
  logoutAllDevices(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.logoutAllDevices(customerId);
  }

  @Delete('account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account and scrub customer personal data' })
  deleteAccount(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.deleteAccount(customerId);
  }

  // -------------------------------------------------------------
  // Address CRUD
  // -------------------------------------------------------------

  @Get('addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List saved customer delivery addresses' })
  getAddresses(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getAddresses(customerId);
  }

  @Post('addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new delivery address' })
  addAddress(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.addAddress(customerId, body);
  }

  @Put('addresses/:id')
  @Patch('addresses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update existing delivery address' })
  updateAddress(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updateAddress(customerId, id, body);
  }

  @Delete('addresses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete delivery address' })
  deleteAddress(@Param('id') id: string) {
    return this.service.deleteAddress(id);
  }
}
