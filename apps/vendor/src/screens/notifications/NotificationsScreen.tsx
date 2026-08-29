import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Bell, ShoppingBag, AlertTriangle, Landmark, ShieldCheck } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { NotificationItem } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await VendorApi.getNotifications();
      setNotifications(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag size={20} color={Colors.primary} />;
      case 'INVENTORY':
        return <AlertTriangle size={20} color="#B45309" />;
      case 'FINANCE':
        return <Landmark size={20} color={Colors.secondary} />;
      default:
        return <ShieldCheck size={20} color={Colors.info} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications & Alerts"
        subtitle="Order alerts, stock warnings & announcements"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unreadCard]}>
            <View style={styles.iconBox}>{getIcon(item.type)}</View>
            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.timestamp}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No Notifications"
            description="You're all caught up with orders and store alerts."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.card,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
