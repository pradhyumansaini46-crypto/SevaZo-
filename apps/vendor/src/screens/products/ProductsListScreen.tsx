import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Plus, Search, Layers, Edit3, Image as ImageIcon, AlertTriangle } from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';
import { VendorApi } from '../../services/vendorApi';
import { useThemeStore } from '../../stores/themeStore';

export const ProductsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: 'ALL', label: 'All Catalog' },
    { key: 'cat-fruits', label: '🍎 Fresh Fruits' },
    { key: 'cat-dairy', label: '🥛 Dairy & Eggs' },
    { key: 'cat-bakery', label: '🍞 Bakery' },
    { key: 'cat-pantry', label: '🫒 Oils & Pantry' },
  ];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await VendorApi.getProducts({ search });
      setProducts(res.items);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
      return false;
    }
    return true;
  });

  const renderProductItem = ({ item }: { item: Product }) => {
    const isLow = item.stock > 0 && item.stock <= 5;
    const isOut = item.stock <= 0;
    const primaryImg = item.images?.[0]?.url;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.cardTop}>
          {primaryImg ? (
            <Image source={{ uri: primaryImg }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImg, { backgroundColor: colors.borderLight }]}>
              <ImageIcon size={24} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.meta}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.sku, { color: colors.textMuted }]}>SKU: {item.sku}</Text>
            {item.unit ? <Text style={[styles.unit, { color: colors.textSecondary }]}>{item.unit}</Text> : null}
            <View style={styles.pricingRow}>
              <Text style={[styles.price, { color: colors.textPrimary }]}>₹{item.price}</Text>
              {item.compareAtPrice && item.compareAtPrice > item.price ? (
                <Text style={[styles.comparePrice, { color: colors.textMuted }]}>₹{item.compareAtPrice}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.badgeCol}>
            {isOut ? (
              <Badge label="Out of Stock" variant="danger" />
            ) : isLow ? (
              <Badge label={`Low (${item.stock})`} variant="warning" />
            ) : (
              <Badge label={`${item.stock} in Stock`} variant="success" />
            )}
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductVariants', { productId: item.id })}
            style={styles.actionBtn}
          >
            <Layers size={15} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              Variants ({item.variants?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ProductImages', { productId: item.id })}
            style={styles.actionBtn}
          >
            <ImageIcon size={15} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Images ({item.images?.length || 0})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
            style={[styles.actionBtn, { backgroundColor: colors.primaryLight, borderRadius: BorderRadius.sm }]}
          >
            <Edit3 size={15} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary, fontWeight: '700' }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Products & Catalog"
        subtitle={`${products.length} active inventory items`}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProduct')}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <Input
          placeholder="Search by product name or SKU..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={18} color={colors.textSecondary} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Category Pills */}
      <View style={[styles.categoryScroll, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.key;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.key)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.borderLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    {
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
        ListEmptyComponent={
          <EmptyState
            icon="🛍️"
            title="No Products Found"
            description="Add your first item to make it visible to customers on Sevazo."
            actionTitle="Add New Product"
            onAction={() => navigation.navigate('AddProduct')}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoryScroll: {
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginHorizontal: 4,
  },
  categoryLabel: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  placeholderImg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  sku: {
    fontSize: 12,
    marginTop: 2,
  },
  unit: {
    fontSize: 12,
    marginTop: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  comparePrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 5,
  },
});
