import React, { useState, useEffect } from 'react';
import MUITabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function Tabs({
  activeTab,
  tabLabel,
  onChange,
}: {
  activeTab: number;
  tabLabel: Array<string>;
  onChange?: ((event: React.SyntheticEvent, value: any) => void) | undefined;
}) {
  const [value, setValue] = useState(activeTab);

  useEffect(() => setValue(activeTab), [activeTab, setValue]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <MUITabs
          value={value}
          aria-label="tab"
          onChange={onChange}
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
