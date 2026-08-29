import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderOnboardingService, SaveStepDto } from './rider-onboarding.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 13. Onboarding & Registration Engine')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/onboarding')
export class RiderOnboardingController {
  constructor(private onboardingService: RiderOnboardingService) {}

  @Get()
  @ApiOperation({ summary: 'Prompt 03: GET /api/v1/rider/onboarding — Get 14-step onboarding state and section statuses' })
  getOnboarding(@CurrentRider() rider: any) {
    return this.onboardingService.getOnboardingState(rider.id);
  }

  @Get('state')
  @ApiOperation({ summary: 'Get current rider onboarding state, draft data & completion percentage' })
  getState(@CurrentRider() rider: any) {
    return this.onboardingService.getOnboardingState(rider.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current rider verification status & progress checklist' })
  getStatus(@CurrentRider() rider: any) {
    return this.onboardingService.getOnboardingState(rider.id);
  }

  // ── Prompt 04: Personal Details ──────────────────────────────────────

  @Get('personal')
  @ApiOperation({ summary: 'Prompt 04: GET /api/v1/rider/onboarding/personal' })
  getPersonal(@CurrentRider() rider: any) {
    return this.onboardingService.getPersonalDetails(rider.id);
  }

  @Patch('personal')
  @ApiOperation({ summary: 'Prompt 04: PATCH /api/v1/rider/onboarding/personal' })
  savePersonal(@CurrentRider() rider: any, @Body() data: any) {
    return this.onboardingService.updateSection(rider.id, 'PERSONAL', data);
  }

  // ── Prompt 05: Address & Emergency Contact ───────────────────────────

  @Get('address')
  @ApiOperation({ summary: 'Prompt 05: GET /api/v1/rider/onboarding/address' })
  getAddress(@CurrentRider() rider: any) {
    return this.onboardingService.getAddress(rider.id);
  }

  @Patch('address')
  @ApiOperation({ summary: 'Prompt 05: PATCH /api/v1/rider/onboarding/address' })
  saveAddress(@CurrentRider() rider: any, @Body() data: any) {
    return this.onboardingService.updateSection(rider.id, 'ADDRESS', data);
  }

  @Get('emergency-contact')
  @ApiOperation({ summary: 'Prompt 05: GET /api/v1/rider/onboarding/emergency-contact' })
  getEmergencyContact(@CurrentRider() rider: any) {
    return this.onboardingService.getEmergencyContact(rider.id);
  }

  @Patch('emergency-contact')
  @ApiOperation({ summary: 'Prompt 05: PATCH /api/v1/rider/onboarding/emergency-contact' })
  saveEmergencyContact(@CurrentRider() rider: any, @Body() data: any) {
    return this.onboardingService.updateSection(rider.id, 'EMERGENCY_CONTACT', data);
  }

  // ── Prompt 06: Vehicle Details ───────────────────────────────────────

  @Get('vehicle')
  @ApiOperation({ summary: 'Prompt 06: GET /api/v1/rider/onboarding/vehicle' })
  getVehicle(@CurrentRider() rider: any) {
    return this.onboardingService.getVehicleDetails(rider.id);
  }

  @Patch('vehicle')
  @ApiOperation({ summary: 'Prompt 06: PATCH /api/v1/rider/onboarding/vehicle' })
  saveVehicle(@CurrentRider() rider: any, @Body() data: any) {
    return this.onboardingService.updateSection(rider.id, 'VEHICLE', data);
  }

  // ── Generic Section & Step Handlers ──────────────────────────────────

  @Patch(':section')
  @ApiOperation({ summary: 'Prompt 03: PATCH /api/v1/rider/onboarding/:section' })
  updateSection(
    @CurrentRider() rider: any,
    @Param('section') section: string,
    @Body() data: any,
  ) {
    return this.onboardingService.updateSection(rider.id, section, data);
  }

  @Post('save-step')
  @ApiOperation({ summary: 'Save progress on any onboarding step (Save & Continue or Save & Exit)' })
  saveStep(
    @CurrentRider() rider: any,
    @Body() dto: SaveStepDto,
  ) {
    return this.onboardingService.saveStep(rider.id, dto);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit completed onboarding application for Admin / Ops approval' })
  submitApplication(@CurrentRider() rider: any, @Body() body?: any) {
    return this.onboardingService.submitApplication(rider.id, body);
  }

  @Post('resubmit')
  @ApiOperation({ summary: 'Resubmit corrected documents or information after rejection' })
  resubmitCorrection(
    @CurrentRider() rider: any,
    @Body() body: { correctedData: any },
  ) {
    return this.onboardingService.resubmitCorrection(rider.id, body.correctedData);
  }
}
