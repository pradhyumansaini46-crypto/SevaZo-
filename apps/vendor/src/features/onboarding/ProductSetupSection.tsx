import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  Package,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError, formatCurrency } from '../../utils';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "500g", "1kg", "Red / L"
  sku: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface StarterProduct {
  name: string;
  category: string;
  brand: string;
  description: string;
  sku: string;
  price: number;
  mrp: number;
  taxPercent: number;
  stock: number;
  isReturnable: boolean;
  image: string;
  variants: ProductVariant[];
}

interface ProductSetupSectionProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export const ProductSetupSection: React.FC<ProductSetupSectionProps> = ({
  onSuccess,
  onSkip,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productsList, setProductsList] = useState<StarterProduct[]>([
    {
      name: 'Organic Whole Wheat Bread (400g)',
      category: 'Bakery & Bread',
      brand: 'Harvest Fresh',
      description: '100% whole grain preservative-free daily baked loaf.',
      sku: 'SKU-BRD-001',
      price: 55,
      mrp: 60,
      taxPercent: 5,
      stock: 40,
      isReturnable: false,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
      variants: [],
    },
  ]);

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: 'Grocery & Staples',
      brand: '',
      description: '',
      sku: '',
      price: '99',
      mrp: '120',
      taxPercent: '5',
      stock: '50',
      isReturnable: true,
    },
  });

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: variants.length === 0 ? 'Standard 500g' : `Pack Size ${variants.length + 1}`,
      sku: `VAR-${Date.now().toString().slice(-4)}`,
      price: 99,
      mrp: 120,
      stock: 25,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== varId));
  };

  const onAddProductSubmit = (values: any) => {
    if (!values.name.trim()) {
      toast.warning('Please enter a Product Name.');
      return;
    }

    const newProd: StarterProduct = {
      name: values.name,
      category: values.category || 'General',
      brand: values.brand || 'Store Brand',
      description: values.description || '',
      sku: values.sku || `SKU-${Date.now().toString().slice(-6)}`,
      price: Number(values.price) || 99,
      mrp: Number(values.mrp) || 120,
      taxPercent: Number(values.taxPercent) || 5,
      stock: Number(values.stock) || 50,
      isReturnable: values.isReturnable,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      variants,
    };

    setProductsList((prev) => [...prev, newProd]);
    setShowAddForm(false);
    setVariants([]);
    reset();
    toast.success('Starter product added to your catalog!');
  };

  const handleRemoveProduct = (index: number) => {
    setProductsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinishStep = async () => {
    setLoading(true);
    try {
      if (productsList.length > 0) {
        await VendorApi.saveOnboardingStep(11, { products: productsList });
      }
      toast.success('Catalog setup completed!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Failed to save products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Catalog setup skipped. You can add items later from inventory.');
    if (onSkip) onSkip();
    else if (onSuccess) onSuccess();
  };

  return (
    <StepContainer
      icon={<Package size={24} color={colors.primary} />}
      title="Starter Product Catalog"
      subtitle="Add sample items now to jumpstart sales upon approval, or skip and populate later."
    >
      {/* Skip Banner / Shortcut */}
      <View style={[styles.skipBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.skipTitle, { color: colors.textPrimary }]}>Optional Setup</Text>
          <Text style={[styles.skipSub, { color: colors.textSecondary }]}>
            You do not have to upload your whole inventory right now.
          </Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={[styles.skipBtn, { borderColor: colors.primary }]}>
          <Text style={[styles.skipBtnText, { color: colors.primary }]}>Skip for Now</Text>
        </TouchableOpacity>
      </View>

      {/* Added Products List */}
      <View style={styles.productListSection}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
            Starter Items ({productsList.length})
          </Text>

          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={[styles.addSmallBtn, { backgroundColor: colors.primary }]}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.addSmallBtnText}>+ Add Product</Text>
            </TouchableOpacity>
          )}
        </View>

        {productsList.map((prod, idx) => (
          <View
            key={idx}
            style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Image source={{ uri: prod.image }} style={styles.productImg} />
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
                {prod.name}
              </Text>
              <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
                {prod.category} • SKU: {prod.sku}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  {formatCurrency(prod.price)}
                </Text>
                <Text style={[styles.mrpText, { color: colors.textSecondary }]}>
                  {formatCurrency(prod.mrp)}
                </Text>
                <View style={[styles.stockBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.stockBadgeText}>{prod.stock} in stock</Text>
                </View>
              </View>

              {prod.variants.length > 0 && (
                <Text style={[styles.variantCountText, { color: colors.textSecondary }]}>
                  + {prod.variants.length} SKU variants configured
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={() => handleRemoveProduct(idx)} style={styles.deleteProductBtn}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Inline Product Creator Form */}
      {showAddForm && (
        <View style={[styles.creatorCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.creatorTitle, { color: colors.textPrimary }]}>Add New Starter Item</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Product Title *"
                placeholder="e.g. Fresh Red Apples (1 kg)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Category"
                    placeholder="Fruits & Vegetables"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="brand"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Brand Name"
                    placeholder="Fresh Farms"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Selling Price (₹) *"
                    placeholder="99"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="mrp"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="MRP (₹) *"
                    placeholder="120"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Opening Stock Qty *"
                    placeholder="50"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="sku"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Custom SKU (Optional)"
                    placeholder="SKU-APL-001"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
          </View>

          {/* Variants Section */}
          <View style={styles.variantBlock}>
            <View style={styles.variantHeader}>
              <Layers size={16} color={colors.primary} />
              <Text style={[styles.variantTitle, { color: colors.textPrimary }]}>Variants & Sizes</Text>
            </View>

            {variants.map((v) => (
              <View key={v.id} style={[styles.variantRow, { backgroundColor: colors.background }]}>
                <Text style={[styles.variantName, { color: colors.textPrimary }]}>{v.name}</Text>
                <Text style={[styles.variantPrice, { color: colors.primary }]}>{formatCurrency(v.price)}</Text>
                <TouchableOpacity onPress={() => handleRemoveVariant(v.id)}>
                  <Trash2 size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={handleAddVariant} style={styles.addVarBtn}>
              <Plus size={12} color={colors.primary} />
              <Text style={[styles.addVarText, { color: colors.primary }]}>+ Add Size / Color Variant</Text>
            </TouchableOpacity>
          </View>

          {/* Form Action CTAs */}
          <View style={styles.creatorActions}>
            <Button
              title="Add to Catalog"
              variant="primary"
              size="md"
              fullWidth
              onPress={handleSubmit(onAddProductSubmit)}
            />
            <Button
              title="Cancel"
              variant="ghost"
              size="sm"
              fullWidth
              onPress={() => setShowAddForm(false)}
              style={{ marginTop: 6 }}
            />
          </View>
        </View>
      )}

      {/* Main Bottom CTAs */}
      <View style={styles.actionsBlock}>
        <Button
          title={productsList.length > 0 ? 'Save & Continue' : 'Continue (Add Later)'}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleFinishStep}
        />
      </View>
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  skipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  skipTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  skipSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productListSection: {
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
  },
  productCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
  },
  mrpText: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  stockBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  variantCountText: {
    fontSize: 10,
    marginTop: 2,
  },
  deleteProductBtn: {
    padding: 6,
  },
  creatorCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
    gap: 12,
    ...Shadows.card,
  },
  creatorTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  variantBlock: {
    marginTop: 6,
    gap: 6,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  variantName: {
    fontSize: 12,
  },
  variantPrice: {
    fontSize: 12,
    fontWeight: '700',
  },
  addVarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  addVarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  creatorActions: {
    marginTop: 8,
  },
  actionsBlock: {
    marginTop: 10,
  },
});
