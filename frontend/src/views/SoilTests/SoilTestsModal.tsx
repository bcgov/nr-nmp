import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '../../common.styles';
import { Form, Modal, NumberField } from '../../components/common';
import { NMPFileFieldData, NMPFileSoilTestData, SelectOption, SoilTestMethodsData } from '@/types';
import { StyledDatePicker } from './soilTests.styles';

type SoilModalProps = {
  initialFormData?: Omit<NMPFileSoilTestData, 'soilTestId'>;
  currentFieldIndex: number;
  soilTestId: number;
  soilTestMethods: SelectOption<SoilTestMethodsData>[];
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  handleDialogClose: () => void;
};

export default function SoilTestsModal({
  initialFormData,
  currentFieldIndex,
  soilTestId,
  soilTestMethods,
  setFields,
  handleDialogClose,
}: SoilModalProps) {
  const [formData, setFormData] = useState<Omit<NMPFileSoilTestData, 'soilTestId'>>(
    initialFormData || {},
  );

  const handleFormFieldChange = (changes: Partial<Omit<NMPFileSoilTestData, 'soilTestId'>>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const handleFormFieldSubmit = () => {
    // Calculate convertedKelownaP directly
    const lessThan72 = soilTestMethods.find((method) => method.id === soilTestId)?.value
      .converttokelownaphlessthan72;
    const greaterThan72 = soilTestMethods.find((method) => method.id === soilTestId)?.value
      .converttokelownaphgreaterthan72;

    let convertedKelownaP = formData.valP!;

    if (formData.valP! < 7.2 && lessThan72 !== undefined) {
      convertedKelownaP = formData.valP! * lessThan72;
    } else if (formData.valPH! >= 7.2 && greaterThan72 !== undefined) {
      convertedKelownaP = formData.valP! * greaterThan72;
    }

    // Calculate converted Kelowna K value (if you need it)
    const convertedKelownaK =
      soilTestMethods.find((method) => method.id === soilTestId)?.value.converttokelownak !==
      undefined
        ? formData.valK! *
          soilTestMethods.find((method) => method.id === soilTestId)!.value.converttokelownak
        : formData.valK!;

    setFormData((prev) => ({
      ...prev,
      convertedKelownaP,
      convertedKelownaK,
    }));

    setFields((prev) => {
      const newList = [...prev];
      if (currentFieldIndex !== null)
        newList[currentFieldIndex].SoilTest = { ...formData, soilTestId };
      return newList;
    });
    handleDialogClose();
  };

  return (
    <Modal
      onOpenChange={handleDialogClose}
      title="Add Field"
      isOpen
    >
      <Form
        onCancel={handleDialogClose}
        onConfirm={handleFormFieldSubmit}
        id="modal-form"
      >
        <Grid
          container
          spacing={1}
        >
          <Grid size={formGridBreakpoints}>
            <span className="bcds-react-aria-Select--Label">Sample Month</span>
            <div css={{ label: { margin: '0' } }}>
              <StyledDatePicker>
                <ReactDatePicker
                  selected={formData.sampleDate ? new Date(formData.sampleDate) : undefined}
                  onChange={(e: Date) => {
                    handleFormFieldChange({ sampleDate: e.toISOString() });
                  }}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  wrapperClassName="monthPicker"
                  form="modal-form"
                  required
                />
              </StyledDatePicker>
            </div>
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="NO3-N (ppm), nitrate-nitrogen"
              value={formData.valNO3H}
              onChange={(e) => handleFormFieldChange({ valNO3H: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="P (ppm), phosphorus"
              value={formData.valP}
              onChange={(e) => handleFormFieldChange({ valP: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="K (ppm), potassium"
              value={formData.valK}
              onChange={(e) => handleFormFieldChange({ valK: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="pH"
              value={formData.valPH}
              onChange={(e) => handleFormFieldChange({ valPH: e })}
              minValue={0}
              maxValue={14}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
