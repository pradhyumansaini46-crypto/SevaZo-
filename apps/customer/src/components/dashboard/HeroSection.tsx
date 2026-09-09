import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  banners?: any[];
  onPressBanner?: () => void;
  onPressAction?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  banners,
  onPressBanner,
  onPressAction,
}) => {
  // Determine contextual greeting based on current local hour
  const contextData = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: '☀️ Good morning, Jaipur',
        title: 'Fresh essentials for your day',
        subtitle: 'Farm veggies, milk, bread & breakfast items delivered in 14 mins.',
        ctaText: 'Shop Fresh',
        query: 'fresh',
        tag: 'MORNING HARVEST',
        bgColor: '#065F46', // Emerald
        imageUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        greeting: '⚡ Afternoon recharge',
        title: 'Lunch, snacks & cold brews',
        subtitle: 'Quick bites, chilled drinks, and meal combos straight to your desk.',
        ctaText: 'Explore Now',
        query: 'lunch',
        tag: 'MIDDAY ESSENTIALS',
        bgColor: '#C2410C', // Warm Amber/Orange
        imageUri: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400',
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        greeting: '🌙 Evening sorted?',
        title: 'Dinner delivered to your door',
        subtitle: 'Hot dinner treats, fresh sweets & evening pantry staples in 15 mins.',
        ctaText: 'Explore Food',
        query: 'dinner',
        tag: 'DINNER & SNACKS',
        bgColor: '#1E293B', // Slate / Night
        imageUri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      };
    }
    return {
      greeting: '✨ Late night cravings?',
      title: 'Midnight munchies in 15 mins',
      subtitle: 'Chips, ice creams, sodas & quick bites to satisfy your late cravings.',
      ctaText: 'Satisfy Cravings',
      query: 'snacks',
      tag: 'MIDNIGHT RUSH',
      bgColor: '#312E81', // Indigo
      imageUri: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          triggerHaptic('light');
          if (onPressBanner) {
            onPressBanner();
          } else if (onPressAction) {
            onPressAction(contextData.query);
          }
        }}
        style={[styles.card, { backgroundColor: contextData.bgColor }]}
      >
        <View style={styles.infoCol}>
          <View style={styles.tagPill}>
            <Sparkles size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.tagText}>{contextData.tag}</Text>
          </View>

          <Text style={styles.greetingText}>{contextData.greeting}</Text>
          <Text numberOfLines={2} style={styles.titleText}>
            {contextData.title}
          </Text>
          <Text numberOfLines={2} style={styles.subtitleText}>
            {contextData.subtitle}
          </Text>

          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>{contextData.ctaText}</Text>
            <ArrowRight size={13} color="#0F172A" strokeWidth={2.5} />
          </View>
        </View>

        <Image source={{ uri: contextData.imageUri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  card: {
    width: '100%',
    height: 154,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md + 2,
    overflow: 'hidden',
    ...Shadows.card,
  },
  infoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  greetingText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  titleText: {
    ...Typography.titleSmall,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
    marginTop: 2,
  },
  subtitleText: {
    ...Typography.bodySmall,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
    lineHeight: 14,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 8,
    ...Shadows.small,
  },
  ctaBtnText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 4,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.lg,
  },
});
