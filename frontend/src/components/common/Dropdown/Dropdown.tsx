/**
 * @summary A reusable Dropdown component
 */
import React from 'react';
import { DropdownWrapper, StyledLabel, StyledSelect } from './dropdown.styles';

interface DropdownProps {
  label: string;
  name: string;
  value: number | string;
  options: { value: number | undefined; label: string | undefined }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  flex?: string;
}

function Dropdown({ label, name, value, options, onChange, flex }: DropdownProps) {
  const defaultOption = (
    <option
      key=""
      value=""
      style={{ display: 'none' }}
      selected
    >
      --Select--
    </option>
  );
  return (
    <DropdownWrapper flex={flex}>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
      >
        {[defaultOption].concat(
          options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )),
        )}
      </StyledSelect>
    </DropdownWrapper>
  );
}

export default Dropdown;
