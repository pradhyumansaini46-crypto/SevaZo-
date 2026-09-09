import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { Colors, Typography, Shadows } from '../../theme';
import { ShoppingBag, ArrowRight, Sparkles, Plus, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FREE_DELIVERY_THRESHOLD = 250;

// Quick basket completer items with enterprise Product shape
const BASKET_COMPLETERS: Partial<Product>[] = [
  {
    id: 'comp-bread',
    name: 'Harvest Gold White Bread',
    price: 35,
    compareAtPrice: 40,
    unit: '400 g',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'],
    storeId: 'store-1',
    storeName: 'SevaZo Supermart Express',
    stock: 50,
  },
  {
    id: 'comp-milk',
    name: 'Amul Taaza Toned Milk',
    price: 28,
    compareAtPrice: 30,
    unit: '500 ml',
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200'],
    storeId: 'store-1',
    storeName: 'SevaZo Supermart Express',
    stock: 100,
  },
  {
    id: 'comp-mint',
    name: 'Fresh Mint Leaves (Pudina)',
    price: 15,
    compareAtPrice: 20,
    unit: '100 g',
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200'],
    storeId: 'store-1',
    storeName: 'SevaZo Supermart Express',
    stock: 40,
  },
];

interface SmartCartBarProps {
  bottomOffset?: number;
}

export const SmartCartBar: React.FC<SmartCartBarProps> = ({ bottomOffset }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { getTotalCount, getCalculation, addItem } = useCartStore();

  const totalCount = getTotalCount();
  const calculation = getCalculation();

  const slideAnim = useRef(new Animated.Value(totalCount > 0 ? 1 : 0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(totalCount);

  useEffect(() => {
    if (totalCount > 0) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        tension: 65,
        friction: 10,
      }).start();

      if (totalCount !== prevCount.current) {
        // Micro-interaction bounce on item addition
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.08,
            duration: 120,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
    prevCount.current = totalCount;
  }, [totalCount]);

  if (totalCount === 0) {
    return null;
  }

  const itemsTotal = calculation.itemsTotal;
  const distanceAway = Math.max(0, FREE_DELIVERY_THRESHOLD - itemsTotal);
  const isFreeDeliveryUnlocked = distanceAway === 0;

  const defaultBottom = (bottomOffset !== undefined)
    ? bottomOffset
    : 64 + (insets.bottom > 0 ? insets.bottom : 8);

  const handleAddCompleter = (item: Partial<Product>) => {
    addItem(item as Product);
  };

  const handleCompleteBasket = () => {
    // Find item(s) that help cover the remaining distance
    const candidate = BASKET_COMPLETERS.find((c) => (c.price || 0) <= distanceAway + 20) || BASKET_COMPLETERS[0];
    if (candidate) {
      addItem(candidate as Product);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: defaultBottom,
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
            { scale: bounceAnim },
          ],
        },
      ]}
    >
      <View style={styles.cardContainer}>
        {/* Section 31: Smart Basket Milestone Strip */}
        <View
          style={[
            styles.thresholdStrip,
            isFreeDeliveryUnlocked ? styles.thresholdUnlockedStrip : styles.thresholdActiveStrip,
          ]}
        >
          {isFreeDeliveryUnlocked ? (
            <View style={styles.thresholdRow}>
              <Sparkles size={14} color="#059669" />
              <Text style={styles.thresholdUnlockedText}>
                🎉 You have unlocked <Text style={styles.boldText}>FREE Delivery</Text>!
              </Text>
            </View>
          ) : (
            <View style={styles.thresholdIncompleteContainer}>
              <View style={styles.thresholdHeaderRow}>
                <Text style={styles.thresholdDistanceText}>
                  Add <Text style={styles.boldText}>₹{distanceAway}</Text> for FREE delivery
                </Text>
                <TouchableOpacity
                  style={styles.completeBasketBtn}
                  onPress={handleCompleteBasket}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completeBasketBtnText}>+ Complete Basket</Text>
                </TouchableOpacity>
              </View>

              {/* Quick suggestion add pills */}
              <View style={styles.suggestionRow}>
                {BASKET_COMPLETERS.slice(0, 2).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionChip}
                    onPress={() => handleAddCompleter(item)}
                    activeOpacity={0.7}
                  >
                    <Plus size={11} color={Colors.primary} />
                    <Text style={styles.suggestionChipText} numberOfLines={1}>
                      {item.name?.split(' ')[0]} ₹{item.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Section 16: Floating Smart Cart Bar */}
        <TouchableOpacity
          style={styles.mainCartBar}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.leftContent}>
            <View style={styles.iconBadgeWrap}>
              <View style={styles.iconCircle}>
                <ShoppingBag size={18} color={Colors.surface} />
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{totalCount}</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>₹{calculation.grandTotal}</Text>
                {calculation.savingsTotal > 0 && (
                  <View style={styles.savingsTag}>
                    <Text style={styles.savingsTagText}>
                      Save ₹{calculation.savingsTotal}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemsSubtext}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'} in cart
              </Text>
            </View>
          </View>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>View Cart</Text>
            <ArrowRight size={16} color={Colors.surface} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 999,
  },
  cardContainer: {
    borderRadius: 20,
    backgroundColor: '#0F172A', // Premium dark contrast pill
    overflow: 'hidden',
    ...Shadows.elevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  thresholdStrip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  thresholdActiveStrip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  thresholdUnlockedStrip: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.25)',
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  thresholdUnlockedText: {
    ...Typography.caption,
    color: '#34D399',
    fontWeight: '600',
    fontSize: 12,
  },
  thresholdIncompleteContainer: {
    gap: 5,
  },
  thresholdHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdDistanceText: {
    ...Typography.caption,
    color: '#E2E8F0',
    fontSize: 11.5,
  },
  boldText: {
    fontWeight: '800',
    color: '#F97316',
  },
  completeBasketBtn: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  completeBasketBtnText: {
    ...Typography.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FB923C',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    gap: 3,
  },
  suggestionChipText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  mainCartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadgeWrap: {
    position: 'relative',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: '#059669',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  countPillText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    ...Typography.titleMedium,
    color: Colors.surface,
    fontSize: 17,
    fontWeight: '800',
  },
  savingsTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsTagText: {
    ...Typography.caption,
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  itemsSubtext: {
    ...Typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
  },
  ctaButtonText: {
    ...Typography.bodyMedium,
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
});
