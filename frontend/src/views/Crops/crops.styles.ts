/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const ContentWrapper = styled.div<{ hasFields: boolean }>`
  margin-bottom: 170px;
`;

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const InfoBoxContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const ListItem = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const LeftJustifiedText = styled.span`
  display: block;
  text-align: left;
  margin-top: 8px;
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

export const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

export const RightJustifiedText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #ccc;
  margin: 16px 0;
`;

export const FlexRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

export const HeaderText = styled.span`
  display: block;
  margin-bottom: 4px;
`;

export const ValueText = styled.div`
  margin-top: 4px;
`;

export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const ButtonContainer = styled.div<{ hasFields: boolean }>`
  display: flex;
  justify-content: ${({ hasFields }) => (hasFields ? 'flex-end' : 'center')};
  margin: 16px 0;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const Column = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ErrorText = styled.div`
  color: red;
`;
