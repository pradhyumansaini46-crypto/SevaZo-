import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { ResumeRegistrationScreen } from '../screens/auth/ResumeRegistrationScreen';
import { RegisterProfileScreen } from '../screens/auth/RegisterProfileScreen';
import { RegisterLocationScreen } from '../screens/auth/RegisterLocationScreen';
import { RegisterAddressScreen } from '../screens/auth/RegisterAddressScreen';
import { RegisterPreferencesScreen } from '../screens/auth/RegisterPreferencesScreen';
import { RegisterTermsScreen } from '../screens/auth/RegisterTermsScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="ResumeRegistration" component={ResumeRegistrationScreen} />
      <Stack.Screen name="RegisterProfile" component={RegisterProfileScreen} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} />
      <Stack.Screen name="RegisterAddress" component={RegisterAddressScreen} />
      <Stack.Screen name="RegisterPreferences" component={RegisterPreferencesScreen} />
      <Stack.Screen name="RegisterTerms" component={RegisterTermsScreen} />
    </Stack.Navigator>
  );
};
