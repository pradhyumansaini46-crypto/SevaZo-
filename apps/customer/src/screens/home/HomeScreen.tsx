import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { StoreCard } from '../../components/StoreCard';
import {
  Zap,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag,
  Search,
} from 'lucide-react-native';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useLocationStore } from '../../stores/locationStore';
import { customerApi } from '../../services/customerApi';
import { Product, Store, Category } from '../../types';
import { mockBanners } from '../../services/mockData';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentAddress } = useLocationStore();
  const { items: cartItems, addItem, incrementItem, decrementItem, getItemQuantity, getCalculation, getTotalCount } = useCartStore();
  const { isInWishlist, toggleWishlist, items: wishlistItems } = useWishlistStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [topStores, setTopStores] = useState<Store[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const data = await customerApi.getHomeFeed();
    setCategories(data.categories);
    setTrendingProducts(data.trendingProducts);
    setFlashDeals(data.flashDeals);
    setTopStores(data.topStores);
  };

  const totalCount = getTotalCount();
  const calculation = getCalculation();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header
        showLocation
        locationAddress={`${currentAddress.label}: ${currentAddress.line1}`}
        onPressLocation={() => navigation.navigate('AddressList')}
        showSearch
        onPressSearch={() => navigation.navigate('Search')}
        showWishlist
        wishlistCount={wishlistItems.length}
        onPressWishlist={() => navigation.navigate('Wishlist')}
        showNotifications
        notificationCount={2}
        onPressNotifications={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar Prompt */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBarTrigger}
        >
          <Search size={18} color={Colors.textMuted} />
          <Text style={styles.searchBarPlaceholder}>
            Search "spinach", "amul milk", "doritos"...
          </Text>
          <View style={styles.deliveryPill}>
            <Zap size={11} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.deliveryPillText}>12 MINS</Text>
          </View>
        </TouchableOpacity>

        {/* Hero Banners Carousel */}
        <FlatList
          data={mockBanners}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('SearchResults', { query: 'deal' })}
              style={[styles.bannerCard, { backgroundColor: item.bgColor }]}
            >
              <View style={styles.bannerInfo}>
                <View style={styles.bannerTag}>
                  <Text style={styles.bannerTagText}>{item.tag}</Text>
                </View>
                <Text numberOfLines={2} style={styles.bannerTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={styles.bannerSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
              <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />

        {/* Quick Category Icons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('SearchResults', {
                  categoryId: cat.id,
                  categoryName: cat.name,
                })
              }
              style={styles.categoryItem}
            >
              <View style={styles.categoryIconCircle}>
                <Image
                  source={{ uri: cat.imageUrl || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=150' }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>
              <Text numberOfLines={2} style={styles.categoryName}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Flash Deals Section */}
        <View style={styles.flashDealsContainer}>
          <View style={styles.flashHeaderRow}>
            <View style={styles.flashTitleRow}>
              <View style={styles.flashIconBox}>
                <Zap size={16} color="#DC2626" fill="#DC2626" />
              </View>
              <Text style={styles.flashTitle}>Flash Deals</Text>
              <View style={styles.timerBadge}>
                <Clock size={12} color="#DC2626" />
                <Text style={styles.timerText}>Ends in 02:45:12</Text>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalProductsList}
          >
            {flashDeals.map((prod) => (
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
                style={{ width: 160, marginRight: Spacing.md }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Stores Near You */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <Sparkles size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Top Stores Near You</Text>
          </View>
        </View>

        <View style={styles.storesList}>
          {topStores.slice(0, 2).map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={() =>
                navigation.navigate('StoreDetails', {
                  storeId: store.id,
                  storeName: store.businessName,
                })
              }
            />
          ))}
        </View>

        {/* Recommended For You Section (Personalized) */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <Sparkles size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProductsList}
        >
          {trendingProducts.slice(0, 4).map((prod) => (
            <ProductCard
              key={`rec-${prod.id}`}
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
              style={{ width: 160, marginRight: Spacing.md }}
            />
          ))}
        </ScrollView>

        {/* Trending & Best Sellers Products Grid */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <TrendingUp size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Trending Right Now</Text>
          </View>
        </View>

        <View style={styles.productsGrid}>
          {trendingProducts.map((prod) => (
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

        {/* Recently Viewed Shelf (Prompt 12) */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <Clock size={18} color={Colors.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProductsList}
        >
          {trendingProducts.slice(2, 6).map((prod) => (
            <ProductCard
              key={`recent-${prod.id}`}
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
              style={{ width: 160, marginRight: Spacing.md }}
            />
          ))}
        </ScrollView>

        {/* 1-Tap Reorder Previous Essentials (Prompt 12) */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <ShoppingBag size={18} color={Colors.accentOrange} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Quick Reorder</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProductsList}
        >
          {flashDeals.slice(0, 3).map((prod) => (
            <ProductCard
              key={`reorder-${prod.id}`}
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
              style={{ width: 160, marginRight: Spacing.md }}
            />
          ))}
        </ScrollView>

        {/* Bottom padding for floating mini-cart */}
        <View style={{ height: totalCount > 0 ? 100 : 40 }} />
      </ScrollView>

      {/* Floating Mini Cart Pill */}
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
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    ...Shadows.small,
  },
  searchBarPlaceholder: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  deliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  deliveryPillText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 3,
  },
  bannersList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bannerCard: {
    width: width - Spacing.md * 2,
    height: 140,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  bannerInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  bannerTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  bannerTitle: {
    ...Typography.titleMedium,
    color: Colors.textInverse,
    fontWeight: '800',
    lineHeight: 22,
  },
  bannerSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoriesRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  categoryItem: {
    alignItems: 'center',
    width: 74,
    marginRight: Spacing.sm,
  },
  categoryIconCircle: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.small,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  flashDealsContainer: {
    backgroundColor: '#FFF1F2',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  flashHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  flashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashIconBox: {
    backgroundColor: '#FEE2E2',
    padding: 4,
    borderRadius: BorderRadius.xs,
    marginRight: 6,
  },
  flashTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: '#991B1B',
    marginRight: Spacing.sm,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  timerText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
    marginLeft: 4,
  },
  horizontalProductsList: {
    paddingVertical: Spacing.xs,
  },
  storesList: {
    paddingHorizontal: Spacing.md,
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
    bottom: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
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
