/**
 * @summary Styling for RoutingLink component
 */
import styled from '@emotion/styled';

type NavProps = {
  hex: string;
};

export const ButtonCont = styled.div<NavProps>`
  height: 75pt;
  width: 220pt;
  border-radius: 8pt;
  align-items: center;
  justify-content: flex-start;
  background-color: ${({ hex }) => hex || '#000'};
  padding: 5pt;
  display: flex;
  &:hover {
    transform: scale(0.95);
  }
`;

export const ImageCont = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50pt;
  height: 45pt;
  border-radius: 8pt;
  margin: 0 0 0 10pt;
  padding: 0;
`;

export const TextCont = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  font-size: 16pt;
  text-wrap: auto;
  width: 100%;
  height: 70pt;
  color: black;
  margin: 0;
  padding: 0 0 0 1em;
`;
export const Image = styled.img`
  height: 100%;
  display: flex;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
`;
