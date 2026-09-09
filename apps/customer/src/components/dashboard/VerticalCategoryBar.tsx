import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Category } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface VerticalCategoryBarProps {
  categories: Category[];
  selectedCategoryId?: string | null;
  onSelectCategory: (category: Category) => void;
  onSeeAll?: () => void;
}

export const VerticalCategoryBar: React.FC<VerticalCategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSeeAll,
}) => {
  const handleSelect = (category: Category) => {
    triggerHaptic('selection');
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Shop by Category</Text>
        </View>
        {onSeeAll ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(cat)}
              style={[
                styles.categoryCard,
                isSelected && styles.selectedCategoryCard,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.selectedIconCircle,
                ]}
              >
                {cat.icon ? (
                  <Text style={styles.emojiIcon}>{cat.icon}</Text>
                ) : (
                  <Image
                    source={{ uri: cat.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100' }}
                    style={styles.categoryImg}
                    resizeMode="cover"
                  />
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.categoryName,
                  isSelected && styles.selectedCategoryName,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  categoryCard: {
    alignItems: 'center',
    width: 68,
    marginRight: Spacing.sm,
  },
  selectedCategoryCard: {
    transform: [{ scale: 1.05 }],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  selectedIconCircle: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
  },
  emojiIcon: {
    fontSize: 26,
  },
  categoryImg: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
  },
  categoryName: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'none',
  },
  selectedCategoryName: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
