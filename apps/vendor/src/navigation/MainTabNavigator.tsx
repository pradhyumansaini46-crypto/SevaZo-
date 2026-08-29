import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Store,
  DollarSign,
  TrendingUp,
  Bell,
  Tag,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { ProductsListScreen } from '../screens/products/ProductsListScreen';
import { InventoryListScreen } from '../screens/inventory/InventoryListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

type TabKey = 'Dashboard' | 'Orders' | 'Products' | 'Inventory' | 'Store';

export const MainTabNavigator: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 768; // Web browser / Tablet
  const { vendor, logout } = useAuthStore();
  const { themeMode, toggleTheme } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const [activeTab, setActiveTab] = useState<TabKey>('Dashboard');

  const navItems = [
    {
      key: 'Dashboard' as TabKey,
      label: 'Dashboard',
      icon: (active: boolean) => (
        <LayoutDashboard
          size={22}
          color={active ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'Orders' as TabKey,
      label: 'Orders',
      badge: '1',
      icon: (active: boolean) => (
        <ShoppingBag
          size={22}
          color={active ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'Products' as TabKey,
      label: 'Products',
      icon: (active: boolean) => (
        <Package
          size={22}
          color={active ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'Inventory' as TabKey,
      label: 'Inventory',
      icon: (active: boolean) => (
        <Boxes
          size={22}
          color={active ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'Store' as TabKey,
      label: 'Store',
      icon: (active: boolean) => (
        <Store
          size={22}
          color={active ? colors.primary : colors.textMuted}
        />
      ),
    },
  ];

  const quickLinks = [
    {
      label: 'Finance & Revenue',
      icon: <DollarSign size={18} color={colors.textSecondary} />,
      onPress: () => navigation.navigate('Revenue'),
    },
    {
      label: 'Store Analytics',
      icon: <TrendingUp size={18} color={colors.textSecondary} />,
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      label: 'Promotions & Coupons',
      icon: <Tag size={18} color={colors.textSecondary} />,
      onPress: () => navigation.navigate('Promotions'),
    },
    {
      label: 'Notifications',
      icon: <Bell size={18} color={colors.textSecondary} />,
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      label: 'Merchant Support',
      icon: <HelpCircle size={18} color={colors.textSecondary} />,
      onPress: () => navigation.navigate('Support'),
    },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Orders':
        return <OrdersScreen navigation={navigation} route={route} />;
      case 'Products':
        return <ProductsListScreen navigation={navigation} />;
      case 'Inventory':
        return <InventoryListScreen navigation={navigation} />;
      case 'Store':
        return <SettingsScreen navigation={navigation} />;
      case 'Dashboard':
      default:
        return <DashboardScreen navigation={navigation} />;
    }
  };

  if (isDesktop) {
    // DESKTOP & WEB VIEW: Left Sidebar Navigation
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
        {/* Left Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
          {/* Store Branding Header */}
          <View style={[styles.brandBox, { borderBottomColor: colors.borderLight }]}>
            <Image
              source={{
                uri:
                  vendor?.logo ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
              }}
              style={styles.brandLogo}
            />
            <View style={styles.brandInfo}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {vendor?.storeName || vendor?.businessName || 'Fresh Mart'}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: colors.primaryLight }]}>
                <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.statusPillText, { color: colors.primaryDark }]}>Taking Orders</Text>
              </View>
            </View>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeToggleBtn, { backgroundColor: colors.borderLight }]}
              accessible
              accessibilityLabel="Toggle Theme Mode"
            >
              {themeMode === 'DARK' ? (
                <Sun size={18} color="#FBBF24" />
              ) : (
                <Moon size={18} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Primary Navigation Menu */}
          <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
            <Text style={[styles.menuSectionHeader, { color: colors.textMuted }]}>MAIN NAVIGATION</Text>
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setActiveTab(item.key)}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: colors.primary },
                  ]}
                >
                  <View style={{ marginRight: 12 }}>
                    {item.key === 'Dashboard' && <LayoutDashboard size={20} color={isActive ? '#FFFFFF' : colors.textSecondary} />}
                    {item.key === 'Orders' && <ShoppingBag size={20} color={isActive ? '#FFFFFF' : colors.textSecondary} />}
                    {item.key === 'Products' && <Package size={20} color={isActive ? '#FFFFFF' : colors.textSecondary} />}
                    {item.key === 'Inventory' && <Boxes size={20} color={isActive ? '#FFFFFF' : colors.textSecondary} />}
                    {item.key === 'Store' && <Store size={20} color={isActive ? '#FFFFFF' : colors.textSecondary} />}
                  </View>
                  <Text
                    style={[
                      styles.navLabel,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badge ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.warningLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isActive ? '#FFFFFF' : colors.warning },
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}

            <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

            <Text style={[styles.menuSectionHeader, { color: colors.textMuted }]}>MERCHANT TOOLS</Text>
            {quickLinks.map((link, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={link.onPress}
                style={styles.quickLinkItem}
              >
                {link.icon}
                <Text style={[styles.quickLinkLabel, { color: colors.textSecondary }]}>
                  {link.label}
                </Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bottom Footer User Info & Logout */}
          <View style={[styles.sidebarFooter, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
            <View style={styles.userBox}>
              <View style={[styles.userAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.userAvatarText, { color: colors.primaryDark }]}>
                  {(vendor?.ownerName || 'VM').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {vendor?.ownerName || 'Vikram Mehta'}
                </Text>
                <Text style={[styles.userRole, { color: colors.textMuted }]}>Store Owner</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <LogOut size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content Area on Right */}
        <View style={[styles.desktopContent, { backgroundColor: colors.background }]}>
          {renderActiveScreen()}
        </View>
      </View>
    );
  }

  // MOBILE VIEW: Fixed Bottom Navigation Bar with Complete Safe Area Protection
  const bottomBarPadding = insets.bottom > 0 ? insets.bottom : 10;
  const totalTabBarHeight = 56 + bottomBarPadding;

  return (
    <View style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
      {/* Active Screen Content with clearance for fixed tab bar */}
      <View style={[styles.mobileContentArea, { paddingBottom: totalTabBarHeight }]}>
        {renderActiveScreen()}
      </View>

      {/* Fixed Bottom Navigation Tab Bar */}
      <View
        style={[
          styles.bottomTabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            height: totalTabBarHeight,
            paddingBottom: bottomBarPadding,
          },
        ]}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => setActiveTab(item.key)}
              style={styles.bottomTabButton}
            >
              <View style={styles.tabIconContainer}>
                {item.icon(isActive)}
                {item.badge ? (
                  <View style={[styles.mobileBadge, { backgroundColor: colors.danger }]}>
                    <Text style={styles.mobileBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.bottomTabLabel,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
              {isActive && (
                <View style={[styles.activeIndicatorDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 270,
    borderRightWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    ...Shadows.card,
  },
  brandBox: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  brandInfo: {
    marginLeft: 12,
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeToggleBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    marginLeft: 8,
  },
  sidebarMenu: {
    flex: 1,
    padding: 12,
  },
  menuSectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  menuDivider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  quickLinkLabel: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 11,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  desktopContent: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
    position: 'relative',
  },
  mobileContentArea: {
    flex: 1,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 6,
    ...Shadows.elevated,
    zIndex: 999,
    elevation: 20,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  mobileBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bottomTabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
