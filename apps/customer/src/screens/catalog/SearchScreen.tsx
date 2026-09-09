import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  Search,
  ArrowLeft,
  X,
  Clock,
  Flame,
  Sparkles,
  Mic,
  Store as StoreIcon,
  Tag,
  Grid,
  ChevronRight,
  Plus,
  Minus,
  Zap,
  ShoppingBag,
  Star,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Product, Store, Category } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { ProductCard } from '../../components/ProductCard';
import { VoiceSearchModal } from '../../components/dashboard/VoiceSearchModal';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

const SEARCH_PLACEHOLDERS = [
  'Search groceries...',
  'Search medicines...',
  'Search your favorite store...',
  'Search electronics...',
  'What are you looking for?',
];

const TRENDING_SEARCHES = [
  'Hydroponic Spinach',
  'Amul Milk',
  'Greek Yogurt',
  'Country Sourdough Bread',
  'Kashmiri Apples',
  'Doritos Nachos',
  'Raw Pressery Juice',
  'Neem Face Wash',
];

type SearchTab = 'ALL' | 'PRODUCTS' | 'STORES' | 'BRANDS' | 'CATEGORIES';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('ALL');
  const [recentSearches, setRecentSearches] = useState([
    'Fresh Palak',
    'Amul Milk 1L',
    'Organic Bananas',
  ]);
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    stores: Store[];
    categories: Category[];
  }>({
    products: [],
    stores: [],
    categories: [],
  });

  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  // Dynamic rotating placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Multi-entity live search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ products: [], stores: [], categories: [] });
      return;
    }
    const timer = setTimeout(() => {
      executeLiveSearch(query.trim());
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  const executeLiveSearch = async (text: string) => {
    try {
      const res = await customerApi.search(text);
      setSearchResults(res);
    } catch (e) {
      console.warn('Search failed:', e);
    }
  };

  const handleSearchSubmit = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (!recentSearches.includes(trimmed)) {
      setRecentSearches([trimmed, ...recentSearches.slice(0, 4)]);
    }

    navigation.navigate('SearchResults', { query: trimmed });
  };

  const handleClearHistory = () => {
    triggerHaptic('light');
    setRecentSearches([]);
  };

  // Derive matching brands from products or tags
  const matchedBrands = Array.from(
    new Set(
      searchResults.products
        .map((p) => p.brandName || (p.tags && p.tags[0]))
        .filter(Boolean) as string[]
    )
  ).slice(0, 8);

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.stores.length > 0 ||
    searchResults.categories.length > 0 ||
    matchedBrands.length > 0;

  const showAll = activeTab === 'ALL';
  const showProducts = showAll || activeTab === 'PRODUCTS';
  const showStores = showAll || activeTab === 'STORES';
  const showBrands = showAll || activeTab === 'BRANDS';
  const showCategories = showAll || activeTab === 'CATEGORIES';

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchBarRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            triggerHaptic('light');
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={19} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Search size={18} color={Colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearchSubmit(query)}
            autoFocus
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                setQuery('');
              }}
              style={styles.clearBtn}
            >
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('medium');
              setIsVoiceModalOpen(true);
            }}
            style={styles.micBtn}
          >
            <Mic size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* When Query is Typed: One Search Segments Bar */}
      {query.trim().length > 0 ? (
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {[
              { id: 'ALL' as SearchTab, label: 'All Results' },
              { id: 'PRODUCTS' as SearchTab, label: `Products (${searchResults.products.length})` },
              { id: 'STORES' as SearchTab, label: `Stores (${searchResults.stores.length})` },
              { id: 'BRANDS' as SearchTab, label: `Brands (${matchedBrands.length})` },
              { id: 'CATEGORIES' as SearchTab, label: `Categories (${searchResults.categories.length})` },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveTab(tab.id);
                }}
                style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, activeTab === tab.id && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* State A: Zero Query State (Recent, Trending, Fast Categories) */}
        {!query.trim() ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Clock size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsRow}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      onPress={() => {
                        triggerHaptic('light');
                        setQuery(item);
                      }}
                      style={styles.recentChip}
                    >
                      <Text style={styles.recentChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Trending Searches */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Flame size={18} color="#EA580C" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Trending in Your Neighborhood</Text>
              </View>

              <View style={styles.trendingList}>
                {TRENDING_SEARCHES.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic('light');
                      setQuery(item);
                    }}
                    style={styles.trendingItem}
                  >
                    <View style={styles.trendingLeft}>
                      <View style={styles.trendingRank}>
                        <Text style={styles.rankText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.trendingText}>{item}</Text>
                    </View>
                    <Sparkles size={14} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* State B: "One Search" Multi-Entity Results */
          <View style={styles.resultsWrapper}>
            {!hasResults ? (
              <View style={styles.emptyResultsBox}>
                <Text style={styles.emptyResultsEmoji}>🔍</Text>
                <Text style={styles.emptyResultsTitle}>No results found for "{query}"</Text>
                <Text style={styles.emptyResultsSubtitle}>
                  Try searching for milk, bread, apple, vegetables, or fresh stores.
                </Text>
              </View>
            ) : null}

            {/* 1. Products Section */}
            {showProducts && searchResults.products.length > 0 ? (
              <View style={styles.entitySection}>
                <View style={styles.entityHeaderRow}>
                  <View style={styles.entityTitleRow}>
                    <Text style={styles.entityEmoji}>🍎</Text>
                    <Text style={styles.entityTitle}>Products</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{searchResults.products.length}</Text>
                    </View>
                  </View>
                  {showAll && searchResults.products.length > 3 ? (
                    <TouchableOpacity onPress={() => setActiveTab('PRODUCTS')}>
                      <Text style={styles.seeAllEntity}>See all</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.productsGrid}>
                  {(showAll ? searchResults.products.slice(0, 4) : searchResults.products).map((prod) => (
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
                      style={styles.productGridItem}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* 2. Stores Section */}
            {showStores && searchResults.stores.length > 0 ? (
              <View style={styles.entitySection}>
                <View style={styles.entityHeaderRow}>
                  <View style={styles.entityTitleRow}>
                    <Text style={styles.entityEmoji}>🏪</Text>
                    <Text style={styles.entityTitle}>Stores</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{searchResults.stores.length}</Text>
                    </View>
                  </View>
                  {showAll && searchResults.stores.length > 2 ? (
                    <TouchableOpacity onPress={() => setActiveTab('STORES')}>
                      <Text style={styles.seeAllEntity}>See all</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.storesStack}>
                  {(showAll ? searchResults.stores.slice(0, 3) : searchResults.stores).map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      activeOpacity={0.88}
                      onPress={() =>
                        navigation.navigate('StoreDetails', {
                          storeId: store.id,
                          storeName: store.businessName,
                        })
                      }
                      style={styles.storeCardItem}
                    >
                      <Image source={{ uri: store.avatar }} style={styles.storeAvatar} />
                      <View style={styles.storeInfoCol}>
                        <Text numberOfLines={1} style={styles.storeNameText}>
                          {store.businessName}
                        </Text>
                        <Text numberOfLines={1} style={styles.storeTagsText}>
                          {store.tags?.join(' • ') || 'Verified Local Merchant'}
                        </Text>
                        <View style={styles.storeMetaRow}>
                          <View style={styles.storeRatingBadge}>
                            <Star size={10} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.storeRatingText}>{store.rating.toFixed(1)}</Text>
                          </View>
                          <Text style={styles.storeMetaDot}>•</Text>
                          <Text style={styles.storeMetaText}>{store.deliveryTime || '15 min'}</Text>
                          <Text style={styles.storeMetaDot}>•</Text>
                          <Text style={styles.storeMetaText}>{store.distanceKm} km</Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 3. Brands Section */}
            {showBrands && matchedBrands.length > 0 ? (
              <View style={styles.entitySection}>
                <View style={styles.entityHeaderRow}>
                  <View style={styles.entityTitleRow}>
                    <Text style={styles.entityEmoji}>🏷️</Text>
                    <Text style={styles.entityTitle}>Brands</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{matchedBrands.length}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.brandsRow}>
                  {matchedBrands.map((brand, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.78}
                      onPress={() => {
                        triggerHaptic('light');
                        setQuery(brand);
                      }}
                      style={styles.brandPill}
                    >
                      <Tag size={13} color={Colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.brandPillText}>{brand}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 4. Categories Section */}
            {showCategories && searchResults.categories.length > 0 ? (
              <View style={styles.entitySection}>
                <View style={styles.entityHeaderRow}>
                  <View style={styles.entityTitleRow}>
                    <Text style={styles.entityEmoji}>🥦</Text>
                    <Text style={styles.entityTitle}>Categories</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{searchResults.categories.length}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.categoriesRow}>
                  {searchResults.categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.78}
                      onPress={() =>
                        navigation.navigate('SearchResults', {
                          categoryId: cat.id,
                          categoryName: cat.name,
                        })
                      }
                      style={styles.categoryPill}
                    >
                      <Text style={styles.catEmojiText}>{cat.icon || '🛍️'}</Text>
                      <Text style={styles.catPillText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Voice Assistant Modal */}
      <VoiceSearchModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigateSearch={(recognizedQuery) => {
          setIsVoiceModalOpen(false);
          setQuery(recognizedQuery);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingTop: Spacing.xl + 8,
    paddingBottom: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...Shadows.small,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: Spacing.xs,
    marginRight: 4,
  },
  micBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#ECFDF5',
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: Spacing.xs + 2,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  clearAllText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  recentChipText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  trendingList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingRank: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  trendingText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultsWrapper: {},
  emptyResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyResultsEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyResultsTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyResultsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  entitySection: {
    marginBottom: Spacing.xl,
  },
  entityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  entityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entityEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  entityTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginLeft: 6,
  },
  countBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  seeAllEntity: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productGridItem: {
    width: (width - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
  },
  storesStack: {
    gap: Spacing.sm,
  },
  storeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  storeAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  storeInfoCol: {
    flex: 1,
  },
  storeNameText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  storeTagsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storeRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  storeRatingText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 2,
  },
  storeMetaDot: {
    fontSize: 9,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  storeMetaText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  brandsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  brandPillText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  catEmojiText: {
    fontSize: 14,
    marginRight: 6,
  },
  catPillText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
