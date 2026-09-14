import Grid from '@mui/material/Grid';

interface WarningBoxProps {
  heading: string;
  bullets: string[];
}

export default function WarningBox(props: WarningBoxProps) {
  const { heading, bullets } = props;
  return (
    <Grid
      container
      sx={{ marginTop: '1rem' }}
    >
      <div style={{ border: '1px solid #c81212', width: '100%' }}>
        {heading}
        <ul>
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </Grid>
  );
}
