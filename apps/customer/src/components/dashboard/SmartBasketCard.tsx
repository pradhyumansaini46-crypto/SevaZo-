import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Sparkles, Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { useCartStore } from '../../stores/cartStore';
import { triggerHaptic } from '../../utils/haptics';

interface SmartBasketCardProps {
  onAddedAll?: () => void;
}

export const SmartBasketCard: React.FC<SmartBasketCardProps> = ({ onAddedAll }) => {
  const { addItem } = useCartStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [allAdded, setAllAdded] = useState(false);

  const smartBasketItems = [
    {
      id: 'sb-jam',
      name: 'Kissan Mixed Fruit Jam',
      unit: '500 g Glass Jar',
      price: 120,
      emoji: '🍓',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=150',
    },
    {
      id: 'sb-coffee',
      name: 'Nescafe Classic Instant Coffee',
      unit: '50 g Pouch',
      price: 220,
      emoji: '☕',
      image: 'https://pngimg.com/d/coffee_beans_PNG9273.png',
    },
    {
      id: 'sb-cheese',
      name: 'Amul Processed Cheese Slices',
      unit: '200 g (10 Slices)',
      price: 180,
      emoji: '🧀',
      image: 'https://pngimg.com/d/cheese_PNG25301.png',
    },
  ];

  const totalBundlePrice = smartBasketItems.reduce((sum, item) => sum + item.price, 0);

  const handleAddSingle = (item: typeof smartBasketItems[0]) => {
    triggerHaptic('light');
    addItem({
      id: item.id,
      name: item.name,
      slug: item.id,
      description: item.name,
      categoryId: 'cat-grocery',
      vendorId: 'store-1',
      price: item.price,
      stock: 50,
      unit: item.unit,
      rating: 4.8,
      reviewsCount: 300,
      images: [item.image],
      tags: ['Breakfast', 'Smart Basket'],
      inStock: true,
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleAddAll = () => {
    triggerHaptic('success');
    smartBasketItems.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        slug: item.id,
        description: item.name,
        categoryId: 'cat-grocery',
        vendorId: 'store-1',
        price: item.price,
        stock: 50,
        unit: item.unit,
        rating: 4.8,
        reviewsCount: 300,
        images: [item.image],
        tags: ['Breakfast', 'Smart Basket'],
        inStock: true,
      });
    });

    const newMap: Record<string, boolean> = {};
    smartBasketItems.forEach((i) => (newMap[i.id] = true));
    setAddedIds(newMap);
    setAllAdded(true);
    onAddedAll?.();
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <View style={styles.badgePill}>
          <Sparkles size={12} color="#4338CA" />
          <Text style={styles.badgeText}>SMART BASKET</Text>
        </View>
        <Text style={styles.title}>Complete your breakfast basket</Text>
        <Text style={styles.subtitle}>Frequently paired with items in your cart</Text>
      </View>

      {/* Item Rows */}
      <View style={styles.itemsContainer}>
        {smartBasketItems.map((item) => {
          const isAdded = addedIds[item.id];

          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemThumb}>
                <Text style={styles.emojiThumb}>{item.emoji}</Text>
              </View>

              <View style={styles.itemDetailsCol}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
              </View>

              <View style={styles.priceActionCol}>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleAddSingle(item)}
                  disabled={isAdded}
                  style={[styles.addSingleBtn, isAdded && styles.addSingleBtnActive]}
                >
                  {isAdded ? (
                    <Check size={14} color={Colors.primary} strokeWidth={3} />
                  ) : (
                    <Plus size={14} color={Colors.primary} strokeWidth={2.8} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Batch Add All CTA Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleAddAll}
        disabled={allAdded}
        style={[styles.addAllButton, allAdded && styles.addAllButtonActive]}
      >
        <View style={styles.addAllLeft}>
          <ShoppingBag size={16} color={allAdded ? Colors.primary : Colors.textInverse} />
          <Text style={[styles.addAllText, allAdded && styles.addAllTextActive]}>
            {allAdded ? 'All 3 items added to basket!' : `Add all 3 — ₹${totalBundlePrice}`}
          </Text>
        </View>
        {!allAdded ? <ArrowRight size={16} color={Colors.textInverse} /> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.card,
  },
  headerRow: {
    marginBottom: Spacing.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '900',
    color: '#4338CA',
    marginLeft: 3,
  },
  title: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  subtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 1,
  },
  itemsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemThumb: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  emojiThumb: {
    fontSize: 20,
  },
  itemDetailsCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemUnit: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
    textTransform: 'none',
  },
  priceActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    ...Typography.priceSmall,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  addSingleBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSingleBtnActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4F46E5',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  addAllButtonActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  addAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAllText: {
    ...Typography.titleSmall,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverse,
    marginLeft: Spacing.sm,
  },
  addAllTextActive: {
    color: '#065F46',
  },
});
