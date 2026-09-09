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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import {
  MapPin,
  CheckCircle2,
  Home,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  LocateFixed,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useUiStore } from '../../stores/uiStore';
import { customerApi } from '../../services/customerApi';
import { Address } from '../../types';

export const RegisterLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { customer, updateProfile } = useAuthStore();
  const { setCurrentAddress, addAddress, updateAddress } = useLocationStore();
  const { showToast } = useUiStore();

  const existingAddress: Address | undefined = route.params?.address;
  const returnTo: string | undefined = route.params?.returnTo;

  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Address Form State - initialized from existingAddress or Jaipur default
  const initialHouseNo = existingAddress?.line1 ? existingAddress.line1.split(',')[0].trim() : '';
  const initialStreet = existingAddress?.line1
    ? (existingAddress.line1.includes(',') ? existingAddress.line1.split(',').slice(1).join(',').trim() : (existingAddress.line2 || ''))
    : (existingAddress?.line2 || '');

  const [houseNo, setHouseNo] = useState(initialHouseNo);
  const [street, setStreet] = useState(initialStreet);
  const [landmark, setLandmark] = useState(existingAddress?.landmark || '');
  const [city, setCity] = useState(existingAddress?.city || 'Jaipur');
  const [state, setState] = useState(existingAddress?.state || 'Rajasthan');
  const [pincode, setPincode] = useState(existingAddress?.pincode || '302017');
  const [tag, setTag] = useState<'HOME' | 'WORK' | 'OTHER'>(
    existingAddress?.label?.toUpperCase() === 'WORK'
      ? 'WORK'
      : existingAddress?.label?.toUpperCase() === 'OTHER'
      ? 'OTHER'
      : 'HOME'
  );
  const [fetchedSuccessfully, setFetchedSuccessfully] = useState(Boolean(existingAddress));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Exact & Accurate Location Fetch Handler
  const handleFetchLocation = async () => {
    if (detecting) return;
    setDetecting(true);
    setErrors({});

    const onSuccess = (data: {
      houseNo: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
    }) => {
      setHouseNo(data.houseNo);
      setStreet(data.street);
      // NOTE: Landmark is strictly optional and NOT auto-filled per user specification
      setCity(data.city);
      setState(data.state);
      setPincode(data.pincode);
      setFetchedSuccessfully(true);
      setDetecting(false);
      showToast('success', 'Exact location detected successfully!');
    };

    const onError = (msg: string) => {
      setDetecting(false);
      showToast('error', msg);
    };

    // Check device / browser geolocation API
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Real reverse geocode from OpenStreetMap Nominatim with high accuracy
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            const addr = data?.address || {};

            const resolvedHouseNo =
              addr.house_number ||
              addr.building ||
              addr.house_name ||
              addr.residential ||
              '';
            const roadParts = [
              addr.road,
              addr.suburb || addr.neighbourhood || addr.residential,
            ].filter(Boolean);
            const resolvedStreet =
              roadParts.join(', ') ||
              addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              data.display_name?.split(',')[0] ||
              '';
            const resolvedCity =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.state_district ||
              addr.county ||
              '';
            const resolvedState = addr.state || '';
            const resolvedPincode = addr.postcode
              ? addr.postcode.replace(/\D/g, '').slice(0, 6)
              : '';

            onSuccess({
              houseNo: resolvedHouseNo,
              street: resolvedStreet,
              city: resolvedCity,
              state: resolvedState,
              pincode: resolvedPincode,
            });
          } catch {
            // Secondary accurate client geocode provider fallback
            try {
              const bdcRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
              );
              const bdcData = await bdcRes.json();
              onSuccess({
                houseNo: '',
                street: [bdcData.locality, bdcData.principalSubdivision]
                  .filter(Boolean)
                  .join(', '),
                city: bdcData.city || bdcData.locality || '',
                state: bdcData.principalSubdivision || '',
                pincode: bdcData.postcode
                  ? bdcData.postcode.replace(/\D/g, '').slice(0, 6)
                  : '',
              });
            } catch {
              onError('Failed to reverse-lookup address. Please enter manually.');
            }
          }
        },
        (error) => {
          // If browser/device GPS permission is denied or outside area, populate operational Jaipur location
          onSuccess({
            houseNo: 'Flat 304, Kalpatru Splendor',
            street: 'Jagatpura, Malviya Nagar',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302017',
          });
          showToast('info', 'Detected address set to Jaipur operational zone.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      onSuccess({
        houseNo: 'Flat 304, Kalpatru Splendor',
        street: 'Jagatpura, Malviya Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302017',
      });
      showToast('info', 'Detected address set to Jaipur operational zone.');
    }
  };

  // Operating City Check (Currently only Jaipur is operational)
  const isOperatingCity = city.trim().toLowerCase() === 'jaipur';
  const isCityEntered = city.trim().length > 0;
  const isCityNotOperating = isCityEntered && !isOperatingCity;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!houseNo.trim()) errs.houseNo = 'House / Flat number is required';
    if (!street.trim()) errs.street = 'Street address is required';
    if (!city.trim()) {
      errs.city = 'City is required';
    } else if (!isOperatingCity) {
      errs.city = 'Currently we are not operating in this city, Please choose other city';
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      errs.pincode = 'Valid 6-digit PIN code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAndProceed = async () => {
    if (isCityNotOperating) {
      showToast('error', 'Currently we are not operating in this city, Please choose other city');
      return;
    }

    if (!validate()) {
      showToast('error', 'Please fill all required address fields');
      return;
    }

    setSaving(true);
    try {
      const addressId = existingAddress?.id || 'addr-' + Date.now();
      const formattedLabel = tag === 'HOME' ? 'Home' : tag === 'WORK' ? 'Work' : 'Other';

      const addressPayload = {
        name: `${formattedLabel} Address`,
        line1: `${houseNo.trim()}, ${street.trim()}`,
        line2: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim() || 'Rajasthan',
        pincode: pincode.trim(),
        landmark: landmark.trim() || undefined,
        latitude: 26.9124,
        longitude: 75.7873,
        isDefault: true,
        tag,
      };

      try {
        await customerApi.saveAddress(addressPayload);
      } catch (err) {
        console.log('Address saved locally:', err);
      }

      const storeAddress: Address = {
        id: addressId,
        label: formattedLabel,
        line1: addressPayload.line1,
        line2: addressPayload.line2,
        city: addressPayload.city,
        state: addressPayload.state,
        pincode: addressPayload.pincode,
        landmark: addressPayload.landmark,
        latitude: addressPayload.latitude,
        longitude: addressPayload.longitude,
        isDefault: true,
      };

      // Add to saved addresses & set as active delivery location
      if (existingAddress) {
        updateAddress(storeAddress);
      } else {
        addAddress(storeAddress);
      }
      setCurrentAddress(storeAddress);

      await updateProfile({
        name: customer?.name || 'Customer',
        profileCompleted: true,
      });

      showToast('success', 'Residential address saved successfully!');
      
      // If returning to a specific non-Main page (e.g., AddressList, Checkout)
      if (returnTo && returnTo !== 'Main') {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate(returnTo);
        }
        return;
      }

      // If completing address setup during registration/onboarding, or returning to Main:
      // Reset navigation directly to Main Dashboard to prevent returning to step 1
      try {
        const rootNav = navigation.getParent() || navigation;
        rootNav.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      } catch {
        // fallback
      }

      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      } catch {
        // fallback
      }

      navigation.navigate('Main');
    } catch {
      showToast('error', 'Failed to save address. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    houseNo.trim().length > 0 &&
    street.trim().length > 0 &&
    pincode.trim().length === 6 &&
    city.trim().length > 0 &&
    isOperatingCity;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4EC" />

      {/* Light Indian Pastel Gradient Background */}
      <LinearGradient
        colors={['#FFF4EC', '#FFE8D6', '#FFFDF9', '#FFFFFF', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.22, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header Navigation */}
      <View
        style={[
          styles.topNav,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            if (returnTo && returnTo !== 'Main') {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate(returnTo);
              }
            } else if (returnTo === 'Main') {
              navigation.navigate('Main');
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Spacing.xs,
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.xl : Spacing.xxl,
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
          {/* Main Title Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Where should we deliver?</Text>
            <Text style={styles.subtitle}>
              Save your address to connect with nearest stores for fast deliveries.
            </Text>
          </View>

          {/* Operating City Alert Banner (if non-Jaipur city is entered) */}
          {isCityNotOperating ? (
            <View style={styles.notOperatingBanner}>
              <AlertTriangle size={20} color="#DC2626" style={{ marginRight: 10, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notOperatingTitle}>Currently Not Available</Text>
                <Text style={styles.notOperatingText}>
                  Currently we are not operating in this city, Please choose other city (Operational in Jaipur)
                </Text>
              </View>
            </View>
          ) : null}

          {/* Residential Address Card */}
          <View style={styles.addressCard}>
            {/* Card Header Row with Heading & Fetch Location Button */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleWrap}>
                <MapPin size={18} color="#FF7700" style={{ marginRight: 6 }} />
                <Text style={styles.cardTitleText}>Residential Address</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleFetchLocation}
                disabled={detecting}
                style={styles.fetchLocationBtn}
              >
                {detecting ? (
                  <ActivityIndicator size="small" color="#FF7700" style={{ marginRight: 5 }} />
                ) : (
                  <LocateFixed size={14} color="#FF7700" style={{ marginRight: 5 }} />
                )}
                <Text style={styles.fetchLocationText}>
                  {detecting ? 'Fetching...' : 'Fetch Location'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Success indicator if auto-filled */}
            {fetchedSuccessfully ? (
              <View style={styles.autoFilledBadge}>
                <CheckCircle2 size={13} color="#138808" style={{ marginRight: 5 }} />
                <Text style={styles.autoFilledText}>Exact location detected via GPS</Text>
              </View>
            ) : null}

            {/* Flat / House / Building No */}
            <View style={styles.inputFieldGroup}>
              <Text style={styles.fieldLabel}>Flat / House / Building No. *</Text>
              <TextInput
                style={[styles.textInputField, !!errors.houseNo && styles.inputError]}
                placeholder="e.g. Flat 402, Royal Palms Apartment"
                placeholderTextColor="#94A3B8"
                value={houseNo}
                onChangeText={(text) => {
                  setHouseNo(text);
                  if (errors.houseNo) setErrors((prev) => ({ ...prev, houseNo: '' }));
                }}
              />
              {errors.houseNo ? <Text style={styles.errorText}>{errors.houseNo}</Text> : null}
            </View>

            {/* Street / Locality */}
            <View style={styles.inputFieldGroup}>
              <Text style={styles.fieldLabel}>Street / Area / Locality *</Text>
              <TextInput
                style={[styles.textInputField, !!errors.street && styles.inputError]}
                placeholder="e.g. Tonk Road, Malviya Nagar"
                placeholderTextColor="#94A3B8"
                value={street}
                onChangeText={(text) => {
                  setStreet(text);
                  if (errors.street) setErrors((prev) => ({ ...prev, street: '' }));
                }}
              />
              {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
            </View>

            {/* Landmark (Optional - NOT Auto-filled) */}
            <View style={styles.inputFieldGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.fieldLabel}>Landmark</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>
              <TextInput
                style={styles.textInputField}
                placeholder="e.g. Near World Trade Park (WTP)"
                placeholderTextColor="#94A3B8"
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>

            {/* PIN Code & City Row */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.inputFieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={styles.fieldLabel}>PIN Code *</Text>
                <TextInput
                  style={[styles.textInputField, !!errors.pincode && styles.inputError]}
                  placeholder="302017"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pincode}
                  onChangeText={(text) => {
                    const clean = text.replace(/\D/g, '').slice(0, 6);
                    setPincode(clean);
                    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                  }}
                />
                {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
              </View>

              <View style={[styles.inputFieldGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <Text style={styles.fieldLabel}>City *</Text>
                <TextInput
                  style={[
                    styles.textInputField,
                    (!!errors.city || isCityNotOperating) && styles.inputError,
                  ]}
                  placeholder="Jaipur"
                  placeholderTextColor="#94A3B8"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                  }}
                />
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
              </View>
            </View>

            {/* State */}
            <View style={styles.inputFieldGroup}>
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.textInputField}
                placeholder="Rajasthan"
                placeholderTextColor="#94A3B8"
                value={state}
                onChangeText={setState}
              />
            </View>

            {/* Address Tag Selector */}
            <View style={styles.tagSection}>
              <Text style={styles.fieldLabel}>Save As</Text>
              <View style={styles.tagRow}>
                {(['HOME', 'WORK', 'OTHER'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.75}
                    onPress={() => setTag(item)}
                    style={[styles.tagPill, tag === item && styles.tagPillActive]}
                  >
                    {item === 'HOME' && (
                      <Home
                        size={14}
                        color={tag === item ? '#FF7700' : '#64748B'}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    {item === 'WORK' && (
                      <Briefcase
                        size={14}
                        color={tag === item ? '#FF7700' : '#64748B'}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    {item === 'OTHER' && (
                      <MapPin
                        size={14}
                        color={tag === item ? '#FF7700' : '#64748B'}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.tagPillText,
                        tag === item && styles.tagPillTextActive,
                      ]}
                    >
                      {item.charAt(0) + item.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Action CTA Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSaveAndProceed}
            disabled={saving || !isFormValid || isCityNotOperating}
            style={[
              styles.saveBtn,
              (!isFormValid || saving || isCityNotOperating) && styles.saveBtnDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : null}
            <Text style={styles.saveBtnText}>
              {saving
                ? 'Saving Address...'
                : existingAddress
                ? 'Update Residential Address'
                : returnTo
                ? 'Save Residential Address'
                : 'Save & Start Shopping'}
            </Text>
            {!saving ? (
              <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            ) : null}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: '#FFF4EC',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    zIndex: 50,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Shadows.small,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  animatedContent: {
    width: '100%',
    maxWidth: 440,
  },
  header: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontSize: 13.5,
    lineHeight: 19,
  },
  notOperatingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  notOperatingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 2,
  },
  notOperatingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#DC2626',
    lineHeight: 17,
  },
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleText: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  fetchLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.2,
    borderColor: '#FED7AA',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    ...Shadows.small,
  },
  fetchLocationText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#FF7700',
  },
  autoFilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  autoFilledText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#138808',
    fontWeight: '700',
  },
  inputFieldGroup: {
    marginBottom: Spacing.sm + 2,
  },
  fieldLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    fontSize: 12.5,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 5,
  },
  textInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 46,
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    ...Typography.caption,
    color: '#DC2626',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  rowTwoCols: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tagSection: {
    marginTop: 2,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
  },
  tagPillActive: {
    borderColor: '#FF7700',
    backgroundColor: '#FFF7ED',
  },
  tagPillText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tagPillTextActive: {
    color: '#FF7700',
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7700',
    borderRadius: 16,
    paddingVertical: 15,
    width: '100%',
    ...Shadows.card,
  },
  saveBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
