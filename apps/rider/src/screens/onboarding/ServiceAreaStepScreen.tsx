import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export const ServiceAreaStepScreen = ({ navigation }: any) => {
  useEffect(() => {
    // Service Area is merged into PreferencesStepScreen
    navigation.replace('OnboardingPreferences');
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#FF6600" />
    </View>
  );
};

export default ServiceAreaStepScreen;
