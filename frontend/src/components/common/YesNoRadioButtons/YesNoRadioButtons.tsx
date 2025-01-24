import React, { useState } from 'react';
// Make own style file if necessary
import { SelectorContainer } from '@/views/FarmInformation/farmInformation.styles';
import RadioButton from '../RadioButton/RadioButton';

interface YesNoRadioButtonProps {
  name: string;
  text: string;
  handleYes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNo: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function YesNoRadioButtons({ name, text, handleYes, handleNo }: YesNoRadioButtonProps) {
  const [isYes, setIsYes] = useState<boolean>(false);
  return (
    <SelectorContainer>
      <span style={{ marginRight: '8px' }}>{text}</span>
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
    </SelectorContainer>
  );
}

export default YesNoRadioButtons;
