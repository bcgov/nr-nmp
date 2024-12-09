/**
 * @summary Reusable Checkbox Component
 */
import React from 'react';
import { CheckboxWrapper, StyledLabel } from './checkbox.styles';

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Checkbox({ label, name, checked, onChange }: CheckboxProps) {
  return (
    <CheckboxWrapper>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
    </CheckboxWrapper>
  );
}

export default Checkbox;
