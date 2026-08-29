import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerPaymentService } from './customer-payment.service';

@ApiTags('Customer 7. Payment & Wallet Module')
@Controller('customer/payments')
export class CustomerPaymentController {
  constructor(private service: CustomerPaymentService) {}

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment after gateway redirect' })
  verifyPayment(
    @Body('orderId') orderId: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.service.verifyPayment(orderId, paymentMethod, transactionId);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Payment gateway webhook callback' })
  handleWebhook(@Body('event') event: string, @Body() payload: any) {
    return this.service.handleWebhook(event, payload);
  }

  @Get('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Sevazo Wallet balance' })
  getWallet(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getWallet(customerId);
  }

  @Post('wallet/add')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add funds to Sevazo Wallet via UPI' })
  addFunds(@Req() req: any, @Body('amount') amount: number) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.addWalletFunds(customerId, amount);
  }
}
