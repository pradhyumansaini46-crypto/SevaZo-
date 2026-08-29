import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerSearchService } from './customer-search.service';

@ApiTags('Customer 3. Search Module')
@Controller('customer/search')
export class CustomerSearchController {
  constructor(private service: CustomerSearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full text search products with filter' })
  search(
    @Query('q') q: string,
    @Query('categoryId') categoryId?: string,
    @Query('minRating') minRating?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.service.searchProducts(
      q,
      categoryId,
      minRating ? parseFloat(minRating) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Typeahead query suggestions' })
  getSuggestions(@Query('prefix') prefix: string) {
    return this.service.getSuggestions(prefix);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Top trending search terms' })
  getTrending() {
    return this.service.getTrendingSearches();
  }
}
