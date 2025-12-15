import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import DEFAULT_NMPFILE_CROPS from '../../constants/DefaultNMPFileCropsData';
import CalculateNutrients from '../CalculateNutrients/CalculateNutrients';
import { FieldListModal } from '../../components/common';
import FertilizerModal from '../CalculateNutrients/CalculateNutrientsComponents/FertilizerModal';
import FertigationModal from '../CalculateNutrients/CalculateNutrientsComponents/FertigationModal/FertigationModal';
import OtherModal from '../CalculateNutrients/CalculateNutrientsComponents/OtherModal';

const res = { status: 200, data: [] };
const conversionFactors = {
  status: 200,
  data: [
    {
      kilogramperhectaretopoundperacreconversion: 0.892176122,
      poundper1000ftsquaredtopoundperacreconversion: 43.56000216,
    },
  ],
};
jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve(res)),
    // Returning different objects was causing infinite recursions
    getInitializedResponse: jest.fn((s) =>
      s === 'cropsconversionfactors' ? conversionFactors : res,
    ),
  })),
);

// Set a constant for the data-id so the snapshot is consistent
global.crypto.randomUUID = () => '916859ed-1272-4863-a935-803debaa2d08';

const nmpFile = {
  ...DEFAULT_NMPFILE,
  years: [
    {
      ...DEFAULT_NMPFILE_YEAR,
      year: '2025',
      fields: [
        {
          ...DEFAULT_NMPFILE_FIELD,
          crops: [{ ...DEFAULT_NMPFILE_CROPS, reqN: -99, reqP2o5: -44 }],
        },
      ],
    },
  ],
};

it('Calculate Nutrients is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  let asFragment;
  await waitFor(() => {
    const r = render(
      <MemoryRouter>
        <CalculateNutrients />
      </MemoryRouter>,
    );
    asFragment = r.asFragment;
  });

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('Field modal on Calculate Nutrients is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFieldList = jest.fn();
  const mockSetNameIsUnique = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <FieldListModal
        mode="Duplicate Field"
        setFieldList={mockSetFieldList}
        isFieldNameUnique={mockSetNameIsUnique}
        isOpen
        onClose={mockOnClose}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});

const balanceRow = {
  name: '',
  reqN: 5,
  reqP2o5: 5,
  reqK2o: 5,
  remN: 5,
  remP2o5: 5,
  remK2o: 5,
};

it('Fertilizer modal is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFieldList = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  waitFor(() => {
    const r = render(
      <FertilizerModal
        fieldIndex={0}
        setFields={mockSetFieldList}
        balanceRow={balanceRow}
        isOpen
        onClose={mockOnClose}
        modalStyle={{ width: '800px' }}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});

it('Fertigation modal is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFieldList = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <FertigationModal
        fieldIndex={0}
        balanceRow={balanceRow}
        field={DEFAULT_NMPFILE_FIELD}
        setFields={mockSetFieldList}
        isOpen
        onClose={mockOnClose}
        modalStyle={{ minWidth: '950px', overflowY: 'auto' }}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});

it('Other modal is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFieldList = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <OtherModal
        fieldIndex={0}
        setFields={mockSetFieldList}
        isOpen
        onClose={mockOnClose}
        modalStyle={{ width: '700px' }}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});
