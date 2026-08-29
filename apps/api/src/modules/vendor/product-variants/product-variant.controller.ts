import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { ProductVariantService } from './product-variant.service';

@ApiTags('7. Product Variant Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/product-variants')
export class ProductVariantController {
  constructor(private variantService: ProductVariantService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'List all variants for a given product' })
  listVariants(
    @CurrentVendor() vendor: any,
    @Param('productId') productId: string,
  ) {
    return this.variantService.listVariants(vendor.id, productId);
  }

  @Post('product/:productId')
  @ApiOperation({ summary: 'Create a new variant item' })
  createVariant(
    @CurrentVendor() vendor: any,
    @Param('productId') productId: string,
    @Body() dto: any,
  ) {
    return this.variantService.createVariant(vendor.id, productId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update variant pricing and attributes' })
  updateVariant(
    @CurrentVendor() vendor: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.variantService.updateVariant(vendor.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product variant' })
  deleteVariant(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.variantService.deleteVariant(vendor.id, id);
  }
}
