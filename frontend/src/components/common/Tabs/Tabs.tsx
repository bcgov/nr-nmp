import { useState, useEffect } from 'react';
import MUITabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function Tabs({
  activeTab,
  tabLabel,
}: {
  activeTab: number;
  tabLabel: Array<string>;
}) {
  const [value, setValue] = useState(activeTab);

  useEffect(() => setValue(activeTab), [activeTab, setValue]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <MUITabs
          value={value}
          aria-label="tab"
        >
          {tabLabel.map((ele, i) => (
            <Tab
              label={ele}
              // eslint-disable-next-line react/no-array-index-key
              key={`${ele} + ${i}`}
            />
          ))}
        </MUITabs>
      </Box>
    </Box>
  );
}
