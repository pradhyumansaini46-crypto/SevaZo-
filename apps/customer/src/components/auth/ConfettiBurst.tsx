import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FF7700', '#138808', '#F59E0B', '#FFFFFF', '#EA580C', '#10B981', '#38BDF8'];

interface ParticleData {
  id: number;
  color: string;
  size: number;
  isCircle: boolean;
  angle: number;
  distance: number;
  rotations: number;
}

const PARTICLES: ParticleData[] = Array.from({ length: 32 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 5) * 2,
  isCircle: i % 3 === 0,
  angle: (i / 32) * Math.PI * 2 + (Math.random() * 0.4 - 0.2),
  distance: 80 + Math.random() * 160,
  rotations: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 4)),
}));

interface ConfettiBurstProps {
  active: boolean;
  onComplete?: () => void;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ active, onComplete }) => {
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      animProgress.setValue(0);
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        onComplete?.();
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((p) => {
        const targetX = Math.cos(p.angle) * p.distance;
        // Include gravity curve: shoots out then curves downward
        const targetY = Math.sin(p.angle) * p.distance + 40;

        const translateX = animProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, targetX],
        });

        const translateY = animProgress.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, targetY * 0.7, targetY + 90],
        });

        const opacity = animProgress.interpolate({
          inputRange: [0, 0.1, 0.75, 1],
          outputRange: [0, 1, 0.9, 0],
        });

        const rotate = animProgress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotations * 360}deg`],
        });

        const scale = animProgress.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0.3, 1.2, 0.9, 0.2],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.isCircle ? p.size : p.size * 0.6,
                borderRadius: p.isCircle ? p.size / 2 : 2,
                backgroundColor: p.color,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { scale },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
  },
});
