import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      // Show only the logo for exactly 1.5 seconds
      const [session] = await Promise.all([
        checkSession(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      if (!isMounted) return;

      if (!session.isAuthenticated || session.status === 'UNAUTHENTICATED') {
        navigation.replace('Welcome');
        return;
      }

      switch (session.status) {
        case 'NO_VENDOR':
          navigation.replace('Welcome');
          break;
        case 'DRAFT':
          navigation.replace('OnboardingWizard', { initialStep: session.currentStep, isResume: true });
          break;
        case 'SUBMITTED':
        case 'UNDER_REVIEW':
          navigation.replace('StatusTracker');
          break;
        case 'APPROVED':
          navigation.replace('Main');
          break;
        case 'REJECTED':
          navigation.replace('Correction');
          break;
        case 'SUSPENDED':
          navigation.replace('Suspended');
          break;
        default:
          navigation.replace('Welcome');
          break;
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [checkSession, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});
