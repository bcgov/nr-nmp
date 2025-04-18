import { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function BasicTabs({
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
        <Tabs
          value={value}
          aria-label="tab"
        >
          {tabLabel.map((ele) => (
            <Tab
              label={ele}
              key={ele}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
