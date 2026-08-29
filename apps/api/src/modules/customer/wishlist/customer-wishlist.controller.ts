import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerWishlistService } from './customer-wishlist.service';

@ApiTags('Customer 9. Wishlist Module')
@Controller('customer/wishlist')
export class CustomerWishlistController {
  constructor(private service: CustomerWishlistService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer wishlist with products' })
  getWishlist(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getWishlist(customerId);
  }

  @Post('toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or remove product from wishlist (toggle)' })
  toggleItem(@Req() req: any, @Body('productId') productId: string) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.toggleItem(customerId, productId);
  }

  @Delete('items/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove specific item from wishlist' })
  removeItem(@Param('id') id: string) {
    return this.service.removeItem(id);
  }
}
