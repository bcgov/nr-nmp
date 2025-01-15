import styled from '@emotion/styled';

export const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1em;
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${({ active }) => (active ? '#FFFFFF' : '#ccc')};
  color: ${({ active }) => (active ? '#000' : '#000')};
  border: none;
  border-top: ${({ active }) => (active ? '2px solid #fcba19' : 'none')};
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  height: 50px;
  &:hover {
    background-color: #036;
    color: #fff;
  }
`;

export const TabContent = styled.div`
  padding: 20px;
  background-color: #fff;
  width: 100%;
`;
