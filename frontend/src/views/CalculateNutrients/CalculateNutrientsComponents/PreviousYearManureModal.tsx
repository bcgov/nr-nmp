import { useState, SetStateAction, useMemo, useEffect } from 'react';
import { Grid } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { Modal, Form, NumberField } from '@/components/common';
import { NMPFileFieldData } from '@/types';
import { calcPrevYearManureApplDefault } from '@/calculations/CalculateNutrients/PreviousManure/calculations';

interface PreviousYearManureModalProps {
  fieldIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setFields: (value: SetStateAction<NMPFileFieldData[]>) => void;
  modalStyle?: object;
  field: NMPFileFieldData;
  initialModalData?: {
    PreviousYearManureApplicationFrequency: string;
    PreviousYearManureApplicationNitrogenCredit: number | null;
  };
}

interface PreviousYearManureFormData {
  PreviousYearManureApplicationFrequency: string;
  PreviousYearManureApplicationNitrogenCredit: number | null;
}

const defaultFormData: PreviousYearManureFormData = {
  PreviousYearManureApplicationFrequency: '0',
  PreviousYearManureApplicationNitrogenCredit: null,
};

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
    initialModalData || defaultFormData,
  );

  const [calculatedDefaultCredit, setCalculatedDefaultCredit] = useState<number | null>(null);

  useEffect(() => {
    const getDefaultCredit = async () => {
      if (formData.PreviousYearManureApplicationFrequency !== '0') {
        try {
          const defaultCredit = await calcPrevYearManureApplDefault({
            ...field,
            PreviousYearManureApplicationFrequency: formData.PreviousYearManureApplicationFrequency,
          });
          setCalculatedDefaultCredit(defaultCredit);
        } catch (error) {
          console.error('Error calculating default nitrogen credit:', error);
          setCalculatedDefaultCredit(null);
        }
      } else {
        setCalculatedDefaultCredit(0);
      }
    };

    getDefaultCredit();
  }, [formData.PreviousYearManureApplicationFrequency, field]);

  const isFormValid = useMemo(() => {
    if (formData.PreviousYearManureApplicationFrequency !== '0') {
      return (
        formData.PreviousYearManureApplicationNitrogenCredit !== null &&
        formData.PreviousYearManureApplicationNitrogenCredit >= 0
      );
    }
    return true;
  }, [formData]);

  const validationErrors = useMemo(() => {
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

    return newErrors;
  }, [formData]);

  const handleSubmit = () => {
    if (!isFormValid) {
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
  };

  const handleResetToCalculated = () => {
    if (calculatedDefaultCredit !== null) {
      setFormData((prev) => ({
        ...prev,
        PreviousYearManureApplicationNitrogenCredit: calculatedDefaultCredit,
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
        isConfirmDisabled={!isFormValid}
      >
        <Grid
          container
          spacing={2}
        >
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
                iconRight={
                  calculatedDefaultCredit !== null &&
                  formData.PreviousYearManureApplicationNitrogenCredit !==
                    calculatedDefaultCredit ? (
                    <button
                      type="button"
                      css={{
                        backgroundColor: '#ffa500',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={handleResetToCalculated}
                      title={`Reset to calculated value (${calculatedDefaultCredit} lb/ac)`}
                    >
                      <LoopIcon />
                    </button>
                  ) : undefined
                }
              />
              {calculatedDefaultCredit !== null && (
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                  Calculated default: {calculatedDefaultCredit} lb/ac
                </div>
              )}
              {validationErrors.PreviousYearManureApplicationNitrogenCredit && (
                <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {validationErrors.PreviousYearManureApplicationNitrogenCredit}
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
