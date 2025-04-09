import { useState, SyntheticEvent, ReactNode } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// function a11yProps(index: number) {
//   return {
//     id: `simple-tab-${index}`,
//     'aria-controls': `simple-tabpanel-${index}`,
//   };
// }

export default function BasicTabs({
  children,
  tabLabel,
}: {
  children: Array<ReactNode | null>;
  tabLabel: Array<string>;
}) {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    console.log('Tab clicked value', newValue, event);
    setValue((prev) => prev);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
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
      {children.map((ele, index) => (
        <CustomTabPanel
          key={tabLabel[index]}
          value={value}
          index={index}
        >
          {ele}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
