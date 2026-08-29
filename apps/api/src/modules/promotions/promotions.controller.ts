import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Promotions & Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private service: PromotionsService) {}

  @Get()
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'List all promotional campaigns' })
  findAll() {
    return this.service.findAll();
  }

  @Get('banners')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'List all marketing banners' })
  getBanners() {
    return this.service.getBanners();
  }

  @Post()
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create promotional campaign' })
  createPromotion(@Body() body: any) {
    return this.service.createPromotion(body);
  }

  @Post('banners')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create marketing banner' })
  createBanner(@Body() body: any) {
    return this.service.createBanner(body);
  }
}
