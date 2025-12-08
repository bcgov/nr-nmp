import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import { DEFAULT_NMPFILE_FIELD } from '../../constants/DefaultNMPFileField';
import ManureAndImports from '../ManureAndImports/ManureAndImports';
import ManureImportModal from '../ManureAndImports/ManureImportModal';

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

it('ManureAndImports is correct', async () => {
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
      <ManureAndImports />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('ManureImportModal is correct', async () => {
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
  const mockHandleDialogClose = jest.fn();
  const mockHandleSubmit = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <ManureImportModal
        initialModalData={undefined}
        handleDialogClose={mockHandleDialogClose}
        handleSubmit={mockHandleSubmit}
        manuresList={[]}
        // Modal will not render without isOpen set to true
        isOpen
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});
