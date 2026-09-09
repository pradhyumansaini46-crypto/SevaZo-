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

  const minOrder = store.minOrder || 199;
  const deliveryFee = store.deliveryFee !== undefined ? store.deliveryFee : 0;
  const categoryLabel = store.tags && store.tags.length > 0 ? store.tags[0] : 'Supermarket';

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
        <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? '#10B981' : '#EF4444' }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{store.isOpen ? 'OPEN' : 'CLOSED'}</Text>
        </View>

        {/* Promo offer badge if any */}
        {store.offerText || store.bannerText ? (
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>{store.offerText || store.bannerText}</Text>
          </View>
        ) : null}
      </View>

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <View style={styles.nameWithDot}>
            <View
              style={[
                styles.liveStoreDot,
                { backgroundColor: store.isOpen ? '#10B981' : '#94A3B8' },
              ]}
            />
            <Text numberOfLines={1} style={styles.storeName}>
              {store.businessName}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Star size={11} color={Colors.starGold} fill={Colors.starGold} />
            <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Category & Address */}
        <View style={styles.categorySubRow}>
          <Text style={styles.categoryBadge}>{categoryLabel}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text numberOfLines={1} style={styles.addressText}>
            {store.address}, {store.city}
          </Text>
        </View>

        {/* Meta row: Delivery Time & Distance & Minimum Order */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={Colors.primary} />
            <Text style={styles.metaText}>{store.deliveryTime || '15-20 min'}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <MapPin size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>
              {store.distanceKm ? `${store.distanceKm} km` : '1.2 km'}
            </Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <Text style={styles.minOrderText}>₹{minOrder} min</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <Text style={styles.deliveryFeeText}>
              {deliveryFee === 0 ? 'Free Delivery' : `₹${deliveryFee} delivery`}
            </Text>
          </View>
        </View>
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
  nameWithDot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  liveStoreDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  storeName: {
    flex: 1,
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  categorySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
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
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  minOrderText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'none',
  },
  deliveryFeeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'none',
  },
  metaDot: {
    marginHorizontal: 4,
    color: Colors.textMuted,
    fontSize: 10,
  },
});
