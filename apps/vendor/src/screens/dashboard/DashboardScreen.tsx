import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Star,
  PlusCircle,
  Package,
  Layers,
  Bell,
  CheckCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { StatusToggle } from '../../components/StatusToggle';
import { MetricCard } from '../../components/MetricCard';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { useStoreConfigStore } from '../../stores/storeConfigStore';
import { useThemeStore } from '../../stores/themeStore';
import { VendorApi } from '../../services/vendorApi';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { vendor, updateVendor } = useAuthStore();
  const { isOpen, setIsOpen } = useStoreConfigStore();
  const { isAlertSoundEnabled, toggleAlertSound, setActiveTab } = useOrderStore();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const safeTop = Math.max(insets.top, 12);

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({
    todaySales: 14820,
    todayOrdersCount: 16,
    activeOrders: 4,
    newOrders: 1,
    lowStockCount: 2,
    rating: 4.85,
  });

  const loadStats = async () => {
    try {
      const data = await VendorApi.getDashboardStats();
      setStats(data);
    } catch {
      // keep fallback
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleToggleStore = async (nextState: boolean) => {
    setIsOpen(nextState);
    updateVendor({ isOpen: nextState });
    await VendorApi.updateStoreStatus({ isOpen: nextState });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
            paddingTop: safeTop,
          },
        ]}
      >
        <View style={styles.storeInfoRow}>
          {vendor?.logo ? (
            <Image source={{ uri: vendor.logo }} style={styles.storeLogo} />
          ) : (
            <View style={[styles.placeholderLogo, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.placeholderLogoText}>🏪</Text>
            </View>
          )}
          <View style={styles.storeMeta}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {vendor?.storeName || 'My Store'}
            </Text>
            <View style={styles.statusIndicatorRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOpen ? colors.success : colors.danger },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {isOpen ? 'Accepting Orders' : 'Store Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleAlertSound}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isAlertSoundEnabled && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <Volume2 size={18} color={isAlertSoundEnabled ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Bell size={18} color={colors.textPrimary} />
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Live Switch */}
        <StatusToggle
          isOpen={isOpen}
          onToggle={handleToggleStore}
          prepTimeMinutes={vendor?.prepTimeMinutes || 12}
        />

        {/* Incoming Order Flash Alert Banner */}
        {stats.newOrders > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setActiveTab('NEW');
              navigation.navigate('Orders', { initialTab: 'NEW' });
            }}
            style={[
              styles.newOrderBanner,
              { backgroundColor: isDark ? '#161F30' : '#0F172A', borderColor: colors.primary },
            ]}
          >
            <View style={styles.bannerLeft}>
              <View style={[styles.pulseIcon, { backgroundColor: colors.primary }]}>
                <ShoppingBag size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bannerTitle}>
                  {stats.newOrders} New Order Pending! 🔔
                </Text>
                <Text style={[styles.bannerSub, { color: '#CBD5E1' }]}>
                  Accept within 2 mins to prevent cancellation
                </Text>
              </View>
            </View>
            <View style={[styles.bannerAction, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.bannerActionText}>View</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Today's KPI Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Today's Gross Sales"
            value={`₹${stats.todaySales.toLocaleString()}`}
            subtitle={`${stats.todayOrdersCount} orders fulfilled`}
            icon={<TrendingUp size={20} color={colors.primary} />}
            trend="+18.4%"
            trendPositive={true}
            style={{ marginRight: 8, marginBottom: 12 }}
          />

          <MetricCard
            title="Active Pipeline"
            value={stats.activeOrders}
            subtitle="Processing now"
            icon={<ShoppingBag size={20} color={colors.secondary} />}
            iconBg={isDark ? 'rgba(56, 189, 248, 0.2)' : '#FFE6FA'}
            style={{ marginLeft: 8, marginBottom: 12 }}
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Low Stock Alert"
            value={stats.lowStockCount}
            subtitle="Items need restock"
            icon={<AlertTriangle size={20} color="#B45309" />}
            iconBg="#FEF3C7"
            style={{ marginRight: 8 }}
          />

          <MetricCard
            title="Store Rating"
            value={`${stats.rating} ★`}
            subtitle="Based on 418 reviews"
            icon={<Star size={20} color="#EAB308" />}
            iconBg="#FEF9C3"
            style={{ marginLeft: 8 }}
          />
        </View>

        {/* Quick Action Shortcuts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>⚡ Fast Merchant Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddProduct')}
              style={styles.actionBtn}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isDark ? '#162E28' : '#E3FDF5',
                    borderColor: isDark ? '#059669' : colors.borderLight,
                  },
                ]}
              >
                <PlusCircle size={22} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Inventory')}
              style={styles.actionBtn}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isDark ? '#1E1B4B' : '#FFE6FA',
                    borderColor: isDark ? '#6366F1' : colors.borderLight,
                  },
                ]}
              >
                <Package size={22} color={colors.secondary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Stock Adjust</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Orders')}
              style={styles.actionBtn}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isDark ? '#3B2005' : '#FEF3C7',
                    borderColor: isDark ? '#D97706' : colors.borderLight,
                  },
                ]}
              >
                <Layers size={22} color="#D97706" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Live Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Revenue')}
              style={styles.actionBtn}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isDark ? '#2E1065' : '#FFE6FA',
                    borderColor: isDark ? '#A855F7' : colors.borderLight,
                  },
                ]}
              >
                <Sparkles size={22} color={colors.accentPurple} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Payouts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Order Stage Pipeline */}
        <View
          style={[
            styles.pipelineCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.pipelineHeader}>
            <Text style={[styles.pipelineTitle, { color: colors.textPrimary }]}>Order Fulfillment Stages</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Full Board →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pipelineRow}>
            <TouchableOpacity
              onPress={() => {
                setActiveTab('NEW');
                navigation.navigate('Orders', { initialTab: 'NEW' });
              }}
              style={styles.pipelineStep}
            >
              <View style={[styles.pipelineBadge, { backgroundColor: isDark ? '#3B2005' : '#FEF3C7' }]}>
                <Text style={[styles.pipelineCount, { color: '#F59E0B' }]}>
                  {stats.newOrders}
                </Text>
              </View>
              <Text style={[styles.pipelineLabel, { color: colors.textSecondary }]}>New</Text>
            </TouchableOpacity>

            <View style={styles.pipelineArrow}>
              <Text style={{ color: colors.textMuted }}>→</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setActiveTab('ACCEPTED');
                navigation.navigate('Orders', { initialTab: 'ACCEPTED' });
              }}
              style={styles.pipelineStep}
            >
              <View style={[styles.pipelineBadge, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                <Text style={[styles.pipelineCount, { color: colors.secondary }]}>1</Text>
              </View>
              <Text style={[styles.pipelineLabel, { color: colors.textSecondary }]}>Accepted</Text>
            </TouchableOpacity>

            <View style={styles.pipelineArrow}>
              <Text style={{ color: colors.textMuted }}>→</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setActiveTab('PREPARING');
                navigation.navigate('Orders', { initialTab: 'PREPARING' });
              }}
              style={styles.pipelineStep}
            >
              <View style={[styles.pipelineBadge, { backgroundColor: isDark ? '#2E1065' : '#F5F3FF' }]}>
                <Text style={[styles.pipelineCount, { color: colors.accentPurple }]}>1</Text>
              </View>
              <Text style={[styles.pipelineLabel, { color: colors.textSecondary }]}>Packing</Text>
            </TouchableOpacity>

            <View style={styles.pipelineArrow}>
              <Text style={{ color: colors.textMuted }}>→</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setActiveTab('READY');
                navigation.navigate('Orders', { initialTab: 'READY' });
              }}
              style={styles.pipelineStep}
            >
              <View style={[styles.pipelineBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                <Text style={[styles.pipelineCount, { color: colors.success }]}>1</Text>
              </View>
              <Text style={[styles.pipelineLabel, { color: colors.textSecondary }]}>Ready</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  placeholderLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLogoText: {
    fontSize: 22,
  },
  storeMeta: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scroll: {
    paddingBottom: 40,
  },
  newOrderBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: BorderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    ...Shadows.elevated,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  pipelineCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pipelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  pipelineBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pipelineCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  pipelineLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  pipelineArrow: {
    paddingBottom: 16,
  },
});
