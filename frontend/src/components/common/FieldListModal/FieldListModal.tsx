import React, { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Select,
} from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { formCss, formGridBreakpoints } from '../../../common.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NMPFileFieldData, initialFieldFormData } from '@/types/NMPFileFieldData';

// NOTE: Move into a const file if this is needed elsewhere
const manureOptions = [
  { id: '0', label: 'Select' },
  { id: '1', label: 'No Manure in the last 2 years' },
  { id: '2', label: 'Manure applied in 1 of the 2 years' },
  { id: '3', label: 'Manure applied in each of the 2 years' },
];

interface FieldListModalProps {
  initialModalData: NMPFileFieldData | undefined;
  rowEditIndex: number | undefined;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  isFieldNameUnique: (field: NMPFileFieldData) => boolean;
  onClose: () => void;
}

export default function FieldListModal({
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
        const replaceIndex = prev.findIndex((element) => element.index === rowEditIndex);
        const newList = [...prev];
        newList[replaceIndex] = { ...formData };
        return newList;
      });
    } else {
      setFieldList((prev) => [
        ...prev,
        { ...formData, index: prev.length === 0 ? 0 : (prev[prev.length - 1].index || 0) + 1 },
      ]);
    }
    onClose();
  };

  const handleFormFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateUniqueName = (): string => {
    if (!formData.FieldName) return '';
    return !isFieldNameUnique(formData) ? ' must be unique' : '';
  };

  const isManureOptionValid = () =>
    formData.PreviousYearManureApplicationFrequency !== manureOptions[0].id;

  return (
    <Modal
      title={rowEditIndex !== undefined ? 'Edit field' : 'Add field'}
      onOpenChange={() => {}}
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={onSubmit}
        validationBehavior="native"
        onInvalid={() => setIsFormInvalid(true)}
      >
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && (!formData.FieldName || validateUniqueName()) ? '--error' : ''}`}
            >
              Field name {isFormInvalid && validateUniqueName()}
            </span>
            <TextField
              isRequired
              name="FieldName"
              value={formData.FieldName}
              isInvalid={!!validateUniqueName()} // Note: this turns the textbox border red, looks odd but will only change if we get complaints
              onChange={(e) => handleFormFieldChange('FieldName', e)}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData.Area ? '--error' : ''}`}
            >
              Area
            </span>
            <TextField
              isRequired
              type="number"
              name="Area"
              value={formData.Area?.toString()}
              onChange={(e) => handleFormFieldChange('Area', e?.trim())}
            />
          </Grid>
          <Grid size={6}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !isManureOptionValid() ? '--error' : ''}`}
            >
              Manure Application
            </span>
            <Select
              isRequired
              name="manureApplication"
              items={manureOptions}
              selectedKey={formData.PreviousYearManureApplicationFrequency}
              validate={() => (!isManureOptionValid() ? 'required' : '')}
              onSelectionChange={(e) => {
                handleFormFieldChange('PreviousYearManureApplicationFrequency', e.toString());
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span>Comment (Optional)</span>
            <TextField
              name="Comment"
              value={formData.Comment}
              onChange={(e) => handleFormFieldChange('Comment', e)}
            />
          </Grid>
        </Grid>
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
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Confirm
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
