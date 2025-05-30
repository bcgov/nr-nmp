/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import { Select } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { ModalContent } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';

type AddFertigationModalProps = {
  initialModalData: NMPFileFieldData | undefined;
  rowEditIndex: number | undefined;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onCancel: () => void;
};

export default function FertilizerModal({
  initialModalData,
  // rowEditIndex,
  // setFieldList,
  onCancel,
  ...props
}: AddFertigationModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertigationForm, setFertigationForm] = useState({
    fieldName: initialModalData?.FieldName,
  });

  const handleSubmit = () => {
    onCancel();
  };

  const handleChange = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];
    setFertigationForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  return (
    <Modal
      title="Add Fertigation"
      onOpenChange={() => {}}
      {...props}
    >
      <ModalContent>
        <Form
          onCancel={() => onCancel()}
          onSubmit={() => handleSubmit()}
          isConfirmDisabled={false}
        >
          <Grid
            container
            spacing={2}
          />
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Fertigation Type"
              placeholder="Select a fertigation type"
              // selectedKey={fertigationForm?.manureType}
              // items={}
              onSelectionChange={(e: any) => handleChange(e)}
            />
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
