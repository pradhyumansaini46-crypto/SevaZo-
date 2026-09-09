import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Heart, ShoppingBag, Trash2, TrendingDown, Zap, Sparkles } from 'lucide-react-native';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

type WishlistFilter = 'ALL' | 'PRICE_DROPS' | 'RESTOCKED';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { items: wishlistItems, toggleWishlist, clearWishlist } = useWishlistStore();
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCartStore();

  const [filter, setFilter] = useState<WishlistFilter>('ALL');

  const priceDroppedItems = wishlistItems.filter(
    (item) =>
      (item.priceDrop && item.priceDrop > 0) ||
      (item.compareAtPrice && item.compareAtPrice > item.price)
  );
  const restockedItems = wishlistItems.filter((item) => item.backInStock);

  const displayedItems = wishlistItems.filter((item) => {
    if (filter === 'PRICE_DROPS') {
      return (
        (item.priceDrop && item.priceDrop > 0) ||
        (item.compareAtPrice && item.compareAtPrice > item.price)
      );
    }
    if (filter === 'RESTOCKED') {
      return !!item.backInStock;
    }
    return true;
  });

  const handleAddAllToCart = () => {
    triggerHaptic('success');
    displayedItems.forEach((product) => {
      addItem(product);
    });
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="My Wishlist"
        subtitle={`${wishlistItems.length} saved products`}
        rightAction={
          wishlistItems.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('warning');
                clearWishlist();
              }}
              style={styles.clearBtn}
            >
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          ) : null
        }
      />

      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={<Heart size={36} color={Colors.heartRed} />}
          title="Your Wishlist is Empty"
          description="Save fresh fruits, dairy, snacks, and electronics to track price drops and restock alerts."
          actionTitle="Explore Catalog"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* 1. Intelligent Price Drop Notification Banner */}
          {priceDroppedItems.length > 0 ? (
            <View style={styles.priceDropAlertCard}>
              <View style={styles.priceDropAlertLeft}>
                <View style={styles.priceDropIconCircle}>
                  <TrendingDown size={18} color="#16A34A" />
                </View>
                <View style={styles.priceDropAlertTextCol}>
                  <Text style={styles.priceDropAlertTitle}>
                    {priceDroppedItems.length}{' '}
                    {priceDroppedItems.length === 1 ? 'item is' : 'items are'} cheaper today!
                  </Text>
                  <Text style={styles.priceDropAlertSubtitle}>
                    Exclusive price drop on saved items. Order now before prices change.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* 2. Intelligence Filter Tabs */}
          <View style={styles.filterChipsRow}>
            {[
              { id: 'ALL' as WishlistFilter, label: `All (${wishlistItems.length})` },
              {
                id: 'PRICE_DROPS' as WishlistFilter,
                label: `Price Drops (${priceDroppedItems.length}) 📉`,
              },
              {
                id: 'RESTOCKED' as WishlistFilter,
                label: `Back in Stock (${restockedItems.length}) ⚡`,
              },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic('selection');
                  setFilter(chip.id);
                }}
                style={[
                  styles.filterChip,
                  filter === chip.id && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === chip.id && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Top Actions Bar */}
          <View style={styles.topActionsBar}>
            <Text style={styles.itemsCountText}>
              Showing {displayedItems.length} {displayedItems.length === 1 ? 'item' : 'items'}
            </Text>
            <Button
              title="Add All to Cart"
              onPress={handleAddAllToCart}
              variant="outline"
              size="sm"
              icon={<ShoppingBag size={14} color={Colors.primary} />}
            />
          </View>

          {/* 4. Products Grid */}
          <View style={styles.grid}>
            {displayedItems.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                quantityInCart={getItemQuantity(prod.id)}
                isWishlisted={true}
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
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  priceDropAlertCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  priceDropAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceDropIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  priceDropAlertTextCol: {
    flex: 1,
  },
  priceDropAlertTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: '#15803D',
  },
  priceDropAlertSubtitle: {
    ...Typography.caption,
    color: '#166534',
    marginTop: 2,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
  topActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  itemsCountText: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
  },
});
