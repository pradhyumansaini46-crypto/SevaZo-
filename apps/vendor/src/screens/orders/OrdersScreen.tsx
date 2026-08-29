import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Tabs, TabItem } from '../../components/Tabs';
import { OrderCard } from '../../components/OrderCard';
import { EmptyState } from '../../components/EmptyState';
import { OrderDetailModal } from './OrderDetailModal';
import { Order } from '../../types';
import { VendorApi } from '../../services/vendorApi';
import { useOrderStore } from '../../stores/orderStore';
import { useThemeStore } from '../../stores/themeStore';
import { getThemeColors, Colors } from '../../theme';

export const OrdersScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { activeTab, setActiveTab } = useOrderStore();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tabs: TabItem[] = [
    { key: 'NEW', label: 'New (🔔)', count: 1, badgeColor: '#B45309' },
    { key: 'ACCEPTED', label: 'Accepted', count: 1 },
    { key: 'PREPARING', label: 'Packing', count: 1 },
    { key: 'READY', label: 'Ready', count: 1 },
    { key: 'HISTORY', label: 'History' },
  ];

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await VendorApi.getOrders({ tab: activeTab });
      setOrders(res.items);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleAccept = async (order: Order) => {
    try {
      const updated = await VendorApi.acceptOrder(order.id, 15);
      Alert.alert('Order Accepted!', 'Please start packing items for dispatch.', [
        {
          text: 'View Next Stage',
          onPress: () => {
            setActiveTab('ACCEPTED');
          },
        },
      ]);
      loadOrders();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handlePreparing = async (order: Order) => {
    try {
      await VendorApi.markPreparing(order.id);
      Alert.alert('Packing Started', 'Order moved to preparing stage.');
      setActiveTab('PREPARING');
      loadOrders();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReady = async (order: Order) => {
    try {
      await VendorApi.markReady(order.id);
      Alert.alert('Ready for Pickup!', 'Delivery rider has been alerted to collect the parcel.');
      setActiveTab('READY');
      loadOrders();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Live Orders"
        subtitle="Manage and fulfill instant commerce orders"
      />

      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface }]}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          scrollable
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => handleOpenDetail(item)}
            onAccept={() => handleAccept(item)}
            onPreparing={() => handlePreparing(item)}
            onReady={() => handleReady(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOrders} />}
        ListEmptyComponent={
          <EmptyState
            icon="🛍️"
            title={`No ${activeTab} Orders`}
            description="When customer orders arrive at this stage, they will appear here live."
          />
        }
      />

      {selectedOrder && (
        <OrderDetailModal
          visible={modalVisible}
          order={selectedOrder}
          onClose={() => setModalVisible(false)}
          onAccept={() => {
            handleAccept(selectedOrder);
            setModalVisible(false);
          }}
          onPreparing={() => {
            handlePreparing(selectedOrder);
            setModalVisible(false);
          }}
          onReady={() => {
            handleReady(selectedOrder);
            setModalVisible(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
});
