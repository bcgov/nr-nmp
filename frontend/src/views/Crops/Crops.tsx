/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab component for managing crop data for fields
 * @description Allows users to view, add, edit and delete crops associated with fields
 * Provides functionality to calculate nutrient requirements and removals
 */
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button as ButtonGov,
  ButtonGroup as ButtonGovGroup,
  Dialog,
  Modal as ModalGov,
  TextField,
  Select,
} from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppService from '@/services/app/useAppService';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
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
import { StyledContent } from './crops.styles';
import {
  CropTypesDatabase,
  NMPFileCropData,
  NMPFileFieldData,
  CropsDatabase,
  PreviousCropsDatabase,
} from '@/types';
import defaultNMPFileCropsData from '@/constants/DefaultNMPFileCropsData';
import { APICacheContext } from '@/context/APICacheContext';
import { initFields, saveFieldsToFile } from '../../utils/utils';
import { MANURE_IMPORTS, SOIL_TESTS } from '@/constants/RouteConstants';
import {
  customTableStyle,
  formCss,
  formGridBreakpoints,
  modalDividerStyle,
  modalHeaderStyle,
  tableActionButtonCss,
  // tableActionButtonCss,
} from '../../common.styles';

/**
 * Crops component for managing crop data associated with fields
 *
 * @param {FieldListProps} props - Component props containing fields array and setFields function
 * @returns {JSX.Element} Rendered Crops component
 */
function Crops() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  /**
   * State Variables:
   * - ncredit: Nitrogen credit value from previous crop
   * - isModalVisible: Controls the visibility of the edit modal
   * - currentFieldIndex: Tracks which field is being edited
   * - combinedCropsData: Current crop data being edited
   * - filteredCrops: List of crops filtered by selected crop type
   * - cropTypesDatabase: All crop types from database
   * - cropsDatabase: All crops from database
   * - previousCropDatabase: All previous crop types from database
   * - calculationsPerformed: Tracks if nutrient calculations have been performed
   * - errors: Form validation errors
   * - fields: Array of field data
   */
  const [ncredit, setNcredit] = useState<number>(0);
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [combinedCropsData, setCombinedCropsData] =
    useState<NMPFileCropData>(defaultNMPFileCropsData);
  const [filteredCrops, setFilteredCrops] = useState<{ id: number; label: string }[]>([]);
  const [cropTypesDatabase, setCropTypesDatabase] = useState<any>([]);
  // const [cropTypesDatabaseTemp, setCropTypesDatabaseTemp] = useState<Array<any>>([]);

  const [cropsDatabase, setCropsDatabase] = useState<CropsDatabase[]>([]);
  const [previousCropDatabase, setPreviousCropDatabase] = useState<PreviousCropsDatabase[]>([]);
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // TBD, todo Temp init state for dev work, to be removed
  const [fields, setFields] = useState<NMPFileFieldData[]>(
    initFields(state).map((fieldElement: NMPFileFieldData, index: number) => ({
      ...fieldElement,
      id: index.toString(),
    })),
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  /**
   * Handles changes to form inputs
   *
   * @param {Object} e - Event object containing name and value of changed field
   * @param {string} e.target.name - Name of the input field
   * @param {any} e.target.value - New value of the input field
   */
  // const handleChange = (e: { target: { name: any; value: any } }) => {
  //   const { name, value } = e.target;
  //   setCombinedCropsData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));

  //   // Clear the error for the field being changed
  //   if (errors[name]) {
  //     setErrors((prev) => ({ ...prev, [name]: '' }));
  //   }

  //   // Handle special case for cropTypeId - filter available crops based on type
  //   if (name === 'cropTypeId') {
  //     const selectedCropType = cropsDatabase.filter(
  //       (type) => type.croptypeid === parseInt(value, 10),
  //     );
  //     setFilteredCrops(selectedCropType.map((crop) => ({ id: crop.id, label: crop.cropname })));
  //   }

  //   // Handle special case for cropId - set the crop name for display
  //   if (name === 'cropId') {
  //     const selectedCrop = cropsDatabase.find((crop) => crop.id === parseInt(value, 10));
  //     setCombinedCropsData((prevData) => ({
  //       ...prevData,
  //       cropName: selectedCrop?.cropname,
  //     }));
  //   }
  // };

  const handleFormFieldChange = (field: string, value: string | number) => {
    // setFormData((prev) => ({ ...prev, [field]: value }));

    setCombinedCropsData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Clear the error for the field being changed
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Handle special case for cropTypeId - filter available crops based on type
    if (field === 'cropTypeId') {
      const selectedCropType = cropsDatabase.filter(
        (type) => type.croptypeid === parseInt(value, 10),
      );
      setFilteredCrops(selectedCropType.map((crop) => ({ id: crop.id, label: crop.cropname })));
    }

    // Handle special case for cropId - set the crop name for display
    if (field === 'cropId') {
      const selectedCrop = cropsDatabase.find((crop) => crop.id === parseInt(value, 10));

      setCombinedCropsData((prevData) => ({
        ...prevData,
        cropName: selectedCrop?.cropname,
      }));
    }
  };

  /**
   * Opens the edit modal for a specific field
   *
   * @param {number} fieldIndex - Index of the field to edit in the fields array
   */
  const handleEditCrop = (fieldIndex: number) => {
    setCurrentFieldIndex(fieldIndex);
    setCombinedCropsData(fields[fieldIndex].Crops[0] || combinedCropsData);
    setCalculationsPerformed(false);
    setErrors({}); // Clear errors when modal is opened
  };

  // const handleEditCropTemp = (fieldIndex: number) => {
  //   setCurrentFieldIndex(fieldIndex);

  //   setCombinedCropsData(fields[fieldIndex].Crops[0] || combinedCropsData);
  //   setCalculationsPerformed(false);
  // };

  /**
   * Deletes crop data for a specific field
   *
   * @param {number} fieldIndex - Index of the field whose crop to delete
   */
  const handleDeleteCrop = (fieldIndex: number) => {
    setFields((prev) => {
      const newFieldsList = [...prev];
      newFieldsList[fieldIndex].Crops = [];
      return newFieldsList;
    });
  };

  /**
   * Validates the crop form data
   *
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!combinedCropsData.cropTypeId) {
      newErrors.cropTypeId = 'Crop Type is required';
    }

    if (!combinedCropsData.cropId) {
      newErrors.cropId = 'Crop is required';
    }

    // Yield validation - required and must be positive number
    if (!combinedCropsData.yield) {
      newErrors.yield = 'Yield is required';
    } else if (
      Number.isNaN(Number(combinedCropsData.yield)) ||
      Number(combinedCropsData.yield) <= 0
    ) {
      newErrors.yield = 'Yield must be a valid number greater than zero';
    }

    // Special validation for "Other" crop type
    if (combinedCropsData.cropTypeId == 6 && !combinedCropsData.cropOther) {
      newErrors.cropOther = 'Crop Description is required';
    }

    // Crude protein validation for forage crops (type 1)
    if (combinedCropsData.cropTypeId == 1 && !combinedCropsData.crudeProtien) {
      newErrors.crudeProtien = 'Crude Protein is required';
    } else if (
      combinedCropsData.cropTypeId == 1 &&
      (Number.isNaN(Number(combinedCropsData.crudeProtien)) ||
        Number(combinedCropsData.crudeProtien) <= 0)
    ) {
      newErrors.crudeProtien = 'Crude Protein must be a valid number greater than zero';
    }

    // Only validate previous crop if options are available
    if (
      combinedCropsData.cropTypeId != 6 &&
      combinedCropsData.cropId &&
      !combinedCropsData.prevCropId
    ) {
      // Check if there are previous crop options for this crop
      const hasPreviousCropOptions = previousCropDatabase.some(
        (crop) => crop.cropid === Number(combinedCropsData.cropId),
      );

      if (hasPreviousCropOptions) {
        newErrors.prevCropId = 'Previous crop selection is required';
      }
    }

    // Special validation for cover crops (type 2)
    if (combinedCropsData.cropTypeId == 2 && !combinedCropsData.coverCropHarvested) {
      newErrors.coverCropHarvested = 'Please specify if cover crop was harvested';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Calculates nutrient requirements and removals for the selected crop
   * Updates the combinedCropsData state with calculated values
   */
  const handleCalculate = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (currentFieldIndex !== null) {
      try {
        // Calculate crop requirements (P2O5, K2O, N)
        const cropRequirementP205 = await getCropRequirementP205(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRequirementK2O = await getCropRequirementK2O(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRequirementN = await getCropRequirementN(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        // Calculate crop removals (N, P2O5, K2O)
        const cropRemovalN = await getCropRemovalN(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRemovalP205 = await getCropRemovalP205(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRemovalK20 = await getCropRemovalK20(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        // Update the crops data with calculated values
        setCombinedCropsData((prevData) => ({
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
   * Submits the crop data to update the field
   * Only called after calculations have been performed
   */
  const handleSubmit = () => {
    if (currentFieldIndex !== null) {
      setFields((prevFields) => {
        const newFields = prevFields.map((field, index) => {
          if (index === currentFieldIndex) {
            return { ...field, Crops: [combinedCropsData] };
          }
          return field;
        });

        return newFields;
      });

      setIsDialogOpen(false);
      // setFields(updatedFields);
      // setIsModalVisible(false);
      setCalculationsPerformed(false);
      setErrors({}); // Clear all errors
    }
  };

  const handleNext = () => {
    saveFieldsToFile(fields, state.nmpFile, setNMPFile);
    navigate(MANURE_IMPORTS);
  };

  const handlePrevious = () => {
    navigate(SOIL_TESTS);
  };

  /**
   * Effect: Load initial data from API
   * Fetches crop types, crops, and previous crop types on component mount
   */
  useEffect(() => {
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCropTypesDatabase(data.map((ele: CropTypesDatabase) => ({ ...ele, label: ele.name })));
      }
    });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCropsDatabase(data.map((ele: CropsDatabase) => ({ ...ele, label: ele.cropname })));
      }
    });
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setPreviousCropDatabase(
            data.map((ele: PreviousCropsDatabase) => ({ ...ele, label: ele.name })),
          );
        }
      });
  }, []);

  /**
   * Effect: Update nitrogen credit when previous crop changes
   * Fetches nitrogen credit value for the selected previous crop
   */
  useEffect(() => {
    try {
      if (combinedCropsData.prevCropId && combinedCropsData.prevCropId != 0) {
        apiCache
          .callEndpoint(`api/previouscroptypes/${combinedCropsData.prevCropId}/`)
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
  }, [combinedCropsData.prevCropId]);

  /**
   * Effect: Auto-fill yield and crude protein values when crop changes
   * Fetches yield data based on selected crop and region
   * Calculates crude protein for forage crops
   */
  useEffect(() => {
    if (combinedCropsData.cropId && Number(combinedCropsData.cropId) !== 0) {
      try {
        (async () => {
          const region = await getRegion(JSON.parse(state.nmpFile).farmDetails.FarmRegion);
          apiCache
            .callEndpoint(`api/cropyields/${combinedCropsData.cropId}/${region?.locationid}/`)
            .then((response: { status?: any; data: any }) => {
              if (response.status === 200) {
                const { data } = response;
                // TBD: selecting CropType: other, Crop: other will cause error here
                setCombinedCropsData((prevData) => ({
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
          const crop = await getCrop(Number(combinedCropsData.cropId));

          if (crop && crop.nitrogenrecommendationid != null) {
            const crudeProtien =
              crop.cropremovalfactornitrogen * nToProteinConversionFactor * unitConversionFactor;
            setCombinedCropsData((prevData) => ({
              ...prevData,
              crudeProtien,
            }));
          }
        })();
      } catch (error) {
        console.error('Error getting crop protein data:', error);
      }
    }
  }, [combinedCropsData.cropId]);

  useEffect(() => {
    setProgressStep(3);
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setErrors({});
  };

  const fieldColumns: GridColDef[] = [
    { field: 'FieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
    {
      field: 'Crops',
      headerName: 'Crops',
      valueGetter: (_value, row) => row?.Crops[0]?.cropName,
      width: 150,
      minWidth: 150,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: 'cropTypeName',
      headerName: 'Crop Type',
      valueGetter: (_value, row) => row?.Crops[0]?.cropTypeName,
      width: 120,
      minWidth: 100,
      maxWidth: 300,
    },
    {
      field: '',
      headerName: 'Actions',
      width: 150,
      renderCell: (cell: any) => {
        const isRowHasSoilTest = Object.keys(fields[cell?.row?.id]?.Crops)?.length;

        const handleEditRowBtnClick = () => {
          handleEditCrop(parseInt(cell?.row?.id, 10));
          setIsDialogOpen(true);
        };
        const handleDeleteRowBtnClick = () => {
          handleDeleteCrop(parseInt(cell?.row?.id, 10));
        };
        return (
          <div>
            {isRowHasSoilTest ? (
              <div>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={handleEditRowBtnClick}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={handleDeleteRowBtnClick}
                  icon={faTrash}
                />
              </div>
            ) : (
              <ButtonGov
                variant="primary"
                size="small"
                onPress={handleEditRowBtnClick}
              >
                Add crop
              </ButtonGov>
            )}
          </div>
        );
      },
      sortable: false,
      resizable: false,
    },
  ];

  const requireAndRemoveColumns: GridColDef[] = useMemo(
    () => [
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
    ],
    [],
  );

  // const requirementRows = [{ id: 0, reqN: 9, reqP2o5: 9, reqK2o: 9 }];
  const requirementRows = useMemo(() => {
    const { reqN, reqP2o5, reqK2o } = combinedCropsData;
    return [{ id: Math.random(), reqN, reqP2o5, reqK2o }];
  }, [fields, combinedCropsData]);

  const removeRows = useMemo(() => {
    const { remN, remP2o5, remK2o } = combinedCropsData;
    return [{ id: Math.random(), reqN: remN, reqP2o5: remP2o5, reqK2o: remK2o }];
  }, [fields, combinedCropsData]);

  return (
    <StyledContent>
      <ProgressStepper step={SOIL_TESTS} />
      <AppTitle />
      <PageTitle title="Field Information" />
      <TabsMaterial
        activeTab={2}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      <ModalGov
        isDismissable
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      >
        <Dialog
          isCloseable
          role="dialog"
        >
          <div style={{ padding: '1rem' }}>
            <span css={modalHeaderStyle}>Edit Crop</span>
            <Divider
              aria-hidden="true"
              component="div"
              css={modalDividerStyle}
            />
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
                    items={cropTypesDatabase}
                    selectedKey={combinedCropsData?.cropTypeId}
                    onSelectionChange={(e) => {
                      handleFormFieldChange('cropTypeId', e as number);
                    }}
                  />
                </Grid>
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${errors?.cropId ? '--error' : ''}`}
                  >
                    Crop
                  </span>
                  <Select
                    name="cropId"
                    key={combinedCropsData?.cropId}
                    items={filteredCrops}
                    isDisabled={!filteredCrops?.length}
                    selectedKey={combinedCropsData?.cropId}
                    onSelectionChange={(e) => {
                      handleFormFieldChange('cropId', e);
                    }}
                  />
                </Grid>
                {/* Each of these are a conditional render based on the cropTypeId of the select crop type */}
                {combinedCropsData.cropTypeId != 6 && (
                  <>
                    {(() => {
                      const availablePreviousCrops = previousCropDatabase.filter(
                        (crop) => crop.cropid === Number(combinedCropsData.cropId),
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
                            items={filteredCrops}
                            // selectedKey={combinedCropsData?.cropName}
                            onSelectionChange={(e) => {
                              handleFormFieldChange('prevCropId', e);
                            }}
                          />
                        </Grid>
                      ) : null;
                    })()}
                  </>
                )}
                {combinedCropsData.cropTypeId == 6 && (
                  <Grid size={formGridBreakpoints}>
                    <span
                      className={`bcds-react-aria-Select--Label ${errors.cropOther ? '--error' : ''}`}
                    >
                      Crop Description
                    </span>
                    <TextField
                      type="text"
                      name="cropOther"
                      value={combinedCropsData.cropOther || ''}
                      onChange={(e) => handleFormFieldChange('cropOther', e)}
                    />
                  </Grid>
                )}
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${errors.yield ? '--error' : ''}`}
                  >
                    Yield
                  </span>
                  <TextField
                    type="number"
                    name="yield"
                    value={combinedCropsData.yield?.toString() || ''}
                    onChange={(e) => handleFormFieldChange('yield', e)}
                  />
                </Grid>
                {combinedCropsData.cropTypeId == 1 && (
                  <Grid size={formGridBreakpoints}>
                    <span
                      className={`bcds-react-aria-Select--Label ${errors.crudeProtien ? '--error' : ''}`}
                    >
                      Crude Protein
                    </span>
                    <TextField
                      type="number"
                      name="crudeProtien"
                      value={combinedCropsData.crudeProtien?.toString() || ''}
                      onChange={(e) => handleFormFieldChange('crudeProtien', e)}
                    />
                  </Grid>
                )}
                {combinedCropsData.cropTypeId == 2 && (
                  <Grid size={formGridBreakpoints}>
                    <YesNoRadioButtons
                      value={!!combinedCropsData?.coverCropHarvested}
                      text="Cover Crop Harvested"
                      onChange={(b) => {
                        handleFormFieldChange('coverCropHarvested', b as any);
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
                {combinedCropsData.cropTypeId != 6 && combinedCropsData.cropTypeId != 6 && (
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
                          // rows={combinedCropsData}
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
              <ButtonGovGroup
                alignment="end"
                orientation="horizontal"
              >
                <ButtonGov
                  variant="secondary"
                  onPress={handleDialogClose}
                >
                  Cancel
                </ButtonGov>
                <ButtonGov
                  variant="primary"
                  onPress={handleCalculate}
                >
                  Calculate
                </ButtonGov>
                <ButtonGov
                  variant="primary"
                  onPress={handleSubmit}
                  isDisabled={!calculationsPerformed}
                >
                  Submit
                </ButtonGov>
              </ButtonGovGroup>
            </div>
          </div>
        </Dialog>
      </ModalGov>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fields}
        columns={fieldColumns}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />

      <ButtonGovGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <ButtonGov
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePrevious}
        >
          BACK
        </ButtonGov>
        <ButtonGov
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={handleNext}
          type="submit"
        >
          Next
        </ButtonGov>
      </ButtonGovGroup>
    </StyledContent>
  );
}

export default Crops;
