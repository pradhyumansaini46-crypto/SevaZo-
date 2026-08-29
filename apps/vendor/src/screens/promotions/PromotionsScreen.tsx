import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Tag, Plus, Check, Percent, Sparkles } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Coupon } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const PromotionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New Coupon Form
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');

  const loadPromos = async () => {
    try {
      const res = await VendorApi.getPromotions();
      setCoupons(res.coupons);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreateCoupon = async () => {
    if (!code || !discountValue) {
      Alert.alert('Required', 'Please enter coupon code and discount %');
      return;
    }

    try {
      await VendorApi.createCoupon({
        code: code.toUpperCase(),
        description,
        discountType: 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrder) || 0,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      });

      Alert.alert('Coupon Activated', `Promo code ${code.toUpperCase()} is now live.`);
      setModalVisible(false);
      loadPromos();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Promotions & Offers"
        subtitle="Create store vouchers & boost basket size"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Coupon</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>🎟️ Active Store Coupons</Text>

        {coupons.map((c) => (
          <View key={c.id} style={styles.couponCard}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Percent size={20} color={Colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.couponCode}>{c.code}</Text>
                <Text style={styles.couponDesc}>{c.description}</Text>
                <Text style={styles.couponCondition}>
                  Min Order: ₹{c.minOrderAmount} • {c.discountValue}% OFF
                </Text>
              </View>
            </View>

            <Badge label="ACTIVE" variant="success" size="sm" dot />
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Create Promotional Coupon"
      >
        <Input
          label="Coupon Code *"
          placeholder="e.g. FLASH20"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <Input
          label="Discount Percentage (%) *"
          placeholder="20"
          value={discountValue}
          onChangeText={setDiscountValue}
          keyboardType="numeric"
        />

        <Input
          label="Minimum Order Value (₹)"
          placeholder="299"
          value={minOrder}
          onChangeText={setMinOrder}
          keyboardType="numeric"
        />

        <Input
          label="Offer Description"
          placeholder="e.g. 20% off on all organic fresh vegetables"
          value={description}
          onChangeText={setDescription}
        />

        <Button
          title="Launch Promotional Offer"
          onPress={handleCreateCoupon}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginTop: 10 }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  scroll: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  couponDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  couponCondition: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
});
