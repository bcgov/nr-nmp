import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import DEFAULT_SOIL_TEST from '../../constants/DefaultNMPFileSoilTest';
import SoilTests from '../SoilTests/SoilTests';
import SoilTestsModal from '../SoilTests/SoilTestsModal';
import soilTestCalculation from '../../calculations/FieldAndSoil/SoilTests/Calculations';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: [
          {
            id: 1,
            name: 'A and L Canada (Bray-1 and Mehlich 3)',
          },
          {
            id: 2,
            name: 'AGAT (Mod Bray-1 and Amm Acetate)',
          },
        ],
      }),
    ),
    getInitializedResponse: jest.fn(() => ({ status: 200, data: [] })),
  })),
);

// mock soilTestCalculation
jest.mock('../../calculations/FieldAndSoil/SoilTests/Calculations', () => ({
  __esModule: true,
  soilTestCalculation: jest.fn(() => ({
    soilTestMethods: {
      id: 1,
      name: 'A and L Canada (Bray-1 and Mehlich 3)',
    },
    soilTestId: 1,
    soilTestData: DEFAULT_SOIL_TEST,
  })),
}));

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = () => mockStructuredClone();

// Snapshot test for SoilTests
it('renders correctly', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: {
        ...DEFAULT_NMPFILE,
        years: [{ ...DEFAULT_NMPFILE_YEAR, year: '2025', fields: [DEFAULT_NMPFILE_FIELD] }],
      },
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

// Snapshot test for SoilTestsModal
it('renders soil tests modal', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: {
        ...DEFAULT_NMPFILE,
        years: [{ ...DEFAULT_NMPFILE_YEAR, year: '2025', fields: [DEFAULT_NMPFILE_FIELD] }],
      },
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

// unit test
describe('Buttons perform correct functions', () => {
  it('selects a soil test method and recalculates soil tests if method changed', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [{ ...DEFAULT_NMPFILE_YEAR, year: '2025', fields: [DEFAULT_NMPFILE_FIELD] }],
        },
        showAnimalsStep: false,
      },
      dispatch: jest.fn(),
    }));

    render(
      <MemoryRouter>
        <SoilTests />
      </MemoryRouter>,
    );

    // get soil test selection option
    await waitFor(() => {
      expect(mockUseAppService).toHaveBeenCalled();
    });

    const user = userEvent.setup();
    const selectElement = screen.getByLabelText('Select the lab used (soil test methods)');
    await user.click(selectElement);
    await user.selectOptions(selectElement, '1');
    expect(soilTestCalculation).toHaveBeenCalledTimes(1);

    const selectAnotherElement = screen.getByLabelText('Select the lab used (soil test methods)');
    await user.click(selectAnotherElement);
    await user.selectOptions(selectAnotherElement, '2');
    expect(soilTestCalculation).toHaveBeenCalledTimes(2);
  });
});
