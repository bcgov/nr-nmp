import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Card, Button } from '../../components/common';
import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { CardHeader, Banner, ButtonWrapper } from './manureAndCompost.styles';
import ManureAndImports from './ManureAndImports/ManureAndImports';
import NutrientAnalysis from './NutrientAnalysis/NutrientAnalysis';

export default function ManureAndCompost() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [manures, setManures] = useState<NMPFileImportedManureData[]>([]);

  const tabs = [
    {
      id: 'manure-imports',
      label: 'Manure and Imports',
      content: <ManureAndImports />,
    },
    {
      id: 'nutrient-analysis',
      label: 'Nutrient Analysis',
      content: <NutrientAnalysis manures={manures} />,
    },
  ];

  const handleNext = () => {
    let nmpFile: NMPFile | null = null;
    if (state.nmpFile) {
      nmpFile = JSON.parse(state.nmpFile);
    }
    if (nmpFile && nmpFile.years.length > 0 && manures.length > 0) {
      nmpFile.years[0].ImportedManures = manures.map((manure) => ({
        ...manure,
      }));
    }
    setNMPFile(JSON.stringify(nmpFile));

    // if on the last tab navigate to calculate nutrients page
    if (activeTab === tabs.length - 1) {
      navigate('/calculate-nutrients');
    } else {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
    else navigate('/field-and-soil');
  };

  // assumes only 1 year, edit
  useEffect(() => {
    if (state.nmpFile) {
      const parsedData = JSON.parse(state.nmpFile);
      setManures(parsedData.years[0].Fields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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
            setActiveTab={setActiveTab}
            clickable={false}
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
          handleClick={handleNext}
          aria-label="Next"
          variant="primary"
          disabled={false}
        />
      </ButtonWrapper>
      <ButtonWrapper position="left">
        <Button
          text="Back"
          size="sm"
          handleClick={handlePrevious}
          aria-label="Back"
          variant="primary"
          disabled={false}
        />
      </ButtonWrapper>
    </Card>
  );
}
