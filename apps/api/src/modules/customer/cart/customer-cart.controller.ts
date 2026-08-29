import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerCartService } from './customer-cart.service';

@ApiTags('Customer 4. Cart Module')
@Controller('customer/cart')
export class CustomerCartController {
  constructor(private service: CustomerCartService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer cart & bill calculation' })
  getCart(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getCart(customerId);
  }

  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product or variant to cart' })
  addItem(
    @Req() req: any,
    @Body('productId') productId: string,
    @Body('variantId') variantId?: string,
    @Body('quantity') quantity = 1,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.addItem(customerId, productId, variantId, quantity);
  }

  @Put('items/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(
    @Req() req: any,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.updateItemQuantity(customerId, id, quantity);
  }

  @Delete('items/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove single item from cart' })
  removeItem(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.removeItem(customerId, id);
  }

  @Post('clear')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear all items in cart' })
  clearCart(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.clearCart(customerId);
  }
}
