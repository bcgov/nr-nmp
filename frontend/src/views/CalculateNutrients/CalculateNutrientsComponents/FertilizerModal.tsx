/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useState } from 'react';
import { Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { APICacheContext } from '@/context/APICacheContext';
import { formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import { ModalContent } from './fertilizerModal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';

type NMPFileField = NMPFileFieldData & {
  index: number;
  id: string;
};

type AddFertilizerModalProps = {
  initialModalData: NMPFileField | undefined;
  rowEditIndex: number | undefined;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
  onCancel: () => void;
};

export default function FertilizerModal({
  initialModalData,
  rowEditIndex,
  setFieldList,
  onCancel,
  ...props
}: AddFertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerForm, setFertilizerForm] = useState({
    fieldName: initialModalData?.FieldName,
    fertilizerType: 0,
    fertilizerId: 0,
    applicationRate: 1,
    applUnit: 1,
    liquidDensity: 1,
    densityUnits: 0,
    availableNutrients: { N: 0, P: 0, K: 0 },
    nutrientsStillRequired: { N: 0, P: 0, K: 0 },
  });
  const apiCache = useContext(APICacheContext);

  const [fertilizerTypes, setFertilizerTypes] = useState<
    {
      id: number;
      label: string;
      name: string;
      dryliquid: string;
      custom: boolean;
    }[]
  >([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<
    {
      id: number;
      label: string;
      name: string;
      dryliquid: string;
      nitrogen: number;
      phosphorous: number;
      potassium: number;
      sortnum: number;
    }[]
  >([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      conversiontoimperialgallonsperacre: number;
    }[]
  >([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState(fertilizerOptions);

  // const densityOptions = [
  //   { value: 0, label: 'kg/US Gallon' },
  //   { value: 1, label: 'kg/L' },
  //   { value: 2, label: 'lb/US gallon' },
  //   { value: 3, label: 'lb/imp. gallon' },
  // ];

  // get fertilizer types, names, and conversion units
  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerTypes(data);
      }
    });
    apiCache.callEndpoint('api/fertilizers/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerOptions(data);
      }
    });
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerUnits(data);
      }
    });
    // filters fertilizer based on selected type id
    const selectedFertilizerType = fertilizerTypes.find(
      (type) => type.id === fertilizerForm.fertilizerType,
    );

    if (selectedFertilizerType) {
      const filtered = fertilizerOptions.filter(
        (fertilizer) => fertilizer.dryliquid === selectedFertilizerType.dryliquid,
      );
      setFilteredFertilizers(filtered);
    }
  }, [apiCache, fertilizerForm.fertilizerType, fertilizerTypes, fertilizerOptions]);

  //   // Calculate available nutrients and nutrients still required for the year
  //   const calculateFieldBalances = () => {
  //     let fertN = 0;
  //     let fertP = 0;
  //     let fertK = 0;
  //     // calculate available nutrients (agronomic balance + fertilizer)
  //     field.Crops?.forEach((crop) => {
  //       fertN += crop.reqN ?? 0;
  //       fertP += crop.reqP2o5 ?? 0;
  //       fertK += crop.reqK2o ?? 0;
  //     });
  //     // find fertilizer nutrients by matching id's
  //     const selectedFertilizer = fertilizerOptions.find(
  //       (fertilizer) => fertilizer.id === fertilizerForm.fertilizerId,
  //     );
  //     if (selectedFertilizer) {
  //       fertN += selectedFertilizer.nitrogen;
  //       fertP += selectedFertilizer.phosphorous;
  //       fertK += selectedFertilizer.potassium;
  //     }
  //     const availableNutrients = {
  //       N: fertN,
  //       P: fertP,
  //       K: fertK,
  //     };
  //     // Calculate crop removal values
  //     const cropRemoval =
  //       field.Crops?.map((crop) => ({
  //         N: crop?.remN ?? 0,
  //         P: crop?.remP2o5 ?? 0,
  //         K: crop?.remK2o ?? 0,
  //       })) ?? [];
  //     // Nutrients still required (if negative, set to 0)
  //     const nutrientsStillRequired = {
  //       N: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.N, 0) - availableNutrients.N, 0),
  //       P: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.P, 0) - availableNutrients.P, 0),
  //       K: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.K, 0) - availableNutrients.K, 0),
  //     };
  //     setFertilizerForm((prevForm) => ({
  //       ...prevForm,
  //       availableNutrients,
  //       nutrientsStillRequired,
  //     }));
  //   };

  //   // fx to get the conversion coefficient for the selected fertilizer unit
  //   // const getConversionCoefficient = (unitId: number) => {
  //   //   const unit = fertilizerUnits.find((fUnit) => fUnit.id === unitId);
  //   //   return unit ? unit.conversiontoimperialgallonsperacre : 1;
  //   // };

  //   // triggers converting values and calculate function and populates calculated values
  //   const handleCalculate = () => {
  //     calculateFieldBalances();
  //   };

  const handleSubmit = (newFormData: NMPFileField) => {
    setFieldList((prev) => {
      if (rowEditIndex !== undefined) {
        const replaceIndex = prev.findIndex((elem) => (elem as any).index === rowEditIndex);
        if (replaceIndex === -1) return prev;
        const newList = [...prev];
        newList[replaceIndex] = { ...newFormData, index: rowEditIndex };
        return newList;
      }
      const nextIndex = prev.length === 0 ? 0 : ((prev[prev.length - 1] as any).index ?? 0) + 1;
      return [...prev, { ...newFormData, index: nextIndex }];
    });

    onCancel();
  };

  const handleChange = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    let value = changes[name];

    // Convert string inputs to appropriate number types
    if (typeof value === 'string') {
      if (name === 'applicationRate' || name === 'liquidDensity') {
        value = parseFloat(value);
      } else if (
        name === 'fertilizerId' ||
        name === 'fertilizerType' ||
        name === 'applUnit' ||
        name === 'densityUnits'
      ) {
        value = parseInt(value, 10);
      }
    }

    setFertilizerForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  return (
    <Modal
      title="Add fertilizer"
      onOpenChange={() => {}}
      {...props}
    >
      <ModalContent>
        <Form
          onCancel={() => onCancel()}
          onSubmit={(e: any) => handleSubmit(e)}
          isConfirmDisabled={false}
        >
          <Grid
            container
            spacing={2}
          />
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Fertilizer Type"
              placeholder="Select a fertilizer type"
              selectedKey={fertilizerForm?.fertilizerType}
              items={fertilizerTypes}
              onSelectionChange={(e: any) => handleChange(e)}
            />
            <Select
              isRequired
              label="fertilizerId"
              placeholder="Select a fertilizer type"
              selectedKey={fertilizerForm?.fertilizerId}
              items={filteredFertilizers}
              onSelectionChange={(e: any) => handleChange(e)}
            />
            <TextField
              isRequired
              name="applicationRate"
              value={String(fertilizerForm?.applicationRate)}
              onChange={(e: any) => handleChange(e)}
            />
            <Select
              isRequired
              label="Appl Units"
              name="applUnit"
              selectedKey={fertilizerForm?.applUnit}
              items={fertilizerUnits
                .filter((unit) => [3, 4, 5, 6].includes(unit.id))
                .map((unit) => ({
                  value: { id: unit.id },
                  label: unit.name,
                }))}
              onSelectionChange={(e: any) => handleChange(e)}
            />
          </Grid>
          {/* {(formData.fertilizerType === 3 || 4) && (
            <>
              <TextField
                label="Density"
                type="number"
                name="liquidDensity"
                value={formData.liquidDensity}
                onChange={(e) => handleChange(e)}
                flex="0.5"
              />
              <Select
                label="Density Units"
                name="densityUnits"
                value={formData.densityUnits}
                options={densityOptions}
                onChange={(e: any) => handleChange(e)}
              />
            </>
          )} */}
          {/* <div>
            <h3>Available Nutrients (lb/ac)</h3>
            <table>
              <tbody>
                <tr>
                  <td>
                    <h4>N</h4>
                    <p>{formData.availableNutrients.N}</p>
                  </td>
                  <td>
                    <h4>P2O5</h4>
                    <p>{formData.availableNutrients.P}</p>
                  </td>
                  <td>
                    <h4>k2O</h4>
                    <p>{formData.availableNutrients.K}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> */}
        </Form>
      </ModalContent>
    </Modal>
  );
}
