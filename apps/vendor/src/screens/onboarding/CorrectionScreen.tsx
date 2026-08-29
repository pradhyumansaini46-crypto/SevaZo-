import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Upload,
  Check,
  ArrowRight,
  HelpCircle,
  FileText,
  Building2,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { VendorApi } from '../../services/vendorApi';

export const CorrectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor, updateVendor } = useAuthStore();

  const [gstNumber, setGstNumber] = useState('27AABCS1429B1Z0');
  const [hasReplacedGst, setHasReplacedGst] = useState(false);
  const [loading, setLoading] = useState(false);

  const rejectionReason =
    vendor?.rejectionReason ||
    'GST document could not be verified due to blurry scan.';
  const requiredAction =
    'Upload a clear, high-resolution copy of your registered GST certificate.';

  const handleResubmit = async () => {
    if (!hasReplacedGst) {
      Alert.alert('Document Required', 'Please upload a new copy of your GST Certificate before resubmitting.');
      return;
    }

    setLoading(true);
    try {
      const docs = [
        {
          type: 'GST',
          documentNumber: gstNumber,
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'UNDER_REVIEW',
        },
      ];

      await VendorApi.resubmitCorrections({ documents: docs, section: 'KYC' });
      updateVendor({ status: 'UNDER_REVIEW', rejectionReason: null, rejectionDetails: null });

      Alert.alert(
        'Application Resubmitted',
        'Your updated documents have been sent to the verification desk for priority re-audit.',
        [{ text: 'View Status Tracker', onPress: () => navigation.replace('StatusTracker') }]
      );
    } catch (err: any) {
      Alert.alert('Resubmission Error', err.message || 'Unable to resubmit corrections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Application Needs Attention"
        subtitle="Fix flagged items to resume onboarding"
        onBack={() => navigation.navigate('Welcome')}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Rejection Alert Banner */}
        <View style={[styles.alertBanner, { backgroundColor: isDark ? '#3B1515' : '#FEE2E2', borderColor: '#EF4444' }]}>
          <AlertTriangle size={24} color="#EF4444" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.alertTitle, { color: '#EF4444' }]}>
              Reason: {rejectionReason}
            </Text>
            <Text style={[styles.alertDesc, { color: isDark ? '#FECACA' : '#991B1B' }]}>
              <Text style={{ fontWeight: '700' }}>Required Action: </Text>{requiredAction}
            </Text>
          </View>
        </View>

        {/* Partial Correction Status Overview */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Application Sections Overview</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Verified sections are locked. You only need to update the flagged section.
        </Text>

        <View style={styles.sectionsList}>
          {/* Verified Sections */}
          <View style={[styles.sectionRowCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.secName, { color: colors.textPrimary }]}>Business & Legal Information</Text>
            <Badge label="✓ Verified" variant="success" size="sm" />
          </View>

          <View style={[styles.sectionRowCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.secName, { color: colors.textPrimary }]}>Store Address & Location</Text>
            <Badge label="✓ Verified" variant="success" size="sm" />
          </View>

          {/* FLAGGED SECTION */}
          <View style={[styles.sectionRowCard, { backgroundColor: isDark ? '#2D1B1B' : '#FEF2F2', borderColor: '#EF4444', borderWidth: 1.5 }]}>
            <AlertTriangle size={18} color="#EF4444" />
            <Text style={[styles.secName, { color: '#EF4444', fontWeight: '800' }]}>KYC / Legal Documents</Text>
            <Badge label="⚠ Needs Correction" variant="danger" size="sm" />
          </View>

          <View style={[styles.sectionRowCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.secName, { color: colors.textPrimary }]}>Banking & Settlements</Text>
            <Badge label="✓ Verified" variant="success" size="sm" />
          </View>

          <View style={[styles.sectionRowCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.secName, { color: colors.textPrimary }]}>Store Profile & Hours</Text>
            <Badge label="✓ Verified" variant="success" size="sm" />
          </View>
        </View>

        {/* Correction Action Card for Flagged Item */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>Update Flagged Document</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>GSTIN Registration Certificate</Text>
          <Input
            label="GSTIN Number *"
            value={gstNumber}
            onChangeText={setGstNumber}
            autoCapitalize="characters"
          />

          {hasReplacedGst ? (
            <View style={[styles.uploadedRow, { backgroundColor: isDark ? '#132822' : '#E3FDF5' }]}>
              <Check size={16} color={colors.success} />
              <Text style={[styles.uploadedText, { color: colors.success }]}>
                new_gst_certificate_2026.pdf (Ready to submit)
              </Text>
              <TouchableOpacity onPress={() => setHasReplacedGst(false)}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', marginLeft: 8 }}>Replace</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setHasReplacedGst(true);
                Alert.alert('File Selected', 'new_gst_certificate_2026.pdf selected successfully.');
              }}
              style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
            >
              <Upload size={20} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.primary }]}>Upload Clear GST Certificate</Text>
              <Text style={[styles.uploadSub, { color: colors.textSecondary }]}>Supported: PDF, JPG, PNG (Max 5 MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resubmit CTA */}
        <Button
          title="Resubmit for Verification"
          onPress={handleResubmit}
          loading={loading}
          icon={<ArrowRight size={18} color="#FFFFFF" />}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.xl },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  alertTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  alertDesc: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sectionSub: { fontSize: 12, marginBottom: 14, lineHeight: 16 },
  sectionsList: { gap: 8, marginBottom: 12 },
  sectionRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  secName: { fontSize: 13, fontWeight: '600', marginLeft: 10, flex: 1 },
  card: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
  uploadedText: { fontSize: 12, fontWeight: '700', marginLeft: 6, flex: 1 },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  uploadText: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  uploadSub: { fontSize: 11, marginTop: 4 },
});
