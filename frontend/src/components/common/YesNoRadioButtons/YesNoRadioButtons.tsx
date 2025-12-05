import { RadioGroup, Radio } from '@bcgov/design-system-react-components';
import InfoIcon from '../InfoIcon/InfoIcon';

interface YesNoRadioButtonProps {
  text: string;
  value: boolean;
  onChange: (value: boolean) => void;
  orientation?: 'vertical' | 'horizontal';
  tooltip?: string;
}

function YesNoRadioButtons({
  text,
  value,
  onChange,
  orientation = 'vertical',
  tooltip,
}: Omit<YesNoRadioButtonProps, 'label'>) {
  return (
    <RadioGroup
      orientation={orientation}
      value={value ? 'true' : 'false'}
      onChange={(val) => {
        onChange(val === 'true');
      }}
      aria-label={text}
    >
      {orientation === 'vertical' && (
        <div className="bcds-react-aria-RadioGroup--label">
          {text}
          {tooltip && <InfoIcon tooltip={tooltip} />}
        </div>
      )}
      <Radio value="true">Yes</Radio>
      <Radio value="false">No</Radio>
      {orientation === 'horizontal' && (
        <div
          className="bcds-react-aria-RadioGroup--label"
          style={{ flexBasis: '100%' }}
        >
          {text}
          {tooltip && <InfoIcon tooltip={tooltip} />}
        </div>
      )}
    </RadioGroup>
  );
}

export default YesNoRadioButtons;
