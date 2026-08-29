import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { OnboardingWizardScreen } from '../screens/onboarding/OnboardingWizardScreen';
import { ApplicationSubmittedScreen } from '../screens/onboarding/ApplicationSubmittedScreen';
import { StatusTrackerScreen } from '../screens/onboarding/StatusTrackerScreen';
import { StoreApprovedScreen } from '../screens/onboarding/StoreApprovedScreen';
import { CorrectionScreen } from '../screens/onboarding/CorrectionScreen';
import { SuspendedScreen } from '../screens/onboarding/SuspendedScreen';
import { BusinessSetupScreen } from '../screens/auth/BusinessSetupScreen';
import { KycScreen } from '../screens/auth/KycScreen';
import { ApprovalPendingScreen } from '../screens/auth/ApprovalPendingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="OnboardingWizard" component={OnboardingWizardScreen} />
      <Stack.Screen name="ApplicationSubmitted" component={ApplicationSubmittedScreen} />
      <Stack.Screen name="StatusTracker" component={StatusTrackerScreen} />
      <Stack.Screen name="StoreApproved" component={StoreApprovedScreen} />
      <Stack.Screen name="Correction" component={CorrectionScreen} />
      <Stack.Screen name="Suspended" component={SuspendedScreen} />
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      <Stack.Screen name="Kyc" component={KycScreen} />
      <Stack.Screen name="ApprovalPending" component={ApprovalPendingScreen} />
    </Stack.Navigator>
  );
};
