import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';

import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

import { ProductDetailsScreen } from '../screens/product/ProductDetailsScreen';
import { ReviewsScreen } from '../screens/product/ReviewsScreen';
import { StoreScreen } from '../screens/store/StoreScreen';
import { SearchScreen } from '../screens/catalog/SearchScreen';
import { SearchResultsScreen } from '../screens/catalog/SearchResultsScreen';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';

import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { AddressListScreen } from '../screens/checkout/AddressListScreen';
import { AddEditAddressScreen } from '../screens/checkout/AddEditAddressScreen';
import { CouponScreen } from '../screens/checkout/CouponScreen';
import { PaymentScreen } from '../screens/checkout/PaymentScreen';

import { OrderConfirmationScreen } from '../screens/orders/OrderConfirmationScreen';
import { OrderDetailsScreen } from '../screens/orders/OrderDetailsScreen';
import { LiveTrackingScreen } from '../screens/orders/LiveTrackingScreen';
import { ReturnsScreen } from '../screens/orders/ReturnsScreen';
import { RefundsScreen } from '../screens/orders/RefundsScreen';

import { PaymentsScreen } from '../screens/profile/PaymentsScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { WalletScreen } from '../screens/profile/WalletScreen';
import { SupportScreen } from '../screens/profile/SupportScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SecuritySettingsScreen } from '../screens/profile/SecuritySettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />

        {/* Discovery & Catalog */}
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="StoreDetails" component={StoreScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />

        {/* Checkout & Address */}
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="AddressList" component={AddressListScreen} />
        <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
        <Stack.Screen name="CouponList" component={CouponScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />

        {/* Orders & Tracking */}
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
        <Stack.Screen name="Returns" component={ReturnsScreen} />
        <Stack.Screen name="Refunds" component={RefundsScreen} />

        {/* Profile & Account */}
        <Stack.Screen name="Addresses" component={AddressListScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
