import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useOnboardingStore } from '../store/onboardingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Correction'>;

interface CorrectionItem {
  id: string;
  name: string;
  reason: string;
  requiredAction: string;
  isReplaced: boolean;
}

export const CorrectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { resubmitCorrection, isLoading } = useOnboardingStore();

  const [items, setItems] = useState<CorrectionItem[]>([
    {
      id: 'insurance',
      name: 'Vehicle Insurance',
      reason: 'Document has expired.',
      requiredAction: 'Upload active policy valid for at least 3 months.',
      isReplaced: false,
    },
    {
      id: 'dl',
      name: 'Driving Licence',
      reason: 'Image is unclear.',
      requiredAction: 'Upload a clear, well-lit photo showing all 4 corners.',
      isReplaced: false,
    },
  ]);

  const handleReplace = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isReplaced: true } : item)),
    );
    Alert.alert('Document Updated', 'New document image uploaded and attached for resubmission.');
  };

  const handleResubmit = async () => {
    const unreplaced = items.filter((i) => !i.isReplaced);
    if (unreplaced.length > 0) {
      Alert.alert(
        'Action Required',
        `Please replace all flagged items before resubmitting. (${unreplaced.length} remaining)`,
      );
      return;
    }

    const res = await resubmitCorrection({ correctedItems: items });
    if (res) {
      navigation.replace('ApplicationStatus');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Correction</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <View style={styles.warningIconWrap}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>
          <Text style={styles.bannerTitle}>Application Needs Attention</Text>
          <Text style={styles.bannerSubtitle}>
            {items.length} items require correction before your profile can be approved. You do not need to re-fill your entire application.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Flagged Items for Correction:</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.statusPill, item.isReplaced && styles.statusPillFixed]}>
                <Text style={[styles.statusPillText, item.isReplaced && styles.statusPillTextFixed]}>
                  {item.isReplaced ? '✓ Replaced' : 'Needs Fix'}
                </Text>
              </View>
            </View>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            <View style={styles.actionBox}>
              <Text style={styles.actionLabel}>Required Action:</Text>
              <Text style={styles.actionText}>{item.requiredAction}</Text>
            </View>

            <TouchableOpacity
              style={[styles.replaceBtn, item.isReplaced && styles.replaceBtnDone]}
              onPress={() => handleReplace(item.id)}
            >
              <Text style={[styles.replaceBtnText, item.isReplaced && styles.replaceBtnTextDone]}>
                {item.isReplaced ? '🔄 Change File Again' : '📤 Replace Document'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resubmitBtn}
          onPress={handleResubmit}
          disabled={isLoading}
        >
          <Text style={styles.resubmitBtnText}>
            {isLoading ? 'Resubmitting...' : 'Resubmit for Verification ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 24,
    alignItems: 'center',
  },
  warningIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  warningIcon: {
    fontSize: 24,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 6,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusPillFixed: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  statusPillTextFixed: {
    color: '#15803D',
  },
  reasonBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F43F5E',
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9F1239',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 13,
    color: '#881337',
  },
  actionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  actionText: {
    fontSize: 13,
    color: '#334155',
  },
  replaceBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  replaceBtnDone: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  replaceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  replaceBtnTextDone: {
    color: '#334155',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resubmitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
