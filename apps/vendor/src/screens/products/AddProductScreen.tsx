import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Check, Plus, Image as ImageIcon, Percent, Scale, Tag, Receipt } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';

export const AddProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cat-fruits');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Required Fields', 'Please fill in Product Name, Price, and Initial Stock.');
      return;
    }

    const finalSku = sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    setLoading(true);
    try {
      await VendorApi.createProduct({
        name,
        description,
        categoryId: categoryId || 'cat-fruits',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        taxRate: parseFloat(taxRate) || 0,
        hsnCode: hsnCode || undefined,
        weightGrams: parseInt(weightGrams, 10) || undefined,
        sku: finalSku,
        stock: parseInt(stock, 10),
        unit: unit || '1 unit',
        images: imageUrl ? [imageUrl] : [],
      });

      Alert.alert('Success', 'Product created and added to your active catalog!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message);
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
        title="Add New Product"
        subtitle="Full specifications, tax, weight & inventory"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Basic Product Info</Text>

          <Input
            label="Product Title *"
            placeholder="e.g. Organic Ratnagiri Alphonso Mangoes"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Description & Highlights"
            placeholder="Describe product freshness, origin, shelf-life..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Master SKU (Stock Keeping Unit) *"
            placeholder="FRU-MAN-001"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="characters"
          />

          <Input
            label="Packaging Unit (e.g. 500g, 1 kg Box, Pack of 6) *"
            placeholder="1 kg Box"
            value={unit}
            onChangeText={setUnit}
          />
        </View>

        {/* Pricing Architecture */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Pricing Architecture</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Selling Price (₹) *"
                placeholder="299"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Original / MRP (₹)"
                placeholder="349"
                value={compareAtPrice}
                onChangeText={setCompareAtPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
          </View>

          <Input
            label="Cost Price (₹ - Optional for Margin Tracking)"
            placeholder="210"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="numeric"
            prefix="₹"
          />
        </View>

        {/* Tax & Weight Compliance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Tax & Physical Dimensions</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="GST Tax Rate (%)"
                placeholder="5.0"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                leftIcon={<Percent size={16} color={Colors.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="HSN / SAC Code"
                placeholder="08045020"
                value={hsnCode}
                onChangeText={setHsnCode}
                leftIcon={<Receipt size={16} color={Colors.textSecondary} />}
              />
            </View>
          </View>

          <Input
            label="Net Weight in Grams"
            placeholder="1000"
            value={weightGrams}
            onChangeText={setWeightGrams}
            keyboardType="numeric"
            leftIcon={<Scale size={16} color={Colors.textSecondary} />}
            helperText="Used by delivery dispatch algorithms for payload balancing"
          />
        </View>

        {/* 5-State Initial Inventory */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Initial Physical Stock</Text>
          <Input
            label="Physical Stock Available *"
            placeholder="25"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            helperText="Initial stock is automatically marked as Available Stock"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🖼️ Primary Display Image</Text>
          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChangeText={setImageUrl}
            leftIcon={<ImageIcon size={18} color={Colors.textSecondary} />}
          />
        </View>

        <Button
          title="Publish Product to Store"
          onPress={handleCreate}
          loading={loading}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginBottom: 40 }}
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
  row: {
    flexDirection: 'row',
  },
});
