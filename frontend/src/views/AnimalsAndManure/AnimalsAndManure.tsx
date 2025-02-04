import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import { Banner, ButtonWrapper, CardHeader } from '../FieldAndSoil/fieldAndSoil.styles';
import { TabContentDisplay, TabOptions } from '@/components/common/Tabs/Tabs';
import AddAnimals from './AddAnimals/AddAnimals';
import { Button, Card } from '@/components/common';

export default function AnimalsAndManure() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const tabs = [
    {
      id: 'add-animals',
      label: 'Add Animals',
      content: <AddAnimals setIsFormValid={setIsFormValid} />,
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
    if (activeTab <= tabs.length) setActiveTab(activeTab + 1);
  };

  // Do we want to save the information in the form to the file?
  const handlePrevious = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
    else navigate('/farm-information');
  };

  return (
    <Card
      height="500px"
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
          disabled={!isFormValid}
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
