/**
 * @summary This is the styling page for the common button component.
 */
import styled from '@emotion/styled';
import typography from '../../../typography';

type ButtonProps = {
  variant: string;
  size: string;
  disabled: boolean;
};

const StyledButton = styled.button<ButtonProps>`
  ${typography.toString()}
  width: ${(props) => (props.size === 'sm' ? '125px' : props.size === 'md' ? '200px' : '300px')};
  height: ${(props) => (props.size === 'sm' ? '35px' : props.size === 'md' ? '70px' : '100px')};
  border: none;
  border-radius: 8px;
  padding: ${(props) => (props.size === 'sm' ? '6pt 2pt' : '12px 32px')};
  text-align: center;
  text-decoration: none;
  font-size: ${(props) => (props.size === 'sm' ? '14px' : '18px')};
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === 'primary'
      ? '#003366'
      : props.variant === 'secondary'
        ? '#DC3545'
        : '#000000'};
  background-color: ${(props) =>
    props.variant === 'primary'
      ? '#003366'
      : props.variant === 'secondary'
        ? '#DC3545'
        : props.variant === 'tertiary'
          ? '#198754'
          : '#000000'};
  color: #ffffff;
  &:hover {
    transform: scale(0.98);
  }
  &:disabled {
    transform: scale(1);
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`;

export default StyledButton;
