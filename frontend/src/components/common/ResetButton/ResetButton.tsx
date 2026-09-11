import React from 'react';
import LoopIcon from '@mui/icons-material/Loop';
import StyledButton from './resetButton.styles';

export default function ResetButton(
  props: Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'type'>,
) {
  return (
    <StyledButton type="button" {...props}>
      <LoopIcon />
    </StyledButton>
  );
}
