import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('9. Inventory Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get live inventory for store products' })
  getInventory(@CurrentVendor() vendor: any) {
    return this.inventoryService.getInventory(vendor.id);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products currently below threshold (<= 5 units)' })
  getLowStock(@CurrentVendor() vendor: any) {
    return this.inventoryService.getLowStock(vendor.id);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock with audit transaction logging' })
  adjustStock(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.inventoryService.adjustStock(vendor.id, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get inventory transaction movement history' })
  listTransactions(@CurrentVendor() vendor: any) {
    return this.inventoryService.listTransactions(vendor.id);
  }
}
