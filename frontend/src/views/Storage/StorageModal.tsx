/**
 * @summary This is the modal for the Storage page
 */
import React, { useState, FormEvent } from 'react';
import Divider from '@mui/material/Divider';
import { Button, ButtonGroup, Form } from '@bcgov/design-system-react-components';
import { formCss } from '../../common.styles';
import useAppState from '@/hooks/useAppState';
import {
  LiquidManureStorageSystem,
  ManureInSystem,
  ManureType,
  NMPFileManureStorageSystem,
  SolidManureStorageSystem,
} from '@/types';
import { Modal } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';
import StorageSystemDetailsDisplay from './StorageSystemDetailsDisplay';
import StorageSystemDetailsEdit from './StorageSystemDetailsEdit';
import LiquidStorageDetails from './LiquidStorageDetails';
import SolidStorageDetails from './SolidStorageDetails';
import { DEFAULT_FORM_DATA, StorageModalFormData, StorageModalMode } from './types';
import { DEFAULT_LIQUID_MANURE_STORAGE } from '@/constants';

type ModalComponentProps = {
  mode: StorageModalMode;
  initialModalData?: NMPFileManureStorageSystem;
  unassignedManures: ManureInSystem[];
  handleDialogClose: () => void;
};

export default function StorageModal({
  mode,
  initialModalData,
  unassignedManures,
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
      : initialModalData || DEFAULT_FORM_DATA,
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.manureType === undefined) throw new Error('Form validation failed.');

    const newList = [...(state.nmpFile.years[0].ManureStorageSystems || [])];
    if (mode.mode !== 'create') {
      newList[mode.systemIndex] = formData;
    } else {
      newList.push(formData);
    }
    dispatch({
      type: 'SAVE_MANURE_STORAGE_SYSTEMS',
      year: state.nmpFile.farmDetails.Year!,
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
        onSubmit={handleSubmit}
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
            type="reset"
            variant="secondary"
            onPress={handleDialogClose}
            aria-label="reset"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            aria-label="submit"
          >
            Confirm
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
