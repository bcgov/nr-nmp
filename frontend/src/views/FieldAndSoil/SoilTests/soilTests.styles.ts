/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const ContentWrapper = styled.div<{ hasFields: boolean }>`
  margin-bottom: ${({ hasFields }) => (hasFields ? '100px' : '130px')};
`;

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto;
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

export const InfoBox = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  margin: 15px 0 15px 0;
  ul {
    padding-left: 10px;
    margin-top: 5px;
  }
  li {
    margin-bottom: 2px;
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const Column = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ListItem = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ErrorText = styled.div`
  color: red;
`;
