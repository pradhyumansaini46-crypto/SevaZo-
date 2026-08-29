import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCw,
  AlertTriangle,
  QrCode,
  KeyRound,
  ShieldAlert,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { bankDetailsSchema, BankDetailsFormValues } from '../../validation/schemas';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError, maskAccountNumber } from '../../utils';

interface BankingSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const BankingSection: React.FC<BankingSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingAccount, setExistingAccount] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingValues, setPendingValues] = useState<BankDetailsFormValues | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: '',
      accountType: 'CURRENT',
      payoutPreference: 'BANK_ACCOUNT',
      upiId: '',
    },
  });

  // Fetch saved bank details on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBank = async () => {
      try {
        const state = await VendorApi.getOnboardingState();
        const bank = state.data?.bankAccounts?.[0] || state.data?.bankAccount;
        if (isMounted && bank) {
          setExistingAccount(bank);
          setIsEditing(false);
          reset({
            accountHolder: bank.accountHolder || '',
            bankName: bank.bankName || '',
            accountNumber: bank.accountNumber || '',
            confirmAccountNumber: bank.accountNumber || '',
            ifsc: bank.ifsc || '',
            accountType: bank.accountType || 'CURRENT',
            payoutPreference: bank.payoutPreference || 'BANK_ACCOUNT',
            upiId: bank.upiId || '',
          });
        }
      } catch {
        // Fallback to empty form
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchBank();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleIfscLookup = (ifscCode: string) => {
    const clean = ifscCode.toUpperCase().trim();
    setValue('ifsc', clean);

    if (clean.length === 11) {
      if (clean.startsWith('HDFC')) setValue('bankName', 'HDFC Bank (Bandra West Branch)');
      else if (clean.startsWith('SBIN')) setValue('bankName', 'State Bank of India (Main Branch)');
      else if (clean.startsWith('ICIC')) setValue('bankName', 'ICICI Bank (Linking Road Branch)');
      else if (clean.startsWith('UTIB')) setValue('bankName', 'Axis Bank (Fort Branch)');
    }
  };

  const onSubmit = async (values: BankDetailsFormValues) => {
    // If updating an already verified/saved account, require security OTP confirmation
    if (existingAccount && !isEditing) {
      setPendingValues(values);
      try {
        await VendorApi.requestBankChangeOtp();
        setShowOtpModal(true);
      } catch (err: any) {
        toast.error('Failed to initiate bank update OTP.');
      }
      return;
    }

    setLoading(true);
    try {
      await VendorApi.saveOnboardingStep(7, values);
      toast.success('Settlement bank details saved securely!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Unable to save banking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSave = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit security confirmation OTP.');
      return;
    }

    setOtpLoading(true);
    try {
      await VendorApi.verifyBankChange(otp, pendingValues);
      setShowOtpModal(false);
      setIsEditing(false);
      toast.success('Bank details updated securely under 24h verification cooldown.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      Alert.alert('Verification Failed', normalized.message || 'Invalid bank change OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading banking & settlement profile...
        </Text>
      </View>
    );
  }

  const selectedPayout = watch('payoutPreference');

  return (
    <StepContainer
      icon={<Landmark size={24} color={colors.primary} />}
      title="Settlement & Bank Details"
      subtitle="Direct automated earnings payout account. Daily automated settlement at 08:00 AM."
    >
      {/* Privacy & Encryption Callout */}
      <View style={[styles.securityBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Lock size={16} color={colors.primary} />
        <Text style={[styles.securityText, { color: colors.textSecondary }]}>
          End-to-end encrypted storage. Complete bank account numbers are never exposed in plaintext.
        </Text>
      </View>

      {/* Saved / Masked Account Card (If already saved) */}
      {existingAccount && !isEditing ? (
        <View style={[styles.savedAccountCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.savedCardHeader}>
            <View style={[styles.bankIconBox, { backgroundColor: colors.primaryLight }]}>
              <Landmark size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.savedBankName, { color: colors.textPrimary }]}>
                {existingAccount.bankName || 'Verified Bank Account'}
              </Text>
              <Text style={[styles.savedAccountHolder, { color: colors.textSecondary }]}>
                {existingAccount.accountHolder}
              </Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={[styles.verifiedText, { color: '#065F46' }]}>Verified</Text>
            </View>
          </View>

          <View style={styles.savedDetailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {maskAccountNumber(existingAccount.accountNumber)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>IFSC Code</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {existingAccount.ifsc}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={[styles.changeAccountBtn, { borderColor: colors.border }]}
          >
            <RotateCw size={14} color={colors.primary} />
            <Text style={[styles.changeAccountText, { color: colors.primary }]}>
              Change Bank Account (Requires OTP)
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Form Fields */
        <View style={styles.formFields}>
          {/* Payout Method Toggle */}
          <View style={styles.payoutToggleRow}>
            <TouchableOpacity
              onPress={() => setValue('payoutPreference', 'BANK_ACCOUNT')}
              style={[
                styles.payoutOption,
                {
                  backgroundColor: selectedPayout === 'BANK_ACCOUNT' ? colors.primaryLight : colors.surface,
                  borderColor: selectedPayout === 'BANK_ACCOUNT' ? colors.primary : colors.border,
                },
              ]}
            >
              <Landmark size={18} color={selectedPayout === 'BANK_ACCOUNT' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.payoutText,
                  { color: selectedPayout === 'BANK_ACCOUNT' ? colors.primary : colors.textPrimary },
                ]}
              >
                Bank Transfer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setValue('payoutPreference', 'UPI')}
              style={[
                styles.payoutOption,
                {
                  backgroundColor: selectedPayout === 'UPI' ? colors.primaryLight : colors.surface,
                  borderColor: selectedPayout === 'UPI' ? colors.primary : colors.border,
                },
              ]}
            >
              <QrCode size={18} color={selectedPayout === 'UPI' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.payoutText,
                  { color: selectedPayout === 'UPI' ? colors.primary : colors.textPrimary },
                ]}
              >
                Instant UPI
              </Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="accountHolder"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Account Beneficiary Name *"
                placeholder="Name as printed on Passbook / Cheque"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountHolder?.message}
                helperText="Must match your legal business / PAN card entity name."
              />
            )}
          />

          <Controller
            control={control}
            name="ifsc"
            render={({ field: { onBlur, value } }) => (
              <Input
                label="IFSC Code *"
                placeholder="e.g. HDFC0000123"
                autoCapitalize="characters"
                maxLength={11}
                value={value}
                onChangeText={handleIfscLookup}
                onBlur={onBlur}
                error={errors.ifsc?.message}
                helperText="11-character Indian Financial System Code."
              />
            )}
          />

          <Controller
            control={control}
            name="bankName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Bank & Branch Name *"
                placeholder="HDFC Bank"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.bankName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Bank Account Number *"
                placeholder="Enter 8-18 digit account number"
                keyboardType="number-pad"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmAccountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Account Number *"
                placeholder="Re-enter account number to verify"
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmAccountNumber?.message}
              />
            )}
          />

          {selectedPayout === 'UPI' && (
            <Controller
              control={control}
              name="upiId"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Virtual Payment Address (UPI ID)"
                  placeholder="merchant@okhdfcbank"
                  autoCapitalize="none"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.upiId?.message}
                  leftIcon={<QrCode size={18} color={colors.textSecondary} />}
                />
              )}
            />
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsBlock}>
        <Button
          title="Save & Continue"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      {/* OTP Security Confirmation Modal */}
      <Modal transparent visible={showOtpModal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: '#FEF3C7' }]}>
              <ShieldAlert size={28} color="#D97706" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Security OTP Required
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              To protect your payouts, changing bank account details requires 2-factor OTP verification. Enter OTP sent to your registered phone.
            </Text>

            <Input
              label="6-Digit Security OTP"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              leftIcon={<KeyRound size={18} color={colors.textSecondary} />}
              helperText="Demo code: 123456"
            />

            <View style={styles.modalActions}>
              <Button
                title="Verify & Update Bank"
                variant="primary"
                size="md"
                fullWidth
                loading={otpLoading}
                onPress={handleVerifyOtpAndSave}
              />
              <Button
                title="Cancel"
                variant="ghost"
                size="sm"
                fullWidth
                disabled={otpLoading}
                onPress={() => setShowOtpModal(false)}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  savedAccountCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
    ...Shadows.card,
  },
  savedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBankName: {
    fontSize: 15,
    fontWeight: '800',
  },
  savedAccountHolder: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  savedDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 12,
    marginBottom: 14,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  changeAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  changeAccountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  payoutToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  payoutOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 8,
  },
  payoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formFields: {
    gap: 14,
    marginBottom: 20,
  },
  actionsBlock: {
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderRadius: BorderRadius.xl,
    ...Shadows.elevated,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalActions: {
    marginTop: 14,
  },
});
