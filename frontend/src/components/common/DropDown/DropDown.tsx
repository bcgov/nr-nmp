/**
 * @summary A reusable Dropdown component
 */
import React from 'react';
import { DropdownWrapper, StyledLabel, StyledSelect } from './dropDown.styles';

interface DropdownProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  flex?: string; // Add this line
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
