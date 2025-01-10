import styled from '@emotion/styled';

export const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${({ active }) => (active ? '#036' : '#ccc')};
  color: ${({ active }) => (active ? '#fff' : '#000')};
  border: none;
  border-bottom: ${({ active }) => (active ? '2px solid #fcba19' : 'none')};
  border-radius: 5px;
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
