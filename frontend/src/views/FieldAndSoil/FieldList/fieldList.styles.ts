/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ButtonWrapper = styled.div`
  bottom: 16px;
  right: 16px;
  padding: 5px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const Column = styled.div`
  text-align: center;
`;

export const ListItem = styled.div`
  flex: 1;
  text-align: center;
`;
