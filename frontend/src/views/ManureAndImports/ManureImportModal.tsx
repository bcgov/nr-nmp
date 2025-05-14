/**
 * @summary This is the Add Animal list Tab
 */
import { ComponentProps, FormEvent, Key, useContext, useEffect, useState } from 'react';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
} from '@/constants';
import { APICacheContext } from '@/context/APICacheContext';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
import {
  formCss,
  modalHeaderStyle,
  modalPaddingStyle,
  formGridBreakpoints,
} from '../../common.styles';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
} from '@/types';

const manureTypeOptions = [
  { label: 'Liquid', id: 1 },
  { label: 'Solid', id: 2 },
];

type ModalComponentProps = {
  initialModalData: NMPFileImportedManureData;
  handleDialogClose: () => void;
  handleSubmit: (formData: NMPFileImportedManureData) => void;
  manuresList: any;
};

export default function ManureImportModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  manuresList,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const apiCache = useContext(APICacheContext);

  const [formData, setFormData] = useState<NMPFileImportedManureData>(initialModalData);
  const [isEditingExistingEntry] = useState<boolean>(!!initialModalData?.UniqueMaterialName);
  // const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);

  useEffect(() => {
    apiCache
      .callEndpoint('api/liquidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setLiquidManureDropdownOptions(data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setSolidManureDropdownOptions(data);
        }
      });
  }, []);

  const notUniqueNameCheck = () => {
    if (isEditingExistingEntry) return false;
    else
      return manuresList.some(
        (ele: NMPFileImportedManureData) => ele.UniqueMaterialName === formData.UniqueMaterialName,
      );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    if (notUniqueNameCheck()) {
      console.log('not unique name');
    } else {
      handleSubmit(formData);
      handleDialogClose();
    }
  };

  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev: NMPFileImportedManureData) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };

  return (
    <Modal {...props}>
      <Dialog
        isCloseable
        role="dialog"
        aria-labelledby="add-animal-dialog"
      >
        <div css={modalPaddingStyle}>
          <span css={modalHeaderStyle}>Add manure</span>
          <Divider
            aria-hidden="true"
            component="div"
            css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
          />
          <Form
            css={formCss}
            onSubmit={onSubmit}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={formGridBreakpoints}>
                <span
                  className={`bcds-react-aria-Select--Label ${notUniqueNameCheck() ? '--error' : ''}`}
                ></span>
                <TextField
                  isRequired
                  label="Material name"
                  name="UniqueMaterialName"
                  value={formData?.UniqueMaterialName}
                  onChange={(e: string) => {
                    handleInputChange('UniqueMaterialName', e);
                  }}
                  maxLength={100}
                />
                {notUniqueNameCheck() && (
                  <span className="--error">Unique material name required</span>
                )}
              </Grid>
              <Grid size={formGridBreakpoints}>
                <Select
                  isRequired
                  label="Manure Type"
                  placeholder="Select manure type"
                  selectedKey={formData?.ManureType}
                  items={manureTypeOptions}
                  onSelectionChange={(e: Key) => {
                    console.log(e);
                    handleInputChange('ManureType', Number(e) ?? '');
                    handleInputChange(
                      'ManureTypeName',
                      manureTypeOptions.find((ele) => ele.id === e)?.label,
                    );
                    // Reset dependent inputs on changes
                    handleInputChange('Units', '');
                    handleInputChange('Moisture', '');
                  }}
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <TextField
                  isRequired
                  label="Amount per year"
                  type="number"
                  name="AnnualAmount"
                  value={formData?.AnnualAmount?.toString()}
                  onChange={(e: string) => {
                    handleInputChange('AnnualAmount', e);
                  }}
                  maxLength={7}
                />
              </Grid>

              {formData.ManureType === 2 && (
                <Grid size={formGridBreakpoints}>
                  <Select
                    isRequired
                    label="Units"
                    placeholder="Select a unit"
                    selectedKey={formData?.Units}
                    items={solidManureDropdownOptions.map((ele) => ({
                      id: ele.id,
                      label: ele.inputunitname ?? '',
                    }))}
                    onSelectionChange={(e: Key) => {
                      handleInputChange('Units', e as number);
                    }}
                  />
                </Grid>
              )}

              {formData.ManureType === 1 && (
                <>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Units"
                      placeholder="Select a unit"
                      selectedKey={formData?.Units}
                      items={liquidManureDropdownOptions.map((ele) => ({
                        id: ele.id,
                        label: ele.inputunitname ?? '',
                      }))}
                      onSelectionChange={(e: Key) => {
                        handleInputChange('Units', e as number);
                      }}
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <TextField
                      isRequired
                      label="Moisture (%)"
                      type="number"
                      name="Moisture"
                      value={formData?.Moisture}
                      onChange={(e: string) => {
                        handleInputChange('Moisture', e);
                      }}
                      maxLength={7}
                    />
                  </Grid>
                </>
              )}
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
                onPress={handleDialogClose}
                aria-label="reset"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                aria-label="submit"
              >
                Confirm
              </Button>
            </ButtonGroup>
          </Form>
        </div>
      </Dialog>
    </Modal>
  );
}
