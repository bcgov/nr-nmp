import MuiInfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import './InfoIcon.css';

interface InfoIconProps {
  tooltip: string;
}

function InfoIcon({ tooltip }: InfoIconProps) {
  return (
    <Tooltip
      title={tooltip}
      placement="top-start"
    >
      <MuiInfoIcon
        style={{
          fontSize: '1rem',
          marginLeft: '2px',
          color: 'var(--surface-color-primary-button-default)',
        }}
      />
    </Tooltip>
  );
}

export default InfoIcon;
