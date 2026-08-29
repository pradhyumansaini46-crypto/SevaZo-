import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps } from './Input';

export interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText'> {
  name: Path<T>;
  control: Control<T>;
}

export const FormInput = <T extends FieldValues>({
  name,
  control,
  ...inputProps
}: FormInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
};

export default FormInput;
