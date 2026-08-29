import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Sparkles,
  Store,
  ArrowRight,
  TrendingUp,
  Package,
} from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const StoreApprovedScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 24) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <View style={[styles.iconBox, { backgroundColor: isDark ? '#132822' : '#E3FDF5' }]}>
          <Text style={{ fontSize: 44 }}>🎉</Text>
        </View>

        <Badge label="VERIFIED & ACTIVE" variant="success" size="md" style={{ marginBottom: 12 }} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Your Sevazo Store is Live!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Congratulations! Your business application has been approved. Your storefront is now visible to nearby customers.
        </Text>

        {/* Store Summary Card */}
        <View style={[styles.storeSummaryCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.storeHeaderRow}>
            <View style={[styles.storeIconBox, { backgroundColor: colors.primaryLight }]}>
              <Store size={22} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.storeName, { color: colors.textPrimary }]}>{vendor?.storeName || vendor?.displayName || 'My Store'}</Text>
              <Text style={[styles.storeCategory, { color: colors.textSecondary }]}>{vendor?.businessCategory || 'Active Outlet'}</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>OPEN</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <TrendingUp size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>10-Min Hyperlocal Orders</Text>
            </View>
            <View style={styles.featureItem}>
              <Package size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>Automated Rider Dispatch</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Button
          title="Open Vendor Dashboard"
          onPress={() => navigation.replace('Main')}
          icon={<ArrowRight size={18} color="#FFF" />}
          fullWidth
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, alignItems: 'center' },
  iconBox: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  storeSummaryCard: { width: '100%', padding: 18, borderRadius: BorderRadius.xl, borderWidth: 1 },
  storeHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  storeIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  storeName: { fontSize: 16, fontWeight: '800' },
  storeCategory: { fontSize: 12, marginTop: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  liveText: { color: '#047857', fontSize: 11, fontWeight: '800' },
  divider: { height: 1, marginVertical: 14 },
  featureGrid: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, fontWeight: '600' },
});
