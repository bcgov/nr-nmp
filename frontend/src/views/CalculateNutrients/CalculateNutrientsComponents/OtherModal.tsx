/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import { NMPFileFieldData } from '@/types';
import { ModalContent } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';

type OtherModalProps = {
  initialModalData: NMPFileFieldData | undefined;
  rowEditIndex: number | undefined;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onCancel: () => void;
};

export default function OtherModal({
  initialModalData,
  // rowEditIndex,
  // setFieldList,
  onCancel,
  ...props
}: OtherModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [otherForm, setOtherForm] = useState({
    fieldName: initialModalData?.FieldName,
    manureType: 0,
  });

  const handleSubmit = () => {
    onCancel();
  };

  const handleChange = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];
    setOtherForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  return (
    <Modal
      title="Other Details - Add"
      onOpenChange={() => {}}
      {...props}
    >
      <ModalContent>
        <Form
          onCancel={() => onCancel()}
          onSubmit={() => handleSubmit()}
          isConfirmDisabled={false}
          submitButtonText="Add to Field"
        >
          <Grid
            container
            spacing={2}
          />
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Nutrient Source"
              type="text"
              name="name"
            />
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
