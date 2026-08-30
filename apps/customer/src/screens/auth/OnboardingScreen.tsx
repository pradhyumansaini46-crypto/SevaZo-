import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { Zap, ShieldCheck, MapPin, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: <Zap size={36} color={Colors.primary} />,
    title: 'Lightning 10-Min Delivery',
    subtitle: 'From local organic farms, bakeries and supermarkets right to your door.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  },
  {
    id: '2',
    icon: <ShieldCheck size={36} color={Colors.secondary} />,
    title: '100% Quality Guaranteed',
    subtitle: 'Triple-checked fresh vegetables, dairy, snacks, and daily essentials with instant refunds.',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
  },
  {
    id: '3',
    icon: <MapPin size={36} color={Colors.accentOrange} />,
    title: 'Live GPS Rider Tracking',
    subtitle: 'Watch your rider on the map in real-time with verified contactless OTP delivery.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <Text style={styles.brandText}>SevaZo</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay} />
        <View style={styles.iconCircle}>{slide.icon}</View>
      </View>

      {/* Slide Content */}
      <View style={styles.contentBox}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Action Button */}
        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          icon={<ArrowRight size={18} color={Colors.textInverse} />}
          iconPosition="right"
          size="lg"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl + 10,
    paddingBottom: Spacing.md,
  },
  brandText: {
    ...Typography.titleLarge,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  skipText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  imageContainer: {
    width: width - Spacing.xl * 2,
    height: 280,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  iconCircle: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  contentBox: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxxl,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    marginTop: Spacing.xl,
  },
});
