import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

import { OnboardingWizardScreen } from '../screens/onboarding/OnboardingWizardScreen';
import { ApplicationSubmittedScreen } from '../screens/onboarding/ApplicationSubmittedScreen';
import { StatusTrackerScreen } from '../screens/onboarding/StatusTrackerScreen';
import { StoreApprovedScreen } from '../screens/onboarding/StoreApprovedScreen';
import { CorrectionScreen } from '../screens/onboarding/CorrectionScreen';
import { SuspendedScreen } from '../screens/onboarding/SuspendedScreen';
import { AddProductScreen } from '../screens/products/AddProductScreen';
import { EditProductScreen } from '../screens/products/EditProductScreen';
import { VariantsScreen } from '../screens/products/VariantsScreen';
import { ProductImagesScreen } from '../screens/products/ProductImagesScreen';
import { StockAdjustmentScreen } from '../screens/inventory/StockAdjustmentScreen';
import { LowStockScreen } from '../screens/inventory/LowStockScreen';
import { StoreProfileScreen } from '../screens/store/StoreProfileScreen';
import { StoreHoursScreen } from '../screens/store/StoreHoursScreen';
import { StoreStatusScreen } from '../screens/store/StoreStatusScreen';
import { RevenueScreen } from '../screens/finance/RevenueScreen';
import { TransactionsScreen } from '../screens/finance/TransactionsScreen';
import { SettlementsScreen } from '../screens/finance/SettlementsScreen';
import { PromotionsScreen } from '../screens/promotions/PromotionsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SupportScreen } from '../screens/support/SupportScreen';

const Stack = createNativeStackNavigator<any>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="OnboardingWizard" component={OnboardingWizardScreen} />
        <Stack.Screen name="ApplicationSubmitted" component={ApplicationSubmittedScreen} />
        <Stack.Screen name="StatusTracker" component={StatusTrackerScreen} />
        <Stack.Screen name="StoreApproved" component={StoreApprovedScreen} />
        <Stack.Screen name="Correction" component={CorrectionScreen} />
        <Stack.Screen name="Suspended" component={SuspendedScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />

        {/* Product Modal Flows */}
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen name="ProductVariants" component={VariantsScreen} />
        <Stack.Screen name="ProductImages" component={ProductImagesScreen} />

        {/* Inventory Flows */}
        <Stack.Screen name="StockAdjustment" component={StockAdjustmentScreen} />
        <Stack.Screen name="LowStock" component={LowStockScreen} />

        {/* Store Management Flows */}
        <Stack.Screen name="StoreProfile" component={StoreProfileScreen} />
        <Stack.Screen name="StoreHours" component={StoreHoursScreen} />
        <Stack.Screen name="StoreStatus" component={StoreStatusScreen} />

        {/* Finance & Marketing Flows */}
        <Stack.Screen name="Revenue" component={RevenueScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Settlements" component={SettlementsScreen} />
        <Stack.Screen name="Promotions" component={PromotionsScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
