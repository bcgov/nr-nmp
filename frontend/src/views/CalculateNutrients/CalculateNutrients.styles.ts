/**
 * @summary Styling for CalculateNutrients view
 */
import styled from '@emotion/styled';

export const Error = styled.div`
  display: flex;
  border: 1px solid #c81212;
  width: 100%;
  margin-bottom: 9px;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.4),
    0 0 45px rgba(255, 255, 255, 0.7) inset;
`;

export const Message = styled.div`
  display: flex;
  color: black !important;
  font-size: 12px;
  font-weight: bold;
  align-items: center;
`;

export const Icon = styled.img`
  margin: 0.25em;
`;
