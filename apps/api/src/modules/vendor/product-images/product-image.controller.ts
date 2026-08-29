import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { ProductImageService } from './product-image.service';

@ApiTags('8. Product Image Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/product-images')
export class ProductImageController {
  constructor(private imageService: ProductImageService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'List gallery images for product' })
  listImages(
    @CurrentVendor() vendor: any,
    @Param('productId') productId: string,
  ) {
    return this.imageService.listImages(vendor.id, productId);
  }

  @Post('product/:productId')
  @ApiOperation({ summary: 'Add image to product gallery' })
  addImage(
    @CurrentVendor() vendor: any,
    @Param('productId') productId: string,
    @Body('url') url: string,
    @Body('isPrimary') isPrimary?: boolean,
  ) {
    return this.imageService.addImage(vendor.id, productId, url, isPrimary);
  }

  @Patch(':id/primary')
  @ApiOperation({ summary: 'Set image as the primary cover photo' })
  setPrimary(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.imageService.setPrimary(vendor.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image from product' })
  deleteImage(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.imageService.deleteImage(vendor.id, id);
  }
}
