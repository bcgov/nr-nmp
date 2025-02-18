/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Dropdown, InputField, Button, Modal, RadioButton } from '../../../components/common';
import {
  ContentWrapper,
  Column,
  ListItemContainer,
  ListItem,
  ButtonContainer,
  Header,
  ButtonWrapper,
} from './nutrientAnalsysis.styles';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { DropdownWrapper } from '@/components/common/Dropdown/dropdown.styles';
import { RadioButtonWrapper } from '@/components/common/RadioButton/radioButton.styles';

interface ManureListProps {
  manures: NMPFileImportedManureData[];
}

interface NutrientAnalysisForm {
  ManureName: string;
  MaterialType: string;
  BookLab: string;
  MaterialName: string;
  Nutrients: { Moisture: number; N: number; P: number; K: number };
}

export default function NutrientAnalysis({ manures }: ManureListProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nutrientAnalysisFormData, setNutrientAnalysisFormData] = useState<NutrientAnalysisForm[]>(
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNutrientAnalysisFormData({ ...nutrientAnalysisFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setNutrientAnalysisFormData(nutrientAnalysisFormData[index]); // Fix here
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedAnalysis = nutrientAnalysisFormData.filter((_, i) => i !== index);
    setNutrientAnalysisFormData(updatedAnalysis);
  };

  const handleSubmit = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {/* table with source of Material, material type, moisture, N, P, K, edit and delete button */}
      <ContentWrapper hasAnalysis={nutrientAnalysisFormData.length > 0}>
        {nutrientAnalysisFormData.length > 0 && (
          <Header>
            <Column>Source of Material</Column>
            <Column>Material Type</Column>
            <Column>Moisture(%)</Column>
            <Column>N(%)</Column>
            <Column>P(%)</Column>
            <Column>K(%)</Column>
            <Column align="right">Actions</Column>
          </Header>
        )}
        {nutrientAnalysisFormData.map((NAnalysis, index) => (
          <ListItemContainer key={NAnalysis.MaterialName}>
            <ListItem>{NAnalysis.MaterialType}</ListItem>
            <ListItem>{NAnalysis.Nutrients.Moisture}</ListItem>
            <ListItem>{NAnalysis.Nutrients.N}</ListItem>
            <ListItem>{NAnalysis.Nutrients.P}</ListItem>
            <ListItem>{NAnalysis.Nutrients.K}</ListItem>
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
      <ButtonContainer>
        {/* button to add a nutrient analysis if there are manures to add it to */}
        <Button
          variant="default"
          size="sm"
          disabled={manures.length === 0}
          text="Add a Nutrient Analysis"
          handleClick={() => setIsModalVisible(true)}
        />
      </ButtonContainer>
      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add Nutrient Analysis"
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
        <div />
        <DropdownWrapper>
          {/* // modal has "Source of Material" dropdown which maps manures input */}
          {/* <Dropdown
            label="Source of Material"
            name="Source of Material"
            value={nutrientAnalysisFormData.MaterialType}
            options={[]}
            onChange={handleChange}
          /> */}
          {/* // material type dropdown is this a db to get? */}
          <Dropdown
            label="Material Type"
            name="MaterialType"
            value={nutrientAnalysisFormData.MaterialType}
            options={[]}
            onChange={handleChange}
          />
        </DropdownWrapper>
        <RadioButtonWrapper>
          {/* // radio button "Book Value" and "Lab Analysis" auto sleected based on material type */}
          <RadioButton
            label={''}
            name={''}
            value={''}
            checked={false}
            onChange={handleChange}
          />
        </RadioButtonWrapper>
        {/* 
          // Book value

          // Lab Analysis
          // material name Custom - material tye here
          // turns nutrient values into inputs

          // Moisture, N, NH4-N, P, K
          // N03-N for lab analysis
        */}
      </Modal>
    </div>
  );
}

// const initialFieldFormData = {
//   FieldName: '',
//   Area: '',
//   PreviousYearManureApplicationFrequency: '0',
//   Comment: '',
//   SoilTest: {},
//   Crops: [],
// };

// export default function FieldList({ fields, setFields }: FieldListProps) {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editIndex, setEditIndex] = useState<number | null>(null);
//   const [fieldFormData, setFieldFormData] = useState<NMPFileFieldData>(initialFieldFormData);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFieldFormData({ ...fieldFormData, [name]: value });
//   };


//   const validate = () => {
//     const newErrors: { [key: string]: string } = {};
//     if (!fieldFormData.FieldName.trim()) {
//       newErrors.FieldName = 'Field Name is required';
//     } else if (
//       fields.some(
//         (field, index) =>
//           field.FieldName.trim().toLowerCase() === fieldFormData.FieldName.trim().toLowerCase() &&
//           index !== editIndex,
//       )
//     ) {
//       newErrors.FieldName = 'Field Name must be unique';
//     }
//     if (!fieldFormData.Area.trim() || Number.isNaN(Number(fieldFormData.Area))) {
//       newErrors.Area = 'Area is required and must be a number';
//     }
//     if (fieldFormData.PreviousYearManureApplicationFrequency === '0') {
//       newErrors.PreviousYearManureApplicationFrequency =
//         'Please select a manure application frequency';
//     }
//     return newErrors;
//   };

//   const handleSubmit = () => {
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     setErrors({});
//     if (editIndex !== null) {
//       const updatedFields = fields.map((field, index) =>
//         index === editIndex ? fieldFormData : field,
//       );
//       setFields(updatedFields);
//       setEditIndex(null);
//     } else {
//       setFields([...fields, fieldFormData]);
//     }
//     setFieldFormData(initialFieldFormData);
//     setIsModalVisible(false);
//   };

//   const filteredFields = fields.filter((field) => field.FieldName.trim() !== '');

//   return (
//     <div>
//       <ButtonContainer hasFields={filteredFields.length > 0}>
//         <Button
//           text="Add Field"
//           handleClick={() => setIsModalVisible(true)}
//           aria-label="Add Field"
//           variant="primary"
//           size="sm"
//           disabled={false}
//         />
//       </ButtonContainer>
//       <ContentWrapper hasFields={filteredFields.length > 0}>
//         {filteredFields.length > 0 && (
//           <Header>
//             <Column>Field Name</Column>
//             <Column>Area</Column>
//             <Column>Comments</Column>
//             <Column align="right">Actions</Column>
//           </Header>
//         )}
//         {filteredFields.map((field, index) => (
//           <ListItemContainer key={field.FieldName}>
//             <ListItem>{field.FieldName}</ListItem>
//             <ListItem>{field.Area}</ListItem>
//             <ListItem>{field.Comment}</ListItem>
//             <ListItem align="right">
//               <button
//                 type="button"
//                 onClick={() => handleEdit(index)}
//               >
//                 <FontAwesomeIcon icon={faEdit} />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleDelete(index)}
//               >
//                 <FontAwesomeIcon icon={faTrash} />
//               </button>
//             </ListItem>
//           </ListItemContainer>
//         ))}
//       </ContentWrapper>
//       <Modal
//         isVisible={isModalVisible}
//         title={editIndex !== null ? 'Edit Field' : 'Add Field'}
//         onClose={() => setIsModalVisible(false)}
//         footer={
//           <>
//             <ButtonWrapper>
//               <Button
//                 text="Cancel"
//                 handleClick={() => setIsModalVisible(false)}
//                 aria-label="Cancel"
//                 variant="secondary"
//                 size="sm"
//                 disabled={false}
//               />
//             </ButtonWrapper>
//             <ButtonWrapper>
//               <Button
//                 text="Submit"
//                 handleClick={handleSubmit}
//                 aria-label="Submit"
//                 variant="primary"
//                 size="sm"
//                 disabled={false}
//               />
//             </ButtonWrapper>
//           </>
//         }
//       >
//         {errors.FieldName && <ErrorText>{errors.FieldName}</ErrorText>}
//         <InputField
//           label="Field Name"
//           type="text"
//           name="FieldName"
//           value={fieldFormData.FieldName}
//           onChange={handleChange}
//         />
//         {errors.Area && <ErrorText>{errors.Area}</ErrorText>}
//         <InputField
//           label="Area"
//           type="text"
//           name="Area"
//           value={fieldFormData.Area}
//           onChange={handleChange}
//         />
//         {errors.PreviousYearManureApplicationFrequency && (
//           <ErrorText>{errors.PreviousYearManureApplicationFrequency}</ErrorText>
//         )}
//         <Dropdown
//           label="Manure application in previous years"
//           name="PreviousYearManureApplicationFrequency"
//           value={fieldFormData.PreviousYearManureApplicationFrequency}
//           options={manureOptions}
//           onChange={handleChange}
//         />
//         <InputField
//           label="Comments (optional)"
//           type="text"
//           name="Comment"
//           value={fieldFormData.Comment}
//           onChange={handleChange}
//         />
//       </Modal>
//     </div>
//   );
// }

