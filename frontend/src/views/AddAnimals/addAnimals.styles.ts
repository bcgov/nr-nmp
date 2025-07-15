/**
 * @summary Styling for AddAnimals view
 */
import styled from '@emotion/styled';
import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const Container = styled.div`
  overflow: visible;
  height: 0rem;
`;

export const ErrorText = styled.div`
  color: red;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

export const DropdownButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  width: 100%;
  text-align: left;
  cursor: pointer;
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;

export const DoubleRowStyle = styled.span`
  display: block;
  height: 34px;
`;
