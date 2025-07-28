import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Select from '@/components/common/Select/Select';
import { formCss, formGridBreakpoints } from '../../../common.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NMPFileFieldData } from '@/types';
import Form from '../Form/Form';
import initialFieldFormData from '@/constants/DefaultNMPFileFieldData';
import { MANURE_APPLICATION_FREQ } from '@/constants';

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
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

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

  const handleFormFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateUniqueName = (): string => {
    if (!formData.FieldName) return '';
    return !isFieldNameUnique(formData, rowEditIndex === undefined ? -1 : rowEditIndex)
      ? ' must be unique'
      : '';
  };

  const isManureOptionValid = () =>
    formData.PreviousYearManureApplicationFrequency !== MANURE_APPLICATION_FREQ[0].id;

  return (
    <Modal
      title={mode}
      onOpenChange={onClose}
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={onSubmit}
        validationBehavior="native"
        onInvalid={() => setIsFormInvalid(true)}
        onCancel={onClose}
      >
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <span
              id="FieldName-label"
              className={`bcds-react-aria-TextField--Label ${isFormInvalid && (!formData.FieldName || validateUniqueName()) ? '--error' : ''}`}
            >
              Field Name {isFormInvalid && validateUniqueName()}
            </span>
            <TextField
              aria-labelledby="FieldName-label"
              isRequired
              name="FieldName"
              value={formData.FieldName}
              isInvalid={!!validateUniqueName()} // Note: this turns the textbox border red, looks odd but will only change if we get complaints
              onChange={(e) => handleFormFieldChange('FieldName', e)}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span
              id="Area-label"
              className={`bcds-react-aria-TextField--Label ${isFormInvalid && !formData.Area ? '--error' : ''}`}
            >
              Area (acres)
            </span>
            <TextField
              aria-labelledby="Area-label"
              isRequired
              type="number"
              name="Area"
              value={formData.Area?.toString()}
              onChange={(e) => handleFormFieldChange('Area', e?.trim())}
            />
          </Grid>
          <Grid size={6}>
            <span
              id="manureApplication-label"
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !isManureOptionValid() ? '--error' : ''}`}
            >
              Manure Application
            </span>
            <Select
              aria-labelledby="manureApplication-label"
              isRequired
              name="manureApplication"
              items={MANURE_APPLICATION_FREQ}
              selectedKey={formData.PreviousYearManureApplicationFrequency}
              validate={() => (!isManureOptionValid() ? 'required' : '')}
              onSelectionChange={(e) => {
                handleFormFieldChange('PreviousYearManureApplicationFrequency', e.toString());
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span id="Comment-label">Comment (Optional)</span>
            <TextField
              aria-labelledby="Comment-label"
              name="Comment"
              value={formData.Comment}
              onChange={(e) => handleFormFieldChange('Comment', e)}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
