import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { RiderAuthService } from './rider-auth.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';

@ApiTags('Rider 1. Auth Module')
@Controller('rider/auth')
export class RiderAuthController {
  constructor(private authService: RiderAuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit verification code to rider mobile' })
  sendOtp(
    @Body('phone') phone: string,
    @Body('email') email?: string,
  ) {
    return this.authService.sendOtp(phone, email);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new delivery rider and send verification OTP' })
  register(
    @Body('phone') phone: string,
    @Body('email') email?: string,
  ) {
    return this.authService.sendOtp(phone, email);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP, authenticate rider, and return next destination status' })
  verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
  ) {
    return this.authService.verifyOtp(phone, otp);
  }

  @Public()
  @UseGuards(RiderAuthGuard)
  @Get('session-check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check rider session and resolve exact app destination screen' })
  sessionCheck(@CurrentRider() rider: any) {
    return this.authService.sessionCheck(rider.id);
  }

  @Public()
  @UseGuards(RiderAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated rider profile & onboarding status' })
  getMe(@CurrentRider() rider: any) {
    return this.authService.getMe(rider.id);
  }
}
