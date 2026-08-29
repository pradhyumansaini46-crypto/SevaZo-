import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AlertTriangle, Plus, Check } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Product } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const LowStockScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLowStock = async () => {
    setLoading(true);
    try {
      const res = await VendorApi.getInventory({ lowStockOnly: true });
      setLowStockItems(res.products.filter((p) => p.stock <= 5));
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStock();
  }, []);

  const handleQuickRestock = async (product: Product) => {
    const addQty = 20;
    const nextStock = product.stock + addQty;

    setLowStockItems(
      lowStockItems.map((p) => (p.id === product.id ? { ...p, stock: nextStock } : p))
    );

    await VendorApi.adjustStock({
      productId: product.id,
      changeQty: addQty,
      reason: 'RESTOCK',
      notes: '1-tap quick restock from Low Stock Alert Screen',
    });

    Alert.alert('Restocked!', `Added +20 units to ${product.name}. Current stock: ${nextStock}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Low Stock Alerts"
        subtitle="Items reaching critical inventory threshold"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.alertBanner}>
        <AlertTriangle size={20} color="#B45309" />
        <Text style={styles.alertBannerText}>
          Products with 5 or fewer items remaining will trigger customer out-of-stock warnings.
        </Text>
      </View>

      <FlatList
        data={lowStockItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sku}>SKU: {item.sku} • ₹{item.price}</Text>
              <View style={{ marginTop: 6 }}>
                {item.stock <= 0 ? (
                  <Badge label="OUT OF STOCK (0)" variant="danger" size="sm" dot />
                ) : (
                  <Badge
                    label={`CRITICAL (${item.stock} left)`}
                    variant="warning"
                    size="sm"
                    dot
                  />
                )}
              </View>
            </View>

            <Button
              title="+20 Units"
              size="sm"
              variant="primary"
              fullWidth={false}
              onPress={() => handleQuickRestock(item)}
              leftIcon={<Plus size={14} color="#FFFFFF" />}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 14,
    margin: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertBannerText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  meta: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sku: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
