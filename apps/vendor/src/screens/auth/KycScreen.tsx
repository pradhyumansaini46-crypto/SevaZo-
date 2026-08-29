import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { FileText, Landmark, ShieldCheck, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';
import { useAuthStore } from '../../stores/authStore';

export const KycScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();

  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitKyc = async () => {
    if (!gstNumber || !panNumber || !accountNumber || !ifsc) {
      Alert.alert('Required Info', 'Please enter your GST, PAN, and Bank payout details.');
      return;
    }

    setLoading(true);
    try {
      const documents = [
        { type: 'GST', documentNumber: gstNumber, fileUrl: 'https://docs.sevazo.in/gst.pdf' },
        { type: 'PAN', documentNumber: panNumber, fileUrl: 'https://docs.sevazo.in/pan.pdf' },
        ...(fssaiNumber ? [{ type: 'FSSAI', documentNumber: fssaiNumber, fileUrl: 'https://docs.sevazo.in/fssai.pdf' }] : []),
      ];

      const bankAccount = {
        accountNumber,
        ifsc,
        accountHolder,
        bankName,
      };

      const updated = await VendorApi.submitKyc({ documents, bankAccount });
      updateVendor(updated);

      navigation.replace('ApprovalPending');
    } catch (err: any) {
      Alert.alert('Submission Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Compliance & KYC (Step 2/2)"
        subtitle="Statutory verification & settlement bank details"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📄 Tax & Regulatory Compliance</Text>

          <Input
            label="GSTIN (Goods and Services Tax ID) *"
            placeholder="07AAAAA0000A1Z5"
            value={gstNumber}
            onChangeText={setGstNumber}
            autoCapitalize="characters"
            leftIcon={<FileText size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="PAN Card Number *"
            placeholder="AAAPL1234C"
            value={panNumber}
            onChangeText={setPanNumber}
            autoCapitalize="characters"
            leftIcon={<FileText size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="FSSAI License Number (For Food/Grocery)"
            placeholder="14-digit FSSAI number"
            value={fssaiNumber}
            onChangeText={setFssaiNumber}
            keyboardType="numeric"
            leftIcon={<ShieldCheck size={18} color={Colors.textSecondary} />}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏦 Direct Settlement Bank Account</Text>

          <Input
            label="Bank Account Number *"
            placeholder="50100234567890"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            leftIcon={<Landmark size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="IFSC Code *"
            placeholder="HDFC0001234"
            value={ifsc}
            onChangeText={setIfsc}
            autoCapitalize="characters"
          />

          <Input
            label="Beneficiary / Account Holder Name *"
            placeholder="e.g. Green Valley Retail LLP"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />

          <Input
            label="Bank Name *"
            placeholder="e.g. HDFC Bank"
            value={bankName}
            onChangeText={setBankName}
          />
        </View>

        <Button
          title="Submit for Verification"
          onPress={handleSubmitKyc}
          loading={loading}
          leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
          style={{ marginTop: 10, marginBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
});
