import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface BlinkitHeroBannerProps {
  onPress?: () => void;
  brandName?: string;
  headline?: string;
  subtitle?: string;
  buttonText?: string;
}

export const BlinkitHeroBanner: React.FC<BlinkitHeroBannerProps> = ({
  onPress,
  brandName = "L'ORÉAL PARIS",
  headline = 'VOLUME RUSH',
  subtitle = 'Think you can capture\nthe most volume?',
  buttonText = 'Take the challenge',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.94}
        onPress={() => {
          triggerHaptic('light');
          onPress?.();
        }}
        style={styles.card}
      >
        <LinearGradient
          colors={['#EDE9FE', '#DDD6FE', '#C4B5FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />

        {/* Left Product Image */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=250',
          }}
          style={styles.leftProductImage}
          resizeMode="contain"
        />

        {/* Center Content Column */}
        <View style={styles.centerCol}>
          <Text style={styles.brandTitle}>{brandName}</Text>

          <View style={styles.headlineRow}>
            <Sparkles size={12} color="#7C3AED" style={{ marginRight: 2 }} />
            <Text style={styles.headlineText}>{headline}</Text>
          </View>

          <Text style={styles.subtitleText}>{subtitle}</Text>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>{buttonText}</Text>
          </View>
        </View>

        {/* Right Product Image */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=250',
          }}
          style={styles.rightProductImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    marginVertical: 12,
  },
  card: {
    height: 190,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  gradientBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  leftProductImage: {
    position: 'absolute',
    left: -8,
    top: 10,
    width: 100,
    height: 170,
    transform: [{ rotate: '-8deg' }],
  },
  rightProductImage: {
    position: 'absolute',
    right: -10,
    top: 8,
    width: 105,
    height: 175,
    transform: [{ rotate: '12deg' }],
  },
  centerCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 75,
    zIndex: 2,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#3B0764',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headlineText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4C1D95',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B0764',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: '#5B21B6',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
    ...Shadows.small,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
