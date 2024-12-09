// frontend/src/components/common/RadioButton/RadioButton.tsx
import React from 'react';
import { RadioButtonWrapper, StyledLabel } from './radioButton.styles';

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function RadioButton({ label, name, value, checked, onChange }: RadioButtonProps) {
  return (
    <RadioButtonWrapper>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
    </RadioButtonWrapper>
  );
}

export default RadioButton;
