import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import {
  Moon,
  Bell,
  MessageSquare,
  Globe,
  FileText,
  Shield,
  Info,
  ChevronRight,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Settings"
        subtitle="App preferences & privacy"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* App Preferences */}
        <Text style={styles.sectionHeading}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color={Colors.primary} style={{ marginRight: Spacing.md }} />
              <View>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowSub}>Get live rider and offer updates</Text>
              </View>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MessageSquare size={20} color={Colors.secondary} style={{ marginRight: Spacing.md }} />
              <View>
                <Text style={styles.rowTitle}>SMS Delivery Alerts</Text>
                <Text style={styles.rowSub}>Receive OTP & arrival texts</Text>
              </View>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={Colors.accentOrange} style={{ marginRight: Spacing.md }} />
              <View>
                <Text style={styles.rowTitle}>Language</Text>
                <Text style={styles.rowSub}>{language}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Legal & About */}
        <Text style={styles.sectionHeading}>Legal & Policies</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={styles.rowLeft}>
              <Shield size={20} color={Colors.primary} style={{ marginRight: Spacing.md }} />
              <View>
                <Text style={styles.rowTitle}>Security & Privacy Center</Text>
                <Text style={styles.rowSub}>Active devices, session logout & data erase</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <FileText size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.md }} />
              <Text style={styles.rowTitle}>Terms of Service</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.md }} />
              <Text style={styles.rowTitle}>Privacy Policy</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About App */}
        <View style={styles.aboutCard}>
          <Info size={18} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
          <View>
            <Text style={styles.aboutTitle}>SevaZo Customer Super App</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (Build 2026.08)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  aboutTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  aboutVersion: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
