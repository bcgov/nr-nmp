import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, TextField, Select } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Modal, YesNoRadioButtons } from '@/components/common';
import { CropType, Crop, PreviousCrop, NMPFileCropData, NMPFileFieldData } from '@/types';
import {
  getRegion,
  getCrop,
  getCropRequirementP205,
  getCropRequirementK2O,
  getCropRequirementN,
  getCropRemovalN,
  getCropRemovalP205,
  getCropRemovalK20,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formCss, formGridBreakpoints } from '../../common.styles';
import { booleanChecker } from '../../utils/utils';
import { ModalProps } from '@/components/common/Modal/Modal';

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
  },
  {
    field: 'reqP2o5',
    headerName: 'P2O5',
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqK2o',
    headerName: 'K2O',
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
  },
];

type CropsModalProps = {
  mode: string;
  field: NMPFileFieldData;
  fieldIndex: number;
  initialModalData: NMPFileCropData;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
  farmRegion: number;
};

function CropsModal({
  mode,
  field,
  fieldIndex,
  initialModalData,
  setFields,
  onClose,
  farmRegion,
  ...props
}: CropsModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const apiCache = useContext(APICacheContext);

  const [crops, setCrops] = useState<Crop[]>([]);
  const [formData, setFormData] = useState<NMPFileCropData>(initialModalData);
  const filteredCrops = useMemo<Crop[]>(() => {
    if (formData.cropTypeId === 0) return [];
    return crops.filter((type) => type.croptypeid === Number(formData.cropTypeId));
  }, [crops, formData.cropTypeId]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [previousCrops, setPreviousCrops] = useState<PreviousCrop[]>([]);
  const [ncredit, setNcredit] = useState<number>(0);
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Only called after calculations have been performed
  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prevField, index) => {
        if (index === fieldIndex) {
          // Check if we're editing an existing crop or adding a new crop
          let updatedCrops;
          if (mode === 'Edit') {
            updatedCrops = prevField.Crops.map((crop) =>
              crop.index === initialModalData.index ? { ...formData } : crop,
            );
          } else {
            updatedCrops = [...prevField.Crops, formData];
          }
          return { ...prevField, Crops: updatedCrops };
        }
        return prevField;
      });
      return newFields;
    });

    onClose();
  };

  useEffect(() => {
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCropTypes(data);
      }
    });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCrops(data);
      }
    });
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setPreviousCrops(data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormFieldChange = (name: string, value: string | number | boolean) => {
    // Clear the error for the field being changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Handle special case for cropTypeId - filter available crops based on type
    if (name === 'cropTypeId') {
      // If cropTypeId is set to 2 (Cover crops), default to false
      // If changed away from 2, reset to null
      if (value === 2) {
        if (formData.coverCropHarvested === null) {
          setFormData((prevData) => ({
            ...prevData,
            coverCropHarvested: 'false',
          }));
        }
      } else {
        setFormData((prevData) => ({
          ...prevData,
          coverCropHarvested: null,
        }));
      }

      // Handle special case for cropTypeId - set the crop name for display cropTypes
      setFormData((prevData) => ({
        ...prevData,
        cropTypeId: Number(value),
        cropTypeName:
          cropTypes.find((cropType: CropType) => cropType.id === Number(value))?.name || '', // should this fail in undef?
      }));
    }

    // Handle special case for cropId - set the crop name for display
    if (name === 'cropId') {
      const cropId = Number(value);
      const selectedCrop = crops.find((crop) => crop.id === cropId);
      if (selectedCrop === undefined) {
        throw new Error(`Crop id ${cropId} is not in crop list.`);
      }

      setFormData((prevData) => ({
        ...prevData,
        cropId: value as string,
        cropName: selectedCrop.cropname,
      }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
    } else if (Number.isNaN(Number(formData.yield)) || Number(formData.yield) <= 0) {
      newErrors.yield = 'Yield must be a valid number greater than zero';
    }

    // Special validation for "Other" crop type
    if (formData.cropTypeId === 6 && !formData.cropOther) {
      newErrors.cropOther = 'Crop Description is required';
    }

    // Crude protein validation for forage crops (type 1)
    if (formData.cropTypeId === 1 && !formData.crudeProtien) {
      newErrors.crudeProtien = 'Crude Protein is required';
    } else if (
      formData.cropTypeId === 1 &&
      (Number.isNaN(Number(formData.crudeProtien)) || Number(formData.crudeProtien) <= 0)
    ) {
      newErrors.crudeProtien = 'Crude Protein must be a valid number greater than zero';
    }

    // Only validate previous crop if options are available
    if (formData.cropTypeId !== 6 && formData.cropId && !formData.prevCropId) {
      // Check if there are previous crop options for this crop
      const hasPreviousCropOptions = previousCrops.some(
        (crop) => crop.cropid === Number(formData.cropId),
      );

      if (hasPreviousCropOptions) {
        newErrors.prevCropId = 'Previous crop selection is required';
      }
    }

    // Special validation for cover crops (type 2)
    if (formData.cropTypeId === 2 && !formData.coverCropHarvested) {
      newErrors.coverCropHarvested = 'Please specify if cover crop was harvested';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Calculates nutrient requirements and removals for the selected crop
   * Updates the formData state with calculated values
   */
  const handleCalculate = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (fieldIndex !== null) {
      try {
        // Calculate crop requirements (P2O5, K2O, N)
        const cropRequirementP205 = await getCropRequirementP205(field, formData, farmRegion);
        const cropRequirementK2O = await getCropRequirementK2O(field, formData, farmRegion);
        const cropRequirementN = await getCropRequirementN(formData, farmRegion);

        // Calculate crop removals (N, P2O5, K2O)
        const cropRemovalN = await getCropRemovalN(formData, farmRegion);
        const cropRemovalP205 = await getCropRemovalP205(formData, farmRegion);
        const cropRemovalK20 = await getCropRemovalK20(formData, farmRegion);

        // Update the crops data with calculated values
        setFormData((prevData) => ({
          ...prevData,
          reqP2o5: cropRequirementP205,
          reqK2o: cropRequirementK2O,
          reqN: cropRequirementN,
          remN: cropRemovalN,
          remP2o5: cropRemovalP205,
          remK2o: cropRemovalK20,
        }));

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
              const { data } = response;
              setNcredit(data[0].nitrogencreditimperial || 0);
            }
          });
      }
    } catch (error) {
      console.error('Error getting nitrogen credit:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.prevCropId]);

  /**
   * Effect: Auto-fill yield and crude protein values when crop changes on add crop
   * Fetches yield data based on selected crop and region
   * Calculates crude protein for forage crops
   */
  useEffect(() => {
    if (formData.cropId && Number(formData.cropId) !== 0 && mode === 'Add') {
      try {
        (async () => {
          const region = await getRegion(farmRegion);
          apiCache
            .callEndpoint(`api/cropyields/${formData.cropId}/${region?.locationid}/`)
            .then((response: { status?: any; data: any }) => {
              if (response.status === 200) {
                const { data } = response;
                // TBD: selecting CropType: other, Crop: other will cause error here
                setFormData((prevData) => ({
                  ...prevData,
                  yield: data[0].amount,
                }));
              }
            });
        })();
      } catch (error) {
        console.error('Error getting crop yield:', error);
      }
      try {
        (async () => {
          const nToProteinConversionFactor = 0.625;
          const unitConversionFactor = 0.5;
          const crop = await getCrop(Number(formData.cropId));

          if (crop && crop.nitrogenrecommendationid != null) {
            const crudeProtien =
              crop.cropremovalfactornitrogen * nToProteinConversionFactor * unitConversionFactor;
            setFormData((prevData) => ({
              ...prevData,
              crudeProtien,
            }));
          }
        })();
      } catch (error) {
        console.error('Error getting crop protein data:', error);
      }
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
      title={`${mode} Crop`}
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
              name="cropTypeId"
              items={cropTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              selectedKey={formData.cropTypeId}
              onSelectionChange={(e) => {
                handleFormFieldChange('cropTypeId', e as number);
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span className={`bcds-react-aria-Select--Label ${errors?.cropId ? '--error' : ''}`}>
              Crop
            </span>
            <Select
              name="cropId"
              items={filteredCrops.map((ele) => ({ id: ele.id, label: ele.cropname }))}
              isDisabled={!filteredCrops?.length}
              selectedKey={formData.cropId}
              onSelectionChange={(e) => {
                handleFormFieldChange('cropId', e);
              }}
            />
          </Grid>
          {/* Each of these are a conditional render based on the cropTypeId of the select crop type */}
          {formData.cropTypeId !== 6 && (
            <>
              {(() => {
                const availablePreviousCrops = previousCrops.filter(
                  (crop) => crop.cropid === Number(formData.cropId),
                );

                return availablePreviousCrops.length > 0 ? (
                  <Grid size={formGridBreakpoints}>
                    <span
                      className={`bcds-react-aria-Select--Label ${errors.prevCropId ? '--error' : ''}`}
                    >
                      Previous crop ploughed down (N credit)
                    </span>
                    <Select
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
                ) : null;
              })()}
            </>
          )}
          {formData.cropTypeId === 6 && (
            <Grid size={formGridBreakpoints}>
              <span
                className={`bcds-react-aria-Select--Label ${errors.cropOther ? '--error' : ''}`}
              >
                Crop Description
              </span>
              <TextField
                type="text"
                name="cropOther"
                value={formData.cropOther || ''}
                onChange={(e) => handleFormFieldChange('cropOther', e)}
              />
            </Grid>
          )}
          <Grid size={formGridBreakpoints}>
            <span className={`bcds-react-aria-Select--Label ${errors.yield ? '--error' : ''}`}>
              Yield
            </span>
            <TextField
              type="number"
              name="yield"
              value={formData.yield?.toString() || ''}
              onChange={(e) => handleFormFieldChange('yield', e)}
            />
          </Grid>
          {formData.cropTypeId === 1 && (
            <Grid size={formGridBreakpoints}>
              <span
                className={`bcds-react-aria-Select--Label ${errors.crudeProtien ? '--error' : ''}`}
              >
                Crude Protien
              </span>
              <TextField
                type="number"
                name="crudeProtein"
                value={formData.crudeProtien?.toString() || ''}
                onChange={(e) => handleFormFieldChange('crudeProtien', e)}
              />
            </Grid>
          )}
          {formData.cropTypeId === 2 && (
            <Grid size={formGridBreakpoints}>
              <div
                style={{ marginBottom: '0.15rem' }}
                className={`bcds-react-aria-Select--Label ${errors.coverCropHarvested ? '--error' : ''}`}
              >
                Cover Crop Harvested
              </div>
              <YesNoRadioButtons
                value={booleanChecker(formData.coverCropHarvested)}
                text=""
                onChange={(b: boolean) => {
                  handleFormFieldChange('coverCropHarvested', b.toString());
                }}
                orientation="horizontal"
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Divider
              aria-hidden="true"
              component="div"
              css={{ marginTop: '1rem', marginBottom: '1rem' }}
            />
          </Grid>
          {formData.cropTypeId !== 6 && formData.cropTypeId !== 6 && (
            <Grid size={{ xs: 12 }}>
              <span css={{ fontWeight: 'bold', marginRight: '1rem' }}>N credit (lb/ac):</span>
              <span>{ncredit}</span>
            </Grid>
          )}
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
