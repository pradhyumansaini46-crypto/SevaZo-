import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { customerApi } from '../../services/customerApi';
import { Category } from '../../types';
import { ChevronRight, Grid } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await customerApi.getCategories();
    setCategories(data);
    if (data.length > 0) {
      setSelectedCategory(data[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="All Categories"
        subtitle="Browse fresh items by category"
        showSearch
        onPressSearch={() => navigation.navigate('Search')}
      />

      <View style={styles.layout}>
        {/* Left Sidebar of Categories */}
        <ScrollView
          style={styles.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarContent}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.sidebarItem,
                  isSelected && styles.sidebarItemSelected,
                ]}
              >
                <View
                  style={[
                    styles.sidebarIconBox,
                    isSelected && { borderColor: Colors.primary, borderWidth: 1.5 },
                  ]}
                >
                  <Image
                    source={{ uri: cat.imageUrl || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=150' }}
                    style={styles.sidebarImage}
                    resizeMode="cover"
                  />
                </View>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.sidebarItemText,
                    isSelected && styles.sidebarItemTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
                {isSelected ? <View style={styles.activeBar} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Detail Pane */}
        <ScrollView
          style={styles.detailPane}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailContent}
        >
          {selectedCategory ? (
            <>
              {/* Category Banner Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('SearchResults', {
                    categoryId: selectedCategory.id,
                    categoryName: selectedCategory.name,
                  })
                }
                style={styles.categoryBanner}
              >
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.categoryBannerTitle}>
                    Explore All {selectedCategory.name}
                  </Text>
                  <Text style={styles.categoryBannerCount}>
                    {selectedCategory.itemCount || 50}+ items available
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.primary} />
              </TouchableOpacity>

              {/* Subcategories Grid */}
              <Text style={styles.subcategoriesTitle}>Subcategories</Text>
              <View style={styles.subGrid}>
                {selectedCategory.subcategories?.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('SearchResults', {
                        categoryId: selectedCategory.id,
                        categoryName: `${selectedCategory.name} - ${sub.name}`,
                      })
                    }
                    style={styles.subCard}
                  >
                    <View style={styles.subIconBox}>
                      <Grid size={24} color={Colors.primary} />
                    </View>
                    <Text numberOfLines={2} style={styles.subName}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 96,
    backgroundColor: Colors.surfaceElevated,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sidebarContent: {
    paddingVertical: Spacing.sm,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: 6,
    position: 'relative',
  },
  sidebarItemSelected: {
    backgroundColor: Colors.surface,
  },
  sidebarIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginBottom: 4,
  },
  sidebarImage: {
    width: '100%',
    height: '100%',
  },
  sidebarItemText: {
    ...Typography.bodySmall,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
  sidebarItemTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  detailPane: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailContent: {
    padding: Spacing.md,
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bannerTextWrap: {
    flex: 1,
  },
  categoryBannerTitle: {
    ...Typography.titleSmall,
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  categoryBannerCount: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginTop: 2,
  },
  subcategoriesTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subCard: {
    width: (width - 96 - Spacing.md * 3) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  subIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  subName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
