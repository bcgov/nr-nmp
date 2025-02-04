/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const ListItemContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
`;

export const InfoBoxContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const ListItem = styled.div`
  margin-bottom: 8px;
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
