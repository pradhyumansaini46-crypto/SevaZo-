import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Package,
  Bike,
} from 'lucide-react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface ZeroFeeSpecificationBannerProps {
  onPress?: () => void;
}

export const ZeroFeeSpecificationBanner: React.FC<ZeroFeeSpecificationBannerProps> = ({
  onPress,
}) => {
  const specs = [
    {
      id: 'handling',
      title: 'Zero Handling Fee',
      value: '₹0',
      subtitle: 'Zero packing fee',
      icon: <Package size={15} color="#059669" />,
    },
    {
      id: 'delivery',
      title: 'Zero Delivery Fee',
      value: '₹0',
      subtitle: 'Doorstep local drop',
      icon: <Bike size={15} color="#059669" />,
    },
    {
      id: 'platform',
      title: 'Zero Platform Fee',
      value: '₹0',
      subtitle: 'No sneaky charges',
      icon: <ShieldCheck size={15} color="#059669" />,
    },
    {
      id: 'surge',
      title: 'Zero Surge Fee',
      value: '₹0',
      subtitle: 'No rain/rush surge',
      icon: <Zap size={15} color="#059669" />,
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          triggerHaptic('light');
          onPress?.();
        }}
        style={styles.card}
      >
        {/* Emerald Quick-Commerce Gradient */}
        <LinearGradient
          colors={['#064E3B', '#065F46', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />

        {/* Top Header Tag */}
        <View style={styles.headerRow}>
          <View style={styles.promiseBadge}>
            <Sparkles size={12} color="#FBBF24" style={{ marginRight: 4 }} />
            <Text style={styles.promiseBadgeText}>SEVAZO ZERO-EXTRA PROMISE</Text>
          </View>
          <View style={styles.locationPill}>
            <CheckCircle2 size={11} color="#34D399" style={{ marginRight: 4 }} />
            <Text style={styles.locationPillText}>Jaipur Verified</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineCol}>
          <Text style={styles.mainHeadline}>100% Zero Extra Charges Guarantee</Text>
          <Text style={styles.subHeadline}>
            What you see is what you pay. No hidden costs or surprise markups.
          </Text>
        </View>

        {/* 4 Key Specifications in 4-Column Grid */}
        <View style={styles.specGrid}>
          {specs.map((item) => (
            <View key={item.id} style={styles.specColumn}>
              <View style={styles.specIconCircle}>{item.icon}</View>
              <View style={styles.valueRow}>
                <Text style={styles.specValue}>{item.value}</Text>
              </View>
              <Text numberOfLines={1} style={styles.specTitle}>
                {item.title}
              </Text>
              <Text numberOfLines={1} style={styles.specSub}>
                {item.subtitle}
              </Text>
            </View>
          ))}
        </View>

        {/* Written note underneath in very small letters as requested */}
        <View style={styles.tcFooter}>
          <Text style={styles.tcText}>* T&C Applied.</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  card: {
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    padding: 14,
    ...Shadows.medium,
    borderWidth: 1.2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  gradientBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  promiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  promiseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  locationPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  headlineCol: {
    marginBottom: 12,
  },
  mainHeadline: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subHeadline: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '500',
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 4,
    ...Shadows.small,
  },
  specColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  specIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
  },
  specTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  specSub: {
    fontSize: 7.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  tcFooter: {
    alignItems: 'flex-end',
    marginTop: 6,
    paddingRight: 2,
  },
  tcText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.2,
  },
});
