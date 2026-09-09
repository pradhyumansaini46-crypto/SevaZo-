import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Colors, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface QuadCategoryData {
  id: string;
  name: string;
  moreCountText: string;
  images: string[];
}

interface QuadCategoryCardProps {
  category: QuadCategoryData;
  onPress: () => void;
  cardWidth?: number;
  style?: any;
}

export const QuadCategoryCard: React.FC<QuadCategoryCardProps> = ({
  category,
  onPress,
  cardWidth,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        triggerHaptic('light');
        onPress();
      }}
      style={[styles.card, cardWidth ? { width: cardWidth } : null, style]}
    >
      {/* 2x2 Image Preview Matrix */}
      <View style={styles.imageGridWrapper}>
        <View style={styles.row}>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: category.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: category.images[1] || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: category.images[2] || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: category.images[3] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Center-Bottom Floating Pill Badge: "+215 more" */}
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{category.moreCountText}</Text>
        </View>
      </View>

      {/* Category Name */}
      <Text numberOfLines={2} style={styles.categoryName}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    paddingBottom: 10,
    alignItems: 'center',
    marginBottom: 0,
  },
  imageGridWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 3,
    position: 'relative',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    gap: 3,
    marginBottom: 3,
  },
  imageBox: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  categoryName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
    paddingHorizontal: 2,
  },
});
