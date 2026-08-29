import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryProofService, SubmitDeliveryProofDto } from './delivery-proof.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 12. Delivery Proof Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/proof')
export class DeliveryProofController {
  constructor(private proofService: DeliveryProofService) {}

  @Post(':deliveryId/submit')
  @ApiOperation({ summary: 'Submit delivery verification: Customer OTP OR QR Code OR Doorstep Photo Proof' })
  submitDeliveryProof(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
    @Body() body: SubmitDeliveryProofDto,
  ) {
    return this.proofService.submitDeliveryProof(rider.id, deliveryId, body);
  }

  @Get(':deliveryId')
  @ApiOperation({ summary: 'Get submitted delivery verification proofs' })
  getDeliveryProofs(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.proofService.getDeliveryProofs(rider.id, deliveryId);
  }
}
