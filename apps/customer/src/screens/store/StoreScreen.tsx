import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ProductCard } from '../../components/ProductCard';
import { RatingStars } from '../../components/RatingStars';
import {
  ArrowLeft,
  Share2,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Store, Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

const { width } = Dimensions.get('window');

export const StoreScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const storeId = route.params?.storeId || 'store-1';

  const { addItem, incrementItem, decrementItem, getItemQuantity, getTotalCount, getCalculation } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  const loadStoreDetails = async () => {
    const s = await customerApi.getStoreById(storeId);
    if (s) setStore(s);
    const p = await customerApi.getProducts({ storeId });
    setProducts(p);
  };

  const totalCount = getTotalCount();
  const calculation = getCalculation();

  if (!store) return null;

  const filterTags = ['All', ...(store.tags || [])];
  const filteredProducts =
    selectedTag === 'All'
      ? products
      : products.filter((p) => p.tags.includes(selectedTag));

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Header */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: store.coverImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800' }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />

          {/* Top Actions */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.actionCircle}
            >
              <ArrowLeft size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.actionCircle}>
              <Share2 size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: store.avatar || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100' }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? Colors.success : Colors.danger }]}>
              <Text style={styles.statusText}>{store.isOpen ? 'OPEN' : 'CLOSED'}</Text>
            </View>
          </View>

          <Text style={styles.storeName}>{store.businessName}</Text>
          <Text style={styles.addressText}>{store.address}, {store.city}</Text>

          <View style={styles.ratingRow}>
            <RatingStars rating={store.rating} size={16} showText reviewsCount={store.reviewsCount} />
            <View style={styles.certifiedPill}>
              <ShieldCheck size={13} color={Colors.primary} />
              <Text style={styles.certifiedText}>Verified SevaZo Partner</Text>
            </View>
          </View>

          {/* Delivery Info Pills */}
          <View style={styles.infoPillsRow}>
            <View style={styles.infoPill}>
              <Clock size={14} color={Colors.primary} />
              <Text style={styles.infoPillText}>{store.deliveryTime || '15-20 mins'}</Text>
            </View>
            <View style={styles.infoPill}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.infoPillText}>{store.distanceKm || 1.2} km away</Text>
            </View>
            <View style={styles.infoPill}>
              <Zap size={14} color="#D97706" fill="#D97706" />
              <Text style={styles.infoPillText}>Express Fast Dispatch</Text>
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFiltersRow}
        >
          {filterTags.map((tag, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => setSelectedTag(tag)}
              style={[
                styles.tagPill,
                selectedTag === tag && styles.tagPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.tagPillText,
                  selectedTag === tag && styles.tagPillTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              quantityInCart={getItemQuantity(prod.id)}
              isWishlisted={isInWishlist(prod.id)}
              onPress={() =>
                navigation.navigate('ProductDetails', {
                  productId: prod.id,
                  productName: prod.name,
                })
              }
              onAddToCart={() => addItem(prod)}
              onIncrement={() => incrementItem(prod.id)}
              onDecrement={() => decrementItem(prod.id)}
              onToggleWishlist={() => toggleWishlist(prod)}
              style={styles.gridItem}
            />
          ))}
        </View>

        <View style={{ height: totalCount > 0 ? 100 : 40 }} />
      </ScrollView>

      {/* Floating Mini Cart */}
      {totalCount > 0 ? (
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => navigation.navigate('CartTab')}
          style={styles.floatingCart}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{totalCount}</Text>
            </View>
            <View>
              <Text style={styles.floatingCartTotal}>₹{calculation.grandTotal}</Text>
              <Text style={styles.floatingCartSavings}>
                {calculation.savingsTotal > 0 ? `Saved ₹${calculation.savingsTotal}` : 'Express delivery included'}
              </Text>
            </View>
          </View>

          <View style={styles.floatingCartRight}>
            <Text style={styles.viewCartText}>View Cart</Text>
            <ArrowRight size={18} color={Colors.textInverse} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  coverContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topActionsRow: {
    position: 'absolute',
    top: Spacing.xl + 10,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    marginTop: -30,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadows.small,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  storeName: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  certifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  certifiedText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginLeft: 4,
  },
  infoPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm + 2,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoPillText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  tagFiltersRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  tagPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  tagPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagPillText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tagPillTextSelected: {
    color: Colors.textInverse,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  gridItem: {
    width: (width - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
  },
  floatingCart: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.floatingCTA,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCountCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cartCountText: {
    ...Typography.bodyMedium,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  floatingCartTotal: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  floatingCartSavings: {
    ...Typography.bodySmall,
    color: '#D1FAE5',
    fontSize: 11,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textInverse,
    marginRight: 6,
  },
});
