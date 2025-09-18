import React, { useMemo, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '../../common.styles';
import { Form, Modal, NumberField } from '../../components/common';
import { NMPFileField, NMPFileSoilTest, SelectOption, SoilTestMethods } from '@/types';
import { StyledDatePicker } from './soilTests.styles';

type SoilModalProps = {
  initialFormData?: Omit<NMPFileSoilTest, 'soilTestId'>;
  currentFieldIndex: number;
  soilTestId: number;
  soilTestMethods: SelectOption<SoilTestMethods>[];
  setFields: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
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
  const [formData, setFormData] = useState<Omit<NMPFileSoilTest, 'soilTestId'>>(
    initialFormData || {},
  );

  const formDataDate = useMemo(
    () => (formData?.sampleDate ? new Date(formData.sampleDate) : undefined),
    [formData?.sampleDate],
  );

  const handleFormFieldChange = (changes: Partial<Omit<NMPFileSoilTest, 'soilTestId'>>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const handleFormFieldSubmit = () => {
    // Calculate convertedKelownaP directly
    const lessThan72 = soilTestMethods.find((method) => method.id === soilTestId)?.value
      .converttokelownaphlessthan72;
    const greaterThan72 = soilTestMethods.find((method) => method.id === soilTestId)?.value
      .converttokelownaphgreaterthan72;

    let convertedKelownaP = formData.valP!;

    if (formData.valPH! < 7.2 && lessThan72 !== undefined) {
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

    setFormData((prevFormData) => {
      const newFormData = {
        ...prevFormData,
        convertedKelownaP,
        convertedKelownaK,
      };

      setFields((prevFields) => {
        const newList = [...prevFields];
        if (currentFieldIndex !== null)
          newList[currentFieldIndex].soilTest = { ...newFormData, soilTestId };
        return newList;
      });
      return newFormData;
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
                  selected={formDataDate}
                  onChange={(e) => {
                    handleFormFieldChange({ sampleDate: e ? e.toISOString() : undefined });
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
              label="NO₃-N (ppm), nitrate-nitrogen"
              value={formData.valNO3H}
              onChange={(e) => handleFormFieldChange({ valNO3H: e })}
              step={1}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="P (ppm), phosphorus"
              value={formData.valP}
              onChange={(e) => handleFormFieldChange({ valP: e })}
              step={1}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="K (ppm), potassium"
              value={formData.valK}
              onChange={(e) => handleFormFieldChange({ valK: e })}
              step={1}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="pH"
              value={formData.valPH}
              onChange={(e) => handleFormFieldChange({ valPH: e })}
              maxValue={14}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
