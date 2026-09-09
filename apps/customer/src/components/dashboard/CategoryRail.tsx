import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Category } from '../../types';
import { MoreHorizontal } from 'lucide-react-native';
import { triggerHaptic } from '../../utils/haptics';

interface CategoryRailProps {
  categories?: Category[];
  selectedCategoryId?: string | null;
  onSelectCategory: (category: Category) => void;
  onPressMore?: () => void;
  onSeeAll?: () => void;
  userPersona?: 'GROCERY' | 'FOOD' | 'GENERAL';
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-grocery', name: 'Groceries', icon: '🥦', slug: 'groceries' },
  { id: 'cat-food', name: 'Food & Meals', icon: '🍕', slug: 'food' },
  { id: 'cat-pharmacy', name: 'Pharmacy', icon: '💊', slug: 'pharmacy' },
  { id: 'cat-fashion', name: 'Fashion', icon: '👕', slug: 'fashion' },
  { id: 'cat-beauty', name: 'Beauty', icon: '💄', slug: 'beauty' },
  { id: 'cat-electronics', name: 'Electronics', icon: '📱', slug: 'electronics' },
  { id: 'cat-home', name: 'Home Living', icon: '🏠', slug: 'home-living' },
];

export const CategoryRail: React.FC<CategoryRailProps> = ({
  categories = FALLBACK_CATEGORIES,
  selectedCategoryId,
  onSelectCategory,
  onPressMore,
  onSeeAll,
  userPersona = 'GROCERY',
}) => {
  // Sort categories according to customer persona preference
  const prioritizedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const cloned = [...categories];
    if (userPersona === 'GROCERY') {
      // Prioritize Grocery, Fresh, Household
      const priorityOrder = ['cat-grocery', 'cat-fresh', 'cat-food', 'cat-pharmacy'];
      cloned.sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    } else if (userPersona === 'FOOD') {
      // Prioritize Food, Bakery, Grocery
      const priorityOrder = ['cat-food', 'cat-grocery', 'cat-fresh', 'cat-pharmacy'];
      cloned.sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }

    // Show top 7 categories + "More"
    return cloned.slice(0, 7);
  }, [categories, userPersona]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Shop by category</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('selection');
            (onSeeAll || onPressMore)?.();
          }}
        >
          <Text style={styles.viewAllText}>All Categories</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {prioritizedCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.82}
              onPress={() => {
                triggerHaptic('selection');
                onSelectCategory(cat);
              }}
              style={styles.categoryItem}
            >
              <View
                style={[
                  styles.iconBox,
                  isSelected && styles.iconBoxSelected,
                ]}
              >
                <Text style={styles.emojiText}>{cat.icon || '🛍️'}</Text>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
              >
                {cat.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Dedicated "More" Tab */}
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            triggerHaptic('selection');
            (onSeeAll || onPressMore)?.();
          }}
          style={styles.categoryItem}
        >
          <View style={[styles.iconBox, styles.moreBox]}>
            <MoreHorizontal size={22} color={Colors.primary} />
          </View>
          <Text style={styles.categoryName}>More</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  viewAllText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  railContent: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 62,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    ...Shadows.small,
  },
  iconBoxSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
  },
  moreBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  emojiText: {
    fontSize: 24,
  },
  categoryName: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
