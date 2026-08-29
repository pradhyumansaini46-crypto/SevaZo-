import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Check, ShieldAlert, Navigation } from 'lucide-react-native';
import { Colors, BorderRadius } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { useStoreConfigStore } from '../../stores/storeConfigStore';
import { VendorApi } from '../../services/vendorApi';

export const StoreStatusScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();
  const { isOpen, setIsOpen, prepTimeMinutes, setPrepTime, deliveryRadiusKm, setDeliveryRadius } =
    useStoreConfigStore();

  const [prepTime, setLocalPrepTime] = useState(prepTimeMinutes.toString());
  const [radius, setLocalRadius] = useState(deliveryRadiusKm.toString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const pTime = parseInt(prepTime, 10) || 15;
      const rKm = parseFloat(radius) || 8.5;

      await VendorApi.updateStoreStatus({
        isOpen,
        prepTimeMinutes: pTime,
        deliveryRadiusKm: rKm,
      });

      setPrepTime(pTime);
      setDeliveryRadius(rKm);
      updateVendor({ isOpen, prepTimeMinutes: pTime, deliveryRadiusKm: rKm });

      Alert.alert('Status Updated', 'Store configuration successfully applied.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Store Live Status & Dispatch"
        subtitle="Control order receiving and fulfillment buffer"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>
                {isOpen ? '🟢 Store is ONLINE' : '🔴 Store is OFFLINE'}
              </Text>
              <Text style={styles.switchSub}>
                {isOpen
                  ? 'Accepting instant orders with automated rider dispatch.'
                  : 'Store will appear closed to customers in the Sevazo consumer app.'}
              </Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={isOpen ? Colors.primary : '#94A3B8'}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Preparation Time Buffer</Text>
          <Input
            label="Average Order Preparation Time (Minutes)"
            value={prepTime}
            onChangeText={setLocalPrepTime}
            keyboardType="numeric"
            helperText="Gives kitchen/staff time to pack items before rider arrives"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Serviceable Delivery Radius</Text>
          <Input
            label="Max Delivery Distance (Kilometers)"
            value={radius}
            onChangeText={setLocalRadius}
            keyboardType="numeric"
            helperText="Maximum radius from store address for 15-minute quick delivery"
          />
        </View>

        <Button
          title="Save Status & Buffer Settings"
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
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
