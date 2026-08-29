import React from 'react';
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
import { Heart, ShoppingBag, Trash2 } from 'lucide-react-native';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';

const { width } = Dimensions.get('window');

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { items: wishlistItems, toggleWishlist, clearWishlist } = useWishlistStore();
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCartStore();

  const handleAddAllToCart = () => {
    wishlistItems.forEach((product) => {
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
            <TouchableOpacity onPress={clearWishlist} style={styles.clearBtn}>
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          ) : null
        }
      />

      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={<Heart size={36} color={Colors.heartRed} />}
          title="Your Wishlist is Empty"
          description="Save fresh fruits, dairy, snacks, and bakery essentials to buy them later with one tap."
          actionTitle="Explore Catalog"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.topActionsBar}>
            <Text style={styles.itemsCountText}>
              {wishlistItems.length} Items
            </Text>
            <Button
              title="Add All to Cart"
              onPress={handleAddAllToCart}
              variant="outline"
              size="sm"
              icon={<ShoppingBag size={14} color={Colors.primary} />}
            />
          </View>

          <View style={styles.grid}>
            {wishlistItems.map((prod) => (
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
