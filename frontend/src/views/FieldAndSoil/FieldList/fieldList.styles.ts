/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const ContentWrapper = styled.div`
  margin-bottom: 130px;
`;

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

export const Column = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ListItem = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;
