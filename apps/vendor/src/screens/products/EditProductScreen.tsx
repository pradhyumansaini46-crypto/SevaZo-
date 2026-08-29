import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Check, Trash2, Percent, Scale, Receipt } from 'lucide-react-native';
import { Colors, BorderRadius } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';

export const EditProductScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxRate, setTaxRate] = useState('5.0');
  const [hsnCode, setHsnCode] = useState('');
  const [weightGrams, setWeightGrams] = useState('1000');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const prod = await VendorApi.getProduct(productId);
        if (prod) {
          setName(prod.name);
          setDescription(prod.description);
          setPrice(prod.price.toString());
          setCompareAtPrice(prod.compareAtPrice ? prod.compareAtPrice.toString() : '');
          setCostPrice(prod.costPrice ? prod.costPrice.toString() : '');
          setTaxRate(prod.taxRate ? prod.taxRate.toString() : '5.0');
          setHsnCode(prod.hsnCode || '');
          setWeightGrams(prod.weightGrams ? prod.weightGrams.toString() : '1000');
          setStock(prod.stock.toString());
          setUnit(prod.unit);
        }
      } catch {
        // fallback
      }
    };
    load();
  }, [productId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await VendorApi.updateProduct(productId, {
        name,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        taxRate: parseFloat(taxRate) || 0,
        hsnCode,
        weightGrams: parseInt(weightGrams, 10) || null,
        stock: parseInt(stock, 10),
        unit,
      });

      Alert.alert('Updated', 'Product details saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Product', 'Are you sure you want to remove this item from your catalog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await VendorApi.deleteProduct(productId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Edit Product"
        subtitle="Update pricing, tax, weight & stock"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
            <Trash2 size={20} color={Colors.danger} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Product Identification</Text>
          <Input label="Title" value={name} onChangeText={setName} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <Input label="Packaging Unit" value={unit} onChangeText={setUnit} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Pricing & Inventory</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Selling Price (₹)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="MRP (₹)"
                value={compareAtPrice}
                onChangeText={setCompareAtPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
          </View>
          <Input
            label="Cost Price (₹)"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="numeric"
            prefix="₹"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Tax & Weight</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="GST Tax Rate (%)"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                leftIcon={<Percent size={16} color={Colors.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="HSN Code"
                value={hsnCode}
                onChangeText={setHsnCode}
                leftIcon={<Receipt size={16} color={Colors.textSecondary} />}
              />
            </View>
          </View>

          <Input
            label="Weight in Grams"
            value={weightGrams}
            onChangeText={setWeightGrams}
            keyboardType="numeric"
            leftIcon={<Scale size={16} color={Colors.textSecondary} />}
          />
        </View>

        <Button
          title="Save Product Changes"
          onPress={handleUpdate}
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
