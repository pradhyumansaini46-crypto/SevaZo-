import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { checkSession } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      // Show only the logo for exactly 1.5 seconds
      const [destination] = await Promise.all([
        checkSession(),
        new Promise((r) => setTimeout(r, 1500)),
      ]);

      if (destination === 'OPEN_HOME') {
        navigation.replace('Main');
      } else if (destination === 'RESUME_REGISTRATION') {
        navigation.replace('ResumeRegistration');
      } else {
        navigation.replace('Welcome');
      }
    };

    initApp();
  }, []);

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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});
