import { RadioGroup, Radio } from '@bcgov/design-system-react-components';

interface YesNoRadioButtonProps {
  text: string;
  value: boolean;
  onChange: (value: boolean) => void;
  orientation?: 'vertical' | 'horizontal';
}

function YesNoRadioButtons({
  text,
  value,
  onChange,
  orientation = 'vertical',
}: YesNoRadioButtonProps) {
  return (
    <RadioGroup
      orientation={orientation}
      value={value ? 'true' : 'false'}
      onChange={(val) => {
        onChange(val === 'true');
      }}
      label={text}
    >
      <Radio value="true">Yes</Radio>
      <Radio value="false">No</Radio>
    </RadioGroup>
  );
}

export default YesNoRadioButtons;
