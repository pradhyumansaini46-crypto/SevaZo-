import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Shadows } from '../../theme';
import { Plus, Minus } from 'lucide-react-native';
import { triggerHaptic } from '../../utils/haptics';
import { Product } from '../../types';

const { width } = Dimensions.get('window');

export interface QuadColumnItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rawProduct: Product;
}

export interface QuadColumnCardProps {
  title: string;
  subtitle?: string;
  tagline?: string;
  seeAllText?: string;
  theme: {
    cardBg: string;
    headerTextColor: string;
    footerBg: string;
    footerTextColor: string;
    borderColor?: string;
    accentLineColor?: string;
  };
  headerBadge?: {
    icon?: React.ReactNode;
    text: string;
    bg?: string;
    textColor?: string;
  };
  headerIllustration?: React.ReactNode;
  headerImage?: any;
  floatingChip?: {
    text: string;
    bg?: string;
    textColor?: string;
  };
  items: QuadColumnItem[];
  onPressSeeAll: () => void;
  onPressItem: (item: QuadColumnItem) => void;
  onAddToCart: (item: QuadColumnItem) => void;
  onIncrement: (item: QuadColumnItem) => void;
  onDecrement: (item: QuadColumnItem) => void;
  getItemQuantity: (id: string) => number;
  cardWidth?: number;
  style?: any;
}

export const BlinkitQuadColumnCard: React.FC<QuadColumnCardProps> = ({
  title,
  subtitle,
  tagline,
  seeAllText = 'See all >>',
  theme,
  headerBadge,
  headerIllustration,
  headerImage,
  floatingChip,
  items,
  onPressSeeAll,
  onPressItem,
  onAddToCart,
  onIncrement,
  onDecrement,
  getItemQuantity,
  cardWidth = Math.min(340, width * 0.86),
  style,
}) => {
  return (
    <View
      style={[
        styles.cardContainer,
        {
          width: cardWidth,
          backgroundColor: theme.cardBg,
          borderColor: theme.borderColor || 'rgba(0,0,0,0.08)',
        },
        style,
      ]}
    >
      {/* 1. Header Row - Strictly Aligned Height with Rich Elements */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          {/* Top row: badge + optional tagline */}
          <View style={styles.topBadgeRow}>
            {headerBadge ? (
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: headerBadge.bg || '#7C3AED' },
                ]}
              >
                {headerBadge.icon ? (
                  <View style={styles.badgeIconWrap}>{headerBadge.icon}</View>
                ) : null}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.badgeText,
                    { color: headerBadge.textColor || '#FFFFFF' },
                  ]}
                >
                  {headerBadge.text}
                </Text>
              </View>
            ) : (
              <View style={styles.badgePillPlaceholder} />
            )}

            {tagline ? (
              <View style={styles.taglinePill}>
                <Text style={[styles.taglineText, { color: theme.headerTextColor }]}>
                  {tagline}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Single-line Bolder and Larger Title */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[styles.headerTitle, { color: theme.headerTextColor }]}
          >
            {title}
          </Text>

          {/* Subtitle / Energy Tagline */}
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.headerSubtitle, { color: theme.headerTextColor }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Top Right Graphic/Illustration Container with floating energetic stickers */}
        <View style={styles.illustrationWrap}>
          {/* Subtle glowing backdrop orb */}
          <View
            style={[
              styles.glowOrb,
              { backgroundColor: theme.accentLineColor || theme.headerTextColor },
            ]}
          />

          {/* Floating sparkle top left */}
          <View style={styles.sparkleDot}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>

          {headerImage ? (
            <Image
              source={typeof headerImage === 'string' ? { uri: headerImage } : headerImage}
              style={styles.header3DImg}
              resizeMode="cover"
            />
          ) : headerIllustration ? (
            headerIllustration
          ) : (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
              }}
              style={styles.defaultHeaderImg}
              resizeMode="contain"
            />
          )}

          {/* Floating energetic badge chip bottom right */}
          {floatingChip ? (
            <View
              style={[
                styles.floatingChipWrap,
                { backgroundColor: floatingChip.bg || '#FF5722' },
              ]}
            >
              <Text
                style={[
                  styles.floatingChipText,
                  { color: floatingChip.textColor || '#FFFFFF' },
                ]}
              >
                {floatingChip.text}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 2. Floating Continuous Accent Line across all 4 sections */}
      <View style={styles.floatingLineContainer}>
        <View
          style={[
            styles.floatingLineTrack,
            { backgroundColor: theme.accentLineColor || theme.headerTextColor },
          ]}
        />
        <View
          style={[
            styles.floatingLineDot,
            { backgroundColor: theme.accentLineColor || theme.headerTextColor },
          ]}
        />
      </View>

      {/* 3. Items List */}
      <View style={styles.itemsList}>
        {items.map((item, index) => {
          const qty = getItemQuantity(item.id);
          const discountPercent =
            item.compareAtPrice && item.compareAtPrice > item.price
              ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
              : 0;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => onPressItem(item)}
              style={[
                styles.itemRow,
                index === items.length - 1 && styles.itemRowLast,
              ]}
            >
              {/* Product Thumbnail with micro discount badge */}
              <View style={styles.imgContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImg}
                  resizeMode="cover"
                />
                {discountPercent > 0 ? (
                  <View
                    style={[
                      styles.productDiscountBadge,
                      { backgroundColor: theme.accentLineColor || '#EF4444' },
                    ]}
                  >
                    <Text style={styles.productDiscountText}>{discountPercent}% OFF</Text>
                  </View>
                ) : (
                  <View style={styles.productHotBadge}>
                    <Text style={styles.productHotText}>HOT</Text>
                  </View>
                )}
              </View>

              {/* Title & Unit */}
              <View style={styles.infoCol}>
                <Text numberOfLines={1} style={styles.productName}>
                  {item.name}
                </Text>
                <View style={styles.productMetaRow}>
                  <Text numberOfLines={1} style={styles.productUnit}>
                    {item.unit}
                  </Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.fastDeliveryTag}>⚡ 10m</Text>
                </View>
              </View>

              {/* ADD Button or Quantity Stepper */}
              <View style={styles.actionCol}>
                {qty > 0 ? (
                  <View style={styles.stepperPill}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        triggerHaptic('light');
                        onDecrement(item);
                      }}
                      style={styles.stepperBtn}
                    >
                      <Minus size={11} color="#2563EB" strokeWidth={3} />
                    </TouchableOpacity>
                    <Text style={styles.stepperVal}>{qty}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        triggerHaptic('light');
                        onIncrement(item);
                      }}
                      style={styles.stepperBtn}
                    >
                      <Plus size={11} color="#2563EB" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      triggerHaptic('medium');
                      onAddToCart(item);
                    }}
                    style={styles.addBtn}
                  >
                    <Text style={styles.addBtnText}>ADD</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Price Column */}
              <View style={styles.priceCol}>
                {item.compareAtPrice && item.compareAtPrice > item.price ? (
                  <Text style={styles.comparePrice}>₹{item.compareAtPrice}</Text>
                ) : (
                  <Text style={styles.saveTag}>BEST</Text>
                )}
                <Text style={styles.sellPrice}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Bottom See All Bar */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          triggerHaptic('light');
          onPressSeeAll();
        }}
        style={[styles.footerBar, { backgroundColor: theme.footerBg }]}
      >
        <Text style={[styles.footerText, { color: theme.footerTextColor }]}>
          {seeAllText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 22,
    borderWidth: 1.4,
    overflow: 'hidden',
    ...Shadows.small,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    height: 106,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  badgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    height: 20,
  },
  badgePillPlaceholder: {
    height: 20,
  },
  badgeIconWrap: {
    marginRight: 3,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  taglinePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    height: 20,
    justifyContent: 'center',
  },
  taglineText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.82,
    letterSpacing: -0.1,
  },
  illustrationWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    opacity: 0.18,
  },
  sparkleDot: {
    position: 'absolute',
    top: -4,
    left: -4,
    zIndex: 5,
    backgroundColor: '#FEF08A',
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...Shadows.small,
  },
  sparkleText: {
    fontSize: 9,
    color: '#CA8A04',
    fontWeight: '900',
  },
  header3DImg: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  defaultHeaderImg: {
    width: '100%',
    height: '100%',
  },
  floatingChipWrap: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Shadows.small,
  },
  floatingChipText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  floatingLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  floatingLineTrack: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    opacity: 0.45,
  },
  floatingLineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 5,
    opacity: 0.9,
  },
  itemsList: {
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  imgContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
    ...Shadows.small,
  },
  productImg: {
    width: '88%',
    height: '88%',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 2,
  },
  productDiscountText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  productHotBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#10B981',
    zIndex: 2,
  },
  productHotText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    paddingRight: 6,
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  productUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#94A3B8',
  },
  fastDeliveryTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  actionCol: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 3,
    ...Shadows.small,
  },
  stepperBtn: {
    padding: 3,
  },
  stepperVal: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#2563EB',
    paddingHorizontal: 5,
  },
  priceCol: {
    minWidth: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  comparePrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
    lineHeight: 14,
  },
  saveTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16A34A',
    lineHeight: 14,
  },
  sellPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 17,
  },
  footerBar: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 2,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

