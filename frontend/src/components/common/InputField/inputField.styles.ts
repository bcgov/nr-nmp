import styled from '@emotion/styled';
import * as tokens from '@bcgov/design-tokens/js';

export const InputWrapper = styled.div<{ flex?: string }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  flex: ${({ flex }) => flex || '1'};
`;

export const StyledLabel = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  color: ${tokens.typographyColorPrimary};
`;

export const StyledInput = styled.input`
  padding: 8px;
  font-size: 16px;
  border: 1px solid #c8c8c8;
  border-radius: 4px;
  &:focus {
    border-color: #c8c8c8;
    outline: none;
  }
`;
