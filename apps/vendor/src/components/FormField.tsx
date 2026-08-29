import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps } from './Input';

interface FormFieldProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: Path<T>;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  ...rest
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Input
            label={label}
            placeholder={placeholder}
            value={value ? String(value) : ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            {...rest}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
