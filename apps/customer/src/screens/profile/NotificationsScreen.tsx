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
import { Bell, Truck, Tag, Package, CheckCheck } from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { NotificationItem } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await customerApi.getNotifications();
    setNotifications(data);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return <Truck size={20} color={Colors.primary} />;
      case 'PROMO':
        return <Tag size={20} color={Colors.accentOrange} />;
      case 'ORDER':
        return <Package size={20} color={Colors.secondary} />;
      default:
        return <Bell size={20} color={Colors.info} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Notifications"
        subtitle="Delivery alerts & promos"
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
              <CheckCheck size={18} color={Colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} color={Colors.primary} />}
          title="No Notifications Yet"
          description="We'll notify you when your rider is nearby or when there are super deals on your favorites."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {notifications.map((notif) => (
            <View
              key={notif.id}
              style={[
                styles.notifCard,
                !notif.isRead && styles.notifCardUnread,
              ]}
            >
              <View style={styles.iconCircle}>{getIcon(notif.type)}</View>
              <View style={styles.notifContent}>
                <View style={styles.topRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {!notif.isRead ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifTime}>{notif.timestamp}</Text>
              </View>
            </View>
          ))}
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
    borderColor: Colors.primary,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
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
  },
  notifTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
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
    marginTop: 4,
  },
});
