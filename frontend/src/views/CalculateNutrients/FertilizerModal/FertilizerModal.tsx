/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, InputField } from '@/components/common';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import NMPFileFieldData from '@/types/NMPFileFieldData';

interface FertilizerModalProps {
  field: NMPFileFieldData;
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
}

// fieldtable displays this crops in one field tab and has the option to add fertilizer with a modal
export default function FertilizerModal({
  field,
  fertilizerUnits,
  fertilizerTypes,
  fertilizerOptions,
}: FertilizerModalProps) {
  const [fertilizerForm, setFertilizerForm] = useState({
    fieldName: field.FieldName,
    fertilizerType: 0,
    fertilizerId: 0,
    applicationRate: 1,
    applUnit: 1,
    liquidDensity: 1,
    densityUnits: 0,
    availableNutrients: { N: 0, P: 0, K: 0 },
    nutrientsStillRequired: { N: 0, P: 0, K: 0 },
  });
  const [filteredFertilizers, setFilteredFertilizers] = useState(fertilizerOptions);

  const densityOptions = [
    { value: 0, label: 'kg/US Gallon' },
    { value: 1, label: 'kg/L' },
    { value: 2, label: 'lb/US gallon' },
    { value: 3, label: 'lb/imp. gallon' },
  ];

  // filters fertilizer based on selected type id
  useEffect(() => {
    const selectedFertilizerType = fertilizerTypes.find(
      (type) => type.id === fertilizerForm.fertilizerType,
    );

    if (selectedFertilizerType) {
      const filtered = fertilizerOptions.filter(
        (fertilizer) => fertilizer.dryliquid === selectedFertilizerType.dryliquid,
      );
      setFilteredFertilizers(filtered);
    }
  }, [fertilizerForm.fertilizerType, fertilizerTypes, fertilizerOptions]);

  // Calculate available nutrients and nutrients still required for the year
  const calculateFieldBalances = () => {
    let fertN = 0;
    let fertP = 0;
    let fertK = 0;
    // calculate available nutrients (agronomic balance + fertilizer)
    field.Crops?.forEach((crop) => {
      fertN += crop.reqN ?? 0;
      fertP += crop.reqP2o5 ?? 0;
      fertK += crop.reqK2o ?? 0;
    });
    // find fertilizer nutrients by matching id's
    const selectedFertilizer = fertilizerOptions.find(
      (fertilizer) => fertilizer.id === fertilizerForm.fertilizerId,
    );
    if (selectedFertilizer) {
      fertN += selectedFertilizer.nitrogen;
      fertP += selectedFertilizer.phosphorous;
      fertK += selectedFertilizer.potassium;
    }
    const availableNutrients = {
      N: fertN,
      P: fertP,
      K: fertK,
    };
    // Calculate crop removal values
    const cropRemoval =
      field.Crops?.map((crop) => ({
        N: crop?.remN ?? 0,
        P: crop?.remP2o5 ?? 0,
        K: crop?.remK2o ?? 0,
      })) ?? [];
    // Nutrients still required (if negative, set to 0)
    const nutrientsStillRequired = {
      N: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.N, 0) - availableNutrients.N, 0),
      P: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.P, 0) - availableNutrients.P, 0),
      K: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.K, 0) - availableNutrients.K, 0),
    };
    setFertilizerForm((prevForm) => ({
      ...prevForm,
      availableNutrients,
      nutrientsStillRequired,
    }));
  };

  // fx to get the conversion coefficient for the selected fertilizer unit
  // const getConversionCoefficient = (unitId: number) => {
  //   const unit = fertilizerUnits.find((fUnit) => fUnit.id === unitId);
  //   return unit ? unit.conversiontoimperialgallonsperacre : 1;
  // };

  // triggers converting values and calculate function and populates calculated values
  const handleCalculate = () => {
    calculateFieldBalances();
  };

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // convert number inputs to floats or ints
    let numericValue = Number(value);
    if (name === 'applicationRate' || name === 'liquidDensity') {
      numericValue = parseFloat(value);
    } else if (name === 'fertilizerId' || name === 'fertilizerType') {
      numericValue = parseInt(value, 10);
    }
    // should I be using nmpfile for this instead of fertilizerform?
    setFertilizerForm((prevState) => ({
      ...prevState,
      [name]: numericValue,
    }));
  };

  return (
    <div>
      {/* Fertilizer Form */}
      <ModalContent>
        <Dropdown
          label="Fertilizer Type"
          name="fertilizerType"
          value={fertilizerForm.fertilizerType}
          options={fertilizerTypes.map((type) => ({
            value: type.id,
            label: type.name,
          }))}
          onChange={handleChange}
        />
        <Dropdown
          label="fertilizerId"
          name="fertilizerId"
          value={fertilizerForm.fertilizerId || 0}
          options={filteredFertilizers.map((fertilizer) => ({
            value: fertilizer.id,
            label: fertilizer.name,
          }))}
          onChange={(e: any) => handleChange(e)}
        />
        <InputField
          label="Application Rate"
          type="number"
          name="applicationRate"
          value={fertilizerForm.applicationRate}
          onChange={(e: any) => handleChange(e)}
          flex="0.5"
        />
        <Dropdown
          label="Appl Units"
          name="applUnit"
          value={fertilizerForm.applUnit}
          options={fertilizerUnits
            .filter((unit) => [3, 4, 5, 6].includes(unit.id))
            .map((unit) => ({
              value: unit.id,
              label: unit.name,
            }))}
          onChange={(e: any) => handleChange(e)}
        />
        {(fertilizerForm.fertilizerType === 3 || 4) && (
          <>
            <InputField
              label="Density"
              type="number"
              name="liquidDensity"
              value={fertilizerForm.liquidDensity}
              onChange={(e) => handleChange(e)}
              flex="0.5"
            />
            <Dropdown
              label="Density Units"
              name="densityUnits"
              value={fertilizerForm.densityUnits}
              options={densityOptions}
              onChange={(e: any) => handleChange(e)}
            />
          </>
        )}
        <div>
          <h3>Available Nutrients (lb/ac)</h3>
          <table>
            <tbody>
              <tr>
                <td>
                  <h4>N</h4>
                  <p>{fertilizerForm.availableNutrients.N}</p>
                </td>
                <td>
                  <h4>P2O5</h4>
                  <p>{fertilizerForm.availableNutrients.P}</p>
                </td>
                <td>
                  <h4>k2O</h4>
                  <p>{fertilizerForm.availableNutrients.K}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button
          text="Calculate"
          handleClick={handleCalculate}
          aria-label="Calculate"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </ModalContent>
    </div>
  );
}
