import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showText?: boolean;
  reviewsCount?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  style?: ViewStyle;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  showText = false,
  reviewsCount,
  interactive = false,
  onRate,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const isFilled = rating >= starNumber;
          const isHalf = !isFilled && rating >= starNumber - 0.5;

          const StarComponent = (
            <Star
              key={index}
              size={size}
              color={isFilled || isHalf ? Colors.starGold : Colors.border}
              fill={isFilled ? Colors.starGold : isHalf ? Colors.accentYellowLight : 'transparent'}
            />
          );

          if (interactive && onRate) {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => onRate(starNumber)}
                style={{ padding: 2 }}
              >
                {StarComponent}
              </TouchableOpacity>
            );
          }

          return <View key={index} style={{ marginRight: 2 }}>{StarComponent}</View>;
        })}
      </View>

      {showText && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}
          {reviewsCount !== undefined ? ` (${reviewsCount})` : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
});
