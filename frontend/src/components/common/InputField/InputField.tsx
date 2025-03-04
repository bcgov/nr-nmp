/**
 * @summary Reusable Input Field Component
 */
import React from 'react';
import { InputWrapper, StyledLabel, StyledInput } from './inputField.styles';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: React.FormEventHandler<HTMLInputElement>;
  flex?: string;
  maxLength?: number;
  required?: true;
}

function InputField({
  label,
  type,
  name,
  value,
  onChange,
  onInput,
  flex,
  maxLength,
  required,
}: InputFieldProps) {
  return (
    <InputWrapper flex={flex}>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onInput={onInput}
        maxLength={maxLength}
        required={required}
      />
    </InputWrapper>
  );
}

export default InputField;
