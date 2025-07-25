/* eslint-disable eqeqeq */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Button as ButtonGov,
  ButtonGroup as ButtonGovGroup,
  ButtonGroup,
} from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { StyledContent } from './storage.styles';
import { NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '../../constants/routes';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, tableActionButtonCss } from '../../common.styles';
import StorageModal from './StorageModal';
import useAppState from '@/hooks/useAppState';
import { ManureInSystem, ManureType } from '@/types';
import { StorageModalMode } from './types';

export default function Storage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [modalMode, setModalMode] = useState<StorageModalMode | undefined>(undefined);

  const generatedManures = state.nmpFile.years[0].GeneratedManures;
  const importedManures = state.nmpFile.years[0].ImportedManures;
  const unassignedManures = useMemo(() => {
    const unassignedM: ManureInSystem[] = [];
    (generatedManures || []).forEach((manure) => {
      if (!manure.AssignedToStoredSystem) {
        unassignedM.push({ type: 'Generated', data: manure });
      }
    });
    (importedManures || []).forEach((manure) => {
      if (!manure.AssignedToStoredSystem) {
        unassignedM.push({ type: 'Imported', data: manure });
      }
    });
    return unassignedM;
  }, [generatedManures, importedManures]);

  // These function don't save to the NMP file
  // Because changes are already saved to the NMP file
  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };
  const handleNext = () => {
    navigate(NUTRIENT_ANALYSIS);
  };

  const handleDialogClose = () => {
    setModalMode(undefined);
  };

  const handleDeleteSystem = useCallback(
    (index: number) => {
      const newList = [...state.nmpFile.years[0].ManureStorageSystems!];
      newList.splice(index, 1);
      dispatch({
        type: 'SAVE_MANURE_STORAGE_SYSTEMS',
        year: state.nmpFile.farmDetails.Year!,
        newManureStorageSystems: newList,
      });
    },
    [state.nmpFile, dispatch],
  );

  const handleDeleteStorage = useCallback((systemIndex: number, storageIndex: number) => {
    const newList = [...state.nmpFile.years[0].ManureStorageSystems!];
    const system = newList[systemIndex];
    if (system.manureType !== ManureType.Liquid) throw new Error('Storage entered bad state');
    const newStorageList = [...system.manureStorages];
    newStorageList.splice(storageIndex, 1);
    newList[systemIndex] = { ...system, manureStorages: newStorageList };
    dispatch({
      type: 'SAVE_MANURE_STORAGE_SYSTEMS',
      year: state.nmpFile.farmDetails.Year!,
      newManureStorageSystems: newList,
    });
  }, [state.nmpFile, dispatch]);

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Storage" />
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGovGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <ButtonGov
              size="medium"
              aria-label="Add Storage System"
              onPress={() => setModalMode({ mode: 'create' })}
              variant="secondary"
            >
              Add Storage System
            </ButtonGov>
          </ButtonGovGroup>
        </div>
        {modalMode !== undefined && (
          <StorageModal
            mode={modalMode}
            initialModalData={
              modalMode !== undefined && modalMode.mode !== 'create'
                ? state.nmpFile.years[0].ManureStorageSystems![modalMode.systemIndex]
                : undefined
            }
            unassignedManures={unassignedManures}
            handleDialogClose={handleDialogClose}
            isOpen={modalMode !== undefined}
          />
        )}
        <TabsMaterial
          activeTab={2}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      </>
      {(state.nmpFile.years[0].ManureStorageSystems || []).map((system, systemIndex) => (
        <Grid container>
          <Grid size={10}>
            <span>{system.name}</span>
          </Grid>
          <Grid size={2}>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => setModalMode({ mode: 'system_edit', systemIndex })}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDeleteSystem(systemIndex)}
              icon={faTrash}
              aria-label="Delete"
            />
          </Grid>
          {system.manureType === ManureType.Liquid ? (
            <>
              {system.manureStorages.map((storage, storageIndex) => {
                <>
                  <Grid size={10}>
                    <span>{storage.name}</span>
                  </Grid>
                  <Grid size={2}>
                    <FontAwesomeIcon
                      css={tableActionButtonCss}
                      onClick={() => setModalMode({ mode: 'storage_edit', systemIndex, storageIndex})}
                      icon={faEdit}
                      aria-label="Edit"
                      
                    />
                    <FontAwesomeIcon
                      css={tableActionButtonCss}
                      onClick={() => handleDeleteStorage(systemIndex, storageIndex)}
                      icon={faTrash}
                      aria-label="Delete"
                    />
                  </Grid> 
                </>
              })}
              <Button
                size="medium"
                aria-label="Add a Storage to this System"
                variant="secondary"
                onPress={() => { setModalMode({ mode: 'storage_create', systemIndex })}}
              >
                Add a Storage to this System
              </Button>
            </>
          ) : (
            <>
            <Grid size={10}>
              <span>{system.manureStorage.name}</span>
            </Grid>
            <Grid size={2}>
              <FontAwesomeIcon
                css={tableActionButtonCss}
                onClick={() => setModalMode({ mode: 'storage_edit', systemIndex, storageIndex: 0})}
                icon={faEdit}
                aria-label="Edit"
                
              />
            </Grid>
            </>
          )}
        </Grid>)
      )}
      <div>
        <span>Materials Needing Storage</span>
        <br />
        {unassignedManures.map((m) => (
          <>
            <span key={m.data.ManagedManureName}>{m.data.ManagedManureName}</span>
            <br />
          </>
        ))}
      </div>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePrevious}
        >
          Back
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={handleNext}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
