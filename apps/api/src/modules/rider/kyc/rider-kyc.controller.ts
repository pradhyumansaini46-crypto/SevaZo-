import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderKycService } from './rider-kyc.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 3. KYC Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/kyc')
export class RiderKycController {
  constructor(private kycService: RiderKycService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get rider KYC verification progress and uploaded documents' })
  getKycStatus(@CurrentRider() rider: any) {
    return this.kycService.getKycStatus(rider.id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload KYC document (Aadhaar, PAN, Driving License)' })
  uploadDocument(
    @CurrentRider() rider: any,
    @Body()
    body: {
      type: string;
      documentNumber: string;
      fileUrl: string;
    },
  ) {
    return this.kycService.uploadDocument(rider.id, body);
  }
}
