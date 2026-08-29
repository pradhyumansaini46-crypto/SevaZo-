import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  RiderBankingService,
  SaveBankDetailsDto,
  ChangeBankRequestDto,
} from './rider-banking.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Point 45: /api/v1/rider/banking/*
 * Point 49: Bank Security — masked responses, OTP-verified changes, audit logging
 */
@ApiTags('Rider 7. Banking & Payouts')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/banking')
export class RiderBankingController {
  constructor(private bankingService: RiderBankingService) {}

  @Get()
  @ApiOperation({ summary: 'Get bank details (MASKED — Point 49: XXXX XXXX 4582)' })
  getBankDetails(@CurrentRider() rider: any) {
    return this.bankingService.getBankDetails(rider.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save bank details for the first time during onboarding' })
  saveBankDetails(
    @CurrentRider() rider: any,
    @Body() dto: SaveBankDetailsDto,
  ) {
    return this.bankingService.saveBankDetails(rider.id, dto);
  }

  @Post('change-request')
  @ApiOperation({ summary: 'Point 49: Initiate bank change — sends OTP verification' })
  initiateBankChange(@CurrentRider() rider: any) {
    return this.bankingService.initiateBankChange(rider.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Point 49: Change bank details with OTP verification' })
  changeBankDetails(
    @CurrentRider() rider: any,
    @Body() dto: ChangeBankRequestDto,
  ) {
    return this.bankingService.changeBankDetails(rider.id, dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Prompt 09: POST /api/v1/rider/banking/verify — Validate IFSC and verify account details' })
  verifyBank(
    @CurrentRider() rider: any,
    @Body() body: { ifsc: string; accountNumber?: string; upiId?: string },
  ) {
    return this.bankingService.verifyBank(rider.id, body);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Point 49: View bank operations audit log' })
  getAuditLog(@CurrentRider() rider: any) {
    return this.bankingService.getAuditLog(rider.id);
  }
}
