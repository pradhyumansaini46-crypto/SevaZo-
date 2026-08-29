import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import {
  MapPin,
  ChevronDown,
  Search,
  Bell,
  Heart,
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLocation?: boolean;
  locationAddress?: string;
  onPressLocation?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  showSearch?: boolean;
  onPressSearch?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onPressNotifications?: () => void;
  showWishlist?: boolean;
  wishlistCount?: number;
  onPressWishlist?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLocation = false,
  locationAddress = 'Home - Indiranagar, Bengaluru',
  onPressLocation,
  showBack = false,
  onPressBack,
  showSearch = false,
  onPressSearch,
  showNotifications = false,
  notificationCount = 0,
  onPressNotifications,
  showWishlist = false,
  wishlistCount = 0,
  onPressWishlist,
  rightAction,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + 4 : Spacing.md;

  return (
    <View style={[styles.container, { paddingTop: topPadding }, style]}>
      <View style={styles.contentRow}>
        {/* Left Side: Back Button or Location */}
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressBack}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        {showLocation ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressLocation}
            style={styles.locationContainer}
          >
            <View style={styles.locationIconWrap}>
              <MapPin size={16} color={Colors.primary} />
            </View>
            <View style={styles.locationTextWrap}>
              <View style={styles.locationTitleRow}>
                <Text style={styles.locationTitle}>Delivering to</Text>
                <ChevronDown size={14} color={Colors.textSecondary} style={{ marginLeft: 2 }} />
              </View>
              <Text numberOfLines={1} style={styles.locationAddress}>
                {locationAddress}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.titleContainer}>
            {title ? <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text> : null}
            {subtitle ? <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        )}

        {/* Right Side Action Icons */}
        <View style={styles.actionsRow}>
          {showSearch ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressSearch}
              style={styles.iconBtn}
            >
              <Search size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : null}

          {showWishlist ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressWishlist}
              style={styles.iconBtn}
            >
              <Heart size={20} color={Colors.textPrimary} />
              {wishlistCount > 0 ? (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}

          {showNotifications ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressNotifications}
              style={styles.iconBtn}
            >
              <Bell size={20} color={Colors.textPrimary} />
              {notificationCount > 0 ? (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}

          {rightAction ? rightAction : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 4,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  locationAddress: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: Spacing.xs + 2,
    marginLeft: Spacing.xs,
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textInverse,
  },
});
