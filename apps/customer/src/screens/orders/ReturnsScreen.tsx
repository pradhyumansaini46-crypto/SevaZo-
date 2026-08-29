import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { RotateCcw, CheckSquare, Square, Camera, CheckCircle2 } from 'lucide-react-native';
import { useOrderStore } from '../../stores/orderStore';

export const ReturnsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId || 'ord-1002';

  const { requestReturn } = useOrderStore();

  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    'Packaging Damaged / Leakage',
    'Expired / Near Expiry Item',
    'Incorrect Item Delivered',
    'Quality not fresh / stale',
    'Missing Item from Delivery Bag',
  ];

  const orderItems = [
    {
      id: 'oi-4',
      productId: 'prod-5',
      name: 'Artisan Country Sourdough Loaf (400g)',
      price: 130,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
    },
    {
      id: 'oi-5',
      productId: 'prod-4',
      name: 'Epigamia Greek Yogurt (Wild Blueberry)',
      price: 55,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200',
    },
  ];

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSubmitReturn = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Select Items', 'Please choose at least 1 item to return.');
      return;
    }

    setSubmitting(true);
    await requestReturn({
      orderId,
      orderNumber: 'SVZ-20260819-4411',
      items: selectedItems.map((id) => {
        const itm = orderItems.find((i) => i.id === id);
        return { productId: itm?.productId || id, name: itm?.name || 'Item', quantity: 1 };
      }),
      reason: selectedReason,
      notes,
      refundAmount: 130,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header showBack onPressBack={() => navigation.goBack()} title="Return Request" />
        <View style={styles.successBox}>
          <CheckCircle2 size={64} color={Colors.primary} />
          <Text style={styles.successTitle}>Return Request Approved!</Text>
          <Text style={styles.successSubtitle}>
            ₹130 has been credited to your Sevazo Wallet. No pickup needed for fresh food items.
          </Text>

          <Button
            title="View Refund Status"
            onPress={() => navigation.replace('Refunds')}
            size="md"
            style={styles.successBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Return / Replace Items"
        subtitle="Sevazo No-Questions-Asked Freshness Guarantee"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Step 1: Select Items */}
        <Text style={styles.sectionHeading}>1. Select Items to Return</Text>
        {orderItems.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => toggleItem(item.id)}
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
            >
              {isSelected ? (
                <CheckSquare size={20} color={Colors.primary} />
              ) : (
                <Square size={20} color={Colors.textMuted} />
              )}
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Refund: ₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Step 2: Reason Selector */}
        <Text style={styles.sectionHeading}>2. Select Reason for Return</Text>
        {reasons.map((r, idx) => {
          const isSelected = selectedReason === r;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => setSelectedReason(r)}
              style={[
                styles.reasonRow,
                isSelected && styles.reasonRowSelected,
              ]}
            >
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={styles.reasonText}>{r}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Step 3: Optional Notes & Photo */}
        <Text style={styles.sectionHeading}>3. Additional Comments</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue with the item (optional)..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.photoUploadBtn}>
          <Camera size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.photoUploadText}>Upload Photo of Damaged Item (Optional)</Text>
        </TouchableOpacity>

        <Button
          title="Submit Return Request"
          onPress={handleSubmitReturn}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  itemCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.sm + 2,
  },
  itemName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemPrice: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '800',
    marginTop: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  reasonRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    height: 80,
    textAlignVertical: 'top',
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    borderStyle: 'dashed',
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  photoUploadText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  submitBtn: {
    marginBottom: Spacing.xl,
  },
  successBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successTitle: {
    ...Typography.hero,
    fontSize: 24,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  successSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  successBtn: {
    minWidth: 200,
  },
});
