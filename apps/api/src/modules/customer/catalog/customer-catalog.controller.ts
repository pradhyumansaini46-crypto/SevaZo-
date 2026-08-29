import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerCatalogService } from './customer-catalog.service';

@ApiTags('Customer 2. Catalog Module')
@Controller('customer/catalog')
export class CustomerCatalogController {
  constructor(private service: CustomerCatalogService) {}

  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Get home feed (categories, flash deals, top stores)' })
  getHome() {
    return this.service.getHome();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  getCategories() {
    return this.service.getCategories();
  }

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Search and filter product catalog' })
  getProducts(@Query() query: any) {
    return this.service.getProducts(query);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Get detailed product information with variants' })
  getProductById(@Param('id') id: string) {
    return this.service.getProductById(id);
  }

  @Public()
  @Get('stores')
  @ApiOperation({ summary: 'Get list of nearby dark stores and vendor hubs' })
  getStores() {
    return this.service.getStores();
  }

  @Public()
  @Get('stores/:id')
  @ApiOperation({ summary: 'Get store info and catalog' })
  getStoreById(@Param('id') id: string) {
    return this.service.getStoreById(id);
  }
}
