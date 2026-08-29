import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle, Clock, MapPin, Package, AlertCircle, XCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type DeliveryTab = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const HistoryScreen = () => {
  const [activeTab, setActiveTab] = useState<DeliveryTab>('COMPLETED');

  const completedDeliveries = [
    {
      id: '1',
      orderNumber: 'SVZ-20260821-4921',
      store: 'Organic Harvest Fresh Store',
      customer: 'Priya Verma',
      time: 'Today, 3:15 PM',
      earnings: '₹68.50',
      status: 'DELIVERED',
      distance: '3.8 km',
    },
    {
      id: '2',
      orderNumber: 'SVZ-20260821-4812',
      store: 'Blue Tokai Roastery & Bakery',
      customer: 'Amit Patel',
      time: 'Today, 1:40 PM',
      earnings: '₹74.00',
      status: 'DELIVERED',
      distance: '4.5 km',
    },
    {
      id: '3',
      orderNumber: 'SVZ-20260821-4709',
      store: 'Nirula’s Ice Cream & Fast Food',
      customer: 'Sneha Kapoor',
      time: 'Today, 11:20 AM',
      earnings: '₹55.00',
      status: 'DELIVERED',
      distance: '2.1 km',
    },
  ];

  const availableDeliveries = [
    {
      id: 'avail-1',
      orderNumber: 'SVZ-20260822-5012',
      store: 'Blinkit Instant Groceries - C-Scheme',
      customer: 'Ritu Sharma',
      time: '5 mins ago',
      earnings: '₹75.00',
      status: 'READY_FOR_PICKUP',
      distance: '2.4 km',
    },
  ];

  const activeDeliveries = [
    {
      id: 'act-1',
      orderNumber: 'SVZ-20260822-5001',
      store: 'Starbucks Coffee - Vaishali Nagar',
      customer: 'Karan Mehra',
      time: 'Pickup Confirmed',
      earnings: '₹85.00',
      status: 'OUT_FOR_DELIVERY',
      distance: '3.1 km',
    },
  ];

  const cancelledDeliveries = [
    {
      id: 'canc-1',
      orderNumber: 'SVZ-20260819-3991',
      store: 'Burger King - Mansarovar',
      customer: 'Customer Cancelled',
      time: '20 Aug, 2:10 PM',
      earnings: '₹25.00 (Compensation)',
      status: 'CANCELLED',
      distance: '1.2 km',
    },
  ];

  const renderCurrentList = () => {
    let list: any[] = [];
    if (activeTab === 'AVAILABLE') list = availableDeliveries;
    else if (activeTab === 'ACTIVE') list = activeDeliveries;
    else if (activeTab === 'COMPLETED') list = completedDeliveries;
    else list = cancelledDeliveries;

    if (list.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No orders in {activeTab.toLowerCase()}</Text>
          <Text style={styles.emptyDesc}>New requests will show up when orders are dispatched.</Text>
        </View>
      );
    }

    return list.map((item) => (
      <TouchableOpacity key={item.id} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.storeName}>{item.store}</Text>
          </View>
          <Text style={styles.earnings}>{item.earnings}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color="#94A3B8" />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={12} color="#94A3B8" />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              activeTab === 'COMPLETED' && styles.statusBadgeDone,
              activeTab === 'ACTIVE' && styles.statusBadgeActive,
              activeTab === 'CANCELLED' && styles.statusBadgeCanc,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                activeTab === 'COMPLETED' && styles.statusTextDone,
                activeTab === 'ACTIVE' && styles.statusTextActive,
                activeTab === 'CANCELLED' && styles.statusTextCanc,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector (Point 38 Deliveries Navigation) */}
      <View style={styles.tabBar}>
        {(['AVAILABLE', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as DeliveryTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderCurrentList()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FF6600',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6600',
    letterSpacing: 0.5,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  earnings: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  statusBadgeDone: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeActive: {
    backgroundColor: '#FFF7ED',
  },
  statusBadgeCanc: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statusTextDone: {
    color: '#059669',
  },
  statusTextActive: {
    color: '#EA580C',
  },
  statusTextCanc: {
    color: '#DC2626',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;
