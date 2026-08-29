import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { ProductService } from './product.service';

@ApiTags('6. Product Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendor products with variants & stock' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  listProducts(
    @CurrentVendor() vendor: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.listProducts(vendor.id, categoryId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  getProduct(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.productService.getProduct(vendor.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new catalog product' })
  createProduct(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.productService.createProduct(vendor.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing catalog product' })
  updateProduct(
    @CurrentVendor() vendor: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.productService.updateProduct(vendor.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product from vendor catalog' })
  deleteProduct(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.productService.deleteProduct(vendor.id, id);
  }
}
