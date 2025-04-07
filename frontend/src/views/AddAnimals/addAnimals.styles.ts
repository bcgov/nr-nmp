/**
 * @summary Styling for AddAnimals view
 */
import styled from '@emotion/styled';

export const Header = styled.div`
  display: grid;
  grid-template-columns: 0.25fr 2fr 1.5fr 1fr 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const FlexContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  margin-top: 8px;
`;

// Is it messier to have these small styling classes here or in the HTML itself?
export const MarginWrapperOne = styled.div`
  margin-right: 8px;
`;
export const MarginWrapperTwo = styled.div`
  margin-right: 8px;
  margin-top: 8px;
`;

export const AddButton = styled.button`
  background-color: #003366;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  &:disabled {
    background-color: #a0a0a0;
    cursor: default;
  }
`;

export const FlexForm = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FlexRowContainer = styled.div`
  display: grid;
  /* This creates two columns of equal width */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: auto;
  gap: 8px 16px;
  align-items: center;
`;

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const EditListItemHeader = styled.div`
  border: 1px solid #ccc;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px 0 10px 0;
`;

export const EditListItemBody = styled.div`
  border: 1px solid #ccc;
  border-top: 0;
  border-radius: 0 0 8px 8px;
  padding: 0 10px 10px 10px;
`;
