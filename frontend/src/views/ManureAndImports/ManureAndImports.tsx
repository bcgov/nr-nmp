/* eslint-disable eqeqeq */
/* eslint-disable object-shorthand */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  NMPFile,
} from '@/types';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
} from '@/constants';
import { Button, Modal, InputField, Dropdown } from '@/components/common';
import { getDensityFactoredConversionUsingMoisture } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import {
  ContentWrapper,
  ButtonContainer,
  ButtonWrapper,
  ErrorText,
  Header,
  Column,
  ListItem,
  ListItemContainer,
} from './manureAndImports.styles';
import useAppService from '@/services/app/useAppService';
import ViewCard from '@/components/common/ViewCard/ViewCard';
import { CROPS, NUTRIENT_ANALYSIS } from '@/constants/RouteConstants';
import { initManures, saveManuresToFile } from '@/utils/utils';

const manureTypeOptions = [
  { label: 'Select', value: 0 },
  { label: 'Liquid', value: 1 },
  { label: 'Solid', value: 2 },
];

export default function ManureAndImports() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [manures, setManures] = useState<NMPFileImportedManureData[]>(initManures(state));
  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);
  const [manureFormData, setManureFormData] =
    useState<NMPFileImportedManureData>(DefaultManureFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManureFormData({ ...manureFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setManureFormData(manures[index]);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedManures = manures.filter((_, i) => i !== index);
    setManures(updatedManures);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!manureFormData.MaterialName?.trim()) {
      newErrors.FieldName = 'Field Name is required';
    } else if (
      manures.some(
        (manure, index) =>
          manure.MaterialName?.trim().toLowerCase() ===
            (manureFormData.MaterialName ?? '').trim().toLowerCase() && index !== editIndex,
      )
    ) {
      newErrors.FieldName = 'Material Name must be unique';
    }

    if (!manureFormData.ManureTypeName || manureFormData.ManureTypeName === '0') {
      newErrors.ManureTypeName = 'Manure Type is required';
    }

    if (!manureFormData.AnnualAmount || manureFormData.AnnualAmount <= 0) {
      newErrors.AnnualAmount = 'Annual Amount is required';
    }

    if (!manureFormData.Units) {
      newErrors.Units = 'Units is required';
    }

    if (manureFormData.ManureTypeName === '2' && !manureFormData.Moisture) {
      newErrors.Moisture = 'Moisture is required';
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    let updatedManureFormData = {};

    if (manureFormData.ManureTypeName === '1') {
      const liquidManureConversionFactor = liquidManureDropdownOptions.find(
        (item) => item.inputunit == manureFormData.Units,
      );

      const annualAmountUSGallonsVolume =
        (manureFormData.AnnualAmount ?? 0) *
        (liquidManureConversionFactor?.usgallonsoutput
          ? parseFloat(liquidManureConversionFactor.usgallonsoutput)
          : 0);

      updatedManureFormData = {
        ...manureFormData,
        AnnualAmountUSGallonsVolume: annualAmountUSGallonsVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountUSGallonsVolume * 10) / 10).toString()} U.S. gallons`,
      };
    } else if (manureFormData.ManureTypeName === '2') {
      const solidManureConversionFactor = solidManureDropdownOptions.find(
        (item) => item.inputunit == manureFormData.Units,
      );

      const annualAmountCubicMetersVolume =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.cubicmetersoutput || '',
        );

      const annualAmountCubicYardsVolume =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.cubicyardsoutput || '',
        );

      const annualAmountTonsWeight =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.metrictonsoutput || '',
        );

      updatedManureFormData = {
        ...manureFormData,
        AnnualAmountCubicYardsVolume: annualAmountCubicYardsVolume,
        AnnualAmountCubicMetersVolume: annualAmountCubicMetersVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountCubicYardsVolume * 10) / 10).toString()} yards³ (${Math.round((annualAmountCubicMetersVolume * 10) / 10).toString()} m³)`,
        AnnualAmountDisplayWeight: `${Math.round((annualAmountTonsWeight * 10) / 10).toString()} tons`,
      };
    }

    if (editIndex !== null) {
      const updatedManures = manures.map((manure, index) =>
        index === editIndex ? updatedManureFormData : manure,
      );
      setManures(updatedManures);
      setEditIndex(null);
    } else {
      setManures([...manures, updatedManureFormData]);
    }
    setManureFormData(DefaultManureFormData);
    setIsModalVisible(false);
  };

  const handleAddManure = () => {
    setManureFormData(DefaultManureFormData);
    setIsModalVisible(true);
  };

  const handlePrevious = () => {
    // TODO: Add a check to see if this is the animal flow
    // If so, navigate to ADD_ANIMALS instead
    navigate(CROPS);
  };

  const handleNext = () => {
    saveManuresToFile(manures, state.nmpFile, setNMPFile);
    navigate(NUTRIENT_ANALYSIS);
  };

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

  useEffect(() => {
    setProgressStep(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ViewCard
      height="700px"
      handlePrevious={handlePrevious}
      handleNext={handleNext}
    >
      <ButtonContainer hasManure={manures.length > 0}>
        <Button
          text="Add Manure"
          handleClick={handleAddManure}
          aria-label="Add Imported Manure"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </ButtonContainer>
      <ContentWrapper hasManure={manures.length > 0}>
        {manures.length > 0 && (
          <Header>
            <Column>Material Type</Column>
            <Column>Annual Amount (Volume)</Column>
            <Column>Annual Amount (Weight)</Column>
            <Column>Stored</Column>
            <Column align="right">Actions</Column>
          </Header>
        )}
        {manures.map((manure, index) => (
          <ListItemContainer key={manure.MaterialName}>
            <ListItem>
              {manure.MaterialName} {manure.ManureTypeName === '1' ? '(Liquid)' : '(Solid)'}
            </ListItem>
            <ListItem>{manure.AnnualAmountDisplayVolume}</ListItem>
            <ListItem>{manure.AnnualAmountDisplayWeight}</ListItem>
            <ListItem>{manure.IsMaterialStored ? 'Yes' : 'No'}</ListItem>
            <ListItem align="right">
              <button
                type="button"
                onClick={() => handleEdit(index)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </ListItem>
          </ListItemContainer>
        ))}
      </ContentWrapper>
      <Modal
        isVisible={isModalVisible}
        title={editIndex !== null ? 'Edit Field' : 'Add Field'}
        onClose={() => setIsModalVisible(false)}
        footer={
          <>
            <ButtonWrapper>
              <Button
                text="Cancel"
                handleClick={() => setIsModalVisible(false)}
                aria-label="Cancel"
                variant="secondary"
                size="sm"
                disabled={false}
              />
            </ButtonWrapper>
            <ButtonWrapper>
              <Button
                text="Submit"
                handleClick={handleSubmit}
                aria-label="Submit"
                variant="primary"
                size="sm"
                disabled={false}
              />
            </ButtonWrapper>
          </>
        }
      >
        {errors.FieldName && <ErrorText>{errors.FieldName}</ErrorText>}
        <InputField
          label="Material Name"
          type="text"
          name="MaterialName"
          value={manureFormData.MaterialName || ''}
          onChange={handleChange}
        />
        {errors.ManureTypeName && <ErrorText>{errors.ManureTypeName}</ErrorText>}
        <Dropdown
          label="Manure Type"
          name="ManureTypeName"
          value={manureFormData.ManureTypeName || ''}
          options={manureTypeOptions}
          onChange={handleChange}
        />
        {errors.AnnualAmount && <ErrorText>{errors.AnnualAmount}</ErrorText>}
        <InputField
          label="Amount per year"
          type="text"
          name="AnnualAmount"
          value={(manureFormData.AnnualAmount ?? 0).toString() || ''}
          onChange={handleChange}
        />
        {manureFormData.ManureTypeName === '1' ? (
          <>
            {errors.Units && <ErrorText>{errors.Units}</ErrorText>}
            <Dropdown
              label="Units"
              name="Units"
              value={manureFormData.Units || ''}
              options={liquidManureDropdownOptions.map((manure) => ({
                value: manure.inputunit ?? 0,
                label: manure.inputunitname ?? '',
              }))}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            {errors.Units && <ErrorText>{errors.Units}</ErrorText>}

            <Dropdown
              label="Units"
              name="Units"
              value={manureFormData.Units || ''}
              options={solidManureDropdownOptions.map((manure) => ({
                value: manure.inputunit ?? 0,
                label: manure.inputunitname ?? '',
              }))}
              onChange={handleChange}
            />
          </>
        )}
        {manureFormData.ManureTypeName === '2' && (
          <>
            {errors.Moisture && <ErrorText>{errors.Moisture}</ErrorText>}
            <InputField
              label="Moisture (%)"
              type="text"
              name="Moisture"
              value={manureFormData.Moisture || ''}
              onChange={handleChange}
            />
          </>
        )}
      </Modal>
    </ViewCard>
  );
}
