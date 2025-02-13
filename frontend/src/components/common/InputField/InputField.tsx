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
  flex?: string;
}

function InputField({ label, type, name, value, onChange, flex }: InputFieldProps) {
  return (
    <InputWrapper flex={flex}>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
    </InputWrapper>
  );
}

export default InputField;
