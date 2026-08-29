import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthService } from './vendor-auth.service';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';

@ApiTags('1. Vendor Auth Module')
@Controller('vendor/auth')
export class VendorAuthController {
  constructor(private authService: VendorAuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit verification code to mobile number with rate limiting' })
  sendOtp(@Body('phone') phone: string) {
    return this.authService.sendOtp(phone);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify mobile OTP and return session / create vendor draft' })
  verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(phone, otp);
  }

  @Public()
  @Post('register-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate registration by sending OTP to mobile number' })
  registerOtp(@Body() payload: { phone: string; email: string }) {
    return this.authService.registerOtp(payload);
  }

  @Public()
  @Post('verify-register-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify registration OTP and create new vendor account' })
  verifyRegisterOtp(@Body() payload: { phone: string; email: string; otp: string }) {
    return this.authService.verifyRegisterOtp(payload);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate JWT access token using refresh token' })
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @UseGuards(VendorAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated vendor profile & exact onboarding status' })
  getMe(@CurrentVendor() vendor: any) {
    return this.authService.getMe(vendor.id);
  }

  @Public()
  @UseGuards(VendorAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and invalidate session' })
  logout(@CurrentVendor() vendor: any) {
    return this.authService.logout(vendor.id);
  }
}
