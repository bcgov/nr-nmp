import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Select from '@/components/common/Select/Select';
import { formGridBreakpoints } from '../../../common.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NMPFileField } from '@/types';
import Form from '../Form/Form';
import { MANURE_APPLICATION_FREQ, DEFAULT_NMPFILE_FIELD } from '@/constants';
import NumberField from '../NumberField/NumberField';
import TextField from '../TextField/TextField';

type Mode = 'Add Field' | 'Edit Field' | 'Duplicate Field';

interface FieldListModalProps {
  mode: Mode;
  initialModalData?: NMPFileField;
  rowEditIndex?: number;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
  isFieldNameUnique: (field: Partial<NMPFileField>, index: number) => boolean;
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
  const [formData, setFormData] = useState<NMPFileField>(
    initialModalData !== undefined ? initialModalData : DEFAULT_NMPFILE_FIELD,
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

  const handleFormFieldChange = (changes: Partial<NMPFileField>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const validateUniqueName = (): boolean => {
    if (!formData.fieldName) return true;
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
              value={formData.fieldName}
              onChange={(e) => handleFormFieldChange({ fieldName: e })}
              validate={() => (validateUniqueName() ? undefined : 'Field name must be unique')}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="Area in acres"
              value={formData.area}
              onChange={(e) => handleFormFieldChange({ area: e })}
              minValue={0.01} // A min value of 0 will cause a divide by 0 error elsewhere
            />
          </Grid>
          <Grid size={6}>
            <Select
              label="Manure application"
              isRequired
              items={MANURE_APPLICATION_FREQ}
              selectedKey={formData.previousYearManureApplicationId}
              placeholder="Select"
              onSelectionChange={(e) => {
                handleFormFieldChange({ previousYearManureApplicationId: e as number });
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Comments (optional)"
              value={formData.comment}
              onChange={(e) => handleFormFieldChange({ comment: e })}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
