import { useState, SetStateAction, useMemo, useEffect } from 'react';
import { Grid } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { Modal, Form, NumberField } from '@/components/common';
import { NMPFileField } from '@/types';
import { calcPrevYearManureApplDefault } from '@/calculations/CalculateNutrients/PreviousManure/calculations';

interface PreviousYearManureFormData {
  PreviousYearManureApplicationFrequency: number;
  PreviousYearManureApplicationNitrogenCredit: number | null;
}

interface PreviousYearManureModalProps {
  fieldIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setFields: (value: SetStateAction<NMPFileField[]>) => void;
  modalStyle?: object;
  field: NMPFileField;
  initialModalData?: PreviousYearManureFormData;
}

const defaultFormData: PreviousYearManureFormData = {
  PreviousYearManureApplicationFrequency: 0,
  PreviousYearManureApplicationNitrogenCredit: null,
};

const resetButtonStyle = {
  backgroundColor: '#ffa500',
  border: 'none',
  borderRadius: '4px',
  padding: '4px',
  cursor: 'pointer',
} as const;

const helperTextStyle = {
  fontSize: '0.875rem',
  color: '#666',
  marginTop: '0.25rem',
} as const;

const errorTextStyle = {
  color: 'red',
  fontSize: '0.875rem',
  marginTop: '0.25rem',
} as const;

export default function PreviousYearManureModal({
  fieldIndex,
  isOpen,
  onClose,
  setFields,
  modalStyle,
  field,
  initialModalData,
}: PreviousYearManureModalProps) {
  const [formData, setFormData] = useState<PreviousYearManureFormData>(
    initialModalData ?? defaultFormData,
  );

  const [calculatedDefaultCredit, setCalculatedDefaultCredit] = useState<number | null>(null);

  const hasManureApplication = formData.PreviousYearManureApplicationFrequency !== 0;

  useEffect(() => {
    if (!hasManureApplication) {
      setCalculatedDefaultCredit(0);
      return;
    }

    calcPrevYearManureApplDefault({
      ...field,
      PreviousYearManureApplicationFrequency: formData.PreviousYearManureApplicationFrequency,
    })
      .then(setCalculatedDefaultCredit)
      .catch((error) => {
        console.error('Error calculating default nitrogen credit:', error);
        setCalculatedDefaultCredit(null);
      });
  }, [formData.PreviousYearManureApplicationFrequency, field, hasManureApplication]);

  useEffect(() => {
    if (
      hasManureApplication &&
      formData.PreviousYearManureApplicationNitrogenCredit === null &&
      calculatedDefaultCredit !== null
    ) {
      setFormData((prev) => ({
        ...prev,
        PreviousYearManureApplicationNitrogenCredit: calculatedDefaultCredit,
      }));
    }
  }, [
    formData.PreviousYearManureApplicationNitrogenCredit,
    calculatedDefaultCredit,
    hasManureApplication,
  ]);

  const isFormValid = useMemo(() => {
    if (!hasManureApplication) return true;

    const credit = formData.PreviousYearManureApplicationNitrogenCredit;
    return credit !== null && credit >= 0;
  }, [formData.PreviousYearManureApplicationNitrogenCredit, hasManureApplication]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (hasManureApplication) {
      const credit = formData.PreviousYearManureApplicationNitrogenCredit;
      if (credit === null || credit < 0) {
        errors.PreviousYearManureApplicationNitrogenCredit =
          'Nitrogen credit must be a positive number when manure application is selected';
      }
    }

    return errors;
  }, [formData.PreviousYearManureApplicationNitrogenCredit, hasManureApplication]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        previousYearManureApplicationFrequency:
          formData.PreviousYearManureApplicationFrequency.toString(),
        // Note: NMPFileField doesn't have PreviousYearManureApplicationNitrogenCredit field
        // This data might need to be stored elsewhere or the field structure updated
      };
      return updatedFields;
    });

    onClose();
  };

  const handleFormFieldChange = (updates: Partial<PreviousYearManureFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleResetToCalculated = () => {
    handleFormFieldChange({
      PreviousYearManureApplicationNitrogenCredit: calculatedDefaultCredit,
    });
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
        isConfirmDisabled={!isFormValid}
      >
        <Grid
          container
          spacing={2}
        >
          {hasManureApplication ? (
            <Grid size={12}>
              <NumberField
                label="Nitrogen Credit (lb/ac)"
                value={formData.PreviousYearManureApplicationNitrogenCredit ?? undefined}
                onChange={(value) => {
                  handleFormFieldChange({
                    PreviousYearManureApplicationNitrogenCredit: value,
                  });
                }}
                minValue={0}
                step={0.1}
                iconRight={
                  calculatedDefaultCredit !== null &&
                  formData.PreviousYearManureApplicationNitrogenCredit !==
                    calculatedDefaultCredit ? (
                    <button
                      type="button"
                      css={resetButtonStyle}
                      onClick={handleResetToCalculated}
                      title={`Reset to calculated value (${calculatedDefaultCredit} lb/ac)`}
                    >
                      <LoopIcon />
                    </button>
                  ) : undefined
                }
              />
              {calculatedDefaultCredit !== null && (
                <div style={helperTextStyle}>
                  Calculated default: {calculatedDefaultCredit} lb/ac
                </div>
              )}
              {validationErrors.PreviousYearManureApplicationNitrogenCredit && (
                <div style={errorTextStyle}>
                  {validationErrors.PreviousYearManureApplicationNitrogenCredit}
                </div>
              )}
            </Grid>
          ) : (
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
