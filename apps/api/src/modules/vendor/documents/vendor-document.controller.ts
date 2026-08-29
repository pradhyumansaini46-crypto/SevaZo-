import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorDocumentService } from './vendor-document.service';

@ApiTags('4. Vendor Document Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/documents')
export class VendorDocumentController {
  constructor(private docService: VendorDocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List all statutory verification KYC documents with statuses' })
  listDocuments(@CurrentVendor() vendor: any) {
    return this.docService.listDocuments(vendor.id);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate encrypted presigned S3 URL for direct binary upload' })
  generateUploadUrl(
    @CurrentVendor() vendor: any,
    @Body() payload: { documentType: string; fileName: string; mimeType: string },
  ) {
    return this.docService.generatePresignedUrl(vendor.id, payload);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Record uploaded document metadata in database' })
  completeUpload(
    @CurrentVendor() vendor: any,
    @Body() payload: { documentType: string; fileKey: string; fileUrl: string; documentNumber: string; documentExpiry?: string },
  ) {
    return this.docService.completeUpload(vendor.id, payload);
  }

  @Post()
  @ApiOperation({ summary: 'Upload/create statutory compliance document record' })
  uploadDocument(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.docService.uploadDocument(vendor.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or replace a KYC document' })
  deleteDocument(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.docService.deleteDocument(vendor.id, id);
  }
}
