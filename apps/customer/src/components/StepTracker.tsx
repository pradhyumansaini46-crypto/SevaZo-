import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { Check } from 'lucide-react-native';

export interface StepItem {
  key: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface StepTrackerProps {
  steps: StepItem[];
  vertical?: boolean;
  style?: ViewStyle;
}

export const StepTracker: React.FC<StepTrackerProps> = ({
  steps,
  vertical = true,
  style,
}) => {
  if (!vertical) {
    // Horizontal step tracker
    return (
      <View style={[styles.horizontalContainer, style]}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <React.Fragment key={step.key || idx}>
              <View style={styles.horizontalStep}>
                <View
                  style={[
                    styles.horizontalDot,
                    step.completed && styles.dotCompleted,
                    step.current && styles.dotCurrent,
                  ]}
                >
                  {step.completed ? (
                    <Check size={12} color={Colors.textInverse} strokeWidth={3} />
                  ) : (
                    <View
                      style={[
                        styles.innerDot,
                        step.current && { backgroundColor: Colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.horizontalStepTitle,
                    step.current && { color: Colors.primary, fontWeight: '700' },
                  ]}
                >
                  {step.title}
                </Text>
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.horizontalLine,
                    step.completed && { backgroundColor: Colors.primary },
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  // Vertical timeline tracker
  return (
    <View style={[styles.verticalContainer, style]}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <View key={step.key || idx} style={styles.verticalStepRow}>
            {/* Dot & Connecting line */}
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.verticalDot,
                  step.completed && styles.dotCompleted,
                  step.current && styles.dotCurrent,
                ]}
              >
                {step.completed ? (
                  <Check size={12} color={Colors.textInverse} strokeWidth={3} />
                ) : (
                  <View
                    style={[
                      styles.innerDot,
                      step.current && { backgroundColor: Colors.primary },
                    ]}
                  />
                )}
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.verticalLine,
                    step.completed && { backgroundColor: Colors.primary },
                  ]}
                />
              ) : null}
            </View>

            {/* Content Column */}
            <View style={styles.contentColumn}>
              <View style={styles.stepHeader}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.current && styles.stepTitleActive,
                    !step.completed && !step.current && styles.stepTitlePending,
                  ]}
                >
                  {step.title}
                </Text>
                {step.timestamp ? (
                  <Text style={styles.timestampText}>{step.timestamp}</Text>
                ) : null}
              </View>
              {step.subtitle ? (
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  verticalContainer: {
    paddingVertical: Spacing.sm,
  },
  verticalStepRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  verticalDot: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotCurrent: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepTitleActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  stepTitlePending: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  timestampText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
  },
  stepSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Horizontal styles
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  horizontalStep: {
    alignItems: 'center',
    width: 70,
  },
  horizontalDot: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  horizontalStepTitle: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  horizontalLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
});
