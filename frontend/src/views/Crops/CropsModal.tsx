/* eslint-disable no-case-declarations */
import React, { useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';
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
import { CropType, Crop, PreviousCrop, NMPFileCrop, NMPFileField, SelectOption } from '@/types';
import {
  postprocessModalData,
  calculateCropRequirementsUsingCache,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '../../common.styles';
import { ModalProps } from '@/components/common/Modal/Modal';
import {
  DEFAULT_NMPFILE_CROPS,
  HarvestUnit,
  CROP_TYPE_OTHER_ID,
  CROP_OTHER_ID,
  CROP_BLUEBERRIES_ID,
  CROP_TYPE_BERRIES_ID,
} from '@/constants';
import { HARVEST_UNIT_OPTIONS } from '../../constants/harvestUnits';
import useAppState from '@/hooks/useAppState';
import { cropsModalReducer, showUnitDropdown } from './utils';

type BerryQuantity = { id: number; plantsperacre: number; distancebetweenplants: string };

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
    renderHeader: () => (
      <strong>
        <span>P₂O₅</span>
      </strong>
    ),
    width: 75,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
    flex: 1,
  },
  {
    field: 'reqK2o',
    renderHeader: () => (
      <strong>
        <span>K₂O</span>
      </strong>
    ),
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
function preprocessModalData(data: NMPFileCrop): NMPFileCrop {
  return {
    ...data,
    reqN: Math.abs(data.reqN),
    reqP2o5: Math.abs(data.reqP2o5),
    reqK2o: Math.abs(data.reqK2o),
    remN: Math.abs(data.remN),
    remP2o5: Math.abs(data.remP2o5),
    remK2o: Math.abs(data.remK2o),
    // Preserve the calculated N value if it exists (and make it positive)
    calculatedN: data.calculatedN !== undefined ? Math.abs(data.calculatedN) : undefined,
  };
}

type CropsModalProps = {
  field: NMPFileField;
  fieldIndex: number;
  cropIndex?: number;
  initialModalData?: NMPFileCrop;
  setFields: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
  onClose: () => void;
};

function CropsModal({
  field,
  fieldIndex,
  cropIndex,
  initialModalData,
  setFields,
  onClose,
  ...props
}: CropsModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { nmpFile } = useAppState().state;
  const apiCache = useContext(APICacheContext);

  const [
    { formData, selectedCropType, selectedCrop, isFormYieldEqualToDefault, calculatedReqN },
    dispatch,
  ] = useReducer(cropsModalReducer, {
    formData: initialModalData ? preprocessModalData(initialModalData) : DEFAULT_NMPFILE_CROPS,
    selectedCropType: undefined,
    selectedCrop: undefined,
    defaultYieldInTons: undefined,
    // If the N value was adjusted, use the stored calculated value for the refresh button
    calculatedReqN:
      initialModalData &&
      initialModalData.reqNAdjusted &&
      initialModalData.calculatedN !== undefined
        ? Math.abs(initialModalData.calculatedN) // Ensure it's positive
        : undefined,
    isFormYieldEqualToDefault: true,
  });
  const crops: Crop[] = apiCache.getInitializedResponse('crops').data;

  // These 4 are related to berries and are stored in the DB in the SelectOption format
  const [plantAges, setPlantAges] = useState<SelectOption<undefined>[]>([]);
  const [berryQuantities, setBerryQuantities] = useState<BerryQuantity[]>([]);
  const [whereWillPruningsGo, setWhereWillPruningsGo] = useState<SelectOption<undefined>[]>([]);

  const filteredCrops = useMemo<Crop[]>(() => {
    if (formData.cropTypeId === 0) return [];
    return crops.filter((type) => type.croptypeid === formData.cropTypeId);
  }, [crops, formData.cropTypeId]);
  const cropTypes: CropType[] = apiCache.getInitializedResponse('croptypes').data;
  const [previousCrops, setPreviousCrops] = useState<PreviousCrop[]>([]);
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);

  const berryPlantsPerAcreOptions = useMemo(
    () =>
      berryQuantities.map((ele) => ({
        id: ele.id,
        label: ele.plantsperacre?.toString(),
      })),
    [berryQuantities],
  );

  const berryDistBtwPlantsOptions = useMemo(
    () =>
      berryQuantities.map((ele) => ({
        id: ele.id,
        label: ele.distancebetweenplants,
      })),
    [berryQuantities],
  );

  // Only called after calculations have been performed
  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prevField, index) => {
        if (index === fieldIndex) {
          // Check if we're editing an existing crop or adding a new crop
          let updatedCrops;
          if (cropIndex !== undefined) {
            updatedCrops = [...prevField.crops];
            updatedCrops[cropIndex] = postprocessModalData(formData, calculatedReqN);
          } else {
            updatedCrops = [...prevField.crops, postprocessModalData(formData, calculatedReqN)];
          }
          return { ...prevField, crops: updatedCrops };
        }
        return prevField;
      });
      return newFields;
    });

    onClose();
  };

  // When crop is Other calculate button is disabled
  // To enable submit button setCalculationsPerformed to true for Other
  // Also set calculations performed to true if N has been adjusted before
  // OR if we're editing an existing crop (since calculations were already done)
  useEffect(() => {
    if (
      selectedCropType?.id === CROP_TYPE_OTHER_ID ||
      (initialModalData?.reqNAdjusted && selectedCropType?.modifynitrogen) ||
      cropIndex !== undefined // Editing existing crop
    ) {
      setCalculationsPerformed(true);
    } else {
      setCalculationsPerformed(false);
    }
  }, [selectedCropType, initialModalData, cropIndex]);

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
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: PreviousCrop[] }) => {
        if (response.status === 200) {
          setPreviousCrops(response.data);
        }
      });
    apiCache.callEndpoint('api/plantage/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setPlantAges(response.data);
      }
    });
    apiCache.callEndpoint('api/berryQuantities/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setBerryQuantities(response.data);
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

  const handleFormFieldChange = useCallback(
    (attr: keyof NMPFileCrop, value: string | number | boolean) => {
      // Reset calculation button, except when editing reqN or reqNAdjusted for Field vegetables after calculations
      // OR when we're editing an existing crop (since calculations were already done)
      const isEditingFieldVegN =
        (attr === 'reqN' || attr === 'reqNAdjusted') &&
        selectedCropType?.modifynitrogen &&
        calculationsPerformed;

      const isEditingExistingCrop = cropIndex !== undefined;

      if (formData.cropId !== CROP_OTHER_ID && !isEditingFieldVegN && !isEditingExistingCrop) {
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
        case 'numberOfPlantsPerAcre':
        case 'distanceBtwnPlantsRows':
          if (typeof value === 'number') {
            dispatch({
              type: 'SET_FORM_DATA_ATTR',
              attr: 'numberOfPlantsPerAcre',
              value: berryQuantities[value - 1].plantsperacre,
            });
            dispatch({
              type: 'SET_FORM_DATA_ATTR',
              attr: 'distanceBtwnPlantsRows',
              value: berryQuantities[value - 1].distancebetweenplants,
            });
          }
          return;
        default:
          dispatch({ type: 'SET_FORM_DATA_ATTR', attr, value });
      }
    },
    [
      berryQuantities,
      selectedCropType,
      formData.cropId,
      cropTypes,
      crops,
      whereWillPruningsGo,
      calculationsPerformed,
      dispatch,
      cropIndex,
    ],
  );

  /**
   * Calculates nutrient requirements and removals for the selected crop
   * Updates the formData state with calculated values
   */
  const handleCalculate = useCallback(() => {
    const dispatchResult = calculateCropRequirementsUsingCache(
      nmpFile.farmDetails.farmRegion,
      field,
      formData,
      apiCache,
    );
    // Update the crops data with calculated values
    dispatch({
      type: 'SET_CALCULATED_VALUES',
      reqN: dispatchResult.cropRequirementN,
      reqP2o5: dispatchResult.cropRequirementP205,
      reqK2o: dispatchResult.cropRequirementK2O,
      remN: dispatchResult.cropRemovalN,
      remP2o5: dispatchResult.cropRemovalP205,
      remK2o: dispatchResult.cropRemovalK20,
    });

    // Mark calculations as performed
    setCalculationsPerformed(true);
  }, [apiCache, formData, field, nmpFile.farmDetails.farmRegion]);

  useEffect(() => {
    if (cropIndex !== undefined && selectedCrop !== undefined && selectedCropType !== undefined) {
      // Only auto-calculate if we don't already have a calculatedReqN value
      if (calculatedReqN === undefined) {
        handleCalculate();
      }
    }
  }, [cropIndex, selectedCrop, selectedCropType, calculatedReqN, handleCalculate]);

  // Effect: Update nitrogen credit when previous crop changes
  useEffect(() => {
    if (previousCrops.length > 0 && formData.prevCropId) {
      const previousCrop = previousCrops.find((c) => c.id === formData.prevCropId);
      if (previousCrop === undefined) {
        throw new Error(`Previous crop ${formData.prevCropId} not found`);
      }
      dispatch({
        type: 'SET_FORM_DATA_ATTR',
        attr: 'nCredit',
        value: previousCrop.nitrogencreditimperial,
      });
    }
  }, [formData.prevCropId, previousCrops]);

  /**
   * Effect: Auto-fill yield when crop changes on add crop
   * Fetches default yield based on selected crop and region
   */
  useEffect(() => {
    if (formData.cropId !== 0 && formData.cropId !== CROP_OTHER_ID && selectedCrop !== undefined) {
      apiCache
        .callEndpoint(`api/cropyields/${formData.cropId}/${nmpFile.farmDetails.regionLocationId}/`)
        .then((response) => {
          if (response.status === 200) {
            const { data } = response;
            let amount;
            if ((data as { amount: number }[]).length === 0) {
              console.error(
                `No yield data for ${formData.cropId} and location id ${nmpFile.farmDetails.regionLocationId}`,
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

  // Check if N can be edited (Field vegetables with modifynitrogen = true AND calculations have been performed)
  // For editing existing crops, allow editing if modifynitrogen is true (since calculations were already done)
  const isNEditable =
    selectedCropType?.modifynitrogen && (calculationsPerformed || cropIndex !== undefined);

  // Dynamic columns for requirement table - make N editable for Field vegetables
  const requirementColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'reqN',
        headerName: 'N',
        width: 100,
        minWidth: 100,
        maxWidth: 200,
        sortable: false,
        resizable: false,
        flex: 1,
        ...(isNEditable && {
          renderCell: (params) => (
            <NumberField
              value={params.value}
              onChange={(newValue) => {
                handleFormFieldChange('reqN', newValue);
                handleFormFieldChange('reqNAdjusted', true);
              }}
              iconRight={
                formData.reqNAdjusted && calculatedReqN !== undefined ? (
                  <button
                    type="button"
                    title="Reset to calculated value"
                    css={{
                      backgroundColor: '#ffa500',
                      padding: '0px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '6px',
                      marginRight: '-6px',
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'absolute',
                      right: '7px',
                    }}
                    onClick={() => {
                      dispatch({
                        type: 'SET_FORM_DATA_ATTR',
                        attr: 'reqN',
                        value: calculatedReqN,
                      });
                      dispatch({
                        type: 'SET_FORM_DATA_ATTR',
                        attr: 'reqNAdjusted',
                        value: false,
                      });
                    }}
                  >
                    <LoopIcon style={{ fontSize: '12px', margin: '0', padding: '0' }} />
                  </button>
                ) : undefined
              }
              css={{
                position: 'relative',
                '& .MuiOutlinedInput-root': {
                  border: '2px solid #1976d2',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '18px' /* Make room for the button */,
                },
                '& .MuiOutlinedInput-input': {
                  padding: '4px 6px',
                  textAlign: 'center',
                  flexGrow: 1,
                  width: '100%',
                },
                '& .MuiInputAdornment-root': {
                  margin: '0',
                  height: '100%',
                  position: 'absolute',
                  right: '0',
                },
              }}
            />
          ),
        }),
      },
      {
        field: 'reqP2o5',
        renderHeader: () => (
          <strong>
            <span>P₂O₅</span>
          </strong>
        ),
        width: 75,
        minWidth: 75,
        maxWidth: 200,
        sortable: false,
        resizable: false,
        flex: 1,
      },
      {
        field: 'reqK2o',
        renderHeader: () => (
          <strong>
            <span>K₂O</span>
          </strong>
        ),
        width: 75,
        minWidth: 75,
        maxWidth: 200,
        sortable: false,
        resizable: false,
        flex: 1,
      },
    ],
    [isNEditable, handleFormFieldChange, formData.reqNAdjusted, calculatedReqN, dispatch],
  );

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
                    onChange={(e) => {
                      handleFormFieldChange('crudeProtein', e);
                      // Technically, this should only be set true if it
                      // doesn't equal the default, but I don't feel like
                      // saving the default
                      if (e !== formData.crudeProtein) {
                        handleFormFieldChange('crudeProteinAdjusted', true);
                      }
                    }}
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
                      items={berryPlantsPerAcreOptions}
                      selectedKey={
                        berryQuantities.find(
                          (ele) => ele.plantsperacre === formData.numberOfPlantsPerAcre,
                        )?.id || 0
                      }
                      onSelectionChange={(e) =>
                        handleFormFieldChange('numberOfPlantsPerAcre', e as number)
                      }
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Distance between plants, distance between rows (inches)"
                      items={berryDistBtwPlantsOptions}
                      selectedKey={
                        berryQuantities.find(
                          (ele) => ele.distancebetweenplants === formData.distanceBtwnPlantsRows,
                        )?.id || 0
                      }
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
                  {formData.hasLeafTest && (
                    <Grid
                      container
                      spacing={1}
                      size={12}
                    >
                      <Grid size={6}>
                        <NumberField
                          isRequired={formData.hasLeafTest}
                          label="Leaf Tissue P (%)"
                          value={formData.leafTissueP}
                          onChange={(e) => handleFormFieldChange('leafTissueP', e)}
                          maxValue={100}
                        />
                      </Grid>
                      <Grid size={6}>
                        <NumberField
                          isRequired={formData.hasLeafTest}
                          label="Leaf Tissue K (%)"
                          value={formData.leafTissueK}
                          onChange={(e) => handleFormFieldChange('leafTissueK', e)}
                          maxValue={100}
                        />
                      </Grid>
                    </Grid>
                  )}
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
              {!selectedCropType?.customcrop && (
                <>
                  {(() => {
                    const availablePreviousCrops = previousCrops.filter(
                      (crop) => crop.previouscropcode === selectedCrop?.previouscropcode,
                    );

                    // There is always a "no credit" option, so if the array
                    // is only 1 long, this is the only option
                    return availablePreviousCrops.length > 1 ? (
                      <Grid
                        container
                        spacing={1}
                        size={12}
                      >
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
                      </Grid>
                    ) : null;
                  })()}
                </>
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
                        {/* TODO: record whether the crop N has been altered for a report footnote */}
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
                          label="P₂O₅ (%)"
                          value={formData.reqP2o5}
                          onChange={(v) => handleFormFieldChange('reqP2o5', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label="K₂O (%)"
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
                          label="P₂O₅ (%)"
                          value={formData.remP2o5}
                          onChange={(v) => handleFormFieldChange('remP2o5', v)}
                        />
                      </Grid>
                      <Grid size="grow">
                        <NumberField
                          isRequired
                          shortenRequired
                          label="K₂O (%)"
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
                        columns={isNEditable ? requirementColumns : requireAndRemoveColumns}
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
