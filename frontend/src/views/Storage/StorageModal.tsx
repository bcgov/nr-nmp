/**
 * @summary This is the modal for the Storage page
 */
import React, { useState } from 'react';
import Divider from '@mui/material/Divider';
import { formCss } from '../../common.styles';
import useAppState from '@/hooks/useAppState';
import {
  LiquidManureStorageSystem,
  ManureInSystem,
  ManureType,
  NMPFileManureStorageSystem,
  PrecipitationConversionFactor,
  SolidManureStorageSystem,
} from '@/types';
import { Form, Modal } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';
import StorageSystemDetailsDisplay from './StorageSystemDetailsDisplay';
import StorageSystemDetailsEdit from './StorageSystemDetailsEdit';
import LiquidStorageDetails from './LiquidStorageDetails';
import SolidStorageDetails from './SolidStorageDetails';
import { DEFAULT_FORM_DATA, StorageModalFormData, StorageModalMode } from './types';
import { DEFAULT_LIQUID_MANURE_STORAGE } from '@/constants';
import { calcStorageSurfaceAreaSqFt } from '@/utils/manureStorageSystems';

type ModalComponentProps = {
  mode: StorageModalMode;
  initialModalData?: NMPFileManureStorageSystem;
  unassignedManures: ManureInSystem[];
  annualPrecipitation?: number;
  handleDialogClose: () => void;
};

export default function StorageModal({
  mode,
  initialModalData,
  unassignedManures,
  annualPrecipitation,
  handleDialogClose,
  ...props
}: ModalComponentProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state, dispatch } = useAppState();
  const [formData, setFormData] = useState<StorageModalFormData>(
    // For storage_create mode, append a blank liquid manure storage
    mode.mode === 'storage_create'
      ? {
          ...(initialModalData as LiquidManureStorageSystem),
          manureStorages: (initialModalData as LiquidManureStorageSystem).manureStorages.concat(
            DEFAULT_LIQUID_MANURE_STORAGE,
          ),
        }
      : initialModalData || { ...DEFAULT_FORM_DATA, uuid: crypto.randomUUID() },
  );

  const handleSubmit = () => {
    if (formData.manureType === undefined) throw new Error('Form validation failed.');
    if (annualPrecipitation === undefined) throw new Error('No precipitation data found.');

    // Add precipitation data to the form
    const withRainData = { ...formData };
    if (withRainData.manureType === ManureType.Liquid) {
      let totalUncoveredArea = withRainData.runoffAreaSqFt || 0;
      withRainData.manureStorages.forEach((storage) => {
        if (!storage.isStructureCovered) {
          if (!storage.structure) throw new Error('Form validation failed.');
          totalUncoveredArea += calcStorageSurfaceAreaSqFt(storage.structure);
        }
      });
      withRainData.annualPrecipitation =
        totalUncoveredArea > 0
          ? totalUncoveredArea * annualPrecipitation * PrecipitationConversionFactor.Liquid
          : undefined;
    } else {
      // For solid manure
      withRainData.annualPrecipitation = withRainData.manureStorage.uncoveredAreaSqFt
        ? withRainData.manureStorage.uncoveredAreaSqFt *
          annualPrecipitation *
          PrecipitationConversionFactor.Solid
        : undefined;
    }

    const newList = [...(state.nmpFile.years[0].manureStorageSystems || [])];
    if (mode.mode !== 'create') {
      newList[mode.systemIndex] = withRainData;
    } else {
      newList.push(withRainData);
    }
    dispatch({
      type: 'SAVE_MANURE_STORAGE_SYSTEMS',
      year: state.nmpFile.farmDetails.year,
      newManureStorageSystems: newList,
    });
    handleDialogClose();
  };

  return (
    <Modal
      onOpenChange={handleDialogClose}
      title="Storage System Details"
      {...props}
      modalStyle={{ width: '700px' }}
    >
      <Form
        css={formCss}
        onCancel={handleDialogClose}
        onConfirm={handleSubmit}
      >
        {mode.mode === 'create' || mode.mode === 'system_edit' ? (
          <StorageSystemDetailsEdit
            mode={mode.mode}
            formData={formData}
            setFormData={setFormData}
            unassignedManures={unassignedManures}
          />
        ) : (
          <StorageSystemDetailsDisplay formData={formData as NMPFileManureStorageSystem} />
        )}
        {mode.mode !== 'system_edit' && (
          <>
            {formData.manureType !== undefined && (
              <Divider
                aria-hidden="true"
                component="div"
                css={{ marginTop: '1rem', marginBottom: '1rem' }}
              />
            )}
            {formData.manureType === ManureType.Liquid && (
              <LiquidStorageDetails
                formData={formData}
                setFormData={
                  setFormData as React.Dispatch<React.SetStateAction<LiquidManureStorageSystem>>
                }
                storageIndex={
                  mode.mode === 'storage_edit'
                    ? mode.storageIndex
                    : formData.manureStorages.length - 1
                }
              />
            )}
            {formData.manureType === ManureType.Solid && (
              <SolidStorageDetails
                formData={formData}
                setFormData={
                  setFormData as React.Dispatch<React.SetStateAction<SolidManureStorageSystem>>
                }
              />
            )}
          </>
        )}
      </Form>
    </Modal>
  );
}
