import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('brands')
export class BrandsController {
  constructor(private service: BrandsService) {}

  @Get()
  @RequirePermissions('catalog:read')
  @ApiOperation({ summary: 'List all product brands' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Create brand' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Update brand' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
