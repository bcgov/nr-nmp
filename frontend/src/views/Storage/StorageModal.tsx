/**
 * @summary This is the modal for the Storage page
 */
import { useState, FormEvent } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Form,
  TextField,
} from '@bcgov/design-system-react-components';
import { formCss, formGridBreakpoints } from '../../common.styles';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import useAppState from '@/hooks/useAppState';
import { ManureInSystem, ManureStorage, ManureType, NMPFileManureStorageSystem } from '@/types';
import DEFAULT_NMPFILE_MANURE_STORAGE from '@/constants/DefaultNMPFileManureStorage';
import { Modal, Select } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';

type ModalComponentProps = {
  initialModalData?: NMPFileManureStorageSystem;
  rowEditIndex?: number;
  unassignedManures: ManureInSystem[];
  handleDialogClose: () => void;
};

export default function StorageModal({
  initialModalData,
  rowEditIndex,
  unassignedManures,
  handleDialogClose,
  ...props
}: ModalComponentProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state, dispatch } = useAppState();
  const [formData, setFormData] = useState<NMPFileManureStorageSystem>(
    initialModalData || DEFAULT_NMPFILE_MANURE_STORAGE,
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newList = [...(state.nmpFile.years[0].ManureStorageSystems || [])];
    if (rowEditIndex !== undefined) {
      newList[rowEditIndex] = formData;
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
        <Divider
          aria-hidden="true"
          component="div"
          css={{ marginTop: '1rem', marginBottom: '1rem' }}
        />

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
