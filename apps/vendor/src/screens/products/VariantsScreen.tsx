import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Trash2, Layers, Check, Sparkles } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ProductVariant } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const VariantsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New variant form states
  const [varName, setVarName] = useState('');
  const [varSku, setVarSku] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varComparePrice, setVarComparePrice] = useState('');
  const [varCostPrice, setVarCostPrice] = useState('');
  const [varWeight, setVarWeight] = useState('');
  const [varStock, setVarStock] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const prod = await VendorApi.getProduct(productId);
      setProduct(prod);
      setVariants(prod.variants || []);
    } catch {
      // handle error
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleAddVariant = async () => {
    if (!varName || !varPrice || !varSku) {
      Alert.alert('Required Fields', 'Please fill in Variant Name, unique SKU, and Selling Price.');
      return;
    }

    setLoading(true);
    try {
      await VendorApi.createVariant(productId, {
        name: varName,
        sku: varSku.toUpperCase(),
        price: parseFloat(varPrice),
        compareAtPrice: varComparePrice ? parseFloat(varComparePrice) : undefined,
        costPrice: varCostPrice ? parseFloat(varCostPrice) : undefined,
        weightGrams: varWeight ? parseInt(varWeight, 10) : undefined,
        stock: parseInt(varStock, 10) || 0,
      });

      Alert.alert('Variant Created', `Variant ${varSku} added with separate SKU inventory.`);
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = (id: string) => {
    Alert.alert('Delete Variant', 'Remove this variant SKU from store inventory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await VendorApi.deleteVariant(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Product Variant Matrix"
        subtitle={product ? `${product.name} (SKU: ${product.sku})` : 'Multi-SKU Variant Inventory'}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Variant</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {variants.length === 0 ? (
          <View style={styles.emptyBox}>
            <Layers size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Variants Configured</Text>
            <Text style={styles.emptySub}>
              Create multi-SKU variants for Size (Small, Medium, Large) or Color (Black, White) combinations.
            </Text>
            <Button
              title="Add First Variant SKU"
              onPress={() => setModalVisible(true)}
              size="sm"
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          variants.map((v) => (
            <View key={v.id} style={styles.variantCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.varName}>{v.name}</Text>
                  <Text style={styles.varSku}>SKU: {v.sku}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteVariant(v.id)}
                  style={styles.deleteIcon}
                >
                  <Trash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Selling Price</Text>
                  <Text style={styles.metaVal}>₹{v.price}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Physical Stock</Text>
                  <Text style={[styles.metaVal, { color: Colors.primaryDark }]}>{v.stock} units</Text>
                </View>
                {v.compareAtPrice ? (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>MRP</Text>
                    <Text style={[styles.metaVal, { textDecorationLine: 'line-through', color: Colors.textMuted }]}>
                      ₹{v.compareAtPrice}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Variant Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Variant SKU"
      >
        <Input
          label="Variant Combination Name *"
          placeholder="e.g. Small / Black or 1 kg Family Pack"
          value={varName}
          onChangeText={setVarName}
        />

        <Input
          label="Unique Variant SKU *"
          placeholder="e.g. TSHIRT-SM-BLK"
          value={varSku}
          onChangeText={setVarSku}
          autoCapitalize="characters"
        />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Input
              label="Selling Price (₹) *"
              placeholder="499"
              value={varPrice}
              onChangeText={setVarPrice}
              keyboardType="numeric"
              prefix="₹"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Input
              label="MRP (₹)"
              placeholder="599"
              value={varComparePrice}
              onChangeText={setVarComparePrice}
              keyboardType="numeric"
              prefix="₹"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Input
              label="Cost Price (₹)"
              placeholder="320"
              value={varCostPrice}
              onChangeText={setVarCostPrice}
              keyboardType="numeric"
              prefix="₹"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Input
              label="Weight (Grams)"
              placeholder="250"
              value={varWeight}
              onChangeText={setVarWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Physical Stock Initial Units *"
          placeholder="20"
          value={varStock}
          onChangeText={setVarStock}
          keyboardType="numeric"
        />

        <Button
          title="Save Variant SKU"
          onPress={handleAddVariant}
          loading={loading}
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
    paddingBottom: 40,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  variantCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  varName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  varSku: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  deleteIcon: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
