import { useState, SetStateAction, useMemo, useContext } from 'react';
import { Grid } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { Modal, Form, NumberField } from '@/components/common';
import { NMPFileField } from '@/types';
import { calcPrevYearManureApplDefault } from '@/calculations/CalculateNutrients/PreviousManure/calculations';
import { APICacheContext } from '@/context/APICacheContext';

interface PreviousYearManureModalProps {
  fieldIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setFields: (value: SetStateAction<NMPFileField[]>) => void;
  modalStyle?: object;
  field: NMPFileField;
}

const resetButtonStyle = {
  backgroundColor: '#ffa500',
  border: 'none',
  borderRadius: '4px',
  padding: '4px',
  cursor: 'pointer',
} as const;

export default function PreviousYearManureModal({
  fieldIndex,
  isOpen,
  onClose,
  setFields,
  modalStyle,
  field,
}: PreviousYearManureModalProps) {
  const [nCredit, setNCredit] = useState<number>(field.previousYearManureApplicationNCredit || 0);
  const apiCache = useContext(APICacheContext);
  const calculatedDefaultCredit = useMemo(
    () => calcPrevYearManureApplDefault(field, apiCache.getInitializedResponse('previousyearmanureapplications').data),
    [field, apiCache],
  );
  const isFormValid = useMemo(() => nCredit >= 0, [nCredit]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        previousYearManureApplicationNCredit: nCredit,
        previousYearNCreditUpdated: nCredit !== calculatedDefaultCredit,
      };
      return updatedFields;
    });

    onClose();
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
              value={nCredit}
              onChange={(value) => setNCredit(value)}
              minValue={0}
              step={0.1}
              iconRight={nCredit !== calculatedDefaultCredit ? (
                <button
                  type="button"
                  css={resetButtonStyle}
                  onClick={() => setNCredit(calculatedDefaultCredit)}
                  title={`Reset to calculated value (${calculatedDefaultCredit} lb/ac)`}
                >
                  <LoopIcon />
                </button>
              ) : undefined}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
