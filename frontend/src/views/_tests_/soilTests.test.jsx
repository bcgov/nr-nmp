import {
  render, waitFor, screen, fireEvent,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import SoilTests from '../SoilTests/SoilTests';
import SoilTestsModal from '../SoilTests/SoilTestsModal';
import {
  getKelownaRating,
  soilTestCalculation,
} from '../../calculations/FieldAndSoil/SoilTests/Calculations';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

// API cache mocking
const mockSoilTestMethods = [
  {
    id: 1,
    converttokelownaphlessthan72: 2,
    converttokelownaphgreaterthan72: 3,
    converttokelownak: 0.5,
  },
];
const mockNutrientRanges = [
  { id: 1, upperlimit: 10, rating: 'A' },
  { id: 2, upperlimit: 25, rating: 'B' },
  { id: 3, upperlimit: 40, rating: 'C' },
];
jest.mock('../../services/APICache', () => jest.fn().mockImplementation(() => ({
  callEndpoint: jest.fn((ep) => {
    if (ep === 'soiltestmethods') {
      return Promise.resolve({ status: 200, data: mockSoilTestMethods });
    }
    return Promise.resolve({ status: 200, data: [] });
  }),
  getInitializedResponse: jest.fn((ep) => {
    if (ep === 'soiltestphosphorousranges' || ep === 'soiltestpotassiumranges') {
      return { status: 200, data: mockNutrientRanges };
    }
    return { status: 200, data: [] };
  }),
})));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = mockStructuredClone;

const mockNMPFile = {
  ...DEFAULT_NMPFILE,
  years: [
    {
      ...DEFAULT_NMPFILE_YEAR,
      year: '2025',
      fields: [DEFAULT_NMPFILE_FIELD],
    },
  ],
};
const mockSoilTest = {
  soilTestId: 1,
  valNO3H: 5,
  valP: 5,
  valK: 5,
  valPH: 5,
};

it('SoilTests component snapshot test', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: mockNMPFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <SoilTests />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('SoilTestsModal component snapshot test', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: mockNMPFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFields = jest.fn();
  const mockHandleDialogClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  const { baseElement } = render(
    <SoilTestsModal
      initialFormData={undefined}
      currentFieldIndex={0}
      soilTestId={0}
      soilTestMethods={[]}
      setFields={mockSetFields}
      handleDialogClose={mockHandleDialogClose}
    />,
  );

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});

describe('SoilTests calculations', () => {
  it('getKelownaRating', () => {
    expect(getKelownaRating(25, mockNutrientRanges)).toBe('B');
    expect(getKelownaRating(10.1, mockNutrientRanges)).toBe('B');
    expect(getKelownaRating(41, mockNutrientRanges)).toBe('C');
  });

  it('soilTestCalculation', () => {
    expect(
      soilTestCalculation(mockSoilTestMethods, 1, { valP: 5, valPH: 7, valK: 4 }),
    ).toEqual({
      convertedKelownaP: 10,
      convertedKelownaK: 2,
    });
    expect(
      soilTestCalculation(mockSoilTestMethods, 1, { valP: 5, valPH: 7.2, valK: 4 }),
    ).toEqual({
      convertedKelownaP: 15,
      convertedKelownaK: 2,
    });
    expect(
      () => soilTestCalculation(mockSoilTestMethods, 3, { valP: 5, valPH: 7, valK: 4 }),
    ).toThrow();
  });
});

describe('SoilTests component unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows infobox with no soiltest and warning on Next', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: mockNMPFile,
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    await waitFor(() => {
      render(
        <MemoryRouter>
          <SoilTests />
        </MemoryRouter>,
      );
    });

    expect(screen.getByTestId('infobox')).toBeInTheDocument();
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    // Click Continue on warning modal
    const contButton = screen.getByText('Continue');
    fireEvent.click(contButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('no warning on Next with soiltest', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [
            {
              ...DEFAULT_NMPFILE_YEAR,
              year: '2025',
              fields: [{
                ...DEFAULT_NMPFILE_FIELD,
                soilTest: mockSoilTest,
              }],
            },
          ],
        },
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    await waitFor(() => {
      render(
        <MemoryRouter>
          <SoilTests />
        </MemoryRouter>,
      );
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('allows Back without soiltest', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: mockNMPFile,
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    await waitFor(() => {
      render(
        <MemoryRouter>
          <SoilTests />
        </MemoryRouter>,
      );
    });

    const back = screen.getByText('Back');
    fireEvent.click(back);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('deleting a soil test removes it and shows warning on Next', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [
            {
              ...DEFAULT_NMPFILE_YEAR,
              year: '2025',
              fields: [{
                ...DEFAULT_NMPFILE_FIELD,
                soilTest: mockSoilTest,
              }],
            },
          ],
        },
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    await waitFor(() => {
      render(
        <MemoryRouter>
          <SoilTests />
        </MemoryRouter>,
      );
    });

    expect(screen.queryByTestId('infobox')).not.toBeInTheDocument();
    // A test id for the grid didn't work, so this checks for a column header of the grid
    expect(screen.getByText('Sampling Month')).toBeInTheDocument();

    // Delete the soil test
    const delIcon = screen.getByTestId('delete-icon');
    fireEvent.click(delIcon);
    expect(screen.getByText('Soil tests - Delete')).toBeInTheDocument();
    const delButton = screen.getByText('Delete');
    fireEvent.click(delButton);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
