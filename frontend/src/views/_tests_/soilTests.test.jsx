import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import SoilTests from '../SoilTests/SoilTests';
import SoilTestsModal from '../SoilTests/SoilTestsModal';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
    getInitializedResponse: jest.fn(() => ({ status: 200, data: [] })),
  })),
);

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = () => mockStructuredClone();

it('SoilTests is correct', async () => {
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

it('SoilTestsModal is correct', async () => {
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
