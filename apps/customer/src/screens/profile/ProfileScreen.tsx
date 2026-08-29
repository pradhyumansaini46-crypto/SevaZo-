import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import {
  User,
  MapPin,
  CreditCard,
  Wallet,
  Bell,
  RotateCcw,
  Headphones,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Shield,
  Award,
  Heart,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { customer, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Sevazo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: 'My Orders & Activity',
      items: [
        {
          title: 'My Wishlist',
          sub: `${wishlistItems.length} items saved`,
          icon: <Heart size={20} color={Colors.heartRed} />,
          onPress: () => navigation.navigate('Wishlist'),
        },
        {
          title: 'Refunds & Returns',
          sub: 'Track status of returned orders',
          icon: <RotateCcw size={20} color="#D97706" />,
          onPress: () => navigation.navigate('Refunds'),
        },
      ],
    },
    {
      title: 'Account Settings & Payments',
      items: [
        {
          title: 'Saved Addresses',
          sub: 'Manage home, work and other locations',
          icon: <MapPin size={20} color={Colors.primary} />,
          onPress: () => navigation.navigate('Addresses'),
        },
        {
          title: 'Sevazo Wallet',
          sub: `Balance: ₹${customer?.walletBalance || 450}`,
          icon: <Wallet size={20} color={Colors.secondary} />,
          onPress: () => navigation.navigate('Wallet'),
        },
        {
          title: 'Saved Payment Methods',
          sub: 'UPI IDs & Cards',
          icon: <CreditCard size={20} color={Colors.accentOrange} />,
          onPress: () => navigation.navigate('Payments'),
        },
        {
          title: 'Notifications & Alerts',
          sub: 'Order updates and promotional deals',
          icon: <Bell size={20} color={Colors.info} />,
          onPress: () => navigation.navigate('Notifications'),
        },
      ],
    },
    {
      title: 'Help & Preferences',
      items: [
        {
          title: 'Customer Support & Helpdesk',
          sub: '24/7 Live chat and FAQs',
          icon: <Headphones size={20} color={Colors.primary} />,
          onPress: () => navigation.navigate('Support'),
        },
        {
          title: 'App Settings',
          sub: 'Theme, permissions, language, terms',
          icon: <SettingsIcon size={20} color={Colors.textSecondary} />,
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Profile" subtitle="Account dashboard" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{customer?.name || 'Aarav Sharma'}</Text>
              <View style={styles.tierBadge}>
                <Award size={12} color="#92400E" />
                <Text style={styles.tierText}>GOLD</Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{customer?.phone || '+91 9876543210'}</Text>
            <Text style={styles.userEmail}>{customer?.email || 'aarav.sharma@example.com'}</Text>
          </View>
        </View>

        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{customer?.ordersCount || 18}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: Colors.primary }]}>
              ₹{customer?.walletBalance || 450}
            </Text>
            <Text style={styles.metricLabel}>Wallet Balance</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: Colors.secondary }]}>₹1,240</Text>
            <Text style={styles.metricLabel}>Total Saved</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => {
                const isLast = iIdx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={iIdx}
                    activeOpacity={0.75}
                    onPress={item.onPress}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconWrap}>{item.icon}</View>
                    <View style={styles.menuTextWrap}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={18} color={Colors.danger} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.logoutText}>Sign Out from Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tierText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 2,
  },
  userPhone: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  metricValue: {
    ...Typography.titleSmall,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  logoutText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.danger,
  },
});
