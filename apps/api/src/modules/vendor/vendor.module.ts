import { Module } from '@nestjs/common';
import { VendorAuthModule } from './auth/vendor-auth.module';
import { VendorProfileModule } from './profile/vendor-profile.module';
import { VendorOnboardingModule } from './onboarding/vendor-onboarding.module';
import { VendorDocumentModule } from './documents/vendor-document.module';
import { StoreModule } from './stores/store.module';
import { ProductModule } from './products/product.module';
import { ProductVariantModule } from './product-variants/product-variant.module';
import { ProductImageModule } from './product-images/product-image.module';
import { InventoryModule } from './inventory/inventory.module';
import { VendorOrderModule } from './orders/vendor-order.module';
import { VendorNotificationModule } from './notifications/vendor-notification.module';
import { VendorFinanceModule } from './finance/vendor-finance.module';
import { SettlementModule } from './settlements/settlement.module';
import { VendorPromotionModule } from './promotions/vendor-promotion.module';
import { VendorAnalyticsModule } from './analytics/vendor-analytics.module';

@Module({
  imports: [
    VendorAuthModule,
    VendorProfileModule,
    VendorOnboardingModule,
    VendorDocumentModule,
    StoreModule,
    ProductModule,
    ProductVariantModule,
    ProductImageModule,
    InventoryModule,
    VendorOrderModule,
    VendorNotificationModule,
    VendorFinanceModule,
    SettlementModule,
    VendorPromotionModule,
    VendorAnalyticsModule,
  ],
  exports: [
    VendorAuthModule,
    VendorProfileModule,
    VendorOnboardingModule,
    VendorDocumentModule,
    StoreModule,
    ProductModule,
    ProductVariantModule,
    ProductImageModule,
    InventoryModule,
    VendorOrderModule,
    VendorNotificationModule,
    VendorFinanceModule,
    SettlementModule,
    VendorPromotionModule,
    VendorAnalyticsModule,
  ],
})
export class VendorModule {}
