/**
 * @summary This is the Add Animal list Tab
 */
import { ComponentProps, FormEvent, Key, useContext, useEffect, useState } from 'react';
import { APICacheContext } from '@/context/APICacheContext';
import manureTypeOptions from '@/constants/ManureTypeOptions';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  Select,
  Checkbox,
  TextField,
} from '@bcgov/design-system-react-components';
import {
  formCss,
  modalHeaderStyle,
  modalPaddingStyle,
  formGridBreakpoints,
} from '../../common.styles';
import { DAIRY_COW_ID, MILKING_COW_ID } from '../AddAnimals/types';
// import { AnimalData, initialEmptyData } from './types';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
} from '@/types';

// need a row id
type tempManureData = NMPFileImportedManureData & { id?: string };

const animalOptions = [
  { id: '1', label: 'Beef Cattle' },
  { id: '2', label: 'Dairy Cattle' },
];

type ModalComponentProps = {
  initialModalData: tempManureData;
  handleDialogClose: () => void;
  handleSubmit: (formData: tempManureData) => void;
};

interface DairyCattleBreed {
  id: number;
  breedname: string;
  breedmanurefactor: number;
}

export default function ManureImportModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const apiCache = useContext(APICacheContext);

  const [formData, setFormData] = useState<tempManureData>(initialModalData);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(false);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  // only run on initial mount
  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const sOptions: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
        setSubtypeOptions(sOptions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [breedOptions, setBreedOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const subtypeOptionz: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
        setSubtypeOptions(subtypeOptionz);
      }
    });

    apiCache.callEndpoint('api/breeds/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const breedz: DairyCattleBreed[] = (data as DairyCattleBreed[]).map((row) => ({
          id: row.id,
          breedname: row.breedname,
          breedmanurefactor: row.breedmanurefactor,
        }));
        // setBreeds(breedz);
        const breedOptionz = breedz.map((breed) => ({
          id: breed.id.toString(),
          label: breed.breedname,
        }));
        setBreedOptions(breedOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();
    handleSubmit(formData);
  };

  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev: tempManureData) => {
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
                <TextField
                  isRequired
                  label="Manure name"
                  type="number"
                  name="animalsPerFarm"
                  value={formData?.UniqueMaterialName}
                  onChange={(e: string) => {
                    handleInputChange('UniqueMaterialName', e);
                  }}
                  maxLength={100}
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <Select
                  isRequired
                  label="Cattle Type"
                  placeholder="Select a cattle type"
                  // selectedKey={formData?.subtype}
                  items={subtypeOptions}
                  onSelectionChange={(e: Key) => {
                    handleInputChange('subtype', e?.toString());
                  }}
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <TextField
                  isRequired
                  label="Average Animal Number on Farm"
                  type="number"
                  name="animalsPerFarm"
                  // value={formData?.animalsPerFarm?.toString()}
                  onChange={(e: string) => {
                    handleInputChange('animalsPerFarm', e);
                  }}
                  maxLength={7}
                />
              </Grid>
              <Grid size={12}>
                <Checkbox
                  isSelected={showCollectionDays}
                  onChange={setShowCollectionDays}
                >
                  Do you pile or collect manure from these animals?
                </Checkbox>
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
