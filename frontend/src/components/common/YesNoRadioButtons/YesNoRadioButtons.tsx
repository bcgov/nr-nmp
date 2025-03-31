import { useState } from 'react';
import { RadioGroup, Radio } from '@bcgov/design-system-react-components';
import { StyledSpan } from './yesNoRadioButtons.styles';

interface YesNoRadioButtonProps {
  text: string;
  onChange: (value: string) => void;
  defaultVal?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

function YesNoRadioButtons({
  text,
  onChange,
  defaultVal = false,
  orientation = 'vertical',
}: YesNoRadioButtonProps) {
  const [selected, setSelected] = useState<string>(defaultVal ? 'true' : 'false');
  return (
    <RadioGroup
      orientation={orientation}
      value={selected}
      onChange={(val) => {
        setSelected(val);
        onChange(val);
      }}
    >
      <StyledSpan>{text}</StyledSpan>
      <Radio value="true">Yes</Radio>
      <Radio value="false">No</Radio>
    </RadioGroup>
  );
}

export default YesNoRadioButtons;
