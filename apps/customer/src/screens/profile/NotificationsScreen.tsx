import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import {
  Bell,
  Truck,
  Tag,
  Package,
  CheckCheck,
  Heart,
  Wallet,
  ShieldCheck,
  Flame,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { NotificationItem } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type NotifCategory = 'ALL' | 'ORDERS' | 'DEALS' | 'WISHLIST' | 'ACCOUNT';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('ALL');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await customerApi.getNotifications();
    setNotifications(data);
  };

  const handleMarkAllRead = () => {
    triggerHaptic('success');
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const isCategoryMatch = (notif: NotificationItem, cat: NotifCategory) => {
    if (cat === 'ALL') return true;
    if (cat === 'ORDERS') return notif.type === 'ORDER' || notif.type === 'DELIVERY';
    if (cat === 'DEALS') return notif.type === 'DEALS' || notif.type === 'PROMO';
    if (cat === 'WISHLIST') return notif.type === 'WISHLIST';
    if (cat === 'ACCOUNT') return notif.type === 'ACCOUNT' || notif.type === 'SYSTEM';
    return true;
  };

  const ordersCount = notifications.filter((n) => isCategoryMatch(n, 'ORDERS')).length;
  const dealsCount = notifications.filter((n) => isCategoryMatch(n, 'DEALS')).length;
  const wishlistCount = notifications.filter((n) => isCategoryMatch(n, 'WISHLIST')).length;
  const accountCount = notifications.filter((n) => isCategoryMatch(n, 'ACCOUNT')).length;

  const filteredNotifications = notifications.filter((n) =>
    isCategoryMatch(n, activeCategory)
  );

  const getCategoryMeta = (type: string) => {
    switch (type) {
      case 'DELIVERY':
      case 'ORDER':
        return {
          icon: <Truck size={18} color="#047857" />,
          bg: '#ECFDF5',
          label: 'Order Update',
          labelColor: '#047857',
        };
      case 'PROMO':
      case 'DEALS':
        return {
          icon: <Tag size={18} color="#DC2626" />,
          bg: '#FFF1F2',
          label: 'Special Deal',
          labelColor: '#DC2626',
        };
      case 'WISHLIST':
        return {
          icon: <Heart size={18} color="#DB2777" fill="#FCE7F3" />,
          bg: '#FDF2F8',
          label: 'Wishlist Alert',
          labelColor: '#DB2777',
        };
      case 'ACCOUNT':
      case 'SYSTEM':
      default:
        return {
          icon: <Wallet size={18} color="#2563EB" />,
          bg: '#EFF6FF',
          label: 'Account & Cash',
          labelColor: '#2563EB',
        };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Notifications"
        subtitle="Stay updated on orders & savings"
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
              <CheckCheck size={18} color={Colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Category Tabs Bar */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {[
            { id: 'ALL' as NotifCategory, label: `All (${notifications.length})` },
            { id: 'ORDERS' as NotifCategory, label: `🛵 Orders (${ordersCount})` },
            { id: 'DEALS' as NotifCategory, label: `🏷️ Deals (${dealsCount})` },
            { id: 'WISHLIST' as NotifCategory, label: `❤️ Wishlist (${wishlistCount})` },
            { id: 'ACCOUNT' as NotifCategory, label: `👤 Account (${accountCount})` },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('selection');
                setActiveCategory(tab.id);
              }}
              style={[
                styles.tabChip,
                activeCategory === tab.id && styles.tabChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  activeCategory === tab.id && styles.tabChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} color={Colors.primary} />}
          title="No Notifications in this Category"
          description="You are completely up to date. We'll alert you as soon as updates occur."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {filteredNotifications.map((notif) => {
            const meta = getCategoryMeta(notif.type);
            return (
              <View
                key={notif.id}
                style={[
                  styles.notifCard,
                  !notif.isRead && styles.notifCardUnread,
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
                  {meta.icon}
                </View>

                <View style={styles.notifContent}>
                  <View style={styles.topRow}>
                    <View style={styles.badgeLabelRow}>
                      <Text style={[styles.categoryPillLabel, { color: meta.labelColor }]}>
                        {meta.label}
                      </Text>
                    </View>
                    <Text style={styles.notifTime}>{notif.timestamp}</Text>
                  </View>

                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {!notif.isRead ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </View>
              </View>
            );
          })}
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
  markReadBtn: {
    padding: Spacing.xs,
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
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  notifCardUnread: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPillLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  notifMessage: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
});
