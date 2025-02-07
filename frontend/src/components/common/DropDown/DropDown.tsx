/**
 * @summary A reusable Dropdown component
 */
import React from 'react';
import { DropdownWrapper, StyledLabel, StyledSelect } from './dropdown.styles';

interface DropdownProps {
  label: string;
  name: string;
  value: number | string;
  options: { value: number; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  flex?: string;
}

function Dropdown({ label, name, value, options, onChange, flex }: DropdownProps) {
  return (
    <DropdownWrapper flex={flex}>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </DropdownWrapper>
  );
}

export default Dropdown;
