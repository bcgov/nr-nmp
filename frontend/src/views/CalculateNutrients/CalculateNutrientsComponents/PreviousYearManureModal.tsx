import { useState, useEffect, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { Modal, Form, Select, NumberField } from '@/components/common';
import { NMPFileFieldData } from '@/types';
import { MANURE_APPLICATION_FREQ } from '@/constants';

interface PreviousYearManureModalProps {
  field: NMPFileFieldData;
  fieldIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setFields: (value: SetStateAction<NMPFileFieldData[]>) => void;
  modalStyle?: object;
}

interface PreviousYearManureFormData {
  PreviousYearManureApplicationFrequency: string;
  PreviousYearManureApplicationNitrogenCredit: number | null;
}

export default function PreviousYearManureModal({
  field,
  fieldIndex,
  isOpen,
  onClose,
  setFields,
  modalStyle,
}: PreviousYearManureModalProps) {
  const [formData, setFormData] = useState<PreviousYearManureFormData>({
    PreviousYearManureApplicationFrequency: field.PreviousYearManureApplicationFrequency || '0',
    PreviousYearManureApplicationNitrogenCredit:
      field.PreviousYearManureApplicationNitrogenCredit || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        PreviousYearManureApplicationFrequency: field.PreviousYearManureApplicationFrequency || '0',
        PreviousYearManureApplicationNitrogenCredit:
          field.PreviousYearManureApplicationNitrogenCredit || null,
      });
      setErrors({});
    }
  }, [isOpen, field]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.PreviousYearManureApplicationFrequency !== '0') {
      if (
        formData.PreviousYearManureApplicationNitrogenCredit === null ||
        formData.PreviousYearManureApplicationNitrogenCredit < 0
      ) {
        newErrors.PreviousYearManureApplicationNitrogenCredit =
          'Nitrogen credit must be a positive number when manure application is selected';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        PreviousYearManureApplicationFrequency: formData.PreviousYearManureApplicationFrequency,
        PreviousYearManureApplicationNitrogenCredit:
          formData.PreviousYearManureApplicationFrequency === '0'
            ? null
            : formData.PreviousYearManureApplicationNitrogenCredit,
      };
      return updatedFields;
    });

    onClose();
  };

  const handleFormFieldChange = (updates: Partial<PreviousYearManureFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // Clear nitrogen credit if frequency is set to '0'
    if (updates.PreviousYearManureApplicationFrequency === '0') {
      setFormData((prev) => ({
        ...prev,
        ...updates,
        PreviousYearManureApplicationNitrogenCredit: null,
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Edit Previous Year Manure Application"
      modalStyle={modalStyle}
    >
      <Form
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmButtonText="Save"
        isConfirmDisabled={!validateForm()}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <Select
              label="Previous Year Manure Application Frequency"
              isRequired
              items={MANURE_APPLICATION_FREQ}
              selectedKey={formData.PreviousYearManureApplicationFrequency}
              placeholder="Select frequency"
              onSelectionChange={(value) => {
                handleFormFieldChange({ PreviousYearManureApplicationFrequency: value as string });
              }}
            />
          </Grid>

          {formData.PreviousYearManureApplicationFrequency !== '0' && (
            <Grid size={12}>
              <NumberField
                label="Nitrogen Credit (lb/ac)"
                value={formData.PreviousYearManureApplicationNitrogenCredit || undefined}
                onChange={(value) => {
                  handleFormFieldChange({
                    PreviousYearManureApplicationNitrogenCredit: value,
                  });
                }}
                minValue={0}
                step={0.1}
              />
              {errors.PreviousYearManureApplicationNitrogenCredit && (
                <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.PreviousYearManureApplicationNitrogenCredit}
                </div>
              )}
            </Grid>
          )}

          {formData.PreviousYearManureApplicationFrequency === '0' && (
            <Grid size={12}>
              <p style={{ fontStyle: 'italic', color: '#666' }}>
                No previous year manure application selected. Nitrogen credit will be set to 0.
              </p>
            </Grid>
          )}
        </Grid>
      </Form>
    </Modal>
  );
}
