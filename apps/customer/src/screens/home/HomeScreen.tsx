import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ProductCard } from '../../components/ProductCard';
import { StoreCard } from '../../components/StoreCard';
import { BlinkitHeader } from '../../components/dashboard/BlinkitHeader';
import { QuadCategoryCard } from '../../components/dashboard/QuadCategoryCard';
import { ZeroFeeSpecificationBanner } from '../../components/dashboard/ZeroFeeSpecificationBanner';
import { BlinkitQuadColumnCard, QuadColumnItem } from '../../components/dashboard/BlinkitQuadColumnCard';
import { BlinkitGroupedCategoryGrid } from '../../components/dashboard/BlinkitGroupedCategoryGrid';
import { DeliveryContextCard } from '../../components/dashboard/DeliveryContextCard';
import { ActiveOrderWidget } from '../../components/dashboard/ActiveOrderWidget';
import { ActiveOrderCard } from '../../components/dashboard/ActiveOrderCard';
import { CategoryRail } from '../../components/dashboard/CategoryRail';
import { HeroSection } from '../../components/dashboard/HeroSection';
import { VerticalCategoryBar } from '../../components/dashboard/VerticalCategoryBar';
import { LocationSelectModal } from '../../components/dashboard/LocationSelectModal';
import { VoiceSearchModal } from '../../components/dashboard/VoiceSearchModal';
import { SmartBasketCard } from '../../components/dashboard/SmartBasketCard';
import {
  Search,
  Mic,
  Zap,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag,
  ChevronRight,
  ChevronLeft,
  Store as StoreIcon,
  Flame,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useLocationStore } from '../../stores/locationStore';
import { useOrderStore } from '../../stores/orderStore';
import { customerApi } from '../../services/customerApi';
import {
  Product,
  Store,
  Category,
  Order,
  DashboardSectionConfig,
  DashboardSectionId,
  DeliveryContextData,
  SevazoPulseData,
} from '../../types';
import {
  mockDashboardSections,
  mockSevazoPulse,
  mockCategories,
  mockBanners,
  mockBuyAgainProducts,
  mockAvailableNowProducts,
  mockStores,
  mockTrendingProducts,
  mockDealProducts,
  mockRecommendedProducts,
  mockRecentlyViewedProducts,
  mockDeliveryContext,
  mockBestsellerQuadCategories,
} from '../../services/mockData';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

const SEARCH_PLACEHOLDERS = [
  'Search "gift bag"',
  'Search "fresh vegetables & fruits"',
  'Search "dairy, bread & eggs"',
  'Search "chips & namkeen"',
  'Search "cold drinks & juices"',
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentAddress } = useLocationStore();
  const { activeOrder: storeActiveOrder, orders } = useOrderStore();
  const {
    addItem,
    incrementItem,
    decrementItem,
    getItemQuantity,
    getCalculation,
    getTotalCount,
  } = useCartStore();
  const { isInWishlist, toggleWishlist, items: wishlistItems } = useWishlistStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sections, setSections] = useState<DashboardSectionConfig[]>(mockDashboardSections);
  const [deliveryContext, setDeliveryContext] = useState<DeliveryContextData>(mockDeliveryContext);
  const [pulseData, setPulseData] = useState<SevazoPulseData | undefined>(mockSevazoPulse);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Computed live active order (only active when created by user)
  const liveActiveOrder =
    storeActiveOrder ||
    activeOrder ||
    orders.find((o) =>
      ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT'].includes(o.status)
    ) ||
    null;
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [heroBanners, setHeroBanners] = useState<any[]>(mockBanners);
  const [buyAgainProducts, setBuyAgainProducts] = useState<Product[]>(mockBuyAgainProducts);
  const [availableNowProducts, setAvailableNowProducts] = useState<Product[]>(mockAvailableNowProducts);
  const [topStores, setTopStores] = useState<Store[]>(mockStores);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>(mockTrendingProducts);
  const [dealProducts, setDealProducts] = useState<Product[]>(mockDealProducts);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>(mockRecommendedProducts);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>(mockRecentlyViewedProducts);

  // Interactive enhancements
  const mainScrollViewRef = React.useRef<ScrollView>(null);
  const bestsellersScrollRef = React.useRef<ScrollView>(null);
  const [bestsellerScrollOffset, setBestsellerScrollOffset] = useState(0);
  const [maxBestsellerScroll, setMaxBestsellerScroll] = useState(1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'ALL' | '15MIN' | '30MIN'>('ALL');
  const [dealsFilter, setDealsFilter] = useState<'ALL' | 'OFF100' | 'B1G1' | 'UNDER199'>('ALL');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await customerApi.getHomeFeed();
      setSections(data.sections || []);
      setDeliveryContext(data.deliveryContext);
      setPulseData(data.pulse);
      setActiveOrder(data.activeOrder || null);
      setCategories(data.categories || []);
      setHeroBanners(data.heroBanners || []);
      setBuyAgainProducts(data.buyAgainProducts || []);
      setAvailableNowProducts(data.availableNowProducts || []);
      setTopStores(data.topStores || []);
      setTrendingProducts(data.trendingProducts || []);
      setDealProducts(data.dealProducts || []);
      setRecommendedProducts(data.recommendedProducts || []);
      setRecentlyViewedProducts(data.recentlyViewedProducts || []);
    } catch (e) {
      console.warn('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    triggerHaptic('light');
    loadDashboardData();
  }, []);

  const handleSelectCategory = (category: Category) => {
    if (selectedCategoryId === category.id) {
      // Toggle off
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(category.id);
      // Navigate to filtered results if tapped twice or user wants full catalog
      navigation.navigate('SearchResults', {
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  };

  // Helper: Backend-driven section relevance check
  const isSectionVisible = (sectionId: DashboardSectionId): boolean => {
    const config = sections.find((s) => s.id === sectionId);
    if (!config || !config.enabled) return false;

    const hasActiveOrder =
      !!liveActiveOrder &&
      ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT'].includes(
        liveActiveOrder.status
      );

    // Intelligent customer persona relevance
    if (sectionId === 'active_order') {
      return hasActiveOrder;
    }
    if (sectionId === 'hero_banner') {
      // Per Section 18: When active order exists, it replaces promotional hero banners
      return !hasActiveOrder && heroBanners.length > 0;
    }
    if (sectionId === 'buy_again') {
      return buyAgainProducts.length > 0;
    }
    if (sectionId === 'recently_viewed') {
      return recentlyViewedProducts.length > 0;
    }
    return true;
  };

  const totalCartCount = getTotalCount();
  const calculation = getCalculation();

  // Filtered products if a category is selected
  const displayedAvailable = selectedCategoryId
    ? availableNowProducts.filter((p) => p.categoryId === selectedCategoryId)
    : availableNowProducts;

  const filteredAvailable = displayedAvailable.filter((prod) => {
    const eta = prod.deliveryEtaMinutes || 14;
    if (timeFilter === '15MIN') return eta <= 15;
    if (timeFilter === '30MIN') return eta <= 30;
    return true;
  });

  const filteredDeals = dealProducts.filter((prod) => {
    if (dealsFilter === 'OFF100') {
      const discount = prod.compareAtPrice ? prod.compareAtPrice - prod.price : 0;
      return discount >= 100 || (prod.discountBadge && prod.discountBadge.includes('100'));
    }
    if (dealsFilter === 'B1G1') {
      return (
        (prod.discountBadge && prod.discountBadge.toLowerCase().includes('b1g1')) ||
        prod.name.toLowerCase().includes('b1g1') ||
        prod.name.toLowerCase().includes('buy 1') ||
        (prod.tags && prod.tags.includes('B1G1'))
      );
    }
    if (dealsFilter === 'UNDER199') {
      return prod.price <= 199;
    }
    return true;
  });

  const displayAddressLabel = currentAddress.line1
    ? `${currentAddress.label || 'Home'} • ${currentAddress.city || 'Jaipur'}`
    : 'Home • Jaipur';

  // 4 Columns in One Row Data (exact matching the user's provided Blinkit UI specification)
  const dealsColumnItems: QuadColumnItem[] = [
    {
      id: 'deal-1',
      name: 'Fortune Sunlite Refined Oil',
      unit: '1 Litre',
      price: 125,
      compareAtPrice: 165,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=250',
      rawProduct: dealProducts[0] || mockDealProducts[0],
    },
    {
      id: 'deal-2',
      name: 'Cadbury Dairy Milk Silk',
      unit: '60 g',
      price: 85,
      compareAtPrice: 110,
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=250',
      rawProduct: dealProducts[1] || mockDealProducts[1],
    },
    {
      id: 'deal-3',
      name: 'Tata Tea Premium Gold',
      unit: '500 g',
      price: 210,
      compareAtPrice: 280,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=250',
      rawProduct: dealProducts[2] || mockDealProducts[2],
    },
    {
      id: 'deal-4',
      name: 'Aashirvaad Sharbati Atta',
      unit: '5 kg',
      price: 245,
      compareAtPrice: 310,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250',
      rawProduct: dealProducts[3] || mockDealProducts[3],
    },
  ];

  const storesNearYouColumnItems: QuadColumnItem[] = [
    {
      id: 'sn-1',
      name: "Lady's Finger (Bhindi)",
      unit: '250 g',
      price: 18,
      compareAtPrice: 25,
      image: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=250',
      rawProduct: availableNowProducts[0] || mockAvailableNowProducts[0],
    },
    {
      id: 'sn-2',
      name: 'Desi Country Tomatoes',
      unit: '500 g',
      price: 19,
      compareAtPrice: 25,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=250',
      rawProduct: availableNowProducts[1] || mockAvailableNowProducts[1],
    },
    {
      id: 'sn-3',
      name: 'Too Yumm! Chilli Stix',
      unit: '70 g',
      price: 19,
      compareAtPrice: 20,
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=250',
      rawProduct: availableNowProducts[2] || mockAvailableNowProducts[2],
    },
    {
      id: 'sn-4',
      name: 'Fresh Farm Jyoti Potatoes',
      unit: '1 kg',
      price: 24,
      compareAtPrice: 32,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=250',
      rawProduct: availableNowProducts[3] || mockAvailableNowProducts[3],
    },
  ];

  const mostlyPickedColumnItems: QuadColumnItem[] = [
    {
      id: 'mp-1',
      name: 'Supreme Harvest Crystal Sugar',
      unit: '1 kg',
      price: 71,
      compareAtPrice: 80,
      image: 'https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=250',
      rawProduct: buyAgainProducts[0] || mockBuyAgainProducts[0],
    },
    {
      id: 'mp-2',
      name: 'Kurkure Namkeen Masala Munch',
      unit: '81.9 g',
      price: 19,
      compareAtPrice: 20,
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=250',
      rawProduct: buyAgainProducts[1] || mockBuyAgainProducts[1],
    },
    {
      id: 'mp-3',
      name: 'MAGGI 2-Minute Double Masala',
      unit: '95 g',
      price: 19,
      compareAtPrice: 20,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=250',
      rawProduct: buyAgainProducts[2] || mockBuyAgainProducts[2],
    },
    {
      id: 'mp-4',
      name: 'Sambar Small Onion (Pyaaz)',
      unit: '250 g',
      price: 14,
      compareAtPrice: 20,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=250',
      rawProduct: buyAgainProducts[3] || mockBuyAgainProducts[3],
    },
  ];

  const preferenceColumnItems: QuadColumnItem[] = [
    {
      id: 'pref-1',
      name: 'Organic India Tulsi Green Tea',
      unit: '25 Bags',
      price: 175,
      compareAtPrice: 220,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=250',
      rawProduct: recommendedProducts[0] || mockRecommendedProducts[0],
    },
    {
      id: 'pref-2',
      name: 'Raw Forest Wild Honey',
      unit: '250 g',
      price: 195,
      compareAtPrice: 240,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=250',
      rawProduct: recommendedProducts[1] || mockRecommendedProducts[1],
    },
    {
      id: 'pref-3',
      name: 'Epigamia Greek Natural Yogurt',
      unit: '100 g',
      price: 45,
      compareAtPrice: 50,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=250',
      rawProduct: recommendedProducts[2] || mockRecommendedProducts[2],
    },
    {
      id: 'pref-4',
      name: 'Coca-Cola Zero Sugar Can',
      unit: '300 ml',
      price: 40,
      compareAtPrice: 45,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=250',
      rawProduct: recommendedProducts[3] || mockRecommendedProducts[3],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={mainScrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* 1. TOP HEADER: "Sevazo in 8 minutes" + Store Distance + Modern Cart Button + Profile */}
        <BlinkitHeader
          etaMinutes={8}
          distanceKm={1}
          locationLabel={currentAddress.label?.toUpperCase() || 'HOME'}
          locationAddress={currentAddress.line1 || 'Kalpatru splendor, 1204'}
          onPressLocation={() => {
            triggerHaptic('selection');
            setIsLocationModalOpen(true);
          }}
          onPressCart={() => {
            triggerHaptic('medium');
            navigation.navigate('Cart');
          }}
          onPressNotification={() => {
            triggerHaptic('light');
            navigation.navigate('Notifications');
          }}
        />

        {/* 2. PILL SEARCH BAR: "Search 'gift bag'" with voice mic */}
        <View style={styles.searchBarWrapper}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              triggerHaptic('light');
              navigation.navigate('Search');
            }}
            style={styles.searchBarTrigger}
          >
            <Search size={18} color="#64748B" style={styles.searchIcon} />
            <Text style={styles.searchBarPlaceholder} numberOfLines={1}>
              {SEARCH_PLACEHOLDERS[placeholderIndex]}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('medium');
                setIsVoiceModalOpen(true);
              }}
              style={styles.micButton}
            >
              <Mic size={18} color="#0F172A" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 4. ACTIVE ORDER: Only shown when the user has actually placed/created an order */}
        {isSectionVisible('active_order') && liveActiveOrder ? (
          <ActiveOrderCard
            order={liveActiveOrder}
            onPressTrack={(orderId) => navigation.navigate('LiveTracking', { orderId })}
          />
        ) : null}

        {/* 5. KEY SPECIFICATIONS BANNER: Zero handling fee, Zero delivery fee, Zero platform/surge fee */}
        <ZeroFeeSpecificationBanner
          onPress={() => navigation.navigate('SearchResults', { query: 'zero fee' })}
        />

        {/* 6. FOUR COLUMNS IN ONE ROW (Blinkit Multi-Item Column Cards) */}
        <View style={styles.quadColumnsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quadColumnsScrollContent}
          >
            {/* Column 1: Grab the deals */}
            <BlinkitQuadColumnCard
              title={'Grab the deals'}
              subtitle={'⚡ Flat up to 60% OFF • Top picks'}
              tagline={'⚡ 10 MINS'}
              seeAllText={'See all deals >>'}
              theme={{
                cardBg: '#FFF6F0',
                headerTextColor: '#9A2C10',
                footerBg: '#FFE6D8',
                footerTextColor: '#9A2C10',
                borderColor: '#FFD7C7',
                accentLineColor: '#FF5722',
              }}
              headerBadge={{
                text: '⚡ CRAZY DEALS',
                bg: '#FF461E',
                textColor: '#FFFFFF',
              }}
              headerImage={require('../../../assets/images/dashboard/deals_3d.jpg')}
              floatingChip={{
                text: 'UP TO 50%',
                bg: '#FF461E',
                textColor: '#FFFFFF',
              }}
              items={dealsColumnItems}
              onPressSeeAll={() => navigation.navigate('SearchResults', { query: 'deals' })}
              onPressItem={(item) =>
                navigation.navigate('ProductDetails', {
                  productId: item.id,
                  productName: item.name,
                })
              }
              onAddToCart={(item) => addItem(item.rawProduct)}
              onIncrement={(item) => incrementItem(item.id)}
              onDecrement={(item) => decrementItem(item.id)}
              getItemQuantity={getItemQuantity}
            />

            {/* Column 2: Stores near you */}
            <BlinkitQuadColumnCard
              title={'Stores near you'}
              subtitle={'🏪 Local dark stores • Fast delivery'}
              tagline={'📍 1.2 KM'}
              seeAllText={'See all stores >>'}
              theme={{
                cardBg: '#F7F1FF',
                headerTextColor: '#581C87',
                footerBg: '#EBD9FF',
                footerTextColor: '#581C87',
                borderColor: '#E2D1F9',
                accentLineColor: '#8B5CF6',
              }}
              headerBadge={{
                text: '🏪 ₹1 STORE',
                bg: '#6B21A8',
                textColor: '#FDE047',
              }}
              headerImage={require('../../../assets/images/dashboard/stores_3d.jpg')}
              floatingChip={{
                text: '₹1 DEAL',
                bg: '#7C3AED',
                textColor: '#FDE047',
              }}
              items={storesNearYouColumnItems}
              onPressSeeAll={() => navigation.navigate('SearchResults', { query: 'stores' })}
              onPressItem={(item) =>
                navigation.navigate('ProductDetails', {
                  productId: item.id,
                  productName: item.name,
                })
              }
              onAddToCart={(item) => addItem(item.rawProduct)}
              onIncrement={(item) => incrementItem(item.id)}
              onDecrement={(item) => decrementItem(item.id)}
              getItemQuantity={getItemQuantity}
            />

            {/* Column 3: Mostly picked-up items */}
            <BlinkitQuadColumnCard
              title={'Mostly picked items'}
              subtitle={'🔥 Trending daily kitchen staples'}
              tagline={'★ 4.9 RATED'}
              seeAllText={'See all popular >>'}
              theme={{
                cardBg: '#EEFBF3',
                headerTextColor: '#064E3B',
                footerBg: '#D1F5DD',
                footerTextColor: '#064E3B',
                borderColor: '#BFE5C7',
                accentLineColor: '#10B981',
              }}
              headerBadge={{
                text: '🔥 BESTSELLERS',
                bg: '#059669',
                textColor: '#FFFFFF',
              }}
              headerImage={require('../../../assets/images/dashboard/mostly_picked_3d.jpg')}
              floatingChip={{
                text: 'TOP PICK',
                bg: '#059669',
                textColor: '#FFFFFF',
              }}
              items={mostlyPickedColumnItems}
              onPressSeeAll={() => navigation.navigate('SearchResults', { query: 'popular' })}
              onPressItem={(item) =>
                navigation.navigate('ProductDetails', {
                  productId: item.id,
                  productName: item.name,
                })
              }
              onAddToCart={(item) => addItem(item.rawProduct)}
              onIncrement={(item) => incrementItem(item.id)}
              onDecrement={(item) => decrementItem(item.id)}
              getItemQuantity={getItemQuantity}
            />

            {/* Column 4: Based on your preference */}
            <BlinkitQuadColumnCard
              title={'Based on your preference'}
              subtitle={'✨ Curated smart picks for your cart'}
              tagline={'🎯 FOR YOU'}
              seeAllText={'See all picks >>'}
              theme={{
                cardBg: '#EFF6FF',
                headerTextColor: '#1E40AF',
                footerBg: '#DBEAFE',
                footerTextColor: '#1E40AF',
                borderColor: '#BFDBFE',
                accentLineColor: '#3B82F6',
              }}
              headerBadge={{
                text: '✨ FOR YOU',
                bg: '#2563EB',
                textColor: '#FFFFFF',
              }}
              headerImage={require('../../../assets/images/dashboard/preference_3d.jpg')}
              floatingChip={{
                text: 'CURATED',
                bg: '#2563EB',
                textColor: '#FFFFFF',
              }}
              items={preferenceColumnItems}
              onPressSeeAll={() => navigation.navigate('SearchResults', { query: 'preference' })}
              onPressItem={(item) =>
                navigation.navigate('ProductDetails', {
                  productId: item.id,
                  productName: item.name,
                })
              }
              onAddToCart={(item) => addItem(item.rawProduct)}
              onIncrement={(item) => incrementItem(item.id)}
              onDecrement={(item) => decrementItem(item.id)}
              getItemQuantity={getItemQuantity}
            />
          </ScrollView>
        </View>

        {/* 6. ALL CATEGORIES: Signature Blinkit 4-Column Grouped Grid (Grocery & Kitchen, Snacks & Drinks, etc.) */}
        <BlinkitGroupedCategoryGrid
          onPressSubcategory={(sub, section) => {
            navigation.navigate('SearchResults', {
              query: sub.query || sub.name,
              categoryName: sub.name,
              categoryId: sub.id,
              sectionTitle: section.title,
            });
          }}
          onPressBackToTop={() => {
            mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
        />

        {/* 7. BESTSELLERS: Single Row Slider with 3 Columns visible */}
        <View style={styles.bestsellersSection}>
          <View style={styles.bestsellersHeaderRow}>
            <View style={styles.bestsellersTitleCol}>
              <Text style={styles.bestsellersTitle}>Bestsellers</Text>
              <Text style={styles.bestsellersSubtitle}>Top picks from every category</Text>
            </View>

            {/* Right side slider navigation controls */}
            <View style={styles.bestsellersSliderArrows}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic('light');
                  const colWidth = (width - 32 - 16) / 3 + 8;
                  const targetX = Math.max(0, bestsellerScrollOffset - colWidth * 3);
                  bestsellersScrollRef.current?.scrollTo({ x: targetX, animated: true });
                }}
                disabled={bestsellerScrollOffset <= 5}
                style={[
                  styles.bestsellerArrowBtn,
                  bestsellerScrollOffset <= 5 && styles.bestsellerArrowBtnDisabled,
                ]}
              >
                <ChevronLeft size={16} color={bestsellerScrollOffset <= 5 ? '#CBD5E1' : '#0F172A'} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic('light');
                  const colWidth = (width - 32 - 16) / 3 + 8;
                  const targetX = bestsellerScrollOffset + colWidth * 3;
                  bestsellersScrollRef.current?.scrollTo({ x: targetX, animated: true });
                }}
                disabled={bestsellerScrollOffset >= maxBestsellerScroll - 5}
                style={[
                  styles.bestsellerArrowBtn,
                  bestsellerScrollOffset >= maxBestsellerScroll - 5 && styles.bestsellerArrowBtnDisabled,
                ]}
              >
                <ChevronRight size={16} color={bestsellerScrollOffset >= maxBestsellerScroll - 5 ? '#CBD5E1' : '#0F172A'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Single Row Horizontal Slider */}
          <ScrollView
            ref={bestsellersScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bestsellersSliderContent}
            onScroll={(e) => {
              setBestsellerScrollOffset(e.nativeEvent.contentOffset.x);
            }}
            onContentSizeChange={(contentWidth) => {
              setMaxBestsellerScroll(Math.max(0, contentWidth - width));
            }}
            scrollEventThrottle={16}
          >
            {mockBestsellerQuadCategories.map((cat, index) => (
              <QuadCategoryCard
                key={cat.id}
                category={cat}
                cardWidth={(width - 32 - 16) / 3}
                style={{
                  marginRight: index === mockBestsellerQuadCategories.length - 1 ? 0 : 8,
                }}
                onPress={() =>
                  navigation.navigate('SearchResults', {
                    categoryId: cat.id,
                    categoryName: cat.name,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* 7b. SMART BASKET: Contextual basket completion */}
        <View style={styles.smartBasketWrapper}>
          <SmartBasketCard />
        </View>

        {/* 8. AVAILABLE NEAR YOU: "What can arrive in minutes?" */}
        {isSectionVisible('available_now') && displayedAvailable.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>⚡</Text>
                <View>
                  <Text style={styles.sectionTitle}>Available Near You</Text>
                  <Text style={styles.sectionSubtitle}>Signature fast local delivery</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SearchResults', { query: 'available' })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Time Filter Chips */}
            <View style={styles.timeFilterRow}>
              {[
                { id: 'ALL', label: 'All' },
                { id: '15MIN', label: '< 15 min ⚡' },
                { id: '30MIN', label: '< 30 min' },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  activeOpacity={0.75}
                  onPress={() => {
                    triggerHaptic('selection');
                    setTimeFilter(chip.id as any);
                  }}
                  style={[
                    styles.timeFilterChip,
                    timeFilter === chip.id && styles.timeFilterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeFilterText,
                      timeFilter === chip.id && styles.timeFilterTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalShelf}
            >
              {filteredAvailable.map((prod) => (
                <ProductCard
                  key={`avail-${prod.id}`}
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
        )}



        {/* 10. TRENDING IN YOUR AREA: "What is trending?" */}
        {isSectionVisible('trending') && trendingProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>🔥</Text>
                <View>
                  <Text style={styles.sectionTitle}>Trending in Your Area</Text>
                  <Text style={styles.sectionSubtitle}>Top picks flying off shelves</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SearchResults', { query: 'trending' })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalShelf}
            >
              {trendingProducts.map((prod) => (
                <ProductCard
                  key={`trend-${prod.id}`}
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
        )}



        {/* 13. RECENTLY VIEWED: "What did I save / view?" */}
        {isSectionVisible('recently_viewed') && recentlyViewedProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>🛍️</Text>
                <View>
                  <Text style={styles.sectionTitle}>Recently Viewed</Text>
                  <Text style={styles.sectionSubtitle}>Jump back to items you liked</Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalShelf}
            >
              {recentlyViewedProducts.map((prod) => (
                <ProductCard
                  key={`rv-${prod.id}`}
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
        )}

        {/* Clean bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <LocationSelectModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onAddNewAddress={() => {
          setIsLocationModalOpen(false);
          navigation.navigate('RegisterLocation', { returnTo: 'Main' });
        }}
      />

      <VoiceSearchModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigateSearch={(query) => {
          setIsVoiceModalOpen(false);
          navigation.navigate('SearchResults', { query });
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBarPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },
  micButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestsellersSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  bestsellersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  bestsellersTitleCol: {
    flex: 1,
  },
  bestsellersTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  bestsellersSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  bestsellersSliderArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestsellerArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  bestsellerArrowBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.5,
  },
  bestsellersSliderContent: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  heroSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  heroBannerList: {
    paddingHorizontal: Spacing.md,
  },
  heroCard: {
    width: width - Spacing.md * 2,
    height: 146,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  heroInfoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  heroTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroTagText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    color: Colors.textInverse,
    fontWeight: '900',
    lineHeight: 22,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 4,
    lineHeight: 15,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  heroCtaText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginRight: 4,
  },
  heroImage: {
    width: 95,
    height: 95,
    borderRadius: BorderRadius.lg,
  },
  sectionContainer: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs + 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  addAllText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  smartBasketWrapper: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  timeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeFilterChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  timeFilterText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  timeFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  horizontalShelf: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  storesList: {
    paddingHorizontal: Spacing.md,
  },
  dealsSectionWrapper: {
    marginTop: Spacing.lg,
    backgroundColor: '#FFF1F2',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  dealsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  dealsTitleCol: {},
  tagBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealsTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  dealsSubtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  dealTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  dealTimerText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '900',
    color: '#991B1B',
    marginLeft: 3,
  },
  dealsFilterRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: 8,
  },
  dealsFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  dealsFilterChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  dealsFilterChipText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  dealsFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
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
  fourColSectionContainer: {
    marginTop: 14,
    marginBottom: 6,
  },
  fourColSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  fourColTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  fourColEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  fourColTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  fourColSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
  },
  seeAllButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 2,
  },
  horizontalShelfContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  quadColumnsSection: {
    marginVertical: 12,
  },
  quadColumnsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
});
