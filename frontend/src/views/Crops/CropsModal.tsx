/* eslint-disable no-case-declarations */
import React, { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoopIcon from '@mui/icons-material/Loop';
import {
  Modal,
  Select,
  YesNoRadioButtons,
  TextField,
  NumberField,
  Form,
} from '@/components/common';
import {
  CropType,
  Crop,
  PreviousCrop,
  NMPFileCropData,
  NMPFileFieldData,
  SelectOption,
} from '@/types';
import {
  getCropRequirementP205,
  getCropRequirementK2O,
  getCropRequirementN,
  getCropRemovalN,
  getCropRemovalP205,
  getCropRemovalK20,
  getRaspberryNutrients,
  getBlueberryNutrients,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '../../common.styles';
import { ModalProps } from '@/components/common/Modal/Modal';
import { DEFAULT_NMPFILE_CROPS, HarvestUnit } from '@/constants';
import {
  CROP_OTHER_ID,
  CROP_TYPE_OTHER_ID,
  CROP_TYPE_BERRIES_ID,
  CROP_BLUEBERRIES_ID,
  CROP_RASPBERRIES_ID,
} from '@/types/Crops';
import { HARVEST_UNIT_OPTIONS } from '../../constants/harvestUnits';
import useAppState from '@/hooks/useAppState';
import { cropsModalReducer, showUnitDropdown } from './utils';

// Define constants for column headings for Nutrient added/removed tables
const requireAndRemoveColumns: GridColDef[] = [
  {
    field: 'reqN',
    headerName: 'N',
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
    flex: 1,
  },
  {
    field: 'reqP2o5',
    headerName: 'P2O5',
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
    flex: 1,
  },
  {
    field: 'reqK2o',
    headerName: 'K2O',
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
    flex: 1,
  },
];

/**
 * Turn all of the nutrient values positive so the modal only handles
 * positive values. When these values are saved to fields, they
 * are saved as negative numbers.
 * @param data The initialModalData
 * @returns Identical data with all nutrient values positive
 */
function preprocessModalData(data: NMPFileCropData): NMPFileCropData {
  return {
    ...data,
    reqN: Math.abs(data.reqN),
    reqP2o5: Math.abs(data.reqP2o5),
    reqK2o: Math.abs(data.reqK2o),
    remN: Math.abs(data.remN),
    remP2o5: Math.abs(data.remP2o5),
    remK2o: Math.abs(data.remK2o),
  };
}

/**
 * Turns all of the nutrient values negative for CalculateNutrients.
 * Crops only remove, not add, nutrients from the soil.
 * @param data The formData
 * @returns Identical data with all nutrient values negative
 */
function postprocessModalData(data: NMPFileCropData): NMPFileCropData {
  return {
    ...data,
    reqN: -1 * data.reqN,
    reqP2o5: -1 * data.reqP2o5,
    reqK2o: -1 * data.reqK2o,
    remN: -1 * data.remN,
    remP2o5: -1 * data.remP2o5,
    remK2o: -1 * data.remK2o,
  };
}

type CropsModalProps = {
  field: NMPFileFieldData;
  fieldIndex: number;
  cropIndex?: number;
  initialModalData?: NMPFileCropData;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
  farmRegion: number;
};

function CropsModal({
  field,
  fieldIndex,
  cropIndex,
  initialModalData,
  setFields,
  onClose,
  farmRegion,
  ...props
}: CropsModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { nmpFile } = useAppState().state;
  const apiCache = useContext(APICacheContext);

  const [{ formData, selectedCropType, selectedCrop, isFormYieldEqualToDefault }, dispatch] =
    useReducer(cropsModalReducer, {
      formData: initialModalData ? preprocessModalData(initialModalData) : DEFAULT_NMPFILE_CROPS,
      selectedCropType: undefined,
      selectedCrop: undefined,
      defaultYieldInTons: undefined,
      isFormYieldEqualToDefault: true,
    });
  const [crops, setCrops] = useState<Crop[]>([]);

  // These 4 are related to berries and are stored in the DB in the SelectOption format
  const [plantAges, setPlantAges] = useState<SelectOption<undefined>[]>([]);
  const [plantsPerAcre, setPlantsPerAcre] = useState<SelectOption<undefined>[]>([]);
  const [distanceBetweenPlants, setDistanceBetweenPlants] = useState<SelectOption<undefined>[]>([]);
  const [whereWillPruningsGo, setWhereWillPruningsGo] = useState<SelectOption<undefined>[]>([]);

  const filteredCrops = useMemo<Crop[]>(() => {
    if (formData.cropTypeId === 0) return [];
    return crops.filter((type) => type.croptypeid === formData.cropTypeId);
  }, [crops, formData.cropTypeId]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [previousCrops, setPreviousCrops] = useState<PreviousCrop[]>([]);
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);

  // Only called after calculations have been performed
  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prevField, index) => {
        if (index === fieldIndex) {
          // Check if we're editing an existing crop or adding a new crop
          let updatedCrops;
          if (cropIndex !== undefined) {
            updatedCrops = [...prevField.Crops];
            updatedCrops[cropIndex] = postprocessModalData(formData);
          } else {
            updatedCrops = [...prevField.Crops, postprocessModalData(formData)];
          }
          return { ...prevField, Crops: updatedCrops };
        }
        return prevField;
      });
      return newFields;
    });

    onClose();
  };

  // When crop is Other calculate button is disabled
  // To enable submit button setCalculationsPerformed to true for Other
  useEffect(() => {
    if (selectedCropType?.id === CROP_TYPE_OTHER_ID) {
      setCalculationsPerformed(true);
    } else {
      setCalculationsPerformed(false);
    }
  }, [selectedCropType]);

  // On load, make API calls to initialize reducer state values
  useEffect(() => {
    if (formData.cropTypeId !== 0) {
      apiCache
        .callEndpoint(`api/croptypes/${formData.cropTypeId}/`)
        .then((response: { status: any; data: CropType[] }) => {
          if (response.status === 200) {
            dispatch({ type: 'SET_SELECTED_CROP_TYPE', cropType: response.data[0] });
          }
        });
      apiCache
        .callEndpoint(`api/crops/${formData.cropId}/`)
        .then((response: { status: any; data: Crop[] }) => {
          if (response.status === 200) {
            dispatch({ type: 'SET_SELECTED_CROP', crop: response.data[0] });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Populate dropdowns on load
  useEffect(() => {
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setCropTypes(response.data);
      }
    });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setCrops(response.data);
      }
    });
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          setPreviousCrops(response.data);
        }
      });
    apiCache.callEndpoint('api/plantage/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setPlantAges(response.data);
      }
    });
    apiCache.callEndpoint('api/plantsperacre/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setPlantsPerAcre(response.data);
      }
    });
    apiCache
      .callEndpoint('api/distancebetweenplants/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          setDistanceBetweenPlants(response.data);
        }
      });
    apiCache
      .callEndpoint('api/wherewillpruningsgo/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          setWhereWillPruningsGo(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormFieldChange = (attr: keyof NMPFileCropData, value: string | number | boolean) => {
    // Reset calculation button
    if (formData.cropId !== CROP_OTHER_ID) {
      setCalculationsPerformed(false);
    }

    switch (attr) {
      case 'cropTypeId':
        const cropTypeId = value as number;
        const cropType = cropTypes.find((cT: CropType) => cT.id === cropTypeId);
        if (cropType === undefined)
          throw new Error(`Crop type ${cropTypeId} is missing from list.`);
        dispatch({ type: 'SET_CROP_TYPE_ID', cropTypeId, cropType });
        return;
      case 'cropId':
        const cropId = Number(value);
        const crop = crops.find((c) => c.id === cropId);
        if (crop === undefined) throw new Error(`Crop id ${cropId} is not in crop list.`);
        dispatch({ type: 'SET_CROP_ID', cropId, crop });
        return;
      case 'yield':
        dispatch({ type: 'SET_YIELD', yield: value as number });
        return;
      case 'yieldHarvestUnit':
        dispatch({ type: 'SET_YIELD_HARVEST_UNIT', unit: value as HarvestUnit });
        return;
      case 'whereWillPruningsGo':
        const selectedPruningOption = whereWillPruningsGo.find(
          (option) => option.id === Number(value),
        );
        const pruningLocation = selectedPruningOption ? selectedPruningOption.label : '';
        dispatch({ type: 'SET_FORM_DATA_ATTR', attr, value: pruningLocation });
        return;
      default:
        dispatch({ type: 'SET_FORM_DATA_ATTR', attr, value });
    }
  };

  /**
   * Helper function to extract nutrient values from calculation results
   */
  const extractNutrientValues = (nutrients: any) => ({
    cropRequirementN: nutrients.reqN,
    cropRequirementP205: nutrients.reqP2o5,
    cropRequirementK2O: nutrients.reqK2o,
    cropRemovalN: nutrients.remN,
    cropRemovalP205: nutrients.remP2o5,
    cropRemovalK20: nutrients.remK2o,
  });

  /**
   * Calculates nutrient requirements and removals for the selected crop
   * Updates the formData state with calculated values
   */
  const handleCalculate = async () => {
    if (fieldIndex !== null && selectedCrop !== undefined && selectedCropType !== undefined) {
      try {
        let nutrientValues;
        // Get soil test P and K values, use defaults if not available
        const soilTestValP = field.SoilTest?.convertedKelownaP
          ? Number(field.SoilTest.convertedKelownaP)
          : 250; // Default from defaultSoilTestData
        const soilTestValK = field.SoilTest?.convertedKelownaK
          ? Number(field.SoilTest.convertedKelownaK)
          : 500; // Default from defaultSoilTestData
        // Leaf tissue will be completed after this ticket and updated here. Using temp values for now
        const leafTissueP = 0;
        const leafTissueK = 0;
        if (selectedCrop.id === CROP_RASPBERRIES_ID) {
          const nutrients = await getRaspberryNutrients(
            formData.yield,
            formData.willSawdustBeApplied!,
            formData.willPlantsBePruned!,
            formData.whereWillPruningsGo!,
            soilTestValP,
            soilTestValK,
            leafTissueP,
            leafTissueK,
          );
          nutrientValues = extractNutrientValues(nutrients);
        } else if (selectedCrop.id === CROP_BLUEBERRIES_ID) {
          const nutrients = await getBlueberryNutrients(
            formData.yield,
            formData.willSawdustBeApplied!,
            formData.willPlantsBePruned!,
            formData.whereWillPruningsGo!,
            formData.plantAgeYears!,
            formData.numberOfPlantsPerAcre!,
            soilTestValP,
            leafTissueP,
            leafTissueK,
          );
          nutrientValues = extractNutrientValues(nutrients);
        } else {
          // Calculate crop requirements (P2O5, K2O, N)
          const cropRequirementN = getCropRequirementN(formData, selectedCrop, selectedCropType);
          const cropRequirementP205 = await getCropRequirementP205(
            formData,
            field.SoilTest,
            farmRegion,
          );
          const cropRequirementK2O = await getCropRequirementK2O(
            formData,
            field.SoilTest,
            farmRegion,
          );

          // Calculate crop removals (N, P2O5, K2O)
          const cropRemovalN = getCropRemovalN(formData, selectedCrop, selectedCropType);
          const cropRemovalP205 = getCropRemovalP205(formData, selectedCrop, selectedCropType);
          const cropRemovalK20 = getCropRemovalK20(formData, selectedCrop, selectedCropType);

          nutrientValues = {
            cropRequirementN,
            cropRequirementP205,
            cropRequirementK2O,
            cropRemovalN,
            cropRemovalP205,
            cropRemovalK20,
          };
        }

        // Update the crops data with calculated values
        dispatch({
          type: 'SET_CALCULATED_VALUES',
          reqN: nutrientValues.cropRequirementN,
          reqP2o5: nutrientValues.cropRequirementP205,
          reqK2o: nutrientValues.cropRequirementK2O,
          remN: nutrientValues.cropRemovalN,
          remP2o5: nutrientValues.cropRemovalP205,
          remK2o: nutrientValues.cropRemovalK20,
        });

        // Mark calculations as performed
        setCalculationsPerformed(true);
      } catch (error) {
        console.error('Error calculating crop data:', error);
      }
    }
  };

  /**
   * Effect: Update nitrogen credit when previous crop changes
   * Fetches nitrogen credit value for the selected previous crop
   */
  useEffect(() => {
    try {
      if (formData.prevCropId && formData.prevCropId !== 0) {
        apiCache
          .callEndpoint(`api/previouscroptypes/${formData.prevCropId}/`)
          .then((response: { status?: any; data: any }) => {
            if (response.status === 200) {
              dispatch({
                type: 'SET_FORM_DATA_ATTR',
                attr: 'nCredit',
                value: response.data[0].nitrogencreditimperial || 0,
              });
            }
          });
      }
    } catch (error) {
      console.error('Error getting nitrogen credit:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.prevCropId]);

  /**
   * Effect: Auto-fill yield when crop changes on add crop
   * Fetches default yield based on selected crop and region
   */
  useEffect(() => {
    if (formData.cropId !== 0 && formData.cropId !== CROP_OTHER_ID && selectedCrop !== undefined) {
      apiCache
        .callEndpoint(`api/cropyields/${formData.cropId}/${nmpFile.farmDetails.RegionLocationId}/`)
        .then((response) => {
          if (response.status === 200) {
            const { data } = response;
            let amount;
            if ((data as { amount: number }[]).length === 0) {
              console.error(
                `No yield data for ${formData.cropId} and location id ${nmpFile.farmDetails.RegionLocationId}`,
              );
              amount = 0;
            } else {
              amount = data[0].amount;
            }
            dispatch({ type: 'SET_DEFAULT_YIELD', amount });
            if (initialModalData?.cropId !== formData.cropId) {
              dispatch({ type: 'SET_YIELD_IN_TONS', yield: amount });
            }
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cropId, selectedCrop]);

  // Set data for nutrients added table
  const requirementRows = useMemo(() => {
    const { reqN, reqP2o5, reqK2o } = formData;
    return [{ id: Math.random(), reqN, reqP2o5, reqK2o }];
  }, [formData]);

  // Set data for nutrients removed table
  const removeRows = useMemo(() => {
    const { remN, remP2o5, remK2o } = formData;
    return [{ id: Math.random(), reqN: remN, reqP2o5: remP2o5, reqK2o: remK2o }];
  }, [formData]);

  return (
    <Modal
      onOpenChange={onClose}
      title={`${cropIndex !== undefined ? 'Edit' : 'Add'} Crop`}
      {...props}
    >
      <Form
        onCancel={onClose}
        onCalculate={handleCalculate}
        isCalculateDisabled={
          selectedCropType === undefined ||
          selectedCropType.id === CROP_TYPE_OTHER_ID ||
          (selectedCrop === undefined && !selectedCropType.customcrop)
        }
        onConfirm={handleSubmit}
        isConfirmDisabled={!calculationsPerformed}
        confirmButtonText="Submit"
      >
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Crop Type"
              items={cropTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              selectedKey={formData.cropTypeId}
              onSelectionChange={(e) => handleFormFieldChange('cropTypeId', e as number)}
            />
          </Grid>
          {cropTypes.length === 0 ? null : (
            <>
              {selectedCropType?.customcrop ? (
                <Grid size={formGridBreakpoints}>
                  <TextField
                    label="Crop Description"
                    isRequired
                    value={formData.name}
                    onChange={(e) => handleFormFieldChange('name', e)}
                  />
                </Grid>
              ) : (
                <Grid size={formGridBreakpoints}>
                  <Select
                    isRequired
                    label="Crop"
                    items={filteredCrops.map((ele) => ({ id: ele.id, label: ele.cropname }))}
                    isDisabled={filteredCrops.length === 0}
                    selectedKey={formData.cropId}
                    onSelectionChange={(e) => handleFormFieldChange('cropId', e as number)}
                  />
                </Grid>
              )}
              <Grid size={formGridBreakpoints}>
                <NumberField
                  isRequired
                  label={`Yield${showUnitDropdown(formData.cropTypeId) ? '' : ' (tons/ac)'}`}
                  value={formData.yield}
                  onChange={(e) => handleFormFieldChange('yield', e)}
                  iconRight={
                    !isFormYieldEqualToDefault ? (
                      <button
                        type="button"
                        css={{ backgroundColor: '#ffa500' }}
                        onClick={() => dispatch({ type: 'RESTORE_DEFAULT_YIELD' })}
                      >
                        <LoopIcon />
                      </button>
                    ) : undefined
                  }
                  minValue={0}
                />
              </Grid>
              {showUnitDropdown(formData.cropTypeId) && (
                <Grid size={formGridBreakpoints}>
                  <Select
                    label="Units"
                    isRequired
                    items={HARVEST_UNIT_OPTIONS}
                    selectedKey={formData.yieldHarvestUnit}
                    onSelectionChange={(e) => {
                      handleFormFieldChange('yieldHarvestUnit', e as string);
                    }}
                  />
                </Grid>
              )}
              {selectedCropType?.crudeproteinrequired && (
                <Grid size={formGridBreakpoints}>
                  <NumberField
                    isRequired
                    label="Crude Protein (%)"
                    value={formData.crudeProtein}
                    onChange={(e) => handleFormFieldChange('crudeProtein', e)}
                    minValue={0}
                    maxValue={100}
                  />
                </Grid>
              )}
              {selectedCrop?.id === CROP_BLUEBERRIES_ID && (
                <>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Plant Age (Years)"
                      items={plantAges}
                      selectedKey={formData.plantAgeYears}
                      onSelectionChange={(e) => handleFormFieldChange('plantAgeYears', e as number)}
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="# of plants per acre"
                      items={plantsPerAcre}
                      selectedKey={formData.numberOfPlantsPerAcre}
                      onSelectionChange={(e) =>
                        handleFormFieldChange('numberOfPlantsPerAcre', e as number)
                      }
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Distance between plants, distance between rows (inches)"
                      items={distanceBetweenPlants}
                      selectedKey={formData.distanceBtwnPlantsRows}
                      onSelectionChange={(e) =>
                        handleFormFieldChange('distanceBtwnPlantsRows', e as number)
                      }
                    />
                  </Grid>
                </>
              )}
              {selectedCropType?.id === CROP_TYPE_BERRIES_ID && (
                <>
                  <Grid size={formGridBreakpoints}>
                    <YesNoRadioButtons
                      value={formData.willPlantsBePruned || false}
                      text="Will plants be pruned?"
                      onChange={(b: boolean) => {
                        handleFormFieldChange('willPlantsBePruned', b);
                      }}
                      orientation="horizontal"
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Where will prunings go?"
                      items={whereWillPruningsGo}
                      selectedKey={
                        whereWillPruningsGo.find(
                          (option) => option.label === formData.whereWillPruningsGo,
                        )?.id || 0
                      }
                      onSelectionChange={(e) =>
                        handleFormFieldChange('whereWillPruningsGo', e as number)
                      }
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <YesNoRadioButtons
                      value={formData.willSawdustBeApplied || false}
                      text="Is sawdust or wood mulch applied within the 6 months prior to the growing season?"
                      onChange={(b: boolean) => {
                        handleFormFieldChange('willSawdustBeApplied', b);
                      }}
                      orientation="horizontal"
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <YesNoRadioButtons
                      value={formData.hasLeafTest || false}
                      text="Do you have a leaf test from the past three years?"
                      onChange={(b: boolean) => {
                        handleFormFieldChange('hasLeafTest', b);
                      }}
                      orientation="horizontal"
                    />
                  </Grid>
                </>
              )}
              {!selectedCropType?.customcrop && (
                <>
                  {(() => {
                    const availablePreviousCrops = previousCrops.filter(
                      (crop) => crop.cropid === formData.cropId,
                    );

                    return availablePreviousCrops.length > 0 ? (
                      <>
                        <Grid size={formGridBreakpoints}>
                          <Select
                            isRequired
                            label="Previous crop ploughed down (N credit)"
                            items={availablePreviousCrops.map((ele) => ({
                              id: ele.id,
                              label: ele.name,
                            }))}
                            selectedKey={formData.prevCropId}
                            onSelectionChange={(e) => {
                              handleFormFieldChange('prevCropId', e as number);
                            }}
                          />
                        </Grid>
                        <Grid size={formGridBreakpoints}>
                          <span className="bcds-react-aria-Text primary small">
                            N credit (lb/ac):
                          </span>
                          <div>
                            <span css={{ display: 'block', marginTop: '8px' }}>
                              {formData.nCredit}
                            </span>
                          </div>
                        </Grid>
                      </>
                    ) : null;
                  })()}
                </>
              )}
              {selectedCropType?.covercrop && (
                <Grid size={formGridBreakpoints}>
                  <YesNoRadioButtons
                    value={formData.coverCropHarvested || false}
                    text="Cover Crop Harvested"
                    onChange={(b: boolean) => {
                      handleFormFieldChange('coverCropHarvested', b);
                    }}
                    orientation="horizontal"
                  />
                </Grid>
              )}

              {selectedCropType?.customcrop ? (
                <div css={{ display: 'block' }}>
                  <Grid
                    container
                    size={12}
                  >
                    <Grid size={6}>
                      <span css={{ fontWeight: 'bold' }}>Crop Requirement (lb/ac)</span>
                    </Grid>
                    <Grid size={6}>
                      <span css={{ fontWeight: 'bold' }}>Nutrient Removal (lb/ac)</span>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    size={12}
                  >
                    <Grid
                      container
                      spacing={0.5}
                      size={6}
                    >
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label="N"
                          value={formData.reqN}
                          onChange={(v) => handleFormFieldChange('reqN', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label={
                            <span>
                              P<sub>2</sub>O<sub>5</sub>
                            </span>
                          }
                          value={formData.reqP2o5}
                          onChange={(v) => handleFormFieldChange('reqP2o5', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label={
                            <span>
                              K<sub>2</sub>O
                            </span>
                          }
                          value={formData.reqK2o}
                          onChange={(v) => handleFormFieldChange('reqK2o', v)}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={0.5}
                      size={6}
                    >
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label="N"
                          value={formData.remN}
                          onChange={(v) => handleFormFieldChange('remN', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label={
                            <span>
                              P<sub>2</sub>O<sub>5</sub>
                            </span>
                          }
                          value={formData.remP2o5}
                          onChange={(v) => handleFormFieldChange('remP2o5', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label={
                            <span>
                              K<sub>2</sub>O
                            </span>
                          }
                          value={formData.remK2o}
                          onChange={(v) => handleFormFieldChange('remK2o', v)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Grid
                    container
                    spacing={1}
                    sx={{ marginTop: '1rem' }}
                  >
                    <Grid size={{ xs: 6 }}>
                      <span css={{ fontWeight: 'bold' }}>Crop Requirement (lb/ac)</span>
                      <DataGrid
                        sx={{ ...customTableStyle }}
                        columns={requireAndRemoveColumns}
                        rows={requirementRows}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterPagination
                        hideFooter
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <span css={{ fontWeight: 'bold' }}>Nutrient Removal (lb/ac)</span>
                      <DataGrid
                        sx={{ ...customTableStyle }}
                        columns={requireAndRemoveColumns}
                        rows={removeRows}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterPagination
                        hideFooter
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Form>
    </Modal>
  );
}

export default CropsModal;
