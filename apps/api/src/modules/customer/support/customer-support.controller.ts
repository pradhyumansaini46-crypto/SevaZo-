import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerSupportService } from './customer-support.service';

@ApiTags('Customer 12. Support & Helpdesk Module')
@Controller('customer/support')
export class CustomerSupportController {
  constructor(private service: CustomerSupportService) {}

  @Get('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all customer support tickets' })
  getTickets(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getTickets(customerId);
  }

  @Post('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Raise a new support ticket' })
  createTicket(
    @Req() req: any,
    @Body('subject') subject: string,
    @Body('description') description: string,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.createTicket(customerId, subject, description);
  }

  @Post('tickets/:id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add message to existing ticket conversation' })
  addMessage(
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.service.addMessage(id, message, 'CUSTOMER');
  }

  @Public()
  @Get('faqs')
  @ApiOperation({ summary: 'Get frequently asked questions' })
  getFaqs() {
    return this.service.getFaqs();
  }
}
