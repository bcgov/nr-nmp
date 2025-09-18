import { useState, SetStateAction, useMemo, useEffect } from 'react';
import { Grid } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { Modal, Form, NumberField } from '@/components/common';
import { NMPFileField } from '@/types';
import { calcPrevYearManureApplDefault } from '@/calculations/CalculateNutrients/PreviousManure/calculations';

interface PreviousYearManureFormData {
  previousYearManureApplicationId: number;
  previousYearManureApplicationNCredit?: number;
}

interface PreviousYearManureModalProps {
  fieldIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setFields: (value: SetStateAction<NMPFileField[]>) => void;
  modalStyle?: object;
  field: NMPFileField;
  initialModalData: PreviousYearManureFormData;
}

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

export default function PreviousYearManureModal({
  fieldIndex,
  isOpen,
  onClose,
  setFields,
  modalStyle,
  field,
  initialModalData,
}: PreviousYearManureModalProps) {
  const [formData, setFormData] = useState<PreviousYearManureFormData>(initialModalData);

  const [calculatedDefaultCredit, setCalculatedDefaultCredit] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    calcPrevYearManureApplDefault({
      ...field,
      previousYearManureApplicationId: formData.previousYearManureApplicationId,
    })
      .then(setCalculatedDefaultCredit)
      .catch((error) => {
        console.error('Error calculating default nitrogen credit:', error);
        setCalculatedDefaultCredit(undefined);
      });
  }, [formData.previousYearManureApplicationId, field]);

  useEffect(() => {
    if (
      formData.previousYearManureApplicationNCredit === undefined &&
      calculatedDefaultCredit !== undefined
    ) {
      setFormData((prev) => ({
        ...prev,
        previousYearManureApplicationNCredit: calculatedDefaultCredit,
      }));
    }
  }, [formData.previousYearManureApplicationNCredit, calculatedDefaultCredit]);

  const isFormValid = useMemo(() => {
    const credit = formData.previousYearManureApplicationNCredit;
    return credit !== undefined && credit >= 0;
  }, [formData.previousYearManureApplicationNCredit]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        previousYearManureApplicationId: formData.previousYearManureApplicationId,
        previousYearManureApplicationNCredit: formData.previousYearManureApplicationNCredit,
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
      previousYearManureApplicationNCredit: calculatedDefaultCredit,
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
          <Grid size={12}>
            <NumberField
              label="Nitrogen Credit (lb/ac)"
              value={formData.previousYearManureApplicationNCredit}
              onChange={(value) => {
                handleFormFieldChange({
                  previousYearManureApplicationNCredit: value,
                });
              }}
              minValue={0}
              step={0.1}
              iconRight={
                calculatedDefaultCredit !== undefined &&
                formData.previousYearManureApplicationNCredit !== calculatedDefaultCredit ? (
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
            {calculatedDefaultCredit !== undefined && (
              <div style={helperTextStyle}>Calculated default: {calculatedDefaultCredit} lb/ac</div>
            )}
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
