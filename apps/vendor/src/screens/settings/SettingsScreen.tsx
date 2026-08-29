import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Store,
  Clock,
  Landmark,
  Volume2,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Check,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { useThemeStore } from '../../stores/themeStore';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, logout } = useAuthStore();
  const { isAlertSoundEnabled, toggleAlertSound } = useOrderStore();
  const { themeMode, setTheme } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your merchant store?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Store & Settings"
        subtitle="Operations, themes, payouts & account"
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Merchant Summary Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primaryDark }]}>
              {vendor?.storeName?.charAt(0) || 'S'}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{vendor?.storeName || 'Fresh Mart'}</Text>
            <Text style={[styles.profileOwner, { color: colors.textSecondary }]}>{vendor?.ownerName || 'Vikram Mehta'} • {vendor?.phone || '+91 98765 43210'}</Text>
            <Text style={[styles.profileRating, { color: colors.primary }]}>★ {vendor?.rating || '4.85'} Merchant Rating</Text>
          </View>
        </View>

        {/* Theme Appearance Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>🎨 Visual Theme & Appearance</Text>
          <View style={styles.themeGrid}>
            {/* Default Pastel Palette #E3FDF5 -> #FFE6FA */}
            <TouchableOpacity
              onPress={() => setTheme('LIGHT')}
              style={[
                styles.themeCard,
                { backgroundColor: '#FFFFFF', borderColor: themeMode === 'LIGHT' ? colors.primary : colors.borderLight },
                themeMode === 'LIGHT' && styles.themeCardActive,
              ]}
            >
              <View style={[styles.palettePreview, { backgroundColor: '#E3FDF5', borderColor: '#A7F3D0' }]}>
                <View style={[styles.paletteAccent, { backgroundColor: '#FFE6FA' }]} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.themeTitle, { color: '#0F172A' }]}>Default Theme</Text>
                <Text style={[styles.themeDesc, { color: '#334155' }]}>#E3FDF5 → #FFE6FA pastel</Text>
              </View>
              {themeMode === 'LIGHT' && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Crystal-Clear High-Contrast Dark Mode */}
            <TouchableOpacity
              onPress={() => setTheme('DARK')}
              style={[
                styles.themeCard,
                { backgroundColor: '#131B2A', borderColor: themeMode === 'DARK' ? '#10B981' : '#334155' },
                themeMode === 'DARK' && styles.themeCardActive,
              ]}
            >
              <View style={[styles.palettePreview, { backgroundColor: '#090D16', borderColor: '#334155' }]}>
                <View style={[styles.paletteAccent, { backgroundColor: '#10B981' }]} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.themeTitle, { color: '#FFFFFF' }]}>Dark Theme</Text>
                <Text style={[styles.themeDesc, { color: '#E2E8F0' }]}>Crystal-Clear High Contrast</Text>
              </View>
              {themeMode === 'DARK' && (
                <View style={[styles.checkCircle, { backgroundColor: '#10B981' }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Management Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>🏪 Store Management</Text>
          <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('StoreProfile')}
              style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            >
              <View style={styles.menuLeft}>
                <Store size={18} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Store Profile & Branding</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('StoreHours')}
              style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            >
              <View style={styles.menuLeft}>
                <Clock size={18} color={colors.secondary} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Store Hours & Schedule</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('StoreStatus')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Shield size={18} color={colors.info} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Store Status & Prep Buffer</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Finance & Payouts */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>💳 Finance & Banking</Text>
          <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Revenue')}
              style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            >
              <View style={styles.menuLeft}>
                <Landmark size={18} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Gross Revenue & 10% Commission</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Settlements')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Sparkles size={18} color={colors.accentPurple} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Bank Settlements & NEFT Statements</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>⚙️ Preferences & Sound Alerts</Text>
          <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Volume2 size={18} color={colors.primary} />
                <View>
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Loud Order Audio Alert</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Play ringing chime on incoming order</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor={isAlertSoundEnabled ? '#FFFFFF' : '#94A3B8'}
                onValueChange={toggleAlertSound}
                value={isAlertSoundEnabled}
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>💬 Merchant Assistance</Text>
          <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Support')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <HelpCircle size={18} color={colors.secondary} />
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Merchant Helpdesk & Partner Hotline</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: isDark ? '#450A0A' : '#FEE2E2', borderColor: isDark ? '#991B1B' : '#FECDD3' }]}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out of Merchant Store</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 20,
    ...Shadows.card,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileMeta: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileOwner: {
    fontSize: 12,
    marginTop: 2,
  },
  profileRating: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  themeGrid: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    ...Shadows.subtle,
  },
  themeCardActive: {
    borderWidth: 2,
  },
  palettePreview: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  paletteAccent: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGroup: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  menuSub: {
    fontSize: 11,
    marginLeft: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
