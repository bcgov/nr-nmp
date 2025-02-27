/**
 * @summary The Field and Soil page for the application
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import FieldList from './FieldList/FieldList';
import SoilTests from './SoilTests/SoilTests';
import Crops from './Crops/Crops';
import { Card, Button } from '../../components/common';
import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { CardHeader, Banner, ButtonWrapper } from './fieldAndSoil.styles';
import NMPFileCropData from '@/types/NMPFileCropData';
import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';

export default function FieldAndSoil() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [fields, setFields] = useState<
    {
      FieldName: string;
      Area: string;
      PreviousYearManureApplicationFrequency: string;
      Comment: string;
      SoilTest: object;
      Crops: NMPFileCropData[];
    }[]
  >([]);

  const tabs = [
    {
      id: 'field-list',
      label: 'Field List',
      content: (
        <FieldList
          fields={fields}
          setFields={setFields}
        />
      ),
    },
    {
      id: 'soil-test',
      label: 'Soil Tests',
      content: (
        <SoilTests
          fields={fields}
          setFields={setFields}
        />
      ),
    },
    {
      id: 'crops',
      label: 'Crops',
      content: (
        <Crops
          fields={fields}
          setFields={setFields}
        />
      ),
    },
  ];

  const handleNext = () => {
    let nmpFile: NMPFile;

    // There shouldn't be a need to check here. If the user reached this page without
    // an nmp file being saved to the state, it is an error
    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else {
      nmpFile = { ...defaultNMPFile };
      nmpFile.years.push({ ...blankNMPFileYearData });
    }
    if (nmpFile.years.length > 0) {
      nmpFile.years[0].Fields = fields.map((field) => ({
        FieldName: field.FieldName,
        Area: parseFloat(field.Area),
        PreviousYearManureApplicationFrequency: field.PreviousYearManureApplicationFrequency,
        Comment: field.Comment,
        SoilTest: field.SoilTest,
        Crops: field.Crops,
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
    else navigate('/farm-information');
  };

  // assumes only 1 year, edit
  useEffect(() => {
    if (state.nmpFile) {
      const parsedData = JSON.parse(state.nmpFile);
      setFields(parsedData.years[0].Fields);
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
          disabled={fields.length === 0}
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
