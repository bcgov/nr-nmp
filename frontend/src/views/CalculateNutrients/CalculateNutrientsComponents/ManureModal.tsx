/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useState } from 'react';
import { Select } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { APICacheContext } from '@/context/APICacheContext';
import { formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { ModalContent } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';

type AddFertilizerModalProps = {
  initialModalData: NMPFileFieldData | undefined;
  rowEditIndex: number | undefined;
  setFieldList: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onCancel: () => void;
};

export default function FertilizerModal({
  initialModalData,
  // rowEditIndex,
  // setFieldList,
  onCancel,
  ...props
}: AddFertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState({
    fieldName: initialModalData?.FieldName,
    manureType: 0,
  });
  const apiCache = useContext(APICacheContext);

  const [manureTypes, setManureTypes] = useState<
    {
      id: number;
      label: string;
      name: string;
      dryliquid: string;
      custom: boolean;
    }[]
  >([]);

  // get fertilizer types, names, and conversion units
  useEffect(() => {
    apiCache.callEndpoint('api/manuretypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureTypes(data);
      }
    });
  }, [apiCache, manureForm.manureType]);

  const handleSubmit = () => {
    onCancel();
  };

  const handleChange = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];
    setManureForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  return (
    <Modal
      title="Add Manure"
      onOpenChange={() => {}}
      {...props}
    >
      <ModalContent>
        <Form
          onCancel={() => onCancel()}
          onSubmit={() => handleSubmit()}
          isConfirmDisabled={false}
        >
          <Grid
            container
            spacing={2}
          />
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Manure Type"
              placeholder="Select a manure type"
              selectedKey={manureForm?.manureType}
              items={manureTypes}
              onSelectionChange={(e: any) => handleChange(e)}
            />
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
