/**
 * @summary A reusable Dropdown component
 */
import React from 'react';
import { DropdownWrapper, StyledLabel, StyledSelect } from './dropdown.styles';

interface DropdownProps {
  label: string;
  name: string;
  value: number | string;
  options: { value: number | string | undefined; label: string | undefined }[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  flex?: string;
  required?: true;
}

function Dropdown({ label, name, value, options, onChange, flex, required }: DropdownProps) {
  const defaultOption = (
    <option
      key=""
      value=""
      style={{ display: 'none' }}
      selected
      disabled
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
        required={required}
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
