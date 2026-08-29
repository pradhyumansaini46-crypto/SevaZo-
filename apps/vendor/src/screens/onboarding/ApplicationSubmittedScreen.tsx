import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Home,
  MessageSquare,
} from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const ApplicationSubmittedScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor } = useAuthStore();

  const applicationId = route.params?.applicationId || `SVZ-VND-${vendor?.id ? vendor.id.slice(-6).toUpperCase() : '000123'}`;

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
        {/* Celebration Badge */}
        <View style={[styles.iconBox, { backgroundColor: isDark ? '#132822' : '#E3FDF5' }]}>
          <Text style={{ fontSize: 44 }}>🎉</Text>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Application Submitted</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your Sevazo vendor application has been submitted successfully and is currently queued for audit.
        </Text>

        {/* Application ID & Status Card */}
        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Application ID:</Text>
            <Text style={[styles.metaValue, { color: colors.primary }]}>{applicationId}</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Status:</Text>
            <Badge label="Under Review" variant="warning" size="sm" />
          </View>
          <View style={[styles.metaDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Estimated Review SLA:</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>24 - 48 Hours</Text>
          </View>
        </View>

        {/* Informational Callout */}
        <View style={[styles.infoBanner, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.borderLight }]}>
          <Clock size={20} color={colors.primary} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>What happens next?</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Our merchant compliance desk will verify your legal documents, tax registration, and store geofencing. We will notify you via SMS and WhatsApp when verification is complete.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="View Application Status Tracker"
            onPress={() => navigation.replace('StatusTracker')}
            icon={<ArrowRight size={16} color="#FFF" />}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Go to Welcome"
            variant="outline"
            onPress={() => navigation.replace('Welcome')}
            leftIcon={<Home size={16} color={colors.textPrimary} />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, alignItems: 'center' },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.card,
  },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  metaCard: {
    width: '100%',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  metaLabel: { fontSize: 13, fontWeight: '600' },
  metaValue: { fontSize: 14, fontWeight: '800' },
  metaDivider: { height: 1, marginVertical: 8 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 28,
  },
  infoTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  infoDesc: { fontSize: 12, lineHeight: 17 },
  actionsContainer: { width: '100%' },
});
