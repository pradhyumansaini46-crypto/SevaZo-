import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Store, User, Mail, Phone, MapPin, Camera, Check } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { VendorApi } from '../../services/vendorApi';

export const StoreProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();

  const [storeName, setStoreName] = useState(vendor?.storeName || 'Fresh Mart');
  const [ownerName, setOwnerName] = useState(vendor?.ownerName || 'Vikram Mehta');
  const [email, setEmail] = useState(vendor?.email || 'vikram@freshmart.in');
  const [phone, setPhone] = useState(vendor?.phone || '+91 98765 43210');
  const [description, setDescription] = useState(vendor?.description || '');
  const [logo, setLogo] = useState(vendor?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80');
  const [banner, setBanner] = useState(vendor?.banner || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await VendorApi.updateStoreProfile({
        storeName,
        ownerName,
        description,
        logo,
        banner,
      });
      updateVendor(updated);
      Alert.alert('Success', 'Store profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Store Profile & Branding"
        subtitle="Manage public storefront appearance"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner & Logo Branding */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: banner }} style={styles.bannerImg} />
          <View style={styles.logoWrapper}>
            <Image source={{ uri: logo }} style={styles.logoImg} />
            <TouchableOpacity style={styles.cameraIcon}>
              <Camera size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Storefront Identity</Text>
          <Input
            label="Store Display Name"
            value={storeName}
            onChangeText={setStoreName}
            leftIcon={<Store size={18} color={Colors.textSecondary} />}
          />
          <Input
            label="Owner / Representative Name"
            value={ownerName}
            onChangeText={setOwnerName}
            leftIcon={<User size={18} color={Colors.textSecondary} />}
          />
          <Input
            label="Store Description & Story"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📞 Contact Information</Text>
          <Input
            label="Business Email"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={18} color={Colors.textSecondary} />}
          />
          <Input
            label="Merchant Mobile / WhatsApp"
            value={phone}
            onChangeText={setPhone}
            leftIcon={<Phone size={18} color={Colors.textSecondary} />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Physical Store Location</Text>
          <View style={styles.addressRow}>
            <MapPin size={20} color={Colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.addressLine}>{vendor?.address?.line1}</Text>
              <Text style={styles.addressCity}>
                {vendor?.address?.city}, {vendor?.address?.state} - {vendor?.address?.pincode}
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Save Store Profile"
          onPress={handleSave}
          loading={loading}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
  },
  bannerContainer: {
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 44,
    backgroundColor: Colors.borderLight,
    position: 'relative',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  logoWrapper: {
    position: 'absolute',
    bottom: -32,
    left: 20,
    width: 68,
    height: 68,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: 3,
    ...Shadows.card,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    padding: 5,
    borderRadius: BorderRadius.full,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLine: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addressCity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
