/* eslint-disable react/function-component-definition */
import React from 'react';
import { InputWrapper, StyledLabel, StyledInput } from './inputField.styles';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string;
  flex?: string; // Add this line
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  width,
  flex,
}) => (
  <InputWrapper
    style={{ width }}
    flex={flex}
  >
    {' '}
    {/* Update this line */}
    <StyledLabel htmlFor={name}>{label}</StyledLabel>
    <StyledInput
      type={type}
      name={name}
      value={value}
      onChange={onChange}
    />
  </InputWrapper>
);

export default InputField;
