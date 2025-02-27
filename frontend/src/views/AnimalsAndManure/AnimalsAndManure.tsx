/* eslint-disable prefer-destructuring */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import { Banner, ButtonWrapper, CardHeader } from '../FieldAndSoil/fieldAndSoil.styles';
import { TabContentDisplay, TabOptions } from '@/components/common/Tabs/Tabs';
import { Button, Card } from '@/components/common';
import { AnimalsWorkflowData } from './AddAnimals/types';
import NMPFile from '@/types/NMPFile';
import AddAnimals from './AddAnimals/AddAnimals';

export default function AnimalsAndManure() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<AnimalsWorkflowData[][]>([[], [], []]);

  const tabs = [
    {
      id: 'add-animals',
      label: 'Add Animals',
      content: <AddAnimals saveData={setFormData} />,
    },
    {
      id: 'manure-and-imports',
      label: 'Manure and Imports',
      content: <div>Coming soon</div>,
    },
    {
      id: 'nutrient-analysis',
      label: 'Nutrient Analysis',
      content: <div>Coming soon</div>,
    },
  ];

  const handleNext = () => {
    if (!state.nmpFile) {
      throw new Error('NMP file has entered impossible state in AnimalsAndManure.');
    }

    if (activeTab <= tabs.length) {
      setActiveTab(activeTab + 1);
    } else {
      const nmpFile: NMPFile = JSON.parse(state.nmpFile);
      // TODO: Add multi-year handling
      nmpFile.years[0].FarmAnimals = formData[0];
      // TODO: Copy the data of the other tabs
      setNMPFile(JSON.stringify(nmpFile));

      navigate('/field-and-soil');
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
    else navigate('/farm-information');
  };

  return (
    <Card
      height="700px"
      width="700px"
    >
      <CardHeader>
        <Banner>
          <TabOptions
            tabs={tabs}
            activeTab={activeTab}
          />
        </Banner>
      </CardHeader>
      <TabContentDisplay
        tabs={tabs}
        activeTab={activeTab}
      />
      <ButtonWrapper position="right">
        <Button
          text="Next"
          size="sm"
          handleClick={() => {
            handleNext();
          }}
          aria-label="Next"
          variant="primary"
          disabled={false}
        />
      </ButtonWrapper>
      <ButtonWrapper position="left">
        <Button
          text="Back"
          size="sm"
          handleClick={() => {
            handlePrevious();
          }}
          aria-label="Back"
          variant="primary"
          disabled={false}
        />
      </ButtonWrapper>
    </Card>
  );
}
