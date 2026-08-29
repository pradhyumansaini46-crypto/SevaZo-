import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import {
  User,
  Bike,
  FileText,
  CreditCard,
  Sliders,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export const SettingsScreen = ({ navigation }: any) => {
  const { rider, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your partner account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Splash');
        },
      },
    ]);
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Details',
      subtitle: `${rider?.name || 'Rahul Sharma'} • ${rider?.phone || '+91 98765 43210'}`,
      icon: <User size={20} color="#FF6600" />,
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      subtitle: rider?.vehicleType === 'BICYCLE' ? 'Standard Delivery Bicycle' : 'Motorcycle (Hero Splendor+ • RJ 14 AB 1234)',
      icon: <Bike size={20} color="#10B981" />,
    },
    {
      id: 'documents',
      title: 'KYC & Compliance Documents',
      subtitle: 'Driving Licence, RC, Insurance, PAN, Aadhaar (Verified ✓)',
      icon: <FileText size={20} color="#FBBF24" />,
    },
    {
      id: 'bank',
      title: 'Bank & Payout Details',
      subtitle: 'HDFC Bank • Account: XXXX XXXX 4582',
      icon: <CreditCard size={20} color="#A78BFA" />,
    },
    {
      id: 'preferences',
      title: 'Delivery Preferences',
      subtitle: 'Max 10 km • Jaipur (Vaishali Nagar, Mansarovar)',
      icon: <Sliders size={20} color="#FF6600" />,
    },
    {
      id: 'support',
      title: 'Help & Safety Support',
      subtitle: '24/7 SOS Helpline, FAQs & Ticket Center',
      icon: <ShieldAlert size={20} color="#EF4444" />,
      onPress: () => navigation.navigate('Support'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{(rider?.name || 'R')[0]}</Text>
        </View>
        <Text style={styles.name}>{rider?.name || 'Rahul Sharma'}</Text>
        <Text style={styles.phone}>{rider?.phone || '+91 98765 43210'}</Text>
        <View style={styles.appIdBadge}>
          <Text style={styles.appIdText}>ID: {rider?.applicationId || 'SVZ-RID-000123'}</Text>
        </View>
      </View>

      {/* Light / Dark Mode Toggle Card */}
      <View style={styles.themeToggleCard}>
        <View style={styles.themeIconWrap}>
          {isDark ? <Moon size={20} color="#FF7A00" /> : <Sun size={20} color="#FF6600" />}
        </View>
        <View style={styles.themeTextWrap}>
          <Text style={styles.themeTitle}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          <Text style={styles.themeSubtitle}>
            {isDark ? 'Obsidian Slate with Orange accents' : 'Crisp White with Orange accents'}
          </Text>
        </View>
        <Switch
          value={!isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#334155', true: '#10B981' }}
          thumbColor={isDark ? '#94A3B8' : '#FFFFFF'}
        />
      </View>

      {/* Point 38: Profile Navigation Items */}
      <Text style={styles.sectionHeading}>Account & Configuration</Text>

      {profileSections.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={item.onPress || (() => Alert.alert(item.title, item.subtitle))}
        >
          <View style={styles.iconWrap}>{item.icon}</View>
          <View style={styles.textWrap}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sign Out of Partner Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6600',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  phone: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  appIdBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.35)',
  },
  appIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6600',
    letterSpacing: 1,
  },
  themeToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FF6600',
    marginBottom: Spacing.lg,
  },
  themeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  themeTextWrap: {
    flex: 1,
  },
  themeTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  themeSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: BorderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});
