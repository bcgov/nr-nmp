/**
 * @summary The calculate nutrients page for the application
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import { CardHeader, Banner, Heading, InputFieldsContainer, SelectorContainer, ButtonWrapper } from './CalculateNutrients.styles';
import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { InputField, RadioButton, Checkbox, Dropdown, Card, Button } from '../../components/common';

export default function CalculateNutrients() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [fields, setFields] = useState<
    {
      FieldName: string;
      Crops: any[];
    }[]
  >([]);

  const tabs = fields && fields.length > 0 ? fields.map((field, index) => ({
    id: field.FieldName,
    label: field.FieldName,
    content: (
      <div key={field.FieldName} padding-top="3em">
        <table>
          <thead>
            <tr>
              <th>Crops</th>
              <th>Agronomic (lb/ac)</th>
              <th>Crop Removal</th>
            </tr>
          </thead>
          <tbody>
            {/* {field.Crops.map((crop, cropIndex) => (
              <tr key={cropIndex}>
                <td>{crop.cropId}</td>
                <td>{crop.agronomic}</td>
                <td>{crop.cropRemoval}</td>
              </tr>
            ))} */}
          </tbody>
        </table>
      </div>
    ),
  })) : [];

  const handleNext = () => {
    navigate('/')
  }

  const handlePrevious = () => {
    navigate('/field-and-soil');
  };

  useEffect(() => {
    if (state.nmpFile) {
      const data = state.nmpFile;
      if (data){
        const parsedData = JSON.parse(data);
        setFields(parsedData.years[0].Fields);
      }
    }
  }, [state.nmpFile]);

  // const crops = fields.map((fields) =>
  //   fields.Crops.map((crop) => ({
  //     CropName: crop.cropId,
  //   }))
  // );

  return (
    <Card
      height="500px"
      width="700px"
      display="flex"
      justifyContent="flex-start"
    >
      <CardHeader>
        <Banner>
          <Heading padding-right="1em">Calculate Nutrients</Heading>
            <TabOptions
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
        </Banner>
      </CardHeader>
      <ButtonWrapper position="Left">
            <Button
              text="Add Fertilizer"
              size="sm"
              handleClick={handleNext}
              aria-label="Add Fertilizer"
              variant="primary"
              disabled={false}
            />
      </ButtonWrapper>
      {/* <TabContentDisplay
        tabs={tabs}
        activeTab={activeTab}
      /> */}
      {tabs.length > 0 && (
        <TabContentDisplay
          tabs={tabs}
          activeTab={activeTab}
        />
      )}
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

/**
 * @summary The calculate nutrients page for the application
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import fieldType from '@/types/fieldType';
import {
  CardHeader,
  Banner,
  Heading,
  Table,
  ButtonWrapper,
  TabWrapper,
} from './CalculateNutrients.styles';
import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { Card, Button } from '../../components/common';
import FieldTable from './FieldTable/FieldTable'

export default function CalculateNutrients() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [fields, setFields] = useState<fieldType[]>([]);

  // for each field create a tab with the field name and populate with its crops
  const tabs = fields
    ? fields.map((field) => ({
        id: field.FieldName,
        label: field.FieldName,
        content: (
          <FieldTable
            key={field.Id}
            field={field}
            setFields={setFields}
          />
        ),
      }))
    : [];

  const handleNext = () => {
    // add next page in future ticket
    navigate('/');
  };

  const handlePrevious = () => {
    navigate('/field-and-soil');
  };

  useEffect(() => {
    if (state.nmpFile) {
      const parsedData = JSON.parse(state.nmpFile);
      setFields(parsedData.years[0].Fields);
    }
  }, [state]);

  return (
    <Card
      height="500px"
      width="700px"
      justifyContent="flex-start"
    >
      <CardHeader>
        <Banner>
          <Heading>Calculate Nutrients</Heading>
        </Banner>
        <TabWrapper>
          <TabOptions
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </TabWrapper>
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
