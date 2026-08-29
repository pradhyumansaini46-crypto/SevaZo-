import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
  @RequirePermissions('catalog:read')
  @ApiOperation({ summary: 'Get hierarchical category tree' })
  findAllTree() {
    return this.service.findAllTree();
  }

  @Post()
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Create new category' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Delete category' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
