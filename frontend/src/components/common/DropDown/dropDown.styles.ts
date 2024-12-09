/**
 * @summary Styling for Dropdown component
 */
import styled from '@emotion/styled';

export const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  flex: ${({ flex }) => flex || '1'};
`;

export const StyledLabel = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  text-align: left;
`;

export const StyledSelect = styled.select`
  padding: 8px;
  font-size: 16px;
  border: 1px solid #c8c8c8;
  border-radius: 4px;
  &:focus {
    border-color: #c8c8c8;
    outline: none;
  }
`;
