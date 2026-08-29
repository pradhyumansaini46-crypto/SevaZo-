import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import { Store } from '../types';
import { Star, Clock, MapPin } from 'lucide-react-native';

interface StoreCardProps {
  store: Store;
  onPress: () => void;
  style?: ViewStyle;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onPress, style }) => {
  const coverUri =
    store.coverImage ||
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500';

  const avatarUri =
    store.avatar ||
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Cover Image Container */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.overlay} />

        {/* Store Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
        </View>

        {/* Open/Closed Badge */}
        <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? Colors.success : Colors.danger }]}>
          <Text style={styles.statusText}>{store.isOpen ? 'OPEN' : 'CLOSED'}</Text>
        </View>

        {/* Promo text if any */}
        {store.bannerText ? (
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>{store.bannerText}</Text>
          </View>
        ) : null}
      </View>

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.storeName}>
            {store.businessName}
          </Text>
          <View style={styles.ratingBadge}>
            <Star size={11} color={Colors.starGold} fill={Colors.starGold} />
            <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.addressText}>
          {store.address}, {store.city}
        </Text>

        {/* Meta badges: Delivery Time & Distance */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={Colors.primary} />
            <Text style={styles.metaText}>{store.deliveryTime || '15-20 min'}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <MapPin size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{store.distanceKm ? `${store.distanceKm} km` : '1.2 km'}</Text>
          </View>
        </View>

        {/* Tag chips */}
        {store.tags && store.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {store.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  coverContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -16,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: 2,
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadows.small,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  bannerText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textInverse,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm + 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  storeName: {
    flex: 1,
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellowLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 3,
  },
  addressText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  metaDot: {
    marginHorizontal: 6,
    color: Colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tagChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
