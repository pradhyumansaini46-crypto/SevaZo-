import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './database/prisma.module';
import { QueueModule } from './queue/queue.module';

// Common Guards & Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

// 22 Domain Modules
import { AdminAuthModule } from './modules/auth/auth.module';
import { AdminUserModule } from './modules/admin-users/admin-users.module';
import { RoleModule } from './modules/roles/roles.module';
import { PermissionModule } from './modules/permissions/permissions.module';

import { CustomerManagementModule } from './modules/customers/customers.module';
import { VendorManagementModule } from './modules/vendors/vendors.module';
import { RiderManagementModule } from './modules/riders/riders.module';

import { CategoryModule } from './modules/categories/categories.module';
import { BrandModule } from './modules/brands/brands.module';
import { ProductManagementModule } from './modules/products/products.module';

import { OrderManagementModule } from './modules/orders/orders.module';
import { DeliveryManagementModule } from './modules/deliveries/deliveries.module';

import { PaymentManagementModule } from './modules/payments/payments.module';
import { RefundModule } from './modules/refunds/refunds.module';
import { SettlementModule } from './modules/settlements/settlements.module';
import { CommissionModule } from './modules/commissions/commissions.module';

import { CouponModule } from './modules/coupons/coupons.module';
import { PromotionModule } from './modules/promotions/promotions.module';

import { SupportModule } from './modules/support/support.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { RiderModule } from './modules/rider/rider.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,

    // Identity & RBAC
    AdminAuthModule,
    AdminUserModule,
    RoleModule,
    PermissionModule,

    // Users
    CustomerManagementModule,
    VendorManagementModule,
    RiderManagementModule,

    // Catalog
    CategoryModule,
    BrandModule,
    ProductManagementModule,

    // Orders & Logistics
    OrderManagementModule,
    DeliveryManagementModule,

    // Finance
    PaymentManagementModule,
    RefundModule,
    SettlementModule,
    CommissionModule,

    // Marketing
    CouponModule,
    PromotionModule,

    // Support & Analytics
    SupportModule,
    AnalyticsModule,

    // Administration & Config
    AuditModule,
    SettingsModule,

    // Vendor 15 Dedicated Subsystem Modules
    VendorModule,

    // Rider 16 Dedicated Subsystem Modules
    RiderModule,

    // Customer App Subsystem Module
    CustomerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
