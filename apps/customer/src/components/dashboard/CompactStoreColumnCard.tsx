import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Store } from '../../types';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Star, Clock, MapPin } from 'lucide-react-native';

interface CompactStoreColumnCardProps {
  store: Store;
  onPress: () => void;
  cardWidth?: number;
}

export const CompactStoreColumnCard: React.FC<CompactStoreColumnCardProps> = ({
  store,
  onPress,
  cardWidth = 124,
}) => {
  const coverUri =
    store.coverImage ||
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400';

  const avatarUri =
    store.avatar ||
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100';

  const categoryLabel = store.tags && store.tags.length > 0 ? store.tags[0] : 'Store';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { width: cardWidth }]}
    >
      {/* Cover Image */}
      <View style={styles.imageBox}>
        <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.overlay} />

        {/* Store Avatar */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
        </View>

        {/* Open Badge */}
        <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>{store.isOpen ? 'OPEN' : 'CLOSED'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.storeName}>
          {store.businessName}
        </Text>

        <Text numberOfLines={1} style={styles.categoryText}>
          {categoryLabel}
        </Text>

        {/* Rating & ETA */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Star size={9} color={Colors.starGold} fill={Colors.starGold} />
            <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text numberOfLines={1} style={styles.etaText}>
            {store.deliveryTime || '15 min'}
          </Text>
        </View>

        <View style={styles.distanceRow}>
          <MapPin size={9} color="#64748B" style={{ marginRight: 2 }} />
          <Text numberOfLines={1} style={styles.distanceText}>
            {store.distanceKm ? `${store.distanceKm} km away` : 'Near you'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageBox: {
    width: '100%',
    height: 80,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  avatarWrap: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    padding: 7,
  },
  storeName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 14,
  },
  categoryText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 2,
  },
  dot: {
    fontSize: 9,
    color: '#94A3B8',
    marginHorizontal: 3,
  },
  etaText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  distanceText: {
    fontSize: 8.5,
    color: '#64748B',
  },
});
