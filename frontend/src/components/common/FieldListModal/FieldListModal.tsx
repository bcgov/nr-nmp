import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Select from '@/components/common/Select/Select';
import { formGridBreakpoints } from '../../../common.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NMPFileFieldData } from '@/types';
import Form from '../Form/Form';
import initialFieldFormData from '@/constants/DefaultNMPFileFieldData';
import { MANURE_APPLICATION_FREQ } from '@/constants';
import NumberField from '../NumberField/NumberField';
import TextField from '../TextField/TextField';

type Mode = 'Add Field' | 'Edit Field' | 'Duplicate Field';

interface FieldListModalProps {
  mode: Mode;
  initialModalData?: NMPFileFieldData;
  rowEditIndex?: number;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  isFieldNameUnique: (field: Partial<NMPFileFieldData>, index: number) => boolean;
  onClose: () => void;
}

export default function FieldListModal({
  mode,
  initialModalData,
  rowEditIndex,
  setFieldList,
  isFieldNameUnique,
  onClose,
  ...props
}: FieldListModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState<NMPFileFieldData>(
    initialModalData !== undefined ? initialModalData : initialFieldFormData,
  );

  const onSubmit = () => {
    if (rowEditIndex !== undefined) {
      // If editing, find and replace field instead of adding new field
      setFieldList((prev) => {
        const newList = [...prev];
        newList[rowEditIndex] = { ...formData };
        return newList;
      });
    } else {
      setFieldList((prev) => [...prev, { ...formData }]);
    }
    onClose();
  };

  const handleFormFieldChange = (changes: Partial<NMPFileFieldData>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const validateUniqueName = (): boolean => {
    if (!formData.FieldName) return true;
    return isFieldNameUnique(formData, rowEditIndex === undefined ? -1 : rowEditIndex);
  };

  return (
    <Modal
      title={mode}
      onOpenChange={onClose}
      {...props}
    >
      <Form
        onCancel={onClose}
        onConfirm={onSubmit}
      >
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <TextField
              isRequired
              label="Field Name"
              value={formData.FieldName}
              onChange={(e) => handleFormFieldChange({ FieldName: e })}
              validate={() => (validateUniqueName() ? undefined : 'Field name must be unique')}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="Area in acres"
              value={formData.Area}
              onChange={(e) => handleFormFieldChange({ Area: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={6}>
            <Select
              label="Manure application"
              isRequired
              items={MANURE_APPLICATION_FREQ}
              selectedKey={formData.PreviousYearManureApplicationFrequency}
              placeholder="Select"
              onSelectionChange={(e) => {
                handleFormFieldChange({ PreviousYearManureApplicationFrequency: e as string });
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Comments (optional)"
              value={formData.Comment}
              onChange={(e) => handleFormFieldChange({ Comment: e })}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
