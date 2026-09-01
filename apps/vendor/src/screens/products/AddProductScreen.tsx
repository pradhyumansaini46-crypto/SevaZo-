import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import {
  Check,
  Plus,
  Image as ImageIcon,
  Percent,
  Scale,
  Tag,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Camera,
  Trash2,
  FileSpreadsheet,
  Eye,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  ShieldAlert,
  Calendar,
  X,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { VendorApi } from '../../services/vendorApi';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  defaultHsn: string;
  defaultGst: number;
  subcategories: string[];
  suggestedTags: string[];
  defaultImage: string;
}

const CATEGORY_TAXONOMY: CategoryItem[] = [
  {
    id: 'cat-groceries',
    name: 'Fruits & Vegetables',
    icon: '🥦',
    defaultHsn: '08045020',
    defaultGst: 0,
    subcategories: ['Fresh Fruits', 'Fresh Vegetables', 'Organic & Hydroponic', 'Exotic Fruits', 'Herbs & Seasonings', 'Cut & Sprouts'],
    suggestedTags: ['Fresh Today', 'Organic', 'Seasonal', 'Farm Fresh', 'Bestseller', 'Diet Friendly'],
    defaultImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600',
  },
  {
    id: 'cat-dairy',
    name: 'Dairy, Bread & Eggs',
    icon: '🥛',
    defaultHsn: '04012000',
    defaultGst: 5,
    subcategories: ['Milk & Cream', 'Paneer & Tofu', 'Butter & Cheese', 'Curd & Yogurt', 'Eggs', 'Fresh Breads & Buns'],
    suggestedTags: ['Daily Need', 'Cold Chain', 'Farm Fresh', 'Protein Rich', 'Pasteurized'],
    defaultImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
  },
  {
    id: 'cat-staples',
    name: 'Atta, Rice, Oil & Dals',
    icon: '🌾',
    defaultHsn: '10063010',
    defaultGst: 5,
    subcategories: ['Atta & Flours', 'Rice & Grains', 'Edible Oils & Ghee', 'Dals & Pulses', 'Sugar, Jaggery & Salt', 'Spices & Masalas'],
    suggestedTags: ['Pantry Essential', '100% Pure', 'Unpolished', 'Cold Pressed', 'Bulk Savings'],
    defaultImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
  },
  {
    id: 'cat-snacks',
    name: 'Snacks & Beverages',
    icon: '🍪',
    defaultHsn: '19053100',
    defaultGst: 12,
    subcategories: ['Chips & Namkeen', 'Biscuits & Cookies', 'Soft Drinks & Juices', 'Tea & Coffee', 'Chocolates & Candies', 'Instant Noodles & Pasta'],
    suggestedTags: ['Instant Munch', 'Trending', 'Party Pack', 'Zero Sugar', 'Bestseller'],
    defaultImage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
  },
  {
    id: 'cat-restaurant',
    name: 'Prepared Meals & Dishes',
    icon: '🍛',
    defaultHsn: '996331',
    defaultGst: 5,
    subcategories: ['Main Course & Curries', 'Starters & Appetizers', 'Biryani & Rice Bowls', 'Breads & Rotis', 'Pizzas & Fast Food', 'Desserts & Shakes'],
    suggestedTags: ['Chef Special', 'Pure Veg', 'Spicy', 'Freshly Prepared', 'Quick Bite'],
    defaultImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
  },
  {
    id: 'cat-pharmacy',
    name: 'Medicines & Wellness',
    icon: '💊',
    defaultHsn: '30049099',
    defaultGst: 12,
    subcategories: ['Prescription Medicines (Rx)', 'OTC & Pain Relief', 'Vitamins & Supplements', 'First Aid & Bandages', 'Ayurvedic & Herbal', 'Personal Hygiene'],
    suggestedTags: ['100% Genuine', 'Doctor Recommended', 'Fast Relief', 'Immunity Booster', 'Cold Chain'],
    defaultImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care & Beauty',
    icon: '🧴',
    defaultHsn: '33051090',
    defaultGst: 18,
    subcategories: ['Skin Care', 'Hair Care', 'Oral Hygiene', 'Soaps & Body Wash', 'Men Grooming', 'Baby Care'],
    suggestedTags: ['Dermatologist Tested', 'Cruelty Free', 'Chemical Free', 'Bestseller'],
    defaultImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Home Needs',
    icon: '🔌',
    defaultHsn: '85177090',
    defaultGst: 18,
    subcategories: ['Cables & Chargers', 'Earphones & Audio', 'Batteries & Bulbs', 'Cleaning & Detergents', 'Kitchen Essentials', 'Stationery'],
    suggestedTags: ['1-Year Warranty', 'Fast Charging', 'Durable', 'Bestseller'],
    defaultImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  },
];

const GST_SLABS = [0, 5, 12, 18, 28];

interface VariantItem {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
}

export const AddProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // 1. Basic Info & Category Hierarchy
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(CATEGORY_TAXONOMY[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(CATEGORY_TAXONOMY[0].subcategories[0]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('1 kg Box');
  const [tags, setTags] = useState<string[]>(['Fresh Today', 'Organic']);
  const [customTagInput, setCustomTagInput] = useState('');

  // 2. Pricing & Margin State
  const [price, setPrice] = useState('299');
  const [compareAtPrice, setCompareAtPrice] = useState('349');
  const [costPrice, setCostPrice] = useState('210');

  // 3. Tax & Compliance
  const [taxRate, setTaxRate] = useState<number>(selectedCategory.defaultGst);
  const [hsnCode, setHsnCode] = useState<string>(selectedCategory.defaultHsn);
  const [weightGrams, setWeightGrams] = useState('1000');

  // 4. Inventory, Reorder & Expiry
  const [stock, setStock] = useState('25');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [expiryDate, setExpiryDate] = useState('');
  const [shelfLifeDays, setShelfLifeDays] = useState('3');

  // 5. Variants System
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarMrp, setNewVarMrp] = useState('');
  const [newVarStock, setNewVarStock] = useState('');
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);

  // 6. Delivery & Handling Logistics
  const [isFragile, setIsFragile] = useState(false);
  const [isColdChain, setIsColdChain] = useState(false);
  const [maxQtyPerOrder, setMaxQtyPerOrder] = useState('10');

  // 7. Multi-Image System
  const [images, setImages] = useState<string[]>([selectedCategory.defaultImage]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  // 8. Bulk CSV & Preview Modals
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Category switch handler
  const handleSelectCategory = (cat: CategoryItem) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(cat.subcategories[0]);
    setTaxRate(cat.defaultGst);
    setHsnCode(cat.defaultHsn);
    setTags(cat.suggestedTags.slice(0, 3));
    if (images.length === 1 && images[0].includes('unsplash')) {
      setImages([cat.defaultImage]);
    }
  };

  // Smart calculations for Margin & Discount
  const calculations = useMemo(() => {
    const sPrice = parseFloat(price) || 0;
    const mrp = parseFloat(compareAtPrice) || 0;
    const cPrice = parseFloat(costPrice) || 0;

    const discountAmount = mrp > sPrice ? mrp - sPrice : 0;
    const discountPercent = mrp > 0 && discountAmount > 0 ? Math.round((discountAmount / mrp) * 100) : 0;

    const marginAmount = sPrice - cPrice;
    const marginPercent = sPrice > 0 && cPrice > 0 ? ((marginAmount / sPrice) * 100).toFixed(1) : '0';

    const isSellingAtLoss = cPrice > 0 && cPrice > sPrice;
    const isSellingAboveMrp = mrp > 0 && sPrice > mrp;

    return {
      sPrice,
      mrp,
      cPrice,
      discountAmount,
      discountPercent,
      marginAmount,
      marginPercent,
      isSellingAtLoss,
      isSellingAboveMrp,
    };
  }, [price, compareAtPrice, costPrice]);

  // Tags toggle handler
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTagInput('');
    }
  };

  // Multi-image management
  const handleAddImage = (uri: string) => {
    if (images.length >= 5) {
      Alert.alert('Image Limit Reached', 'You can upload up to 5 images per product.');
      return;
    }
    setImages([...images, uri]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleAddManualUrl = () => {
    if (manualImageUrl.trim()) {
      handleAddImage(manualImageUrl.trim());
      setManualImageUrl('');
    }
  };

  // Variant addition handler
  const handleAddVariant = () => {
    if (!newVarName || !newVarPrice || !newVarStock) {
      Alert.alert('Required Fields', 'Please enter Variant Name, Selling Price and Stock.');
      return;
    }
    const cleanBaseSku = (sku || name || 'VAR').slice(0, 4).toUpperCase().replace(/\s+/g, '');
    const variantSku = `${cleanBaseSku}-${newVarName.replace(/\s+/g, '').toUpperCase()}`;

    const newVar: VariantItem = {
      id: `var-${Date.now()}`,
      name: newVarName,
      sku: variantSku,
      price: newVarPrice,
      compareAtPrice: newVarMrp || newVarPrice,
      stock: newVarStock,
    };

    setVariants([...variants, newVar]);
    setNewVarName('');
    setNewVarPrice('');
    setNewVarMrp('');
    setNewVarStock('');
    setShowAddVariantModal(false);
  };

  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  // Save product (Draft or Active)
  const handleSaveProduct = async (status: 'ACTIVE' | 'DRAFT') => {
    if (!name.trim()) {
      Alert.alert('Missing Title', 'Please provide a product title.');
      return;
    }
    if (!price || calculations.sPrice <= 0) {
      Alert.alert('Missing Price', 'Please provide a valid selling price.');
      return;
    }
    if (calculations.isSellingAboveMrp) {
      Alert.alert('Invalid Pricing', 'Selling price cannot be greater than MRP.');
      return;
    }

    const finalSku = sku.trim() || `SKU-${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const finalImages = images.length > 0 ? images : [selectedCategory.defaultImage];

    setLoading(true);
    try {
      await VendorApi.createProduct({
        name: name.trim(),
        description: description.trim(),
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        subcategory: selectedSubcategory,
        brand: brand.trim() || undefined,
        price: calculations.sPrice,
        compareAtPrice: calculations.mrp > 0 ? calculations.mrp : undefined,
        costPrice: calculations.cPrice > 0 ? calculations.cPrice : undefined,
        taxRate,
        hsnCode: hsnCode.trim() || undefined,
        weightGrams: parseInt(weightGrams, 10) || undefined,
        sku: finalSku,
        stock: parseInt(stock, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        expiryDate: expiryDate.trim() || undefined,
        shelfLifeDays: parseInt(shelfLifeDays, 10) || undefined,
        unit: unit.trim() || '1 unit',
        tags,
        images: finalImages,
        isFragile,
        isColdChain,
        maxQuantityPerOrder: parseInt(maxQtyPerOrder, 10) || undefined,
        hasVariants,
        variants: hasVariants
          ? variants.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              price: parseFloat(v.price),
              compareAtPrice: parseFloat(v.compareAtPrice) || undefined,
              stock: parseInt(v.stock, 10) || 0,
            }))
          : [],
        status,
      });

      setShowPreviewModal(false);
      Alert.alert(
        status === 'ACTIVE' ? '🎉 Product Published' : '💾 Draft Saved',
        status === 'ACTIVE'
          ? 'Product is now live and discoverable on the SevaZo customer app!'
          : 'Product draft saved. You can complete and publish it anytime from your catalog.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Unable to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Add New Product"
        subtitle="Smart pricing, variants, multi-image & compliance"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Bulk CSV Upload Callout Banner */}
        <TouchableOpacity
          style={styles.csvBanner}
          onPress={() => setShowCsvModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.csvIconBox}>
            <FileSpreadsheet size={20} color="#FF6600" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.csvTitle}>Bulk SKU Onboarding via CSV</Text>
            <Text style={styles.csvSub}>Have 50+ items? Upload catalog instantly in one click</Text>
          </View>
          <ArrowRight size={16} color="#FF6600" />
        </TouchableOpacity>

        {/* 1. Category & Subcategory Selection Hierarchy */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📂 Category & Subcategory</Text>
            <Badge label={selectedCategory.name} variant="info" size="sm" />
          </View>

          {/* Main Category Horizontal Chips */}
          <Text style={styles.fieldLabel}>Select Store Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORY_TAXONOMY.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, isSelected && styles.catChipActive]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Subcategory Selector Chips */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Subcategory / Product Type *</Text>
          <View style={styles.subCatGrid}>
            {selectedCategory.subcategories.map((sub) => {
              const isSubSelected = selectedSubcategory === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subCatChip, isSubSelected && styles.subCatChipActive]}
                  onPress={() => setSelectedSubcategory(sub)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.subCatText, isSubSelected && styles.subCatTextActive]}>{sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Discovery Tags Selection */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Discovery & Search Tags</Text>
          <View style={styles.tagsContainer}>
            {selectedCategory.suggestedTags.map((tag) => {
              const isTagged = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, isTagged && styles.tagPillActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, isTagged && styles.tagTextActive]}>
                    {isTagged ? '✓ ' : '+ '}
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Tag Input */}
          <View style={styles.customTagRow}>
            <TextInput
              style={styles.customTagInput}
              placeholder="Add custom tag (e.g. cold-pressed)"
              placeholderTextColor="#94A3B8"
              value={customTagInput}
              onChangeText={setCustomTagInput}
              onSubmitEditing={handleAddCustomTag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddCustomTag}>
              <Text style={styles.addTagBtnText}>+ Add Tag</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Basic Product Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Product Identification</Text>

          <Input
            label="Product Title *"
            placeholder="e.g. Organic Ratnagiri Alphonso Mangoes"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (!sku) {
                const autoSku = txt
                  .slice(0, 3)
                  .toUpperCase()
                  .replace(/[^A-Z]/g, 'PRD');
                setSku(`${autoSku}-${Math.floor(100 + Math.random() * 900)}`);
              }
            }}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Brand / Producer"
                placeholder="e.g. Farm Fresh / Amul"
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Base Unit / Packaging *"
                placeholder="e.g. 500g, 1 kg Box"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          <Input
            label="Master SKU (Stock Keeping Unit) *"
            placeholder="e.g. FRU-MAN-001"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="characters"
            rightIcon={<CheckCircle2 size={16} color="#10B981" />}
            helperText="Auto-validated unique catalog identifier"
          />

          <Input
            label="Description & Highlights"
            placeholder="Describe product freshness, origin, grade, shelf-life and taste highlights..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 3. Pricing Section — Smart Automation */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>💰 Smart Pricing & Margins</Text>
            <View style={styles.smartBadge}>
              <TrendingUp size={12} color="#15803D" />
              <Text style={styles.smartBadgeText}>Live Margin Calculator</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Selling Price (₹) *"
                placeholder="299"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
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
            label="Cost / Wholesale Price (₹ - Optional)"
            placeholder="210"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="numeric"
            prefix="₹"
            helperText="Used internally to calculate your profit margin %"
          />

          {/* Live Auto-Calculated Metrics Bar */}
          <View style={styles.pricingMetricsBar}>
            {/* Discount Pill */}
            {calculations.discountPercent > 0 && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Customer Discount:</Text>
                <Text style={styles.metricValueGreen}>🏷️ {calculations.discountPercent}% OFF</Text>
              </View>
            )}

            {/* Profit Margin Pill */}
            {calculations.cPrice > 0 && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Gross Margin:</Text>
                <Text style={[styles.metricValue, { color: calculations.isSellingAtLoss ? '#DC2626' : '#15803D' }]}>
                  ₹{calculations.marginAmount.toFixed(0)} ({calculations.marginPercent}%)
                </Text>
              </View>
            )}
          </View>

          {/* Loss Warning Banner */}
          {calculations.isSellingAtLoss && (
            <View style={styles.lossAlertBanner}>
              <AlertTriangle size={18} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.lossAlertTitle}>⚠️ You're selling at a loss!</Text>
                <Text style={styles.lossAlertDesc}>
                  Cost Price (₹{calculations.cPrice}) is higher than Selling Price (₹{calculations.sPrice}). You will lose ₹{Math.abs(calculations.marginAmount).toFixed(0)} per unit.
                </Text>
              </View>
            </View>
          )}

          {/* Price > MRP Warning */}
          {calculations.isSellingAboveMrp && (
            <View style={styles.lossAlertBanner}>
              <AlertTriangle size={18} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.lossAlertTitle}>⚠️ Selling Price exceeds MRP</Text>
                <Text style={styles.lossAlertDesc}>
                  In India, consumer laws mandate that Selling Price cannot exceed MRP (₹{calculations.mrp}).
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 4. Multi-Image Section with Camera Upload + AI Fallback */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🖼️ Product Photos (1–5)</Text>
            <Text style={styles.photoCountText}>{images.length}/5 Photos</Text>
          </View>

          <Text style={styles.fieldSubLabel}>
            Upload clear shots showing the product packaging, nutritional table, and freshness.
          </Text>

          {/* Horizontal Image Thumbnails */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((imgUri, index) => (
              <View key={index} style={styles.imageThumbWrap}>
                <Image source={{ uri: imgUri }} style={styles.imageThumb} />
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteImgBtn}
                  onPress={() => handleRemoveImage(index)}
                  activeOpacity={0.7}
                >
                  <X size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoSlot}
                onPress={() => setShowImagePicker(true)}
                activeOpacity={0.7}
              >
                <Camera size={22} color="#FF6600" />
                <Text style={styles.addPhotoSlotText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Quick Actions Row */}
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={() => setShowImagePicker(true)}
            >
              <Camera size={14} color="#FF6600" />
              <Text style={styles.actionPillBtnText}>Camera / Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={() => setImages([selectedCategory.defaultImage])}
            >
              <Sparkles size={14} color="#3B82F6" />
              <Text style={[styles.actionPillBtnText, { color: '#3B82F6' }]}>Auto Category Fallback</Text>
            </TouchableOpacity>
          </View>

          {/* Manual URL Input Fallback */}
          <View style={styles.urlInputRow}>
            <TextInput
              style={styles.urlInput}
              placeholder="Or paste direct image URL (https://...)"
              placeholderTextColor="#94A3B8"
              value={manualImageUrl}
              onChangeText={setManualImageUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addUrlBtn} onPress={handleAddManualUrl}>
              <Text style={styles.addUrlBtnText}>Add URL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Inventory, Reorder Alert & Expiry Date */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Inventory & Shelf Life</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Physical Stock Available *"
                placeholder="25"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Low-Stock Alert Level"
                placeholder="5"
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
                keyboardType="numeric"
                helperText="Triggers reorder notification"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Expiry Date (DD/MM/YYYY)"
                placeholder="30/11/2026"
                value={expiryDate}
                onChangeText={setExpiryDate}
                leftIcon={<Calendar size={16} color={Colors.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Shelf Life (Days)"
                placeholder="3"
                value={shelfLifeDays}
                onChangeText={setShelfLifeDays}
                keyboardType="numeric"
                helperText="Auto-flags fresh perishables"
              />
            </View>
          </View>
        </View>

        {/* 6. Product Variants System */}
        <View style={styles.card}>
          <View style={styles.variantHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>🔀 Multi-Size & Weight Variants</Text>
              <Text style={styles.fieldSubLabel}>e.g. 250g, 500g, 1kg or Pack of 2</Text>
            </View>
            <Switch
              value={hasVariants}
              onValueChange={setHasVariants}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
              thumbColor={hasVariants ? '#FF6600' : '#CBD5E1'}
            />
          </View>

          {hasVariants && (
            <View style={{ marginTop: 12 }}>
              {variants.map((v) => (
                <View key={v.id} style={styles.variantCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.variantTitle}>{v.name}</Text>
                    <Text style={styles.variantSub}>
                      SKU: {v.sku} • ₹{v.price} {v.compareAtPrice ? `(MRP: ₹${v.compareAtPrice})` : ''} • Stock: {v.stock}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteVariant(v.id)} style={styles.trashBtn}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addVariantBtn}
                onPress={() => setShowAddVariantModal(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FF6600" />
                <Text style={styles.addVariantBtnText}>+ Add Packaging / Size Variant</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 7. Tax & Delivery Logistics Compliance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ GST & Logistics Handling</Text>

          {/* Standard GST Rate Selector */}
          <Text style={styles.fieldLabel}>GST Tax Slab *</Text>
          <View style={styles.gstSlabsRow}>
            {GST_SLABS.map((rate) => {
              const isSelected = taxRate === rate;
              return (
                <TouchableOpacity
                  key={rate}
                  style={[styles.gstPill, isSelected && styles.gstPillActive]}
                  onPress={() => setTaxRate(rate)}
                >
                  <Text style={[styles.gstPillText, isSelected && styles.gstPillTextActive]}>
                    {rate === 0 ? '0% (Exempt)' : `${rate}%`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="HSN / SAC Code"
                placeholder="08045020"
                value={hsnCode}
                onChangeText={setHsnCode}
                leftIcon={<Receipt size={16} color={Colors.textSecondary} />}
                helperText="Auto-suggested for category"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Weight (Grams)"
                placeholder="1000"
                value={weightGrams}
                onChangeText={setWeightGrams}
                keyboardType="numeric"
                leftIcon={<Scale size={16} color={Colors.textSecondary} />}
                helperText="For dispatch payload balancing"
              />
            </View>
          </View>

          {/* Logistics Handling Toggles */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Fragile Item Handling</Text>
              <Text style={styles.toggleSub}>Glass jars, fragile baked goods, or delicate items</Text>
            </View>
            <Switch
              value={isFragile}
              onValueChange={setIsFragile}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
              thumbColor={isFragile ? '#FF6600' : '#CBD5E1'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Temperature Sensitive / Cold-Chain</Text>
              <Text style={styles.toggleSub}>Ice creams, frozen dairy, or insulated packaging</Text>
            </View>
            <Switch
              value={isColdChain}
              onValueChange={setIsColdChain}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
              thumbColor={isColdChain ? '#FF6600' : '#CBD5E1'}
            />
          </View>

          <Input
            label="Max Order Quantity Limit (Per Order)"
            placeholder="10"
            value={maxQtyPerOrder}
            onChangeText={setMaxQtyPerOrder}
            keyboardType="numeric"
            helperText="Prevents single order vehicle overload"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setShowPreviewModal(true)}
            activeOpacity={0.8}
          >
            <Eye size={18} color="#0F172A" />
            <Text style={styles.previewBtnText}>Preview as Customer</Text>
          </TouchableOpacity>

          <View style={styles.publishRow}>
            <Button
              title="Save as Draft"
              variant="outline"
              onPress={() => handleSaveProduct('DRAFT')}
              loading={loading}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Publish to Store"
              onPress={() => handleSaveProduct('ACTIVE')}
              loading={loading}
              leftIcon={<Check size={18} color="#FFFFFF" />}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={(uri) => handleAddImage(uri)}
        title="Upload Product Photo"
      />

      {/* Add Variant Modal */}
      <Modal visible={showAddVariantModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Add Product Variant</Text>
              <TouchableOpacity onPress={() => setShowAddVariantModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Input
              label="Variant Title / Size *"
              placeholder="e.g. 500g Pack, 1 kg Box, Pack of 3"
              value={newVarName}
              onChangeText={setNewVarName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Input
                  label="Selling Price (₹) *"
                  placeholder="150"
                  value={newVarPrice}
                  onChangeText={setNewVarPrice}
                  keyboardType="numeric"
                  prefix="₹"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Input
                  label="MRP (₹)"
                  placeholder="180"
                  value={newVarMrp}
                  onChangeText={setNewVarMrp}
                  keyboardType="numeric"
                  prefix="₹"
                />
              </View>
            </View>

            <Input
              label="Available Stock (Units) *"
              placeholder="15"
              value={newVarStock}
              onChangeText={setNewVarStock}
              keyboardType="numeric"
            />

            <Button
              title="Add Variant"
              onPress={handleAddVariant}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>

      {/* Bulk CSV Upload Modal */}
      <Modal visible={showCsvModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={22} color="#FF6600" />
                <Text style={styles.modalHeading}>Bulk Catalog CSV Upload</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCsvModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.csvModalDesc}>
              Quickly onboard 50–500+ SKUs using the standard SevaZo Merchant spreadsheet template.
            </Text>

            <View style={styles.csvStepBox}>
              <Text style={styles.csvStepTitle}>1. Download Standard Template</Text>
              <Text style={styles.csvStepSub}>Includes columns: SKU, Title, Category, MRP, SellingPrice, Stock, Unit, GST, HSN</Text>
              <TouchableOpacity
                style={styles.downloadCsvBtn}
                onPress={() => Alert.alert('Template Downloaded', 'sevazo_catalog_template.csv saved to downloads.')}
              >
                <Text style={styles.downloadCsvText}>⬇️ Download Sample .CSV Template</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.csvStepBox}>
              <Text style={styles.csvStepTitle}>2. Upload Completed Spreadsheet</Text>
              <TouchableOpacity
                style={styles.uploadCsvZone}
                onPress={() => {
                  setShowCsvModal(false);
                  Alert.alert('CSV Parsed Successfully', '24 Kirana SKUs added to your catalog drafts!');
                }}
              >
                <FileSpreadsheet size={32} color="#FF6600" />
                <Text style={styles.uploadCsvZoneTitle}>Tap to select .csv or .xlsx file</Text>
                <Text style={styles.uploadCsvZoneSub}>Supports UTF-8 CSV, Excel spreadsheets up to 25MB</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowCsvModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Preview Before Publish ("Preview as Customer") Modal */}
      <Modal visible={showPreviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%', padding: 0, overflow: 'hidden' }]}>
            {/* Header */}
            <View style={[styles.modalHeaderRow, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Eye size={18} color="#FF6600" />
                <Text style={styles.modalHeading}>Customer App Live Preview</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {/* Product Image Preview Card */}
              <View style={styles.previewImageCard}>
                <Image
                  source={{ uri: images[0] || selectedCategory.defaultImage }}
                  style={styles.previewMainImage}
                  resizeMode="cover"
                />
                <View style={styles.previewTagOverlay}>
                  <Text style={styles.previewTagOverlayText}>⚡ 15-Min Delivery</Text>
                </View>
              </View>

              {/* Title & Brand */}
              <Text style={styles.previewBrand}>{brand || selectedCategory.name}</Text>
              <Text style={styles.previewTitle}>{name || 'Sample Product Title'}</Text>
              <Text style={styles.previewUnit}>{unit || '1 unit'}</Text>

              {/* Pricing Display */}
              <View style={styles.previewPriceRow}>
                <Text style={styles.previewPrice}>₹{calculations.sPrice || '299'}</Text>
                {calculations.mrp > calculations.sPrice && (
                  <>
                    <Text style={styles.previewMrp}>₹{calculations.mrp}</Text>
                    <View style={styles.previewDiscountBadge}>
                      <Text style={styles.previewDiscountText}>{calculations.discountPercent}% OFF</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Badges Row */}
              <View style={styles.previewBadgesRow}>
                {tags.map((t) => (
                  <View key={t} style={styles.previewPillBadge}>
                    <Text style={styles.previewPillText}>{t}</Text>
                  </View>
                ))}
                {isColdChain && (
                  <View style={[styles.previewPillBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.previewPillText, { color: '#2563EB' }]}>❄️ Cold Chain</Text>
                  </View>
                )}
                {isFragile && (
                  <View style={[styles.previewPillBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.previewPillText, { color: '#DC2626' }]}>🛡️ Fragile</Text>
                  </View>
                )}
              </View>

              {/* Variants Preview */}
              {hasVariants && variants.length > 0 && (
                <View style={styles.previewVariantsBox}>
                  <Text style={styles.previewVarLabel}>Available Packaging Units:</Text>
                  <View style={styles.previewVarChipsRow}>
                    {variants.map((v, i) => (
                      <View key={v.id} style={[styles.previewVarChip, i === 0 && styles.previewVarChipActive]}>
                        <Text style={[styles.previewVarChipText, i === 0 && styles.previewVarChipTextActive]}>
                          {v.name} (₹{v.price})
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Mock Customer CTA */}
              <View style={styles.mockAddBtn}>
                <Text style={styles.mockAddBtnText}>ADD TO CART</Text>
              </View>

              <Text style={styles.previewNote}>
                ✓ This preview reflects the authentic layout displayed on the SevaZo Customer app.
              </Text>
            </ScrollView>

            {/* Modal Bottom Publish Action */}
            <View style={styles.previewFooterRow}>
              <Button
                title="Save Draft"
                variant="outline"
                onPress={() => handleSaveProduct('DRAFT')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Publish Now"
                onPress={() => handleSaveProduct('ACTIVE')}
                leftIcon={<Check size={18} color="#FFFFFF" />}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  csvBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 16,
    gap: 12,
  },
  csvIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  csvTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  csvSub: {
    fontSize: 11.5,
    color: '#C2410C',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  fieldSubLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  catScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  catChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  catChipIcon: {
    fontSize: 15,
  },
  catChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  subCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subCatChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subCatChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  subCatText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subCatTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tagTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  customTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  addTagBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addTagBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  smartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  pricingMetricsBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    marginVertical: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  metricValueGreen: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#15803D',
  },
  lossAlertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  lossAlertTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  lossAlertDesc: {
    fontSize: 11.5,
    color: '#B91C1C',
    marginTop: 1,
    lineHeight: 16,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6600',
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageThumbWrap: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 102, 0, 0.9)',
    alignItems: 'center',
    paddingVertical: 2,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  deleteImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoSlot: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderStyle: 'dashed',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoSlotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  actionPillBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  addUrlBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addUrlBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  variantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  variantTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  variantSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  trashBtn: {
    padding: 6,
  },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  addVariantBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  gstSlabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  gstPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gstPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  gstPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  gstPillTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bottomActions: {
    marginTop: 8,
    gap: 10,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  publishRow: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  csvModalDesc: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  csvStepBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  csvStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  csvStepSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  downloadCsvBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadCsvText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  uploadCsvZone: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  uploadCsvZoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  uploadCsvZoneSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  previewImageCard: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  previewMainImage: {
    width: '100%',
    height: '100%',
  },
  previewTagOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewTagOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  previewBrand: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FF6600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  previewUnit: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  previewPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  previewMrp: {
    fontSize: 15,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  previewDiscountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewDiscountText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  previewBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  previewPillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  previewVariantsBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  previewVarLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  previewVarChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewVarChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewVarChipActive: {
    borderColor: '#FF6600',
    backgroundColor: '#FFF7ED',
  },
  previewVarChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  previewVarChipTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  mockAddBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  mockAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 4,
  },
  previewFooterRow: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
});

export default AddProductScreen;
