import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const SplashScreen = ({ navigation }: any) => {
  const { sessionCheck } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      // Show only the logo for exactly 1.5 seconds
      const [sessionResult] = await Promise.all([
        sessionCheck(),
        new Promise((r) => setTimeout(r, 1500)),
      ]);

      const { isAuthenticated, nextAction, status, rejectionReason } = sessionResult;

      if (!isAuthenticated || status === 'NO_ACCOUNT' || status === 'LOGGED_OUT') {
        navigation.replace('Welcome');
        return;
      }

      switch (nextAction) {
        case 'OPEN_HOME':
          if (status === 'APPROVED') {
            navigation.replace('Main');
          } else {
            navigation.replace('OnboardingPersonal');
          }
          break;
        case 'RESUME_REGISTRATION':
          navigation.replace('OnboardingResume');
          break;
        case 'OPEN_VERIFICATION_STATUS':
          navigation.replace('ApplicationStatus');
          break;
        case 'OPEN_CORRECTION':
          navigation.replace('Correction', { rejectionReason });
          break;
        case 'OPEN_SUSPENDED':
          navigation.replace('Suspended');
          break;
        case 'OPEN_SUPPORT':
          navigation.replace('Deactivated');
          break;
        case 'OPEN_WELCOME':
        case 'OPEN_LOGIN':
        default:
          navigation.replace('Welcome');
          break;
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});

export default SplashScreen;
