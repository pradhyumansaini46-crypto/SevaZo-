import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, StatusBar, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { Colors, Typography, Shadows } from '../../theme';
import { preloadMarqueeImages } from './marqueeProducts';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { checkSession } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseRing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Preload catalog images in background
    preloadMarqueeImages();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pulseRing, {
        toValue: 1,
        duration: 850,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const initApp = async () => {
      // Exactly 1 second delay as requested: "for 1 sec show seVazo app than ask these three steps"
      const [destination] = await Promise.all([
        checkSession(),
        new Promise((r) => setTimeout(r, 1000)),
      ]);

      if (destination === 'OPEN_HOME') {
        try {
          navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } catch {
          navigation.navigate('Main' as any);
        }
      } else {
        // Unauthenticated user -> Welcome / Login / Register screen
        navigation.replace('Welcome');
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4EC" />

      {/* Light Orange & Greenish Touch Theme Gradient */}
      <LinearGradient
        colors={['#FFF4EC', '#FFE8D6', '#FFFDF9', '#FFFFFF', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.22, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Soft Radial Glow Ring */}
        <Animated.View
          style={[
            styles.haloRing,
            {
              transform: [
                {
                  scale: pulseRing.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1.25],
                  }),
                },
              ],
              opacity: pulseRing.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: [0.6, 0.3, 0],
              }),
            },
          ]}
        />

        {/* Brand Logo */}
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Indian Tricolor Ribbon Bar */}
        <View style={styles.tricolorBar}>
          <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
          <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
        </View>

        {/* Brand Headline */}
        <Text style={styles.brandTitle}>SevaZo</Text>

        {/* Emotional Tagline */}
        <Text style={styles.taglineText}>Seva Zo Dil Se Ki Jaye ❤️</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#FF7700',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: 54,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  brandTitle: {
    ...Typography.hero,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  taglineText: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 4,
  },
});
