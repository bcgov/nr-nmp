import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import FieldList from '../FieldList/FieldList';
import { FieldListModal } from '../../components/common';
import { FARM_INFORMATION, NUTRIENT_ANALYSIS, SOIL_TESTS } from '../../constants/routes';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
    getInitializedResponse: jest.fn(() => ({ status: 200, data: [] })),
  })),
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const nmpFile = {
  ...DEFAULT_NMPFILE,
  years: [
    {
      ...DEFAULT_NMPFILE_YEAR,
      year: '2025',
      fields: [
        {
          ...DEFAULT_NMPFILE_FIELD,
        },
      ],
    },
  ],
};

// Set a constant for the data-id so the snapshot is consistent
global.crypto.randomUUID = () => '916859ed-1272-4863-a935-803debaa2d08';

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = () => mockStructuredClone();

it('FieldList is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <FieldList />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('Field modal on Field List is correct', async () => {
  const mockSetFieldList = jest.fn();
  const mockSetNameIsUnique = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <FieldListModal
        mode="Add Field"
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

describe('FieldList navigation tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('FieldList allows Next if a field is defined', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile,
        showAnimalsStep: false,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FieldList />
      </MemoryRouter>,
    );

    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(SOIL_TESTS);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SAVE_FIELDS' }));
  });

  it('FieldList does not allow Next without fields', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [
            {
              ...DEFAULT_NMPFILE_YEAR,
              year: '2025',
              fields: [],
            },
          ],
        },
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    render(
      <MemoryRouter>
        <FieldList />
      </MemoryRouter>,
    );

    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('FieldList allows Back without fields', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [
            {
              ...DEFAULT_NMPFILE_YEAR,
              year: '2025',
              fields: [],
            },
          ],
        },
        showAnimalsStep: false,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FieldList />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(FARM_INFORMATION);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('FieldList Back has different redirect if showAnimalsStep is true', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile,
        showAnimalsStep: true,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FieldList />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(NUTRIENT_ANALYSIS);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SAVE_FIELDS' }));
  });
});

describe('FieldListModal unit tests', () => {
  it('Saves field properly', async () => {
    const mockSetFieldList = jest.fn((func) => func([]));
    const mockSetNameIsUnique = jest.fn(() => true);
    const mockOnClose = jest.fn();

    await waitFor(() => {
      render(
        <FieldListModal
          // I give up on figuring out the select
          initialModalData={{ ...DEFAULT_NMPFILE_FIELD, previousYearManureApplicationId: 1 }}
          mode="Add Field"
          setFieldList={mockSetFieldList}
          isFieldNameUnique={mockSetNameIsUnique}
          isOpen
          onClose={mockOnClose}
        />,
      );
    });

    const firstInput = screen.getByLabelText('Field Name (required)');
    fireEvent.change(firstInput, { target: { value: 'Farm' } });
    // Skipping the NumberField and Select
    const fourthInput = screen.getByLabelText('Comments (optional)');
    fireEvent.change(fourthInput, { target: { value: 'Bananas' } });
    const confirm = screen.getByText('Confirm');
    fireEvent.click(confirm);
    expect(mockSetFieldList).toHaveReturnedWith([
      {
        fieldName: 'Farm',
        area: 1,
        previousYearManureApplicationId: 1,
        comment: 'Bananas',
        soilTest: undefined,
        crops: [],
        fertilizers: [],
        fertigations: [],
        otherNutrients: [],
        manures: [],
        previousYearManureApplicationNCredit: undefined,
        soilNitrateCredit: undefined,
      },
    ]);
  });
});
