/**
 * @summary Styling for ManureAndCompost view
 */
import styled from '@emotion/styled';

export const ContentWrapper = styled.div<{ hasManure: boolean }>`
  margin-bottom: ${({ hasManure }) => (hasManure ? '170px' : '0')};
`;

export const GeneratedListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
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

export const TopRightButtonWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const CenterButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const ButtonContainer = styled.div<{ hasManure: boolean }>`
  display: flex;
  justify-content: ${({ hasManure }) => (hasManure ? 'flex-end' : 'center')};
  margin: 16px 0;
  button {
    width: 110px;
    height: 40px;
  }
`;

export const GeneratedHeader = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
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
