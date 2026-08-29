import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldAlert, PhoneCall, MessageSquare, HelpCircle, FileText } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export const SupportScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* SOS Emergency Button */}
      <TouchableOpacity style={styles.sosCard}>
        <ShieldAlert size={36} color="#FFFFFF" />
        <View style={styles.sosInfo}>
          <Text style={styles.sosTitle}>EMERGENCY SOS ASSISTANCE</Text>
          <Text style={styles.sosSubtitle}>Instant alert to Sevzo Emergency Logistics Team & PCR</Text>
        </View>
      </TouchableOpacity>

      {/* Support Options */}
      <Text style={styles.sectionTitle}>Help & Support Channels</Text>
      <View style={styles.list}>
        <TouchableOpacity style={styles.supportCard}>
          <PhoneCall size={22} color="#FF6600" />
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Rider Partner Helpline</Text>
            <Text style={styles.supportDesc}>Toll-free 1800-419-7389 (Available 24x7)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportCard}>
          <MessageSquare size={22} color="#10B981" />
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Live Dispatch Support Chat</Text>
            <Text style={styles.supportDesc}>Average response time: &lt;1 minute</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportCard}>
          <HelpCircle size={22} color="#F59E0B" />
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Trip Cancellation & Dispute Policy</Text>
            <Text style={styles.supportDesc}>Read payout protection terms</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  sosCard: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  sosInfo: {
    flex: 1,
  },
  sosTitle: {
    ...Typography.bodyLarge,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sosSubtitle: {
    ...Typography.bodySmall,
    color: '#FEE2E2',
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  supportDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
