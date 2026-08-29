import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Support & Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('support')
export class SupportController {
  constructor(private service: SupportService) {}

  @Get('tickets')
  @RequirePermissions('support:read')
  @ApiOperation({ summary: 'List customer support tickets' })
  findAllTickets(@Query() query: PaginationQueryDto) {
    return this.service.findAllTickets(query);
  }

  @Get('disputes')
  @RequirePermissions('support:read')
  @ApiOperation({ summary: 'List commerce and order disputes' })
  findAllDisputes(@Query() query: PaginationQueryDto) {
    return this.service.findAllDisputes(query);
  }

  @Post('tickets/:id/reply')
  @RequirePermissions('support:write')
  @ApiOperation({ summary: 'Admin reply to support ticket' })
  replyTicket(@Param('id') id: string, @Body('message') message: string, @CurrentUser() admin: any) {
    return this.service.replyTicket(id, message, admin?.id);
  }
}
