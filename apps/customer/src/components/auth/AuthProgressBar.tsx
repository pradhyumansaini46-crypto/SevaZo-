import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import { Typography, Shadows } from '../../theme';

interface AuthProgressBarProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { id: 1, label: 'Mobile' },
  { id: 2, label: 'OTP' },
  { id: 3, label: 'Address' },
];

export const AuthProgressBar: React.FC<AuthProgressBarProps> = ({ currentStep }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const line1Progress = useRef(new Animated.Value(currentStep > 1 ? 1 : 0)).current;
  const line2Progress = useRef(new Animated.Value(currentStep > 2 ? 1 : 0)).current;

  useEffect(() => {
    // Pulse animation for active step dot
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    // Animate connecting lines
    Animated.timing(line1Progress, {
      toValue: currentStep >= 2 ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();

    Animated.timing(line2Progress, {
      toValue: currentStep >= 3 ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();

    return () => {
      pulseLoop.stop();
    };
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <View style={styles.stepNodeWrap}>
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted && styles.nodeCircleCompleted,
                  isActive && styles.nodeCircleActive,
                ]}
              >
                {isCompleted ? (
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                ) : isActive ? (
                  <Animated.View
                    style={[
                      styles.activeInnerDot,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                ) : (
                  <Text style={styles.pendingNumber}>{step.id}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.nodeLabel,
                  isCompleted && styles.nodeLabelCompleted,
                  isActive && styles.nodeLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>

            {/* Connecting Line between steps */}
            {index < STEPS.length - 1 && (
              <View style={styles.lineTrack}>
                <Animated.View
                  style={[
                    styles.lineFill,
                    {
                      width: (index === 0 ? line1Progress : line2Progress).interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignSelf: 'center',
    marginBottom: 6,
    ...Shadows.small,
  },
  stepNodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  nodeCircleCompleted: {
    backgroundColor: '#138808',
    borderColor: '#138808',
  },
  nodeCircleActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF7700',
    borderWidth: 2,
  },
  activeInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF7700',
  },
  pendingNumber: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  nodeLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 5,
  },
  nodeLabelCompleted: {
    color: '#138808',
    fontWeight: '700',
  },
  nodeLabelActive: {
    color: '#FF7700',
    fontWeight: '800',
  },
  lineTrack: {
    width: 28,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    borderRadius: 1,
    overflow: 'hidden',
  },
  lineFill: {
    height: '100%',
    backgroundColor: '#138808',
  },
});
