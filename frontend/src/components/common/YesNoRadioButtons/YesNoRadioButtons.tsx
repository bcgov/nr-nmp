import React, { useState } from 'react';
import RadioButton from '../RadioButton/RadioButton';
import { RadioButtonsWrapper, StyledSpan } from './yesNoRadioButtons.styles';

interface YesNoRadioButtonProps {
  name: string;
  text: string;
  handleYes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  omitWrapper?: boolean;
}

function YesNoRadioButtons({
  name,
  text,
  handleYes,
  handleNo,
  omitWrapper,
}: YesNoRadioButtonProps) {
  const [isYes, setIsYes] = useState<boolean>(false);
  const unwrappedElements = (
    <>
      <StyledSpan>{text}</StyledSpan>
      <RadioButton
        label="Yes"
        name={name}
        value="true"
        checked={isYes}
        onChange={(e) => {
          setIsYes(true);
          handleYes(e);
        }}
      />
      <RadioButton
        label="No"
        name={name}
        value="false"
        checked={!isYes}
        onChange={(e) => {
          setIsYes(false);
          handleNo(e);
        }}
      />
    </>
  );
  return omitWrapper ? (
    unwrappedElements
  ) : (
    <RadioButtonsWrapper>{unwrappedElements}</RadioButtonsWrapper>
  );
}

export default YesNoRadioButtons;
