import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Product Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  @RequirePermissions('catalog:read')
  @ApiOperation({ summary: 'List all catalog products' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('catalog:read')
  @ApiOperation({ summary: 'Get product detail by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Create a new product in the catalog' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/approval')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Approve or reject vendor product submission' })
  updateApproval(
    @Param('id') id: string,
    @Body('approvalStatus') approvalStatus: any,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.service.updateApproval(id, approvalStatus, rejectionReason);
  }

  @Patch(':id/status')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Update product status (Active/Inactive)' })
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.service.updateStatus(id, status);
  }
}
