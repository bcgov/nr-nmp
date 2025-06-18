/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab component for managing crop data for fields
 * @description Allows users to view, add, edit and delete crops associated with fields
 * Provides functionality to calculate nutrient requirements and removals
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { StyledContent } from './crops.styles';
import { NMPFileFieldData } from '@/types';
import { initFields, initRegion, saveFieldsToFile } from '../../utils/utils';
import { CALCULATE_NUTRIENTS, SOIL_TESTS } from '@/constants/RouteConstants';
import { customTableStyle, tableActionButtonCss } from '../../common.styles';
import CropsModal from './CropsModal';
import defaultNMPFileCropsData from '@/constants/DefaultNMPFileCropsData';

function Crops() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const [fields, setFields] = useState<NMPFileFieldData[]>(initFields(state));
  const farmRegion = useMemo(() => {
    // The region should be set before reaching this page and cannot be changed on this page
    const region = initRegion(state);
    if (region === undefined) throw new Error('Region is not set in NMP file.');
    return region;
  }, []);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingCropIndex, setEditingCropIndex] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<string>('Add Field');

  const handleEditCrop = (fieldIndex: number, cropIndex: number) => {
    setEditingFieldIndex(fieldIndex);
    setEditingCropIndex(cropIndex);
    setModalMode('Edit');
    setIsDialogOpen(true);
  };

  const handleDeleteCrop = (fieldIndex: number, cropIndex: number) => {
    setFields((prev) => {
      const newFieldsList = [...prev];
      newFieldsList[fieldIndex].Crops.splice(cropIndex, 1);
      return newFieldsList;
    });
  };

  const handleNext = () => {
    saveFieldsToFile(fields, state.nmpFile, setNMPFile);
    navigate(CALCULATE_NUTRIENTS);
  };

  const handlePrevious = () => {
    navigate(SOIL_TESTS);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCropIndex(0);
  };

  const createNewCrop = (index: number) => ({
    ...defaultNMPFileCropsData,
    index,
  });

  // each field can have up to 2 crops, render another add crop button after first crop inputted
  const fieldColumns: GridColDef[] = [
    { field: 'FieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
    {
      field: 'Crops1',
      headerName: 'Crop 1',
      valueGetter: (_value, row) => row?.Crops?.[0]?.cropName || '',
      width: 170,
      minWidth: 100,
      maxWidth: 300,
    },
    {
      field: 'ActionsCrop1',
      headerName: 'Actions',
      width: 150,
      renderCell: (cell) => {
        const fieldIndex = parseInt(cell?.row?.index, 10);
        const crop = fields[fieldIndex]?.Crops?.[0];

        return (
          <div>
            {crop ? (
              <>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleEditCrop(fieldIndex, 0)}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleDeleteCrop(fieldIndex, 0)}
                  icon={faTrash}
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setEditingFieldIndex(fieldIndex);
                  setEditingCropIndex(0);
                  setModalMode('Add');
                  setIsDialogOpen(true);
                }}
              >
                Add Crop
              </Button>
            )}
          </div>
        );
      },
      sortable: false,
      resizable: false,
    },
    {
      field: 'Crops2',
      headerName: 'Crop 2',
      valueGetter: (_value, row) => row?.Crops?.[1]?.cropName || '',
      width: 170,
      minWidth: 100,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: 'ActionsCrop2',
      headerName: 'Actions',
      width: 200,
      renderCell: (cell) => {
        const fieldIndex = parseInt(cell?.row?.index, 10);
        const rowHasCrop = !!fields[fieldIndex]?.Crops?.[0];
        const crop = fields[fieldIndex]?.Crops[1];

        if (!rowHasCrop) return null;

        return (
          <div>
            {crop ? (
              <>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleEditCrop(fieldIndex, 1)}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleDeleteCrop(fieldIndex, 1)}
                  icon={faTrash}
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setEditingFieldIndex(fieldIndex);
                  setEditingCropIndex(1);
                  setModalMode('Add');
                  setIsDialogOpen(true);
                }}
              >
                Add Another Crop
              </Button>
            )}
          </div>
        );
      },
      sortable: false,
      resizable: false,
    },
  ];

  return (
    <StyledContent>
      <ProgressStepper step={SOIL_TESTS} />
      <AppTitle />
      <PageTitle title="Field Information" />
      <TabsMaterial
        activeTab={2}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      {editingFieldIndex !== null && isDialogOpen && (
        <CropsModal
          mode={modalMode}
          farmRegion={farmRegion}
          field={fields[editingFieldIndex]}
          fieldIndex={editingFieldIndex}
          setFields={setFields}
          initialModalData={
            modalMode === 'Add'
              ? createNewCrop(editingCropIndex)
              : fields[editingFieldIndex].Crops[editingCropIndex]
          }
          // initialModalData={fields[editingFieldIndex].Crops[editingCropIndex]}
          onClose={handleDialogClose}
          isOpen={isDialogOpen}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fields}
        columns={fieldColumns}
        getRowId={(row: any) => row.index}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />

      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onClick={handlePrevious}
        >
          BACK
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onClick={handleNext}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}

export default Crops;
