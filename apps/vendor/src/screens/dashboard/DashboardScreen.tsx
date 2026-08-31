import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Bell,
  Clock,
  ArrowRight,
  PlusCircle,
  Package,
  Layers,
  Sparkles,
  Utensils,
  Apple,
  Pill,
  Store,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Zap,
  Tag,
  BarChart3,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, BorderRadius, Shadows } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { useStoreConfigStore } from '../../stores/storeConfigStore';
import { useOrderStore } from '../../stores/orderStore';
import { VendorApi } from '../../services/vendorApi';

export type VendorCategory = 'grocery' | 'restaurant' | 'pharmacy' | 'retail';

interface CategoryThemeConfig {
  id: VendorCategory;
  label: string;
  emoji: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  badgeBg: string;
  greetingSub: string;
  illustrationBadge: string;
  salesAmount: string;
  growth: string;
  sparklineColor: string;
  sparklineFill: string;
  sparklinePoints: string;
  sparklineArea: string;
  metrics: {
    ordersCount: number;
    activeCount: number;
    pendingCount: number;
    lowStockCount: number;
  };
  quickActions: Array<{
    id: string;
    label: string;
    icon: any;
    route?: string;
  }>;
  topSectionTitle: string;
  topItems: Array<{
    id: string;
    name: string;
    sales: string;
    orders: string;
    growth: string;
    icon: any;
    color: string;
  }>;
}

const CATEGORY_CONFIGS: Record<VendorCategory, CategoryThemeConfig> = {
  grocery: {
    id: 'grocery',
    label: 'Grocery & Essentials',
    emoji: '🥦',
    primary: '#10B981',      // Emerald 500
    primaryDark: '#059669',  // Emerald 600
    primaryLight: '#ECFDF5', // Emerald 50
    primaryGlow: 'rgba(16, 185, 129, 0.25)',
    badgeBg: '#D1FAE5',
    greetingSub: 'Fresh stock, Happy customers!',
    illustrationBadge: '🥬',
    salesAmount: '₹14,820',
    growth: '+14.5%',
    sparklineColor: '#10B981',
    sparklineFill: '#ECFDF5',
    sparklinePoints: 'M0,35 Q25,10 50,28 T100,12 T150,22 T200,5',
    sparklineArea: 'M0,35 Q25,10 50,28 T100,12 T150,22 T200,5 L200,50 L0,50 Z',
    metrics: {
      ordersCount: 24,
      activeCount: 6,
      pendingCount: 2,
      lowStockCount: 3,
    },
    quickActions: [
      { id: 'add_product', label: 'Add Produce', icon: PlusCircle, route: 'AddProduct' },
      { id: 'manage_stock', label: 'Manage Stock', icon: Package, route: 'Inventory' },
      { id: 'live_orders', label: 'Live Orders', icon: ShoppingBag, route: 'Orders' },
      { id: 'payouts', label: 'Daily Payout', icon: Sparkles, route: 'Revenue' },
    ],
    topSectionTitle: 'Top Categories',
    topItems: [
      { id: '1', name: 'Fresh Vegetables & Greens', sales: '₹5,420', orders: '32 orders', growth: '+18%', icon: Apple, color: '#10B981' },
      { id: '2', name: 'Dairy, Milk & Paneer', sales: '₹4,190', orders: '26 orders', growth: '+12%', icon: Tag, color: '#059669' },
      { id: '3', name: 'Organic Fruits & Berries', sales: '₹3,210', orders: '19 orders', growth: '+9%', icon: Sparkles, color: '#047857' },
    ],
  },
  restaurant: {
    id: 'restaurant',
    label: 'Restaurant & Cafe',
    emoji: '🍕',
    primary: '#F97316',      // Orange 500
    primaryDark: '#EA580C',  // Orange 600
    primaryLight: '#FFF7ED', // Orange 50
    primaryGlow: 'rgba(249, 115, 22, 0.25)',
    badgeBg: '#FFEDD5',
    greetingSub: 'Hot orders, Sizzling kitchens!',
    illustrationBadge: '🍲',
    salesAmount: '₹28,450',
    growth: '+22.4%',
    sparklineColor: '#F97316',
    sparklineFill: '#FFF7ED',
    sparklinePoints: 'M0,40 Q25,25 50,15 T100,28 T150,8 T200,3',
    sparklineArea: 'M0,40 Q25,25 50,15 T100,28 T150,8 T200,3 L200,50 L0,50 Z',
    metrics: {
      ordersCount: 42,
      activeCount: 9,
      pendingCount: 4,
      lowStockCount: 1,
    },
    quickActions: [
      { id: 'add_item', label: 'Add Dish', icon: PlusCircle, route: 'AddProduct' },
      { id: 'menu_manage', label: 'Menu Pricing', icon: Layers, route: 'Inventory' },
      { id: 'kitchen_board', label: 'Kitchen Board', icon: Utensils, route: 'Orders' },
      { id: 'daily_cash', label: 'Settlement', icon: Sparkles, route: 'Revenue' },
    ],
    topSectionTitle: 'Top Selling',
    topItems: [
      { id: '1', name: 'Special Paneer Tikka Platter', sales: '₹9,840', orders: '48 orders', growth: '+28%', icon: Flame, color: '#F97316' },
      { id: '2', name: 'Butter Garlic Naan Combos', sales: '₹6,450', orders: '38 orders', growth: '+19%', icon: Utensils, color: '#EA580C' },
      { id: '3', name: 'Crispy Veg Momos & Dip', sales: '₹4,320', orders: '29 orders', growth: '+14%', icon: Sparkles, color: '#C2410C' },
    ],
  },
  pharmacy: {
    id: 'pharmacy',
    label: 'Pharmacy & Wellness',
    emoji: '💊',
    primary: '#14B8A6',      // Teal 500
    primaryDark: '#0D9488',  // Teal 600
    primaryLight: '#F0FDFA', // Teal 50
    primaryGlow: 'rgba(20, 184, 166, 0.25)',
    badgeBg: '#CCFBF1',
    greetingSub: 'Safe meds, Trusted health!',
    illustrationBadge: '🩺',
    salesAmount: '₹19,630',
    growth: '+11.2%',
    sparklineColor: '#14B8A6',
    sparklineFill: '#F0FDFA',
    sparklinePoints: 'M0,30 Q25,20 50,32 T100,18 T150,14 T200,6',
    sparklineArea: 'M0,30 Q25,20 50,32 T100,18 T150,14 T200,6 L200,50 L0,50 Z',
    metrics: {
      ordersCount: 18,
      activeCount: 4,
      pendingCount: 1,
      lowStockCount: 5,
    },
    quickActions: [
      { id: 'add_med', label: 'Add Medicine', icon: PlusCircle, route: 'AddProduct' },
      { id: 'expiry_check', label: 'Expiry Check', icon: ShieldCheck, route: 'Inventory' },
      { id: 'rx_orders', label: 'Rx Orders', icon: Pill, route: 'Orders' },
      { id: 'reports', label: 'Statements', icon: BarChart3, route: 'Revenue' },
    ],
    topSectionTitle: 'Top Categories',
    topItems: [
      { id: '1', name: 'Prescription & Antibiotics', sales: '₹8,240', orders: '24 orders', growth: '+15%', icon: Pill, color: '#14B8A6' },
      { id: '2', name: 'Vitamins & Supplements', sales: '₹5,180', orders: '19 orders', growth: '+10%', icon: Sparkles, color: '#0D9488' },
      { id: '3', name: 'First Aid & Diagnostic Kits', sales: '₹3,410', orders: '12 orders', growth: '+8%', icon: ShieldCheck, color: '#0F766E' },
    ],
  },
  retail: {
    id: 'retail',
    label: 'Retail & Lifestyle',
    emoji: '🛍️',
    primary: '#2563EB',      // Blue 600
    primaryDark: '#1D4ED8',  // Blue 700
    primaryLight: '#EFF6FF', // Blue 50
    primaryGlow: 'rgba(37, 99, 235, 0.25)',
    badgeBg: '#DBEAFE',
    greetingSub: 'Fast dispatch, Growing sales!',
    illustrationBadge: '📦',
    salesAmount: '₹34,120',
    growth: '+18.5%',
    sparklineColor: '#2563EB',
    sparklineFill: '#EFF6FF',
    sparklinePoints: 'M0,38 Q25,30 50,18 T100,24 T150,10 T200,4',
    sparklineArea: 'M0,38 Q25,30 50,18 T100,24 T150,10 T200,4 L200,50 L0,50 Z',
    metrics: {
      ordersCount: 31,
      activeCount: 7,
      pendingCount: 3,
      lowStockCount: 4,
    },
    quickActions: [
      { id: 'add_sku', label: 'Add SKU', icon: PlusCircle, route: 'AddProduct' },
      { id: 'barcode', label: 'Stock Scan', icon: Package, route: 'Inventory' },
      { id: 'shipments', label: 'Shipments', icon: ShoppingBag, route: 'Orders' },
      { id: 'revenue_track', label: 'Analytics', icon: TrendingUp, route: 'Revenue' },
    ],
    topSectionTitle: 'Top Categories',
    topItems: [
      { id: '1', name: 'Mobile Accessories & Cables', sales: '₹12,450', orders: '44 orders', growth: '+24%', icon: Zap, color: '#2563EB' },
      { id: '2', name: 'Home Living & Essentials', sales: '₹9,820', orders: '31 orders', growth: '+16%', icon: Store, color: '#1D4ED8' },
      { id: '3', name: 'Personal Care & Fragrance', sales: '₹6,410', orders: '22 orders', growth: '+11%', icon: Sparkles, color: '#1E40AF' },
    ],
  },
};

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { vendor } = useAuthStore();
  const { isOpen } = useStoreConfigStore();
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>('grocery');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeTheme = CATEGORY_CONFIGS[selectedCategory];

  // Staggered Fade & Slide-In Animations
  const animHeader = useRef(new Animated.Value(0)).current;
  const animCard = useRef(new Animated.Value(0)).current;
  const animMetrics = useRef(new Animated.Value(0)).current;
  const animActions = useRef(new Animated.Value(0)).current;
  const animList = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run smooth sequential staggered spring animations
    Animated.stagger(80, [
      Animated.spring(animHeader, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(animCard, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(animMetrics, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(animActions, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(animList, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const getSlideStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  const ownerFirstName = (vendor?.ownerName || vendor?.businessName || 'Merchant').split(' ')[0];

  return (
    <View style={styles.container}>
      {/* 1. STICKY TOP-RIGHT CATEGORY SWITCHER PILL (FOR QUICK PREVIEWS & TESTING) */}
      <View style={[styles.floatingDevBar, { top: insets.top > 0 ? insets.top + 8 : 14 }]}>
        <TouchableOpacity
          style={[styles.categoryPillBtn, { backgroundColor: '#0F172A' }]}
          onPress={() => setShowCategoryMenu(!showCategoryMenu)}
          activeOpacity={0.85}
        >
          <SlidersHorizontal size={13} color="#FFFFFF" />
          <Text style={styles.categoryPillText}>
            {activeTheme.emoji} {activeTheme.label.split(' ')[0]}
          </Text>
          <ChevronRight size={13} color="#94A3B8" />
        </TouchableOpacity>

        {/* Dropdown Menu Popup */}
        {showCategoryMenu && (
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>SWITCH THEME</Text>
            {(['grocery', 'restaurant', 'pharmacy', 'retail'] as VendorCategory[]).map((catKey) => {
              const cat = CATEGORY_CONFIGS[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <TouchableOpacity
                  key={catKey}
                  style={[
                    styles.dropdownItem,
                    isSelected && { backgroundColor: cat.primaryLight },
                  ]}
                  onPress={() => {
                    setSelectedCategory(catKey);
                    setShowCategoryMenu(false);
                  }}
                >
                  <Text style={styles.dropdownEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.dropdownLabel,
                      isSelected && { color: cat.primaryDark, fontWeight: '800' },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && <CheckCircle2 size={14} color={cat.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTheme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* A. CURVED HEADER SECTION */}
        <Animated.View
          style={[
            styles.curvedHeader,
            {
              backgroundColor: activeTheme.primary,
              paddingTop: Math.max(insets.top + 10, 32),
            },
            getSlideStyle(animHeader),
          ]}
        >
          {/* Top Status Bar Nav Area */}
          <View style={styles.topNavRow}>
            {/* Status Time Placeholder & Live Network */}
            <View style={styles.statusBarBadge}>
              <Text style={styles.statusBarTime}>9:41</Text>
              <View style={styles.livePulseDot} />
            </View>

            {/* Profile Avatar & Notification Bell */}
            <View style={styles.topRightControls}>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.8}
              >
                <Bell size={18} color="#FFFFFF" />
                <View style={styles.unreadDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileAvatarBox}
                onPress={() => navigation.navigate('Store')}
                activeOpacity={0.8}
              >
                <Text style={styles.profileAvatarText}>
                  {ownerFirstName.slice(0, 2).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Greeting Content */}
          <View style={styles.greetingContainer}>
            <View style={styles.greetingTextColumn}>
              <View style={styles.greetingHeaderRow}>
                <Text style={styles.greetingTitle}>
                  Good Morning, {ownerFirstName}
                </Text>
                <Text style={styles.waveEmoji}> 👋</Text>
              </View>
              <Text style={styles.greetingSubtitle}>{activeTheme.greetingSub}</Text>
            </View>

            {/* Graphic Placeholder (3D Floating Theme Badge) */}
            <View style={styles.graphicPlaceholderBox}>
              <View style={[styles.graphicBackdropGlow, { backgroundColor: activeTheme.primaryGlow }]} />
              <View style={styles.graphicCirclePill}>
                <Text style={styles.graphicEmojiIcon}>{activeTheme.illustrationBadge}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* B. FLOATING SALES CARD (OVERLAPPING CURVED HEADER) */}
        <Animated.View style={[styles.floatingCardWrapper, getSlideStyle(animCard)]}>
          <View style={styles.salesCard}>
            <View style={styles.salesCardHeader}>
              <View style={styles.salesCardLeft}>
                <View style={styles.salesTitleRow}>
                  <Text style={styles.salesCardLabel}>Today's Sales</Text>
                  <View style={styles.liveTagBadge}>
                    <View style={[styles.liveTagDot, { backgroundColor: activeTheme.primary }]} />
                    <Text style={[styles.liveTagText, { color: activeTheme.primaryDark }]}>LIVE</Text>
                  </View>
                </View>

                {/* Large Bold Revenue */}
                <Text style={styles.salesAmountText}>{activeTheme.salesAmount}</Text>

                {/* Growth Pill */}
                <View style={[styles.growthPill, { backgroundColor: '#ECFDF5' }]}>
                  <TrendingUp size={13} color="#10B981" />
                  <Text style={styles.growthPillText}>{activeTheme.growth} vs yesterday</Text>
                </View>
              </View>

              {/* Smooth Sparkline Chart (SVG) */}
              <View style={styles.sparklineBox}>
                <Svg width="115" height="52" viewBox="0 0 200 50">
                  <Defs>
                    <SvgGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={activeTheme.sparklineColor} stopOpacity="0.4" />
                      <Stop offset="100%" stopColor={activeTheme.sparklineColor} stopOpacity="0.0" />
                    </SvgGradient>
                  </Defs>
                  <Path
                    d={activeTheme.sparklineArea}
                    fill="url(#sparklineGradient)"
                  />
                  <Path
                    d={activeTheme.sparklinePoints}
                    fill="none"
                    stroke={activeTheme.sparklineColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <Circle cx="200" cy="5" r="4.5" fill={activeTheme.sparklineColor} />
                </Svg>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* C. KEY METRICS GRID */}
        <Animated.View style={[styles.metricsContainer, getSlideStyle(animMetrics)]}>
          {/* Card 1: Orders */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.85}
          >
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: activeTheme.primaryLight }]}>
                <ShoppingBag size={18} color={activeTheme.primary} />
              </View>
              <View style={[styles.trendBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.trendBadgeText}>+8.2%</Text>
              </View>
            </View>
            <Text style={styles.metricNumber}>{activeTheme.metrics.ordersCount}</Text>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricTitle}>Orders</Text>
              <Text style={[styles.metricSubtitle, { color: activeTheme.primaryDark }]}>
                ({activeTheme.metrics.activeCount} active)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Pending */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Orders', { initialTab: 'NEW' })}
            activeOpacity={0.85}
          >
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={18} color="#D97706" />
              </View>
              <View style={[styles.trendBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.trendBadgeText, { color: '#B45309' }]}>Action</Text>
              </View>
            </View>
            <Text style={[styles.metricNumber, { color: '#D97706' }]}>
              {activeTheme.metrics.pendingCount}
            </Text>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricTitle}>Pending</Text>
              <Text style={styles.metricSubtitle}>Need accept</Text>
            </View>
          </TouchableOpacity>

          {/* Card 3: Low Stock */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Inventory')}
            activeOpacity={0.85}
          >
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <AlertTriangle size={18} color="#EF4444" />
              </View>
              <View style={[styles.trendBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.trendBadgeText, { color: '#B91C1C' }]}>Restock</Text>
              </View>
            </View>
            <Text style={[styles.metricNumber, { color: '#EF4444' }]}>
              {activeTheme.metrics.lowStockCount}
            </Text>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricTitle}>Low Stock</Text>
              <Text style={styles.metricSubtitle}>Items low</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* D. QUICK ACTIONS (HORIZONTAL 4 BUTTONS) */}
        <Animated.View style={[styles.sectionContainer, getSlideStyle(animActions)]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubBadge}>FAST SHORTCUTS</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {activeTheme.quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionItem}
                  onPress={() => action.route && navigation.navigate(action.route)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.quickActionCircle,
                      {
                        backgroundColor: activeTheme.primaryLight,
                        borderColor: activeTheme.badgeBg,
                      },
                    ]}
                  >
                    <ActionIcon size={22} color={activeTheme.primaryDark} />
                  </View>
                  <Text style={styles.quickActionLabel} numberOfLines={1}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* E. TOP CATEGORIES / TOP SELLING SECTION */}
        <Animated.View style={[styles.sectionContainer, getSlideStyle(animList)]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{activeTheme.topSectionTitle}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={[styles.viewAllText, { color: activeTheme.primaryDark }]}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topItemsCard}>
            {activeTheme.topItems.map((item, index) => {
              const ItemIcon = item.icon;
              const isLast = index === activeTheme.topItems.length - 1;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.topItemRow,
                    !isLast && styles.topItemRowBorder,
                  ]}
                >
                  <View style={[styles.topItemIconBox, { backgroundColor: activeTheme.primaryLight }]}>
                    <ItemIcon size={18} color={item.color} />
                  </View>

                  <View style={styles.topItemInfo}>
                    <Text style={styles.topItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.topItemOrders}>{item.orders}</Text>
                  </View>

                  <View style={styles.topItemPriceGroup}>
                    <Text style={styles.topItemRevenue}>{item.sales}</Text>
                    <View style={[styles.growthTagBadge, { backgroundColor: '#ECFDF5' }]}>
                      <Text style={styles.growthTagText}>{item.growth}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Extra Bottom Breathing Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  // Floating Dev Switcher
  floatingDevBar: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
    elevation: 25,
  },
  categoryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dropdownModal: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 8,
  },
  dropdownEmoji: {
    fontSize: 16,
  },
  dropdownLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  // A. Curved Header
  curvedHeader: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 56, // extra padding so floating card overlaps nicely
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusBarTime: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 110, // Avoid overlapping floating dev button
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  greetingTextColumn: {
    flex: 1,
  },
  greetingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  waveEmoji: {
    fontSize: 20,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 3,
    fontWeight: '500',
  },
  graphicPlaceholderBox: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphicBackdropGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  graphicCirclePill: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  graphicEmojiIcon: {
    fontSize: 26,
  },
  // B. Floating Sales Card
  floatingCardWrapper: {
    paddingHorizontal: 16,
    marginTop: -38, // Overlapping curved header
  },
  salesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  salesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  salesCardLeft: {
    flex: 1,
  },
  salesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salesCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  liveTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  salesAmountText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
    marginTop: 4,
    marginBottom: 6,
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  growthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sparklineBox: {
    width: 115,
    height: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // C. Metrics Grid
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  metricLabelRow: {
    marginTop: 2,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  metricSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  // D. Quick Actions
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  // E. Top Items Card
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  topItemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  topItemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  topItemOrders: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  topItemPriceGroup: {
    alignItems: 'flex-end',
  },
  topItemRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  growthTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  growthTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
});

export default DashboardScreen;
