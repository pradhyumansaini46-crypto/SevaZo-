import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { FiltersModal, FilterState } from './FiltersModal';
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, List, Search } from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

const { width } = Dimensions.get('window');

export const SearchResultsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialQuery = route.params?.query || '';
  const initialCategoryId = route.params?.categoryId;
  const initialCategoryName = route.params?.categoryName;

  const { addItem, incrementItem, decrementItem, getItemQuantity, getTotalCount, getCalculation } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'popular',
  });

  useEffect(() => {
    fetchResults();
  }, [initialQuery, initialCategoryId, filters]);

  const fetchResults = async () => {
    setLoading(true);
    const data = await customerApi.getProducts({
      query: initialQuery,
      categoryId: initialCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      inStockOnly: filters.inStockOnly,
      sortBy: filters.sortBy,
    });
    setProducts(data);
    setLoading(false);
  };

  const title = initialCategoryName || (initialQuery ? `"${initialQuery}"` : 'All Products');
  const activeFiltersCount =
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.sortBy && filters.sortBy !== 'popular' ? 1 : 0);

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title={title}
        subtitle={`${products.length} items found`}
        showSearch
        onPressSearch={() => navigation.navigate('Search')}
      />

      {/* Filter & View Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFiltersModalVisible(true)}
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
        >
          <SlidersHorizontal
            size={16}
            color={activeFiltersCount > 0 ? Colors.textInverse : Colors.textPrimary}
          />
          <Text
            style={[
              styles.filterBtnText,
              activeFiltersCount > 0 && styles.filterBtnTextActive,
            ]}
          >
            Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.filterRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsGridView(!isGridView)}
            style={styles.viewToggleBtn}
          >
            {isGridView ? (
              <List size={18} color={Colors.textPrimary} />
            ) : (
              <LayoutGrid size={18} color={Colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching freshest products...</Text>
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Search size={36} color={Colors.primary} />}
          title="No Products Found"
          description="We couldn't find items matching your search or filters. Try adjusting your filters."
          actionTitle="Reset Filters"
          onAction={() => {
            setFilters({ sortBy: 'popular' });
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
        >
          {isGridView ? (
            <View style={styles.gridContainer}>
              {products.map((prod) => (
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
                  style={styles.gridCard}
                />
              ))}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  horizontal
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
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <FiltersModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ sortBy: 'popular' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  filterBtnTextActive: {
    color: Colors.textInverse,
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleBtn: {
    padding: Spacing.xs + 2,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  resultsContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
  },
  listContainer: {
    flexDirection: 'column',
  },
});
