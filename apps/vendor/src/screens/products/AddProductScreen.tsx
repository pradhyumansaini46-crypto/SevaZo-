import React, { useState, useMemo, useEffect } from 'react';
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
  FlatList,
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
  Search,
  Sparkle,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { VendorApi } from '../../services/vendorApi';
import {
  PRODUCT_MASTER_CATALOG,
  MasterProductItem,
  searchProductMaster,
} from '../../data/productMasterCatalog';

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
    subcategories: ['Milk & Milk Products', 'Paneer & Tofu', 'Butter & Cheese', 'Curd & Yogurt', 'Eggs', 'Fresh Breads & Buns'],
    suggestedTags: ['Daily Need', 'Cold Chain', 'Farm Fresh', 'Protein Rich', 'Pasteurized'],
    defaultImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
  },
  {
    id: 'cat-staples',
    name: 'Atta, Rice, Oil & Dals',
    icon: '🌾',
    defaultHsn: '10063010',
    defaultGst: 5,
    subcategories: ['Atta & Flour', 'Rice', 'Cooking Oil & Ghee', 'Pulses & Dals', 'Sugar, Jaggery & Salt', 'Spices & Masalas'],
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
  // Master Search Dropdown State
  const [showMasterSearchModal, setShowMasterSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchCatFilter, setActiveSearchCatFilter] = useState<string>('all');
  const [selectedMasterProduct, setSelectedMasterProduct] = useState<MasterProductItem | null>(null);

  // 1. Basic Info & Category Hierarchy
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(CATEGORY_TAXONOMY[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(CATEGORY_TAXONOMY[0].subcategories[0]);
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [availableUnits, setAvailableUnits] = useState<string[]>(['500g', '1 kg', '2 kg']);
  const [tags, setTags] = useState<string[]>(['Fresh Today', 'Farm Fresh']);
  const [customTagInput, setCustomTagInput] = useState('');

  // 2. Pricing & Margin State
  const [price, setPrice] = useState('45');
  const [compareAtPrice, setCompareAtPrice] = useState('55');
  const [costPrice, setCostPrice] = useState('32');

  // 3. Tax & Compliance
  const [taxRate, setTaxRate] = useState<number>(0);
  const [hsnCode, setHsnCode] = useState<string>('07020000');
  const [weightGrams, setWeightGrams] = useState('1000');

  // 4. Inventory, Reorder & Expiry
  const [stock, setStock] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [expiryDate, setExpiryDate] = useState('');
  const [shelfLifeDays, setShelfLifeDays] = useState('5');

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

  // 7. Multi-Image System (Reference Images vs Custom)
  const [referenceImages, setReferenceImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
    'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600',
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=600',
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [images, setImages] = useState<string[]>([referenceImages[0]]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  // 8. Bulk CSV & Preview Modals
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-init with initial master tomato product on load
  useEffect(() => {
    if (!name && PRODUCT_MASTER_CATALOG.length > 0) {
      handleSelectMasterProduct(PRODUCT_MASTER_CATALOG[1]); // Tomato default
    }
  }, []);

  // Filtered master products list
  const filteredMasterProducts = useMemo(() => {
    return searchProductMaster(searchQuery, activeSearchCatFilter);
  }, [searchQuery, activeSearchCatFilter]);

  // Master product selection handler
  const handleSelectMasterProduct = (item: MasterProductItem) => {
    setSelectedMasterProduct(item);
    setName(item.name_en);
    setHindiName(item.name_hi_native);
    setDescription(item.description_template);
    setHsnCode(item.default_hsn);
    setTaxRate(item.default_gst);
    setUnit(item.default_unit);
    setAvailableUnits(item.default_unit_options);
    setTags(item.suggested_tags);
    setReferenceImages(item.reference_images);
    setSelectedImageIndex(0);
    setImages([item.reference_images[0]]);
    if (item.default_weight_grams) setWeightGrams(item.default_weight_grams.toString());
    if (item.shelf_life_days) setShelfLifeDays(item.shelf_life_days.toString());
    setIsColdChain(!!item.is_cold_chain);
    setIsFragile(!!item.is_fragile);

    // Find and set category taxonomy
    const matchedCategory = CATEGORY_TAXONOMY.find((c) => c.id === item.categoryId) || CATEGORY_TAXONOMY[0];
    setSelectedCategory(matchedCategory);
    setSelectedSubcategory(item.subcategory || matchedCategory.subcategories[0]);

    // Generate SKU
    const prefix = item.name_en.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SKU');
    setSku(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);

    setShowMasterSearchModal(false);
  };

  // Custom product fallback handler
  const handleSelectCustomProduct = (customName: string) => {
    setSelectedMasterProduct(null);
    setName(customName);
    setHindiName('');
    const autoSku = customName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
    setSku(`${autoSku}-${Math.floor(100 + Math.random() * 900)}`);
    setShowMasterSearchModal(false);
  };

  // Reference image switcher handler
  const handlePickReferenceImage = (imgUrl: string, index: number) => {
    setSelectedImageIndex(index);
    setImages([imgUrl]);
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
      Alert.alert('Missing Title', 'Please select or enter a product title.');
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
    const finalImages = images.length > 0 ? images : [referenceImages[0] || selectedCategory.defaultImage];

    setLoading(true);
    try {
      await VendorApi.createProduct({
        name: name.trim(),
        hindiName: hindiName || undefined,
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
        subtitle="Smart master search, 3 reference photos & compliance"
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

        {/* 1. Smart Master Product Dropdown Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#FF6600" />
              <Text style={styles.cardTitle}>Product Selection & Master Lookup</Text>
            </View>
            <Badge label="English + Hinglish" variant="warning" size="sm" />
          </View>

          <Text style={styles.fieldSubLabel}>
            Tap below to search thousands of products in English or Hinglish (e.g. "tamatar", "pyaz", "aam", "doodh", "chawal").
          </Text>

          {/* Searchable Title Dropdown Input Box */}
          <TouchableOpacity
            style={styles.masterSearchTrigger}
            onPress={() => {
              setSearchQuery('');
              setShowMasterSearchModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.searchTriggerLeft}>
              <Search size={18} color="#FF6600" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.searchTriggerLabel}>Product Title *</Text>
                <Text style={styles.searchTriggerValue} numberOfLines={1}>
                  {name ? `${name} ${hindiName ? `(${hindiName})` : ''}` : 'Search product (e.g. Tamatar, Pyaz, Aam)...'}
                </Text>
              </View>
            </View>
            <View style={styles.searchTriggerBtn}>
              <Text style={styles.searchTriggerBtnText}>Change</Text>
              <ChevronRight size={14} color="#EA580C" />
            </View>
          </TouchableOpacity>

          {/* Auto-filled Category & Hierarchy Badges */}
          <View style={styles.autoFilledPillRow}>
            <View style={styles.pillBox}>
              <Text style={styles.pillBoxLabel}>Category:</Text>
              <Text style={styles.pillBoxVal}>{selectedCategory.name}</Text>
            </View>
            <View style={styles.pillBox}>
              <Text style={styles.pillBoxLabel}>Subcategory:</Text>
              <Text style={styles.pillBoxVal}>{selectedSubcategory}</Text>
            </View>
          </View>

          {/* Master SKU & Base Packaging Unit */}
          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Master SKU *"
                placeholder="FRU-MAN-001"
                value={sku}
                onChangeText={setSku}
                autoCapitalize="characters"
                rightIcon={<CheckCircle2 size={16} color="#10B981" />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Base Packaging Unit *"
                placeholder="1 kg"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          {/* Suggested Standard Packaging Units Chips */}
          {availableUnits.length > 0 && (
            <View style={{ marginTop: 2 }}>
              <Text style={styles.miniLabel}>Quick Packaging Options:</Text>
              <View style={styles.unitChipsRow}>
                {availableUnits.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Pre-written Editable Description */}
          <View style={{ marginTop: 12 }}>
            <Input
              label="Description & Highlights (Auto-Filled, Editable) *"
              placeholder="Freshness, origin, shelf-life and taste highlights..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              helperText="Pre-populated from master template. Edit freely to customize."
            />
          </View>
        </View>

        {/* 2. 3 Reference Images Selector Card (Part E UX) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ImageIcon size={16} color="#FF6600" />
              <Text style={styles.cardTitle}>Reference Photos (Pick Your Stock Match)</Text>
            </View>
            <Text style={styles.photoCountText}>3 Options Available</Text>
          </View>

          <Text style={styles.fieldSubLabel}>
            Select the reference photo that best represents your physical inventory stock, or upload your custom store photo.
          </Text>

          {/* 3 Reference Photo Grid */}
          <View style={styles.refImagesGrid}>
            {referenceImages.map((imgUrl, idx) => {
              const isSelected = selectedImageIndex === idx && images[0] === imgUrl;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.refImageCard, isSelected && styles.refImageCardSelected]}
                  onPress={() => handlePickReferenceImage(imgUrl, idx)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imgUrl }} style={styles.refImage} />
                  {isSelected ? (
                    <View style={styles.selectedBadge}>
                      <Check size={12} color="#FFFFFF" />
                      <Text style={styles.selectedBadgeText}>Selected</Text>
                    </View>
                  ) : (
                    <View style={styles.pickBadge}>
                      <Text style={styles.pickBadgeText}>Option {idx + 1}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Photo Upload Action Bar */}
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              style={styles.customPhotoBtn}
              onPress={() => setShowImagePicker(true)}
              activeOpacity={0.8}
            >
              <Camera size={15} color="#FF6600" />
              <Text style={styles.customPhotoBtnText}>📸 Take My Own Store Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.customPhotoBtnSecondary}
              onPress={() => setImages([referenceImages[0]])}
              activeOpacity={0.8}
            >
              <Sparkles size={14} color="#3B82F6" />
              <Text style={styles.customPhotoBtnSecText}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
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
                placeholder="45"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Original / MRP (₹)"
                placeholder="55"
                value={compareAtPrice}
                onChangeText={setCompareAtPrice}
                keyboardType="numeric"
                prefix="₹"
              />
            </View>
          </View>

          <Input
            label="Cost / Wholesale Price (₹ - Optional)"
            placeholder="32"
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

        {/* 4. Inventory, Reorder Alert & Expiry Date */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Inventory & Shelf Life</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label="Physical Stock Available *"
                placeholder="50"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label="Low-Stock Alert Level"
                placeholder="10"
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
                placeholder="5"
                value={shelfLifeDays}
                onChangeText={setShelfLifeDays}
                keyboardType="numeric"
                helperText="Auto-flags fresh perishables"
              />
            </View>
          </View>
        </View>

        {/* 5. Product Variants System */}
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

        {/* 6. Tax & Delivery Logistics Compliance */}
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
                placeholder="07020000"
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
              <Text style={styles.toggleSub}>Glass jars, fragile eggs, or delicate baked items</Text>
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
              <Text style={styles.toggleSub}>Dairy pouches, ice creams, or refrigerated goods</Text>
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

      {/* ======================================================== */}
      {/* 1. MASTER PRODUCT SMART SEARCH DROPDOWN MODAL */}
      {/* ======================================================== */}
      <Modal visible={showMasterSearchModal} transparent animationType="slide">
        <View style={styles.masterModalOverlay}>
          <View style={styles.masterModalContent}>
            {/* Modal Header */}
            <View style={styles.masterModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#FF6600" />
                <Text style={styles.masterModalHeading}>Select Product from Master Database</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMasterSearchModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Big Search Input Bar */}
            <View style={styles.masterSearchInputWrap}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.masterSearchInputField}
                placeholder="Search 'tamatar', 'pyaz', 'aam', 'doodh', 'chawal'..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              <TouchableOpacity
                style={[styles.filterChip, activeSearchCatFilter === 'all' && styles.filterChipActive]}
                onPress={() => setActiveSearchCatFilter('all')}
              >
                <Text style={[styles.filterChipText, activeSearchCatFilter === 'all' && styles.filterChipTextActive]}>
                  🌟 All ({PRODUCT_MASTER_CATALOG.length})
                </Text>
              </TouchableOpacity>
              {CATEGORY_TAXONOMY.map((cat) => {
                const isSelected = activeSearchCatFilter === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    onPress={() => setActiveSearchCatFilter(cat.id)}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {cat.icon} {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Master Products List */}
            <FlatList
              data={filteredMasterProducts}
              keyExtractor={(item) => item.product_id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.masterResultCard}
                  onPress={() => handleSelectMasterProduct(item)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.reference_images[0] }} style={styles.masterResultThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.masterResultTitle}>{item.name_en}</Text>
                      {item.name_hi_native && (
                        <Text style={styles.masterResultHindi}>({item.name_hi_native})</Text>
                      )}
                    </View>
                    <Text style={styles.masterResultCategory}>
                      {item.category} • {item.subcategory}
                    </Text>
                    <View style={styles.masterResultTagsRow}>
                      <Text style={styles.masterResultUnits}>
                        Units: {item.default_unit_options.slice(0, 3).join(', ')}
                      </Text>
                      <View style={styles.gstTag}>
                        <Text style={styles.gstTagText}>GST {item.default_gst}%</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyMasterSearch}>
                  <Text style={styles.emptySearchTitle}>No pre-indexed product found</Text>
                  <Text style={styles.emptySearchSub}>
                    You can add "{searchQuery}" as a custom unlisted item below.
                  </Text>
                </View>
              }
              ListFooterComponent={
                searchQuery.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.customAddCard}
                    onPress={() => handleSelectCustomProduct(searchQuery.trim())}
                  >
                    <View style={styles.customAddIcon}>
                      <Plus size={18} color="#FF6600" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customAddTitle}>+ Add Custom Product: "{searchQuery.trim()}"</Text>
                      <Text style={styles.customAddSub}>Submit new SKU to crowdsourced catalog</Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={(uri) => handleAddImage(uri)}
        title="Upload Custom Product Photo"
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
                  source={{ uri: images[0] || referenceImages[0] }}
                  style={styles.previewMainImage}
                  resizeMode="cover"
                />
                <View style={styles.previewTagOverlay}>
                  <Text style={styles.previewTagOverlayText}>⚡ 15-Min Delivery</Text>
                </View>
              </View>

              {/* Title & Brand */}
              <Text style={styles.previewBrand}>{brand || selectedCategory.name}</Text>
              <Text style={styles.previewTitle}>
                {name || 'Sample Product Title'} {hindiName ? `(${hindiName})` : ''}
              </Text>
              <Text style={styles.previewUnit}>{unit || '1 unit'}</Text>

              {/* Pricing Display */}
              <View style={styles.previewPriceRow}>
                <Text style={styles.previewPrice}>₹{calculations.sPrice || '45'}</Text>
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

              {/* Description Preview */}
              <Text style={styles.previewDesc}>{description}</Text>

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
    marginBottom: 10,
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
  masterSearchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchTriggerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C2410C',
    textTransform: 'uppercase',
  },
  searchTriggerValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  searchTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 2,
  },
  searchTriggerBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  autoFilledPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  pillBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBoxLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  pillBoxVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  unitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  unitChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  refImagesGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  refImageCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  refImageCardSelected: {
    borderColor: '#FF6600',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  refImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    gap: 3,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  pickBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 2,
  },
  pickBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  customPhotoBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 6,
  },
  customPhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  customPhotoBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  customPhotoBtnSecText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3B82F6',
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6600',
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
  // Master Search Modal Styles
  masterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  masterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: '90%',
    minHeight: '75%',
  },
  masterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  masterModalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 6,
  },
  masterSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 10,
  },
  masterSearchInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterChipScroll: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    maxHeight: 36,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  masterResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  masterResultThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  masterResultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  masterResultHindi: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FF6600',
  },
  masterResultCategory: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  masterResultTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  masterResultUnits: {
    fontSize: 11,
    color: '#94A3B8',
  },
  gstTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gstTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  emptyMasterSearch: {
    padding: 24,
    alignItems: 'center',
  },
  emptySearchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  emptySearchSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  customAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  customAddIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAddTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  customAddSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 1,
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
  previewDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
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
