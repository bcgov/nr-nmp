/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useEffect, useState } from 'react';
import { Dropdown, InputField } from '@/components/common';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { ValueText } from '@/views/FieldAndSoil/Crops/crops.styles';

interface Field {
  FieldName: string;
  Id: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: any[];
}

interface FertilizerModalProps {
  field: Field;
  fertilizerUnits: {
    id: number;
    name: string;
    dryliquid: string;
    conversiontoimperialgallonsperacre: number;
  }[];
  fertilizerTypes: {
    id: number;
    name: string;
    dryliquid: string;
    custom: boolean;
  }[];
  fertilizerOptions: {
    id: number;
    name: string;
    dryliquid: string;
    nitrogen: number;
    phosphorous: number;
    potassium: number;
    sortnum: number;
  }[];
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

// fieldtable displays this crops in one field tab and has the option to add fertilizer with a modal
export default function FertilizerModal({
  field,
  fertilizerUnits,
  fertilizerTypes,
  fertilizerOptions,
  setIsModalVisible,
}: FertilizerModalProps) {
  const [fertilizerForm, setFertilizerForm] = useState({
    fieldId: field.Id,
    fertilizerType: '',
    fertilizer: '',
    applicationRate: 0,
    liquidDensity: 0,
  });
  const [filteredFertilizers, setFilteredFertilizers] = useState(fertilizerOptions);
  const [applUnit, setApplUnit] = useState('');
  const [densityUnits, setDensityUnits] = useState('');
  const [applRate, setApplRate] = useState('');
  const [density, setDensity] = useState('');

  const densityOptions = [
    { value: 0, label: 'kg/US Gallon' },
    { value: 1, label: 'kg/L' },
    { value: 2, label: 'lb/US gallon' },
    { value: 3, label: 'lb/imp. gallon' },
  ];

  // Function to get the conversion coefficient for the selected fertilizer unit
  const getConversionCoefficient = (unitId: number) => {
    const unit = fertilizerUnits.find((fUnit) => fUnit.id === unitId);
    return unit ? unit.conversiontoimperialgallonsperacre : 1; // Default to 1 if unit not found
  };

  // Apply conversions based on selected application unit and density unit
  const applyConversions = () => {
    let convertedApplRate = parseFloat(applRate);
    let convertedDensity = parseFloat(density);

    const applUnitCoef = getConversionCoefficient(Number(applUnit));

    // Convert application rate and density to the default unit for calc is lb/ac for dry ferts, imp. gall/ac for liquid
    switch (applUnit) {
      case 'kg/ha':
        convertedApplRate *= applUnitCoef;
        break;
      case 'lb/1000ft2':
        convertedApplRate *= applUnitCoef;
        break;
      case 'L/ac':
        convertedApplRate *= applUnitCoef;
        break;
      case 'US gallons/ac':
        convertedApplRate *= applUnitCoef;
        break;
      default:
        break;
    }

    // Convert density units if applicable (for liquid fertilizers)
    if (fertilizerForm.fertilizerType === '3' || fertilizerForm.fertilizerType === '4') {
      switch (densityUnits) {
        case 'kg/US Gallon':
          convertedDensity *= 2.20462; // Kilograms to pounds
          convertedDensity /= 1.20095; // US Gallons to Imperial Gallons
          break;
        case 'kg/L':
          convertedDensity *= 2.20462; // Kilograms to pounds
          convertedDensity /= 0.264172; // Liters to Imperial Gallons
          break;
        case 'lb/US gallon':
          convertedDensity /= 1.20095; // US Gallons to Imperial Gallons
          break;
        default:
          break;
      }

      // Adjust application rate based on converted density
      convertedApplRate *= convertedDensity;
    }

    // Update the application rate in the form state after conversion
    setFertilizerForm((prevState) => ({
      ...prevState,
      applicationRate: convertedApplRate,
      liquidDensity: convertedDensity,
    }));
  };

  // filters fertilizer based on selected type id
  useEffect(() => {
    const selectedFertilizerType = fertilizerTypes.find(
      (type) => type.id === parseInt(fertilizerForm.fertilizerType, 10),
    );

    if (selectedFertilizerType) {
      const filtered = fertilizerOptions.filter(
        (fertilizer) => fertilizer.dryliquid === selectedFertilizerType.dryliquid,
      );

      setFilteredFertilizers(filtered);
    }
  }, [fertilizerForm.fertilizerType, fertilizerTypes, fertilizerOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // should I be using nmpfile for this instead of fertilizerform?
    setFertilizerForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    applyConversions();
  };

  return (
    <div>
      {/* Fertilizer Form */}
      <ModalContent>
        <Dropdown
          label="Fertilizer Type"
          name="fertilizerType"
          value={fertilizerForm.fertilizerType || ''}
          options={fertilizerTypes.map((type) => ({
            value: type.id,
            label: type.name,
          }))}
          onChange={(e) => handleChange(e)}
        />
        <Dropdown
          label="Fertilizer"
          name="fertilizer"
          value={fertilizerForm.fertilizer || ''}
          options={filteredFertilizers.map((fertilizer) => ({
            value: fertilizer.id,
            label: fertilizer.name,
          }))}
          onChange={(e) => handleChange(e)}
        />
        <InputField
          label="Application Rate"
          type="text"
          name="applicationRate"
          value={applRate}
          onChange={handleChange}
          flex="0.5"
        />
        <Dropdown
          label="Appl Units"
          name="applUnits"
          value={applUnit}
          options={fertilizerUnits
            .filter((unit) => [3, 4, 5, 6].includes(unit.id))
            .map((unit) => ({
              value: unit.id,
              label: unit.name,
            }))}
          onChange={(e) => handleChange(e)}
        />
        {fertilizerForm.fertilizerType === '3' && (
          <>
            <InputField
              label="Density"
              type="text"
              name="liquidDensity"
              value={density}
              onChange={handleChange}
              flex="0.5"
            />
            <Dropdown
              label="Density Units"
              name="liquidDensityUnits"
              value={densityUnits}
              options={densityOptions}
              onChange={(e) => handleChange(e)}
            />
          </>
        )}
      </ModalContent>
    </div>
  );
}
