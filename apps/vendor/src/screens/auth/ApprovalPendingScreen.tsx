import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, CheckCircle2, Store, HelpCircle, ArrowRight } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../theme';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';

export const ApprovalPendingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();

  const handleInstantApproveDemo = () => {
    updateVendor({ approvalStatus: 'APPROVED', status: 'APPROVED' });
    navigation.replace('Main');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconCircle}>
        <Clock size={40} color="#B45309" />
      </View>

      <Text style={styles.title}>KYC Verification Under Review</Text>
      <Text style={styles.subtitle}>
        Your store details and compliance documents are currently being validated by our partner onboarding team.
      </Text>

      {/* Progress Timeline */}
      <View style={styles.timelineCard}>
        <View style={styles.stepRow}>
          <CheckCircle2 size={20} color={Colors.success} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Account Created</Text>
            <Text style={styles.stepSub}>Phone & login verified</Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepRow}>
          <CheckCircle2 size={20} color={Colors.success} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Store Setup Completed</Text>
            <Text style={styles.stepSub}>{vendor?.storeName || 'Store profile saved'}</Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepRow}>
          <CheckCircle2 size={20} color={Colors.success} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>KYC Submitted</Text>
            <Text style={styles.stepSub}>GSTIN & Bank Account recorded</Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepRow}>
          <Clock size={20} color="#B45309" />
          <View style={styles.stepInfo}>
            <Text style={[styles.stepTitle, { color: '#B45309' }]}>
              Admin Review (In Progress)
            </Text>
            <Text style={styles.stepSub}>Estimated completion: Within 24 hours</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonStack}>
        <Button
          title="Enter Dashboard (Sandbox / Demo Mode)"
          onPress={handleInstantApproveDemo}
          variant="primary"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
        />

        <Button
          title="Contact Partner Helpdesk"
          onPress={() => navigation.navigate('Support')}
          variant="outline"
          leftIcon={<HelpCircle size={18} color={Colors.textPrimary} />}
          style={{ marginTop: 12 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 22,
    maxWidth: 320,
  },
  timelineCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepInfo: {
    marginLeft: 14,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 9,
    marginVertical: 4,
  },
  buttonStack: {
    width: '100%',
  },
});
