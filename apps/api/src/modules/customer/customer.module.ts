import { Module } from '@nestjs/common';

// 12 Customer-Facing Subsystem Modules
import { CustomerAuthModule } from './auth/customer-auth.module';
import { CustomerCatalogModule } from './catalog/customer-catalog.module';
import { CustomerSearchModule } from './search/customer-search.module';
import { CustomerCartModule } from './cart/customer-cart.module';
import { CustomerCheckoutModule } from './checkout/customer-checkout.module';
import { CustomerOrdersModule } from './orders/customer-orders.module';
import { CustomerPaymentModule } from './payments/customer-payment.module';
import { CustomerTrackingModule } from './tracking/customer-tracking.module';
import { CustomerWishlistModule } from './wishlist/customer-wishlist.module';
import { CustomerReviewModule } from './reviews/customer-review.module';
import { CustomerNotificationModule } from './notifications/customer-notification.module';
import { CustomerSupportModule } from './support/customer-support.module';

@Module({
  imports: [
    CustomerAuthModule,           // 1. Auth, Profile & Addresses
    CustomerCatalogModule,        // 2. Home Feed, Categories, Products, Stores
    CustomerSearchModule,         // 3. Full-Text Search & Suggestions
    CustomerCartModule,           // 4. Persistent Shopping Cart
    CustomerCheckoutModule,       // 5. Bill Calculation & Coupons
    CustomerOrdersModule,         // 6. Order Lifecycle & Returns
    CustomerPaymentModule,        // 7. Payment Gateway & Wallet
    CustomerTrackingModule,       // 8. Live GPS Tracking & Delivery OTP
    CustomerWishlistModule,       // 9. Saved Product Wishlist
    CustomerReviewModule,         // 10. Product Reviews & Ratings
    CustomerNotificationModule,   // 11. Push Notifications & In-App Alerts
    CustomerSupportModule,        // 12. Support Tickets & FAQs
  ],
  exports: [
    CustomerAuthModule,
    CustomerCatalogModule,
    CustomerSearchModule,
    CustomerCartModule,
    CustomerCheckoutModule,
    CustomerOrdersModule,
    CustomerPaymentModule,
    CustomerTrackingModule,
    CustomerWishlistModule,
    CustomerReviewModule,
    CustomerNotificationModule,
    CustomerSupportModule,
  ],
})
export class CustomerModule {}
