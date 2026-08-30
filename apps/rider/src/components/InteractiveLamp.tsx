import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface InteractiveLampProps {
  isLampOn: boolean;
  onToggle: (state: boolean) => void;
}

export const InteractiveLamp: React.FC<InteractiveLampProps> = ({
  isLampOn,
  onToggle,
}) => {
  const cordAnim = useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsPulling(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && gestureState.dy < 55) {
          cordAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsPulling(false);
        if (gestureState.dy > 20) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {}
          onToggle(!isLampOn);
        }
        Animated.spring(cordAnim, {
          toValue: 0,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Dynamic Light Cone casting down onto the card */}
      {isLampOn && (
        <LinearGradient
          colors={[
            'rgba(255, 102, 0, 0.28)',
            'rgba(255, 102, 0, 0.10)',
            'rgba(255, 102, 0, 0.02)',
            'transparent',
          ]}
          style={styles.lightCone}
          pointerEvents="none"
        />
      )}

      {/* Ceiling Wire */}
      <View style={styles.ceilingWire} />

      {/* Lamp Fixture */}
      <View style={styles.lampContainer}>
        {/* Top Cap */}
        <View style={styles.topCap} />

        {/* Lamp Shade Dome */}
        <View
          style={[
            styles.lampShade,
            isLampOn ? styles.lampShadeOn : styles.lampShadeOff,
          ]}
        >
          <View
            style={[
              styles.shadeAccent,
              { backgroundColor: isLampOn ? '#FF6600' : '#475569' },
            ]}
          />
        </View>

        {/* Bulb Glow Element */}
        <View
          style={[
            styles.bulb,
            isLampOn ? styles.bulbOn : styles.bulbOff,
          ]}
        />

        {/* Pull String & Knob */}
        <Animated.View
          style={[
            styles.pullCordContainer,
            {
              transform: [{ translateY: cordAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.beadedChain} />
          <View
            style={[
              styles.pullKnob,
              isLampOn ? styles.pullKnobOn : styles.pullKnobOff,
            ]}
          >
            <View style={styles.knobInner} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
    zIndex: 20,
    marginBottom: 4,
  },
  lightCone: {
    position: 'absolute',
    top: 36,
    width: 380,
    height: 480,
    borderRadius: 190,
  },
  ceilingWire: {
    width: 2,
    height: 20,
    backgroundColor: '#334155',
  },
  lampContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  topCap: {
    width: 22,
    height: 6,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  lampShade: {
    width: 100,
    height: 38,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lampShadeOn: {
    backgroundColor: '#1E2433',
    borderColor: 'rgba(255, 102, 0, 0.4)',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  lampShadeOff: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  shadeAccent: {
    width: 60,
    height: 2.5,
    borderRadius: 2,
  },
  bulb: {
    width: 28,
    height: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: -2,
    zIndex: 10,
  },
  bulbOn: {
    backgroundColor: '#FB923C',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  bulbOff: {
    backgroundColor: '#475569',
  },
  pullCordContainer: {
    position: 'absolute',
    right: -24,
    top: 14,
    alignItems: 'center',
    padding: 8,
  },
  beadedChain: {
    width: 2,
    height: 32,
    backgroundColor: '#94A3B8',
  },
  pullKnob: {
    width: 12,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pullKnobOn: {
    backgroundColor: '#FF6600',
    borderColor: '#FFD8B2',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 4,
  },
  pullKnobOff: {
    backgroundColor: '#1E293B',
    borderColor: '#64748B',
  },
  knobInner: {
    width: 3,
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default InteractiveLamp;
