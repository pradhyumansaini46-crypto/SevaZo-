import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorOnboardingService } from './vendor-onboarding.service';

@ApiTags('3. Vendor Onboarding Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/onboarding')
export class VendorOnboardingController {
  constructor(private onboardingService: VendorOnboardingService) {}

  @Get()
  @ApiOperation({ summary: 'Get current multi-step onboarding progression & checklist' })
  getOnboardingStateRoot(@CurrentVendor() vendor: any) {
    return this.onboardingService.getOnboardingState(vendor.id);
  }

  @Get('state')
  @ApiOperation({ summary: 'Get current multi-step onboarding progression & checklist (Alias)' })
  getState(@CurrentVendor() vendor: any) {
    return this.onboardingService.getOnboardingState(vendor.id);
  }

  // DEDICATED RESTFUL PATCH ENDPOINTS (Item 43)
  @Patch('owner')
  @ApiOperation({ summary: 'Save owner contact details in draft mode' })
  patchOwner(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchOwner(vendor.id, payload);
  }

  @Get('business')
  @ApiOperation({ summary: 'Get saved business entity and compliance details' })
  getBusiness(@CurrentVendor() vendor: any) {
    return this.onboardingService.getBusinessInfo(vendor.id);
  }

  @Patch('business')
  @ApiOperation({ summary: 'Save business entity and category compliance in draft mode' })
  patchBusiness(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchBusiness(vendor.id, payload);
  }

  @Get('address')
  @ApiOperation({ summary: 'Get saved physical address and store coordinates' })
  getAddress(@CurrentVendor() vendor: any) {
    return this.onboardingService.getAddressInfo(vendor.id);
  }

  @Patch('address')
  @ApiOperation({ summary: 'Save physical business address in draft mode' })
  patchAddress(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchAddress(vendor.id, payload);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Save verified store map coordinates in draft mode' })
  patchLocation(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchLocation(vendor.id, payload);
  }

  @Patch('banking')
  @ApiOperation({ summary: 'Save bank settlement details in draft mode' })
  patchBanking(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchBanking(vendor.id, payload);
  }

  @Patch('store')
  @ApiOperation({ summary: 'Save store branding and customer storefront profile in draft mode' })
  patchStore(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchStore(vendor.id, payload);
  }

  @Patch('hours')
  @ApiOperation({ summary: 'Save 7-day operating hours schedule in draft mode' })
  patchHours(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchHours(vendor.id, payload);
  }

  @Patch('service-area')
  @ApiOperation({ summary: 'Save geofenced delivery radius and coverage pincodes in draft mode' })
  patchServiceArea(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchServiceArea(vendor.id, payload);
  }

  @Patch('products')
  @ApiOperation({ summary: 'Save starter product catalog in draft mode' })
  patchProducts(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchProducts(vendor.id, payload);
  }

  @Patch('delivery')
  @ApiOperation({ summary: 'Save delivery model and packaging preferences in draft mode' })
  patchDelivery(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.patchDelivery(vendor.id, payload);
  }

  @Patch(':section')
  @ApiOperation({ summary: 'Generic dynamic endpoint to save specific section progress in draft mode' })
  patchGenericSection(
    @CurrentVendor() vendor: any,
    @Param('section') section: string,
    @Body() payload: any,
  ) {
    return this.onboardingService.patchSection(vendor.id, section, payload);
  }

  @Post('step/:stepNumber')
  @ApiOperation({ summary: 'Save progress and payload for specific onboarding step (1 to 13)' })
  saveStep(
    @CurrentVendor() vendor: any,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Body() payload: any,
  ) {
    return this.onboardingService.saveStep(vendor.id, stepNumber, payload);
  }

  // TWO-PHASE S3 DOCUMENT UPLOAD (Item 44)
  @Post('documents/upload-url')
  @ApiOperation({ summary: 'Generate S3 presigned URL for document upload' })
  getUploadUrl(
    @CurrentVendor() vendor: any,
    @Body() payload: { documentType: string; fileName: string; mimeType: string },
  ) {
    return this.onboardingService.generatePresignedUrl(vendor.id, payload);
  }

  @Post('documents/presigned-url')
  @ApiOperation({ summary: 'Request direct S3 encrypted presigned upload URL (Alias)' })
  getPresignedUrl(
    @CurrentVendor() vendor: any,
    @Body() payload: { documentType: string; fileName: string; mimeType: string },
  ) {
    return this.onboardingService.generatePresignedUrl(vendor.id, payload);
  }

  @Post('documents/complete')
  @ApiOperation({ summary: 'Complete document upload and record file metadata' })
  completeDocUpload(
    @CurrentVendor() vendor: any,
    @Body() payload: { documentType: string; fileKey: string; fileUrl: string; documentNumber: string; documentExpiry?: string },
  ) {
    return this.onboardingService.completeDocumentUpload(vendor.id, payload);
  }

  // FINAL STRICT SUBMISSION (Item 45)
  @Post('submit')
  @ApiOperation({ summary: 'Strict validation and final submission for admin review' })
  submitFinal(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.submitFinalOnboarding(vendor.id, payload);
  }

  @Post('bank/request-otp')
  @ApiOperation({ summary: 'Request OTP to change sensitive bank account details' })
  requestBankOtp(@CurrentVendor() vendor: any) {
    return this.onboardingService.requestBankChangeOtp(vendor.id);
  }

  @Post('bank/verify-change')
  @ApiOperation({ summary: 'Verify OTP and securely update bank account under 24h cooldown' })
  verifyBankChange(
    @CurrentVendor() vendor: any,
    @Body('otp') otp: string,
    @Body('payload') payload: any,
  ) {
    return this.onboardingService.verifyBankChange(vendor.id, otp, payload);
  }

  @Post('resubmit')
  @ApiOperation({ summary: 'Resubmit corrected documents and details after admin rejection' })
  resubmitCorrections(@CurrentVendor() vendor: any, @Body() payload: any) {
    return this.onboardingService.resubmitCorrections(vendor.id, payload);
  }
}
