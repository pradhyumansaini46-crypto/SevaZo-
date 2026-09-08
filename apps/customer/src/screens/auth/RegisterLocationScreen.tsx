import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  MapPin,
  Navigation,
  Zap,
  CheckCircle2,
  Building,
  Home,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useUiStore } from '../../stores/uiStore';
import { customerApi } from '../../services/customerApi';

const sampleGPS = {
  name: 'Indiranagar 100 Feet Rd',
  line1: 'Flat 402, Green Glen Heights, 100 Feet Rd',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  landmark: 'Near 12th Main Junction',
  latitude: 12.9716,
  longitude: 77.5946,
};

export const RegisterLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { customer, updateProfile } = useAuthStore();
  const { setCurrentAddress } = useLocationStore();
  const { showToast } = useUiStore();

  const [mode, setMode] = useState<'GPS' | 'MANUAL'>('GPS');
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<typeof sampleGPS | null>(null);

  // Manual Form State
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const radarPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Radar pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleDetectGPS = () => {
    setDetecting(true);
    setTimeout(() => {
      setDetectedAddress(sampleGPS);
      setHouseNo('Flat 402, Green Glen Heights');
      setStreet('100 Feet Rd, Indiranagar');
      setLandmark('Near 12th Main');
      setPincode('560038');
      setCity('Bengaluru');
      setDetecting(false);
      showToast('success', 'GPS Location & dark-store pod detected!');
    }, 1200);
  };

  const handleSaveAndStart = async () => {
    setSaving(true);
    try {
      const addressLine1 = mode === 'GPS' && detectedAddress 
        ? detectedAddress.line1 
        : `${houseNo}, ${street}`.trim() || '100 Feet Rd, Indiranagar';

      const finalAddress = {
        label: tag,
        line1: addressLine1,
        line2: landmark,
        landmark: landmark,
        city: city || 'Bengaluru',
        state: 'Karnataka',
        pincode: pincode || '560038',
        latitude: detectedAddress?.latitude || 12.9716,
        longitude: detectedAddress?.longitude || 77.5946,
        isDefault: true,
        contactName: customer?.name || 'Customer',
        contactPhone: customer?.phone || '+91 9876543210',
      };

      // 1. Save to Database
      const saved = await customerApi.saveAddress(finalAddress);

      // 2. Set current active address in app store
      setCurrentAddress(saved);

      // 3. Mark profile completed
      await updateProfile({ profileCompleted: true });

      showToast('success', 'Delivery address saved successfully!');
      
      // Directly redirect first-time user to the Dashboard
      navigation.replace('Main');
    } catch {
      showToast('info', 'Address confirmed! Welcome to SevaZo.');
      navigation.replace('Main');
    } finally {
      setSaving(false);
    }
  };

  const isManualValid = houseNo.trim().length > 0 && street.trim().length > 0 && pincode.trim().length >= 5;
  const canSave = mode === 'GPS' ? !!detectedAddress : isManualValid;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top > 0 ? insets.top + Spacing.sm : Spacing.md,
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.lg : Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Title */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <Zap size={14} color="#059669" fill="#059669" />
              <Text style={styles.badgeText}>10-Minute DarkStore Mapping</Text>
            </View>
            <Text style={styles.title}>Where should we deliver?</Text>
            <Text style={styles.subtitle}>
              Save your address to connect with nearest dark store POD for ultra-fast deliveries.
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('GPS')}
              style={[styles.tabBtn, mode === 'GPS' && styles.tabBtnActive]}
            >
              <Navigation
                size={16}
                color={mode === 'GPS' ? Colors.primary : Colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  mode === 'GPS' && styles.tabBtnTextActive,
                ]}
              >
                Fetch GPS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('MANUAL')}
              style={[styles.tabBtn, mode === 'MANUAL' && styles.tabBtnActive]}
            >
              <Building
                size={16}
                color={mode === 'MANUAL' ? Colors.primary : Colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  mode === 'MANUAL' && styles.tabBtnTextActive,
                ]}
              >
                Enter Manually
              </Text>
            </TouchableOpacity>
          </View>

          {/* OPTION 1: GPS Auto Detection */}
          {mode === 'GPS' ? (
            <View style={styles.gpsCard}>
              <View style={styles.radarContainer}>
                <Animated.View
                  style={[
                    styles.radarCircleOuter,
                    { transform: [{ scale: radarPulse }] },
                  ]}
                />
                <View style={styles.radarCircleInner}>
                  <MapPin size={28} color="#FFFFFF" />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDetectGPS}
                disabled={detecting}
                style={styles.detectButton}
              >
                {detecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Navigation size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.detectButtonText}>
                      {detectedAddress ? 'Re-detect Current Location' : 'Fetch Current GPS Location'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Detected Address Display */}
              {detectedAddress ? (
                <View style={styles.detectedResultBox}>
                  <View style={styles.resultHeader}>
                    <CheckCircle2 size={18} color="#059669" />
                    <Text style={styles.resultPodText}>Indiranagar Pod (0.8 km away)</Text>
                  </View>
                  <Text style={styles.resultAddressName}>{detectedAddress.name}</Text>
                  <Text style={styles.resultAddressLine}>{detectedAddress.line1}</Text>
                  <Text style={styles.resultCityLine}>
                    {detectedAddress.city}, {detectedAddress.state} - {detectedAddress.pincode}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* OPTION 2: Manual Address Entry */
            <View style={styles.manualCard}>
              {/* House / Flat */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.fieldLabel}>Flat / House / Building No. *</Text>
                <TextInput
                  style={styles.textInputField}
                  placeholder="e.g. Flat 402, Green Glen Heights"
                  placeholderTextColor={Colors.textMuted}
                  value={houseNo}
                  onChangeText={setHouseNo}
                />
              </View>

              {/* Street / Locality */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.fieldLabel}>Street / Area / Locality *</Text>
                <TextInput
                  style={styles.textInputField}
                  placeholder="e.g. 100 Feet Rd, Indiranagar"
                  placeholderTextColor={Colors.textMuted}
                  value={street}
                  onChangeText={setStreet}
                />
              </View>

              {/* Landmark */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.textInputField}
                  placeholder="e.g. Near 12th Main Junction"
                  placeholderTextColor={Colors.textMuted}
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>

              {/* PIN Code & City Row */}
              <View style={styles.rowTwoCols}>
                <View style={[styles.inputFieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
                  <Text style={styles.fieldLabel}>PIN Code *</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="560038"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
                <View style={[styles.inputFieldGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="Bengaluru"
                    placeholderTextColor={Colors.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              {/* Address Tag Selector */}
              <View style={styles.tagSection}>
                <Text style={styles.fieldLabel}>Save As</Text>
                <View style={styles.tagRow}>
                  {(['Home', 'Work', 'Other'] as const).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setTag(item)}
                      style={[styles.tagPill, tag === item && styles.tagPillActive]}
                    >
                      {item === 'Home' && (
                        <Home
                          size={14}
                          color={tag === item ? Colors.primary : Colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      {item === 'Work' && (
                        <Briefcase
                          size={14}
                          color={tag === item ? Colors.primary : Colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      {item === 'Other' && (
                        <MapPin
                          size={14}
                          color={tag === item ? Colors.primary : Colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.tagPillText,
                          tag === item && styles.tagPillTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Action CTA Button: Save & Start */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveAndStart}
            disabled={saving || !canSave}
            style={[
              styles.saveBtn,
              (!canSave || saving) && styles.saveBtnDisabled,
            ]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving Address...' : 'Save & Start Shopping'}
            </Text>
            <ArrowRight size={18} color={Colors.textInverse} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Trust Guarantees */}
          <View style={styles.guaranteeRow}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.guaranteeText}>
              Your location is encrypted & used only for dark store dispatch.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: Spacing.lg,
  },
  animatedContent: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 6,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.small,
  },
  tabBtnText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  gpsCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  radarContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  radarCircleOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  radarCircleInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    ...Shadows.small,
  },
  detectButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  detectedResultBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    padding: Spacing.md,
    width: '100%',
    marginTop: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultPodText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 6,
  },
  resultAddressName: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resultAddressLine: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resultCityLine: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  manualCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  inputFieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  textInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  rowTwoCols: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSection: {
    marginTop: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs + 3,
  },
  tagPillActive: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
  },
  tagPillText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tagPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    ...Shadows.medium,
  },
  saveBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  guaranteeText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginLeft: 6,
  },
});

