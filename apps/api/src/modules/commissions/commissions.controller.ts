import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Commission Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @Get()
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'List platform commission earnings ledger' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }
}
