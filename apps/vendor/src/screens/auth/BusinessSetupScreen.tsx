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
import { Store, User, MapPin, Building, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';
import { useAuthStore } from '../../stores/authStore';

export const BusinessSetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();

  const [storeName, setStoreName] = useState(vendor?.storeName || '');
  const [ownerName, setOwnerName] = useState(vendor?.ownerName || '');
  const [description, setDescription] = useState(vendor?.description || '');
  const [line1, setLine1] = useState(vendor?.address?.line1 || '');
  const [line2, setLine2] = useState(vendor?.address?.line2 || '');
  const [city, setCity] = useState(vendor?.address?.city || '');
  const [state, setState] = useState(vendor?.address?.state || '');
  const [pincode, setPincode] = useState(vendor?.address?.pincode || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!storeName || !ownerName || !line1 || !city || !pincode) {
      Alert.alert('Required Fields', 'Please complete all required store and address fields.');
      return;
    }

    setLoading(true);
    try {
      const updated = await VendorApi.setupStore({
        storeName,
        ownerName,
        description,
        line1,
        line2,
        city,
        state,
        pincode,
        latitude: 28.4595,
        longitude: 77.0266,
      });

      updateVendor(updated);
      navigation.navigate('Kyc');
    } catch (err: any) {
      Alert.alert('Error', err.message);
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
        title="Store Setup (Step 1/2)"
        subtitle="Provide your merchant details and pickup location"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏪 Store & Merchant Identity</Text>

          <Input
            label="Business / Store Display Name *"
            placeholder="e.g. Fresh Mart Gourmet"
            value={storeName}
            onChangeText={setStoreName}
            leftIcon={<Store size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="Owner / Authorized Person Name *"
            placeholder="e.g. Rajesh Verma"
            value={ownerName}
            onChangeText={setOwnerName}
            leftIcon={<User size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="Store Bio / Description"
            placeholder="Tell customers about your store specialty..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Physical Store & Pickup Address</Text>

          <Input
            label="Address Line 1 (Shop No., Building, Street) *"
            placeholder="Shop 18, City Centre Mall"
            value={line1}
            onChangeText={setLine1}
            leftIcon={<MapPin size={18} color={Colors.textSecondary} />}
          />

          <Input
            label="Address Line 2 (Area, Landmark)"
            placeholder="Near MG Road Metro Station"
            value={line2}
            onChangeText={setLine2}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City *"
                placeholder="Gurugram"
                value={city}
                onChangeText={setCity}
                leftIcon={<Building size={18} color={Colors.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Pincode *"
                placeholder="122002"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="State *"
            placeholder="Haryana"
            value={state}
            onChangeText={setState}
          />
        </View>

        <Button
          title="Continue to Compliance & KYC"
          onPress={handleSave}
          loading={loading}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
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
  row: {
    flexDirection: 'row',
  },
});
