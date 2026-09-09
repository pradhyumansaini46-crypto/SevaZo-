import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: any;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    eyebrow: 'NEIGHBOURHOOD SHOPPING, REIMAGINED',
    title: 'Shop Smart,\nEat Fresh',
    subtitle:
      'From fresh vegetables to daily essentials — browse 500+ local stores, add to cart in seconds, and let Sevazo handle the rest.',
    image: require('../../../assets/onboarding/step1_shop_fresh.jpg'),
  },
  {
    id: '2',
    eyebrow: 'ZERO WAIT, ZERO HASSLE',
    title: 'Fast Delivery,\nYour Way',
    subtitle:
      'Track your rider live, street by street, as your order makes its way home — or pick a slot that fits your day.',
    image: require('../../../assets/onboarding/step2_fast_delivery.jpg'),
  },
  {
    id: '3',
    eyebrow: 'EVERY ORDER PAYS YOU BACK',
    title: 'Unlock Exclusive\nDeals & Rewards',
    subtitle:
      'Earn points on every order and turn them into real savings — vouchers, discounts, and surprise perks, just for you.',
    image: require('../../../assets/onboarding/step3_deals_rewards.jpg'),
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Smooth slide and crossfade animation when moving between steps
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToSlide = (newIndex: number) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= SLIDES.length) return;
    triggerHaptic('selection');

    const direction = newIndex > currentIndex ? 24 : -24;
    slideAnim.setValue(direction);
    fadeAnim.setValue(0.25);

    setCurrentIndex(newIndex);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handleNext = () => {
    triggerHaptic('medium');
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      // Step 3 completed for new user -> Route to Main Dashboard
      try {
        const parent = navigation.getParent();
        if (parent) {
          parent.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
          return;
        }
      } catch {}
      navigation.navigate('Main' as any);
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    try {
      const parent = navigation.getParent();
      if (parent) {
        parent.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      }
    } catch {}
    navigation.navigate('Main' as any);
  };

  // Touch Swipe Gesture Responder for natural swiping
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -45) {
          // Swiped Left -> Advance to Next Step
          if (currentIndex < SLIDES.length - 1) {
            goToSlide(currentIndex + 1);
          }
        } else if (gestureState.dx > 45) {
          // Swiped Right -> Back to Previous Step
          if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
          }
        }
      },
    })
  ).current;

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  const circleSize = Math.min(width - 56, 300);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7ED" />

      {/* Light Orange & Greenish Touch Theme Gradient Background */}
      <LinearGradient
        colors={['#FFF7ED', '#FFE8D6', '#FFFDF9', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.2, 0.45, 0.78, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header Bar: Skip Button at top-right (Logo removed from all steps) */}
      <View
        style={[
          styles.topHeaderBar,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSkip}
          style={styles.skipButtonPill}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Step Content Area with Smooth Animation */}
      <View style={styles.mainContentContainer}>
        <Animated.View
          style={[
            styles.animatedSlideContent,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Modern Ad Creative Illustration in Circular Card */}
          <View
            style={[
              styles.imageCardWrapper,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          >
            <Image
              source={currentSlide.image}
              style={styles.heroCreativeImage}
              resizeMode="cover"
            />
          </View>

          {/* Typography Content Area */}
          <View style={styles.typographyContainer}>
            {/* Top Eyebrow Tag */}
            <View style={styles.eyebrowTagWrap}>
              <Text style={styles.eyebrowTagText}>{currentSlide.eyebrow}</Text>
            </View>

            {/* Bold Centered Headline */}
            <Text style={styles.headlineTitle}>{currentSlide.title}</Text>

            {/* Centered Descriptive Subtitle (Expanded) */}
            <Text style={styles.bodySubtitle}>{currentSlide.subtitle}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Controls Area: 3 Centered Dots + Full-Width Action Button */}
      <View
        style={[
          styles.bottomControlsSection,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.sm : Spacing.xl },
        ]}
      >
        {/* 3 Pagination Dots */}
        <View style={styles.dotsPaginationRow}>
          {SLIDES.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => goToSlide(idx)}
                style={styles.dotHitSlop}
              >
                <View
                  style={[
                    styles.paginationDot,
                    isActive && styles.paginationDotActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Pill Button: "Next" or "Get Started" */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleNext}
          style={styles.primaryActionButton}
        >
          <Text style={styles.primaryActionButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
    zIndex: 10,
  },
  skipButtonPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  skipButtonText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  mainContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedSlideContent: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageCardWrapper: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Shadows.elevated,
    marginBottom: Spacing.md + 6,
    backgroundColor: '#FFFFFF',
  },
  heroCreativeImage: {
    width: '100%',
    height: '100%',
  },
  typographyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  eyebrowTagWrap: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 10,
    alignSelf: 'center',
  },
  eyebrowTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headlineTitle: {
    ...Typography.hero,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 35,
    letterSpacing: -0.6,
    marginBottom: Spacing.xs + 4,
  },
  bodySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 340,
    fontWeight: '500',
  },
  bottomControlsSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  dotsPaginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md + 2,
  },
  dotHitSlop: {
    padding: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#10B981', // Clean Emerald Green Dot from Figma
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981', // Figma Vibrant Emerald Green
    borderRadius: 9999, // Perfect Pill
    height: 52,
    width: '100%',
    maxWidth: 360,
    ...Shadows.card,
  },
  primaryActionButtonText: {
    ...Typography.bodyLarge,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
