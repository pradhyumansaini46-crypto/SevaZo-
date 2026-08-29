import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Star } from 'lucide-react-native';

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating';
}

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const priceRanges = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: 'Under ₹50', min: 0, max: 50 },
    { label: '₹50 - ₹150', min: 50, max: 150 },
    { label: '₹150 - ₹300', min: 150, max: 300 },
    { label: '₹300+', min: 300, max: 9999 },
  ];

  const sortOptions = [
    { label: 'Popularity', value: 'popular' as const },
    { label: 'Price: Low to High', value: 'price_asc' as const },
    { label: 'Price: High to Low', value: 'price_desc' as const },
    { label: 'Customer Rating', value: 'rating' as const },
  ];

  const ratingOptions = [
    { label: 'Any Rating', value: undefined },
    { label: '4.0★ & Above', value: 4.0 },
    { label: '4.5★ & Above', value: 4.5 },
  ];

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: FilterState = {
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStockOnly: false,
      sortBy: 'popular',
    };
    setLocalFilters(empty);
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Filter & Sort Products"
      maxHeightPercent={85}
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Reset All"
            onPress={handleReset}
            variant="outline"
            size="md"
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <Button
            title="Apply Filters"
            onPress={handleApply}
            variant="primary"
            size="md"
            style={{ flex: 1.5 }}
          />
        </View>
      }
    >
      {/* Sort Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.optionsWrap}>
          {sortOptions.map((opt) => {
            const isSelected = (localFilters.sortBy || 'popular') === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.8}
                onPress={() => setLocalFilters({ ...localFilters, sortBy: opt.value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text
                  style={[styles.pillText, isSelected && styles.pillTextSelected]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Price Range Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.optionsWrap}>
          {priceRanges.map((range, idx) => {
            const isSelected =
              localFilters.minPrice === range.min && localFilters.maxPrice === range.max;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() =>
                  setLocalFilters({
                    ...localFilters,
                    minPrice: range.min,
                    maxPrice: range.max,
                  })
                }
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text
                  style={[styles.pillText, isSelected && styles.pillTextSelected]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Customer Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating</Text>
        <View style={styles.optionsWrap}>
          {ratingOptions.map((opt, idx) => {
            const isSelected = localFilters.minRating === opt.value;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => setLocalFilters({ ...localFilters, minRating: opt.value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                {opt.value ? (
                  <Star size={14} color={isSelected ? Colors.textInverse : Colors.starGold} fill={Colors.starGold} style={{ marginRight: 4 }} />
                ) : null}
                <Text
                  style={[styles.pillText, isSelected && styles.pillTextSelected]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* In-Stock Only Switch */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchTitle}>In-Stock Items Only</Text>
          <Text style={styles.switchSubtitle}>Hide products that are currently sold out</Text>
        </View>
        <Switch
          value={!!localFilters.inStockOnly}
          onValueChange={(val) => setLocalFilters({ ...localFilters, inStockOnly: val })}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.surface}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm + 2,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pillTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  switchTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
