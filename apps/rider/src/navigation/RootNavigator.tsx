import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { OnboardingResumeScreen } from '../screens/OnboardingResumeScreen';
import { PersonalInfoScreen } from '../screens/onboarding/PersonalInfoScreen';
import { AddressScreen } from '../screens/onboarding/AddressScreen';
import { EmergencyContactScreen } from '../screens/onboarding/EmergencyContactScreen';
import { VehicleStepScreen } from '../screens/onboarding/VehicleStepScreen';
import { IdentityStepScreen } from '../screens/onboarding/IdentityStepScreen';
import { DrivingLicenceStepScreen } from '../screens/onboarding/DrivingLicenceStepScreen';
import { VehicleDocumentsStepScreen } from '../screens/onboarding/VehicleDocumentsStepScreen';
import { BankingStepScreen } from '../screens/onboarding/BankingStepScreen';
import { ServiceAreaStepScreen } from '../screens/onboarding/ServiceAreaStepScreen';
import { PreferencesStepScreen } from '../screens/onboarding/PreferencesStepScreen';
import { AvailabilityStepScreen } from '../screens/onboarding/AvailabilityStepScreen';
import { ConsentStepScreen } from '../screens/onboarding/ConsentStepScreen';
import { ReviewStepScreen } from '../screens/onboarding/ReviewStepScreen';
import { OnboardingWizardScreen } from '../screens/OnboardingWizardScreen';
import { ApplicationStatusScreen } from '../screens/ApplicationStatusScreen';
import { ApplicationSubmittedScreen } from '../screens/ApplicationSubmittedScreen';
import { ApprovedScreen } from '../screens/ApprovedScreen';
import { CorrectionScreen } from '../screens/CorrectionScreen';
import { SuspendedScreen, DeactivatedScreen } from '../screens/AccountStatusScreens';
import { MainTabNavigator } from './MainTabNavigator';
import { DeliveryDetailsScreen } from '../screens/DeliveryDetailsScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { PickupVerificationScreen } from '../screens/PickupVerificationScreen';
import { CustomerDeliveryScreen } from '../screens/CustomerDeliveryScreen';
import { DeliveryProofScreen } from '../screens/DeliveryProofScreen';
import { DeliveryCompleteScreen } from '../screens/DeliveryCompleteScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { useAppColors } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const colors = useAppColors();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Launch & Onboarding Flow */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ title: 'Verification' }}
        />
        <Stack.Screen
          name="OnboardingResume"
          component={OnboardingResumeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingPersonal"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingAddress"
          component={AddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingEmergencyContact"
          component={EmergencyContactScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingVehicle"
          component={VehicleStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingIdentity"
          component={IdentityStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingDrivingLicence"
          component={DrivingLicenceStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingVehicleDocuments"
          component={VehicleDocumentsStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingBanking"
          component={BankingStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingServiceArea"
          component={ServiceAreaStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingPreferences"
          component={PreferencesStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingAvailability"
          component={AvailabilityStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingConsent"
          component={ConsentStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingReview"
          component={ReviewStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingWizard"
          component={OnboardingWizardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ApplicationSubmitted"
          component={ApplicationSubmittedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ApplicationStatus"
          component={ApplicationStatusScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Approved"
          component={ApprovedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Correction"
          component={CorrectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Suspended"
          component={SuspendedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Deactivated"
          component={DeactivatedScreen}
          options={{ headerShown: false }}
        />

        {/* Main Active Rider App */}
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeliveryDetails"
          component={DeliveryDetailsScreen}
          options={{ title: 'Order Details' }}
        />
        <Stack.Screen
          name="Navigation"
          component={NavigationScreen}
          options={{ title: 'Live Navigation', headerShown: false }}
        />
        <Stack.Screen
          name="PickupVerification"
          component={PickupVerificationScreen}
          options={{ title: 'Store Handover' }}
        />
        <Stack.Screen
          name="CustomerDelivery"
          component={CustomerDeliveryScreen}
          options={{ title: 'Customer Route', headerShown: false }}
        />
        <Stack.Screen
          name="DeliveryProof"
          component={DeliveryProofScreen}
          options={{ title: 'Doorstep Verification' }}
        />
        <Stack.Screen
          name="DeliveryComplete"
          component={DeliveryCompleteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: 'Alerts & Incentives' }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ title: 'Help & Emergency SOS' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
