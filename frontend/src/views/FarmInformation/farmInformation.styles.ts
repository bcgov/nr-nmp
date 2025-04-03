/**
 * @summary Styling for FarmInformation view
 */
import styled from '@emotion/styled';

export const InputFieldsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  margin-top: 32px;
`;

export const RegionContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
`;

export const SelectorContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
`;

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  button {
    width: 80px;
    height: 40px;
  }
`;
