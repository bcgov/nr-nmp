/**
 * @summary Styling for Card component
 */
import styled from '@emotion/styled';

type CardWrapperProps = {
  width: string;
  height: string;
  justifyContent?: string;
};

export const CardWrapper = styled.div<CardWrapperProps>`
  background-color: rgba(255, 255, 255, 0.8);
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  padding-top: 0;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  flex-direction: column;
  object-fit: scale-down;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  position: relative;
  justify-content: ${(props) => props.justifyContent};
  overflow: auto;
`;

export default CardWrapper;
