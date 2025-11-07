import { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import SystemDisplay from './storage.styles';
import { NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '../../constants/routes';

import { Tabs, View } from '../../components/common';
import { addRecordGroupStyle, tableActionButtonCss } from '../../common.styles';
import StorageModal from './StorageModal';
import useAppState from '@/hooks/useAppState';
import { APICacheContext } from '@/context/APICacheContext';
import { ManureInSystem, ManureType, Subregion } from '@/types';
import { StorageModalMode } from './types';

export default function Storage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [subregionData, setSubregionData] = useState<Subregion | undefined>(undefined);
  const [modalMode, setModalMode] = useState<StorageModalMode | undefined>(undefined);

  const { generatedManures } = state.nmpFile.years[0];
  const { importedManures } = state.nmpFile.years[0];
  const { derivedManures } = state.nmpFile.years[0];
  const unassignedManures = useMemo(() => {
    const unassignedM: ManureInSystem[] = [];
    (generatedManures || []).forEach((manure) => {
      if (!manure.assignedToStoredSystem) {
        unassignedM.push({ type: 'Generated', data: manure });
      }
    });
    (importedManures || []).forEach((manure) => {
      if (!manure.assignedToStoredSystem) {
        unassignedM.push({ type: 'Imported', data: manure });
      }
    });
    (derivedManures || []).forEach((manure) => {
      if (!manure.assignedToStoredSystem) {
        unassignedM.push({ type: 'Derived', data: manure });
      }
    });
    return unassignedM;
  }, [generatedManures, importedManures, derivedManures]);

  // Get subregion precipitation data
  useEffect(() => {
    const region = state.nmpFile.farmDetails.farmRegion;
    const subregion = state.nmpFile.farmDetails.farmSubregion;
    if (region && subregion) {
      apiCache.callEndpoint(`api/subregions/${region}/`).then((response) => {
        const { data } = response;
        const currentSubregion = data.find((ele: Subregion) => ele.id === subregion);
        setSubregionData(currentSubregion);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const newList = [...state.nmpFile.years[0].manureStorageSystems!];
      newList.splice(index, 1);
      dispatch({
        type: 'SAVE_MANURE_STORAGE_SYSTEMS',
        year: state.nmpFile.farmDetails.year,
        newManureStorageSystems: newList,
      });
    },
    [state.nmpFile, dispatch],
  );

  const handleDeleteStorage = useCallback(
    (systemIndex: number, storageIndex: number) => {
      const newList = [...state.nmpFile.years[0].manureStorageSystems!];
      const system = newList[systemIndex];
      if (system.manureType !== ManureType.Liquid) throw new Error('Storage entered bad state');
      const newStorageList = [...system.manureStorages];
      newStorageList.splice(storageIndex, 1);
      newList[systemIndex] = { ...system, manureStorages: newStorageList };
      dispatch({
        type: 'SAVE_MANURE_STORAGE_SYSTEMS',
        year: state.nmpFile.farmDetails.year,
        newManureStorageSystems: newList,
      });
    },
    [state.nmpFile, dispatch],
  );

  return (
    <View
      title="Storage"
      handleBack={handlePrevious}
      handleNext={handleNext}
    >
      <div css={addRecordGroupStyle}>
        <ButtonGroup
          alignment="end"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            onPress={() => setModalMode({ mode: 'create' })}
            variant="secondary"
          >
            Add Storage System
          </Button>
        </ButtonGroup>
      </div>
      {modalMode !== undefined && (
        <StorageModal
          mode={modalMode}
          initialModalData={
            modalMode !== undefined && modalMode.mode !== 'create'
              ? state.nmpFile.years[0].manureStorageSystems![modalMode.systemIndex]
              : undefined
          }
          annualPrecipitation={subregionData ? subregionData.annualprecipitation : undefined}
          unassignedManures={unassignedManures}
          handleDialogClose={handleDialogClose}
          isOpen={modalMode !== undefined}
        />
      )}
      <Tabs
        activeTab={2}
        tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
      />
      <Grid
        container
        size={12}
      >
        <Grid
          container
          size={8}
        >
          {(state.nmpFile.years[0].manureStorageSystems || []).map((system, systemIndex) => (
            <SystemDisplay key={system.name}>
              <div className="row">
                <div>
                  <span>{system.name}</span>
                </div>
                <div>
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
                </div>
              </div>
              {system.manureType === ManureType.Liquid ? (
                <ul>
                  {system.manureStorages.map((storage, storageIndex) => (
                    <li
                      className="row"
                      key={storage.name}
                    >
                      <div>
                        <span>{storage.name}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon
                          css={tableActionButtonCss}
                          onClick={() =>
                            setModalMode({ mode: 'storage_edit', systemIndex, storageIndex })
                          }
                          icon={faEdit}
                          aria-label="Edit"
                        />
                        <FontAwesomeIcon
                          css={tableActionButtonCss}
                          onClick={() => handleDeleteStorage(systemIndex, storageIndex)}
                          icon={faTrash}
                          aria-label="Delete"
                        />
                      </div>
                    </li>
                  ))}
                  <Button
                    size="small"
                    variant="secondary"
                    onPress={() => {
                      setModalMode({ mode: 'storage_create', systemIndex });
                    }}
                  >
                    Add a Storage to this System
                  </Button>
                </ul>
              ) : (
                <ul>
                  <li className="row">
                    <div>
                      <span>{system.manureStorage.name}</span>
                    </div>
                    <div className="margin-right">
                      <FontAwesomeIcon
                        css={tableActionButtonCss}
                        onClick={() =>
                          setModalMode({ mode: 'storage_edit', systemIndex, storageIndex: 0 })
                        }
                        icon={faEdit}
                        aria-label="Edit"
                      />
                    </div>
                  </li>
                </ul>
              )}
            </SystemDisplay>
          ))}
        </Grid>
        <Grid
          container
          size={4}
        >
          <div>Materials Needing Storage</div>
          {unassignedManures.map((m) => (
            <div key={m.data.managedManureName}>{m.data.managedManureName}</div>
          ))}
        </Grid>
      </Grid>
    </View>
  );
}
