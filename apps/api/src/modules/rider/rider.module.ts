import { Module } from '@nestjs/common';

// Rider Subsystem Modules
import { RiderAuthModule } from './auth/rider-auth.module';
import { RiderOnboardingModule } from './onboarding/rider-onboarding.module';
import { RiderProfileModule } from './profile/rider-profile.module';
import { RiderKycModule } from './kyc/rider-kyc.module';
import { RiderVehicleModule } from './vehicles/rider-vehicle.module';
import { RiderDocumentModule } from './documents/rider-document.module';
import { RiderBankingModule } from './banking/rider-banking.module';
import { RiderAddressModule } from './address/rider-address.module';
import { RiderServiceAreaModule } from './service-area/rider-service-area.module';
import { RiderPreferencesModule } from './preferences/rider-preferences.module';
import { RiderAvailabilityModule } from './availability/rider-availability.module';
import { DeliveryModule } from './deliveries/rider-delivery.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { AssignmentModule } from './assignments/rider-assignment.module';
import { LocationModule } from './location/rider-location.module';
import { TrackingModule } from './tracking/tracking.module';
import { PickupModule } from './pickup/rider-pickup.module';
import { DropModule } from './drop/rider-drop.module';
import { DeliveryProofModule } from './proof/delivery-proof.module';
import { RiderEarningsModule } from './earnings/rider-earnings.module';
import { RiderSettlementModule } from './settlements/rider-settlement.module';
import { RiderNotificationModule } from './notifications/rider-notification.module';

@Module({
  imports: [
    RiderAuthModule,
    RiderOnboardingModule,
    RiderProfileModule,
    RiderKycModule,
    RiderVehicleModule,
    RiderDocumentModule,
    RiderBankingModule,
    RiderAddressModule,
    RiderServiceAreaModule,
    RiderPreferencesModule,
    RiderAvailabilityModule,
    DeliveryModule,
    DispatchModule,
    AssignmentModule,
    LocationModule,
    TrackingModule,
    PickupModule,
    DropModule,
    DeliveryProofModule,
    RiderEarningsModule,
    RiderSettlementModule,
    RiderNotificationModule,
  ],
  exports: [
    RiderAuthModule,
    RiderOnboardingModule,
    RiderProfileModule,
    RiderKycModule,
    RiderVehicleModule,
    RiderDocumentModule,
    RiderBankingModule,
    RiderAddressModule,
    RiderServiceAreaModule,
    RiderPreferencesModule,
    RiderAvailabilityModule,
    DeliveryModule,
    DispatchModule,
    AssignmentModule,
    LocationModule,
    TrackingModule,
    PickupModule,
    DropModule,
    DeliveryProofModule,
    RiderEarningsModule,
    RiderSettlementModule,
    RiderNotificationModule,
  ],
})
export class RiderModule {}
