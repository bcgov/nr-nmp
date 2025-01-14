/**
 * @summary The calculate nutrients page for the application
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import { CardHeader, Banner, Heading, Table, ButtonWrapper } from './CalculateNutrients.styles';
import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { Card, Button } from '../../components/common';
import FieldTable from '../CalculateNutrients/FieldTable'

export default function CalculateNutrients() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [farmInfo, setFarmInfo] = useState<
    {
      Fields: [
        FieldName: string,
        Id: number,
        Crops: [
          id: number,
          cropId: string,
          reqN: number,
          reqP2o5: number,
          reqK2o: number,
          remN: number,
          remP2o5: number,
          remK2o: number,
        ],
      ],
    }[]
  >([]);

  //for each field create a tab with the field name and populate with its crops
  //extra blank tab being created
  const tabs = farmInfo ? farmInfo.map((field) => ({
    id: field.Id,
    label: field.FieldName,
    content: (
      <FieldTable
        field={field}
        farmInfo={farmInfo}
        setFarmInfo={setFarmInfo}
      />
    ),
  })) : [];

  const handleNext = () => {
    //add next page in future ticket
    navigate('/')
  }

  const handlePrevious = () => {
    navigate('/field-and-soil');
  };

  useEffect(() => {
    if (state.nmpFile) {
      setFarmInfo(JSON.parse(state.nmpFile).years[0].Fields);
    }
  }, []);

  return (
    <Card
      height="500px"
      width="700px"
      justifyContent="flex-start"
    >
      <CardHeader>
        <Banner>
          <Heading>Calculate Nutrients</Heading>
            <TabOptions
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              style="margin-left: 1em;"
            />
        </Banner>
      </CardHeader>
      <Table>
      {tabs.length > 0 && (
        <TabContentDisplay
          tabs={tabs}
          activeTab={activeTab}
        />
      )}
    </Table>
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
