import { Module } from '@nestjs/common';
import { CustomerSearchController } from './customer-search.controller';
import { CustomerSearchService } from './customer-search.service';

@Module({
  controllers: [CustomerSearchController],
  providers: [CustomerSearchService],
  exports: [CustomerSearchService],
})
export class CustomerSearchModule {}
