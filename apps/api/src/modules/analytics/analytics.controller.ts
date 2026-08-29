import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private service: AnalyticsService) {}

  @Get()
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get all 12 dashboard metric cards overview' })
  getDashboard() {
    return this.service.getDashboardSummary();
  }
}

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get all 12 dashboard metric cards overview' })
  getDashboardSummary() {
    return this.service.getDashboardSummary();
  }

  @Get('revenue-trend')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get revenue time-series trend' })
  getRevenueTrend() {
    return this.service.getRevenueTrend();
  }

  @Get('orders-trend')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get order volume time-series trend' })
  getOrdersTrend() {
    return this.service.getOrdersTrend();
  }

  @Get('cancellation-rate')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get cancellation rate telemetry' })
  getCancellationRate() {
    return this.service.getCancellationRate();
  }

  @Get('delivery-success-rate')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get delivery success rate telemetry' })
  getDeliverySuccessRate() {
    return this.service.getDeliverySuccessRate();
  }
}
