import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      secureTextEntry,
      required = false,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
        )}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputFocused,
            Boolean(error) && styles.inputError,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessible={true}
            accessibilityLabel={label || rest.placeholder}
            {...rest}
          />

          {secureTextEntry ? (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color={Colors.textSecondary} />
              ) : (
                <Eye size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
          ) : null}
        </View>

        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    color: '#1E293B',
    marginBottom: 6,
    fontWeight: '700',
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: '#FF6600',
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    ...Typography.bodyMedium,
    paddingVertical: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

export default Input;
