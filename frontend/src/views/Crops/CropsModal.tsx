/* eslint-disable no-case-declarations */
import React, { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Button, ButtonGroup, TextField, Select } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoopIcon from '@mui/icons-material/Loop';
import { Modal, YesNoRadioButtons } from '@/components/common';
import { CropType, Crop, PreviousCrop, NMPFileCropData, NMPFileFieldData } from '@/types';
import {
  getCropRequirementP205,
  getCropRequirementK2O,
  getCropRequirementN,
  getCropRemovalN,
  getCropRemovalP205,
  getCropRemovalK20,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
import { APICacheContext } from '@/context/APICacheContext';
import {
  customTableStyle,
  formCss,
  formGridBreakpoints,
  textFieldStyle,
} from '../../common.styles';
import { ModalProps } from '@/components/common/Modal/Modal';
import { DEFAULT_NMPFILE_CROPS, HarvestUnit } from '@/constants';
import { CROP_OTHER_ID, CROP_TYPE_OTHER_ID } from '@/types/Crops';
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
  cropIndex: number | undefined;
  initialModalData: NMPFileCropData | undefined;
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
  const filteredCrops = useMemo<Crop[]>(() => {
    if (formData.cropTypeId === 0) return [];
    return crops.filter((type) => type.croptypeid === Number(formData.cropTypeId));
  }, [crops, formData.cropTypeId]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [previousCrops, setPreviousCrops] = useState<PreviousCrop[]>([]);
  // NOTE: Right now, this isn't set to false when the form changes
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // add validation for other crop

  /**
   * Validates the crop form data
   *
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!formData.cropTypeId) {
      newErrors.cropTypeId = 'Crop Type is required';
    }

    if (!formData.cropId) {
      newErrors.cropId = 'Crop is required';
    }

    // Yield validation - required and must be positive number
    if (!formData.yield) {
      newErrors.yield = 'Yield is required';
    } else if (Number.isFinite(formData.yield) || Number(formData.yield) <= 0) {
      newErrors.yield = 'Yield must be a valid number greater than zero';
    }

    // Crude protein validation for forage crops (type 1)
    if (selectedCropType?.crudeproteinrequired && !formData.crudeProtein) {
      newErrors.crudeProtein = 'Crude Protein is required';
    } else if (
      formData.cropTypeId === 1 &&
      (Number.isNaN(Number(formData.crudeProtein)) || Number(formData.crudeProtein) <= 0)
    ) {
      newErrors.crudeProtein = 'Crude Protein must be a valid number greater than zero';
    }

    // Only validate previous crop if options are available
    if (formData.cropId && !formData.prevCropId) {
      // Check if there are previous crop options for this crop
      const hasPreviousCropOptions = previousCrops.some(
        (crop) => crop.cropid === Number(formData.cropId),
      );

      if (hasPreviousCropOptions) {
        newErrors.prevCropId = 'Previous crop selection is required';
      }
    }

    // Special validation for cover crops (type 2)
    if (selectedCropType?.covercrop && formData.coverCropHarvested === undefined) {
      newErrors.coverCropHarvested = 'Please specify if cover crop was harvested';
    }

    // Validation for other crop type
    if (formData.cropTypeId === CROP_TYPE_OTHER_ID && formData.name === '') {
      newErrors.name = 'Please specify a name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Only called after calculations have been performed
  const handleSubmit = () => {
    if (formData.cropTypeId === CROP_TYPE_OTHER_ID) {
      if (!validateForm()) {
        return; // Stop if validation fails
      }
    }
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
    }
    if (formData.cropId !== 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormFieldChange = (attr: keyof NMPFileCropData, value: string | number | boolean) => {
    // Clear the error for the field being changed
    if (errors[attr]) {
      setErrors((prev) => ({ ...prev, [attr]: '' }));
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
      default:
        dispatch({ type: 'SET_FORM_DATA_ATTR', attr, value });
    }
  };

  /**
   * Calculates nutrient requirements and removals for the selected crop
   * Updates the formData state with calculated values
   */
  const handleCalculate = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // TODO: Handle this some better way?
    if (formData.cropId === CROP_OTHER_ID) {
      setCalculationsPerformed(true);
      return;
    }

    if (fieldIndex !== null && selectedCrop !== undefined && selectedCropType !== undefined) {
      try {
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

        // Update the crops data with calculated values
        dispatch({
          type: 'SET_CALCULATED_VALUES',
          reqN: cropRequirementN,
          reqP2o5: cropRequirementP205,
          reqK2o: cropRequirementK2O,
          remN: cropRemovalN,
          remP2o5: cropRemovalP205,
          remK2o: cropRemovalK20,
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
    if (formData.cropId !== 0 && formData.cropId !== CROP_OTHER_ID) {
      apiCache
        .callEndpoint(`api/cropyields/${formData.cropId}/${nmpFile.farmDetails.FarmRegion}/`)
        .then((response) => {
          if (response.status === 200) {
            const { data } = response;
            dispatch({ type: 'SET_DEFAULT_YIELD', amount: data[0].amount });
            if (initialModalData?.cropId !== formData.cropId) {
              dispatch({ type: 'SET_YIELD_IN_TONS', yield: data[0].amount });
            }
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cropId]);

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
      <div css={formCss}>
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${errors?.cropTypeId ? '--error' : ''}`}
            >
              Crop Type
            </span>
            <Select
              isRequired
              name="cropTypeId"
              items={cropTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              selectedKey={formData.cropTypeId}
              onSelectionChange={(e) => {
                handleFormFieldChange('cropTypeId', e as number);
              }}
            />
          </Grid>
          {cropTypes.length === 0 ? null : (
            <>
              {selectedCropType?.customcrop ? (
                <Grid size={formGridBreakpoints}>
                  <span className="bcds-react-aria-Select--Label">Crop Description</span>
                  <TextField
                    isRequired
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={(e) => handleFormFieldChange('name', e)}
                  />
                </Grid>
              ) : (
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${errors?.cropId ? '--error' : ''}`}
                  >
                    Crop
                  </span>
                  <Select
                    isRequired
                    name="cropId"
                    items={filteredCrops.map((ele) => ({ id: ele.id, label: ele.cropname }))}
                    isDisabled={!filteredCrops?.length}
                    selectedKey={formData.cropId}
                    onSelectionChange={(e) => {
                      handleFormFieldChange('cropId', e);
                    }}
                  />
                </Grid>
              )}
              <Grid size={formGridBreakpoints}>
                <span className={`bcds-react-aria-Select--Label ${errors.yield ? '--error' : ''}`}>
                  Yield{showUnitDropdown(formData.cropTypeId) ? '' : ' (tons/ac)'}
                </span>
                <TextField
                  isRequired
                  type="number"
                  name="yield"
                  value={formData.yield?.toString() || ''}
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
                />
              </Grid>
              {showUnitDropdown(formData.cropTypeId) && (
                <Grid size={formGridBreakpoints}>
                  <span className="bcds-react-aria-Select--Label">Units</span>
                  <Select
                    isRequired
                    name="yieldHarvestUnit"
                    items={HARVEST_UNIT_OPTIONS}
                    selectedKey={formData.yieldHarvestUnit}
                    onSelectionChange={(e) => {
                      handleFormFieldChange('yieldHarvestUnit', e);
                    }}
                  />
                </Grid>
              )}
              {selectedCropType?.crudeproteinrequired && (
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${errors.crudeProtein ? '--error' : ''}`}
                  >
                    Crude Protein (%)
                  </span>
                  <TextField
                    isRequired
                    type="number"
                    name="crudeProtein"
                    value={formData.crudeProtein?.toString() || ''}
                    onChange={(e) => handleFormFieldChange('crudeProtein', e)}
                  />
                </Grid>
              )}
              {!selectedCropType?.customcrop && (
                <>
                  {(() => {
                    const availablePreviousCrops = previousCrops.filter(
                      (crop) => crop.cropid === Number(formData.cropId),
                    );

                    return availablePreviousCrops.length > 0 ? (
                      <>
                        <Grid size={formGridBreakpoints}>
                          <span
                            className={`bcds-react-aria-Select--Label ${errors.prevCropId ? '--error' : ''}`}
                          >
                            Previous crop ploughed down (N credit)
                          </span>
                          <Select
                            isRequired
                            name="prevCropId"
                            items={availablePreviousCrops.map((ele) => ({
                              id: ele.id,
                              label: ele.name,
                            }))}
                            selectedKey={formData.prevCropId}
                            onSelectionChange={(e) => {
                              handleFormFieldChange('prevCropId', e);
                            }}
                          />
                        </Grid>
                        <Grid size={formGridBreakpoints}>
                          <span className="bcds-react-aria-Select--Label">N credit (lb/ac):</span>
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
                  <div
                    style={{ marginBottom: '0.15rem' }}
                    className={`bcds-react-aria-Select--Label ${errors.coverCropHarvested ? '--error' : ''}`}
                  >
                    Cover Crop Harvested
                  </div>
                  <YesNoRadioButtons
                    value={formData.coverCropHarvested || false}
                    text=""
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
                        <span className="MuiDataGrid-columnHeaderTitle">N</span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="N"
                          value={formData.reqN.toString()}
                          onChange={(v) => handleFormFieldChange('reqN', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                      <Grid size="grow">
                        <span className="MuiDataGrid-columnHeaderTitle">
                          P<sub>2</sub>O<sub>5</sub>
                        </span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="P2O5"
                          value={formData.reqP2o5.toString()}
                          onChange={(v) => handleFormFieldChange('reqP2o5', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                      <Grid size="grow">
                        <span className="MuiDataGrid-columnHeaderTitle">
                          K<sub>2</sub>O
                        </span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="K2O"
                          value={formData.reqK2o.toString()}
                          onChange={(v) => handleFormFieldChange('reqK2o', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={0.5}
                      size={6}
                    >
                      <Grid size="grow">
                        <span className="MuiDataGrid-columnHeaderTitle">N</span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="N"
                          value={formData.remN.toString()}
                          onChange={(v) => handleFormFieldChange('remN', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                      <Grid size="grow">
                        <span className="MuiDataGrid-columnHeaderTitle">
                          P<sub>2</sub>O<sub>5</sub>
                        </span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="P2O5"
                          value={formData.remP2o5.toString()}
                          onChange={(v) => handleFormFieldChange('remP2o5', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                      <Grid size="grow">
                        <span className="MuiDataGrid-columnHeaderTitle">
                          K<sub>2</sub>O
                        </span>
                        <TextField
                          isRequired
                          type="number"
                          aria-label="K2O"
                          value={formData.remK2o.toString()}
                          onChange={(v) => handleFormFieldChange('remK2o', v)}
                          css={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <div>
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
                  </div>
                </Grid>
              )}
            </>
          )}
        </Grid>
        <Divider
          aria-hidden="true"
          component="div"
          css={{ marginTop: '1rem', marginBottom: '1rem' }}
        />
        <ButtonGroup
          alignment="end"
          orientation="horizontal"
        >
          <Button
            variant="secondary"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleCalculate}
            isDisabled={
              selectedCropType?.id === CROP_TYPE_OTHER_ID ||
              selectedCropType === undefined ||
              (selectedCrop === undefined && !selectedCropType.customcrop)
            }
          >
            Calculate
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            isDisabled={!calculationsPerformed}
          >
            Submit
          </Button>
        </ButtonGroup>
      </div>
    </Modal>
  );
}

export default CropsModal;
