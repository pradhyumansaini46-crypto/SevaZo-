import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  RiderDocumentService,
  RequestUploadUrlDto,
  CompleteUploadDto,
  ReplaceDocumentDto,
} from './rider-document.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Point 45: /api/v1/rider/documents/*
 * Point 47: Document Upload Architecture (Presigned URL Flow)
 */
@ApiTags('Rider 5. Documents Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/documents')
export class RiderDocumentController {
  constructor(private documentService: RiderDocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List all uploaded documents for the rider' })
  getDocuments(@CurrentRider() rider: any) {
    return this.documentService.getDocuments(rider.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get document verification summary and status for each type' })
  getDocumentStatus(@CurrentRider() rider: any) {
    return this.documentService.getDocumentStatus(rider.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific document details by ID' })
  getDocument(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.documentService.getDocument(rider.id, id);
  }

  @Post('upload-url')
  @ApiOperation({
    summary: 'Point 47: Request a presigned upload URL for direct Object Storage upload',
  })
  requestUploadUrl(
    @CurrentRider() rider: any,
    @Body() dto: RequestUploadUrlDto,
  ) {
    return this.documentService.requestUploadUrl(rider.id, dto);
  }

  @Post('complete')
  @ApiOperation({
    summary: 'Point 47: Complete upload — save document metadata and queue for verification',
  })
  completeUpload(
    @CurrentRider() rider: any,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.documentService.completeUpload(rider.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Prompt 07: DELETE /api/v1/rider/documents/:id' })
  deleteDocument(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.documentService.deleteDocument(rider.id, id);
  }
}

@ApiTags('Rider 5b. Vehicle Documents Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/vehicle/documents')
export class RiderVehicleDocumentController {
  constructor(private documentService: RiderDocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Prompt 08: GET /api/v1/rider/vehicle/documents' })
  getVehicleDocuments(@CurrentRider() rider: any) {
    return this.documentService.getDocuments(rider.id);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Prompt 08: POST /api/v1/rider/vehicle/documents/upload-url' })
  requestUploadUrl(@CurrentRider() rider: any, @Body() dto: RequestUploadUrlDto) {
    return this.documentService.requestUploadUrl(rider.id, dto);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Prompt 08: POST /api/v1/rider/vehicle/documents/complete' })
  completeUpload(@CurrentRider() rider: any, @Body() dto: CompleteUploadDto) {
    return this.documentService.completeUpload(rider.id, dto);
  }
}
