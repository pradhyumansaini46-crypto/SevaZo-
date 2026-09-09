import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Mic, X, ShoppingBag, Check, Zap, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { useCartStore } from '../../stores/cartStore';
import { mockBuyAgainProducts } from '../../services/mockData';
import { triggerHaptic } from '../../utils/haptics';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSearch?: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  visible,
  onClose,
  onNavigateSearch,
}) => {
  const { addItem } = useCartStore();
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('Listening...');
  const [recognizedItem, setRecognizedItem] = useState<{
    product: any;
    quantity: number;
    intentLabel: string;
    variantName: string;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      setIsListening(true);
      setTranscript('Listening... Speak naturally in Hindi or English');
      setRecognizedItem(null);

      // Simulate natural speech detection
      const t1 = setTimeout(() => {
        setTranscript('"Mujhe 2 litre milk chahiye"');
        setIsListening(false);

        // NLU / Natural Language Understanding Resolution
        const milkProduct = mockBuyAgainProducts[0];
        setRecognizedItem({
          product: milkProduct,
          quantity: 2,
          intentLabel: 'Understood: Fresh Milk • 2 Litres',
          variantName: '2 x 1 Litre Pack',
        });
        triggerHaptic('success');
      }, 1800);

      return () => clearTimeout(t1);
    }
  }, [visible]);

  const handleAddToCart = () => {
    if (recognizedItem) {
      triggerHaptic('medium');
      addItem(recognizedItem.product, undefined, recognizedItem.quantity);
      onClose();
    }
  };

  const handleSelectSample = (prompt: string, productIndex: number, qty: number) => {
    triggerHaptic('selection');
    setTranscript(`"${prompt}"`);
    setIsListening(false);
    const prod = mockBuyAgainProducts[productIndex];
    setRecognizedItem({
      product: prod,
      quantity: qty,
      intentLabel: `Understood: ${prod.name} • ${qty} Pack`,
      variantName: `${qty} x ${prod.unit}`,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Close Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeBtn}
              >
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>

              {/* Animated Mic Ring */}
              <View style={styles.micCircleWrapper}>
                <View style={[styles.pulseRing, isListening && styles.pulseActive]} />
                <View style={styles.micCircle}>
                  <Mic size={32} color={Colors.textInverse} />
                </View>
              </View>

              {/* Status & Transcript */}
              <Text style={styles.listeningStatus}>
                {isListening ? 'Listening...' : 'Voice Query Detected'}
              </Text>
              <Text style={styles.transcriptText}>{transcript}</Text>

              {/* Recognized AI Product Match Card */}
              {recognizedItem ? (
                <View style={styles.parsedCard}>
                  <View style={styles.parsedHeaderRow}>
                    <Sparkles size={14} color={Colors.primary} />
                    <Text style={styles.parsedHeaderTitle}>
                      {recognizedItem.intentLabel}
                    </Text>
                  </View>

                  <View style={styles.parsedBodyRow}>
                    <Image
                      source={{ uri: recognizedItem.product.images[0] }}
                      style={styles.parsedImg}
                      resizeMode="contain"
                    />
                    <View style={styles.parsedDetails}>
                      <Text numberOfLines={1} style={styles.parsedName}>
                        {recognizedItem.product.name}
                      </Text>
                      <Text style={styles.parsedVariant}>
                        Quantity: {recognizedItem.quantity} ({recognizedItem.variantName})
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.parsedPrice}>
                          ₹{recognizedItem.product.price * recognizedItem.quantity}
                        </Text>
                        <View style={styles.deliveryBadge}>
                          <Zap size={10} color={Colors.primary} fill={Colors.primary} />
                          <Text style={styles.deliveryBadgeText}>12 min</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleAddToCart}
                    style={styles.addCartBtn}
                  >
                    <ShoppingBag size={16} color={Colors.textInverse} style={{ marginRight: 6 }} />
                    <Text style={styles.addCartText}>
                      Add to Cart — ₹{recognizedItem.product.price * recognizedItem.quantity}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Try sample voice prompts */}
              <View style={styles.samplePromptsContainer}>
                <Text style={styles.sampleHeader}>Or try speaking:</Text>
                <View style={styles.samplePillsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectSample('Brown bread aur butter', 1, 1)}
                    style={styles.samplePill}
                  >
                    <Text style={styles.samplePillText}>"Brown bread loaf"</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectSample('6 farm eggs packet', 2, 1)}
                    style={styles.samplePill}
                  >
                    <Text style={styles.samplePillText}>"6 farm eggs"</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  micCircleWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  pulseActive: {
    transform: [{ scale: 1.15 }],
  },
  micCircle: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  listeningStatus: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  transcriptText: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.md,
    minHeight: 38,
  },
  parsedCard: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  parsedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  parsedHeaderTitle: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '900',
    color: '#065F46',
    marginLeft: 4,
  },
  parsedBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  parsedImg: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    marginRight: Spacing.sm,
  },
  parsedDetails: {
    flex: 1,
  },
  parsedName: {
    ...Typography.titleSmall,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  parsedVariant: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  parsedPrice: {
    ...Typography.priceSmall,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 6,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  deliveryBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 2,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  addCartText: {
    ...Typography.titleSmall,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  samplePromptsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sampleHeader: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  samplePillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  samplePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginHorizontal: 4,
  },
  samplePillText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'none',
  },
});
