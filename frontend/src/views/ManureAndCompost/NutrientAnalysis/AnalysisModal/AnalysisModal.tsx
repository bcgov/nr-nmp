/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import React, { useEffect, useState } from 'react';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { Dropdown, InputField, RadioButton } from '@/components/common';
import { DropdownWrapper } from '@/components/common/Dropdown/dropdown.styles';
import { RadioButtonWrapper } from '@/components/common/RadioButton/radioButton.styles';

interface CombinedProps {
  manures: NMPFileImportedManureData[];
  manureData: {
    id: number;
    name: string;
    manureclass: string;
    solidliquid: string;
    moisture: string;
    nitrogen: number;
    ammonia: number;
    phosphorous: number;
    potassium: number;
    drymatterid: number;
    nmineralizationid: number;
    sortnum: number;
    cubicyardconversion: number;
    nitrate: number;
    defaultsolidmoisture: number | null;
  }[];
}

export default function AnalysisModal({ manures, manureData }: CombinedProps) {
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState({
    ManureSource: '',
    ManureName: '',
    MaterialType: '',
    BookLab: '',
    MaterialName: '',
    Nutrients: { Moisture: 0, N: 0, NH4N: 0, P: 0, K: 0 },
  });

  // useEffect(() => {
  //   if (analysisData) {
  //     setAnalysisForm({ ...analysisData });
  //   }
  // }, [analysisData]);

  // how to handle radio buttons?
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAnalysisForm({ ...analysisForm, [name]: value });
    console.log(manureData);
    console.log(manures);
    console.log(analysisForm);
  };

  return (
    <ModalContent>
      <div />
      {/* // modal has "Source of Material" dropdown which maps manures input */}
      <Dropdown
        label="Source of Material"
        name="Source of Material"
        value={analysisForm.ManureName}
        options={[
          { value: 0, label: 'Choose a source' },
          ...manures.map((manure) => ({
            value: manure.id,
            label: manure.MaterialName,
          })),
        ]}
        onChange={handleChange}
      />
      {manures.length > 0 && (
        <>
          <DropdownWrapper>
            <Dropdown
              label="Material Type"
              name="MaterialType"
              value={analysisForm.MaterialType}
              options={manureData.map((manure) => ({
                value: manure.id,
                label: manure.name,
              }))}
              onChange={handleChange}
            />
          </DropdownWrapper>
          <RadioButtonWrapper>
            {/* // radio button "Book Value" and "Lab Analysis" */}
            <RadioButton
              label="Book Value"
              name="booklab"
              value="book"
              checked={analysisForm.BookLab === 'book'}
              onChange={handleChange}
            />
            <RadioButton
              label="Lab Analysis"
              name="booklab"
              value="lab"
              checked={analysisForm.BookLab === 'lab'}
              onChange={handleChange}
            />
          </RadioButtonWrapper>
          {/* // Lab Analysis
            // material name Custom - material type here as default?
            // turns nutrient values into inputs */}
          {analysisForm.BookLab === 'lab' && (
            <InputField
              label="Material Name"
              type="text"
              name="materialName"
              value={`Custom - ${analysisForm.MaterialName}`}
              onChange={handleChange}
            />
          )}
          {/* 
            // Book value
            // Moisture, N, NH4-N, P, K
          */}
          {analysisForm.BookLab === 'book' && (
            <>
              <div>
                <span>Moisture (%)</span>
                <div>{analysisForm.Nutrients.Moisture}</div>
              </div>
              <div>
                <span>N (%)</span>
                <div>{analysisForm.Nutrients.N}</div>
              </div>
              <div>
                <span>NH4-N (ppm)</span>
                <div>{analysisForm.Nutrients.NH4N}</div>
              </div>
              <div>
                <span>P (%)</span>
                <div>{analysisForm.Nutrients.P}</div>
              </div>
              <div>
                <span>K (%)</span>
                <div>{analysisForm.Nutrients.K}</div>
              </div>
            </>
          )}
        </>
      )}
    </ModalContent>
  );
}
