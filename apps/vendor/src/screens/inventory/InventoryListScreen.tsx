import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Package, AlertTriangle, CheckCircle, Search, History, Calculator, Plus } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { VendorApi } from '../../services/vendorApi';
import { useThemeStore } from '../../stores/themeStore';

export const InventoryListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  const [inventories, setInventories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await VendorApi.getInventory({ search });
      setInventories(res.products || []);
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="5-State Inventory Engine"
        subtitle="Physical, Reserved, Damaged & Available Stock"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('LowStock')}
            style={[styles.lowStockBtn, { backgroundColor: isDark ? '#3B2005' : '#FEF3C7' }]}
          >
            <AlertTriangle size={16} color="#F59E0B" />
            <Text style={[styles.lowStockBtnText, { color: '#F59E0B' }]}>Low Stock Alerts</Text>
          </TouchableOpacity>
        }
      />

      {/* Stock Formula Banner */}
      <View
        style={[
          styles.formulaBanner,
          {
            backgroundColor: isDark ? '#162E28' : '#E3FDF5',
            borderColor: isDark ? '#059669' : '#A7F3D0',
          },
        ]}
      >
        <Calculator size={18} color={colors.primary} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={[styles.formulaTitle, { color: isDark ? '#A7F3D0' : colors.primaryDark }]}>Universal Stock Formula</Text>
          <Text style={[styles.formulaText, { color: isDark ? '#E2E8F0' : colors.textSecondary }]}>
            available_stock = physical_stock - reserved_stock - damaged_stock
          </Text>
        </View>
      </View>

      <FlatList
        data={inventories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadInventory} />}
        renderItem={({ item }) => {
          const physical = item.physicalStock ?? item.stock ?? 25;
          const reserved = item.reservedStock ?? 3;
          const damaged = item.damagedStock ?? 0;
          const sold = item.soldStock ?? 42;
          const available = Math.max(0, physical - reserved - damaged);

          return (
            <View style={[styles.invCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.cardHeader}>
                <Image
                  source={{
                    uri:
                      item.images?.[0]?.url ||
                      item.images?.[0] ||
                      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80',
                  }}
                  style={styles.prodThumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.prodName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.prodSku, { color: colors.textMuted }]}>SKU: {item.sku}</Text>
                  <Text style={[styles.prodPrice, { color: colors.textSecondary }]}>₹{item.price} • {item.unit}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('StockAdjustment', { productId: item.id })}
                  style={[styles.adjustBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[styles.adjustBtnText, { color: colors.primaryDark }]}>Adjust</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              {/* 5-State Grid */}
              <View style={styles.statesGrid}>
                <View style={styles.stateCol}>
                  <Text style={[styles.stateLabel, { color: colors.textMuted }]}>Physical</Text>
                  <Text style={[styles.stateVal, { color: colors.textPrimary }]}>{physical}</Text>
                </View>
                <View style={styles.stateCol}>
                  <Text style={[styles.stateLabel, { color: '#F59E0B' }]}>Reserved</Text>
                  <Text style={[styles.stateVal, { color: '#F59E0B' }]}>{reserved}</Text>
                </View>
                <View style={styles.stateCol}>
                  <Text style={[styles.stateLabel, { color: colors.danger }]}>Damaged</Text>
                  <Text style={[styles.stateVal, { color: colors.danger }]}>{damaged}</Text>
                </View>
                <View style={styles.stateCol}>
                  <Text style={[styles.stateLabel, { color: colors.primary, fontWeight: '800' }]}>Available</Text>
                  <Text style={[styles.stateVal, { color: colors.primary, fontWeight: '900' }]}>{available}</Text>
                </View>
                <View style={styles.stateCol}>
                  <Text style={[styles.stateLabel, { color: colors.textMuted }]}>Sold</Text>
                  <Text style={[styles.stateVal, { color: colors.textPrimary }]}>{sold}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="No Products in Inventory"
            description="Add products to your store to track 5-state stock levels."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lowStockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  lowStockBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  formulaBanner: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formulaText: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  invCard: {
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prodThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '700',
  },
  prodSku: {
    fontSize: 11,
    marginTop: 2,
  },
  prodPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  adjustBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateCol: {
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  stateVal: {
    fontSize: 15,
    fontWeight: '800',
  },
});
