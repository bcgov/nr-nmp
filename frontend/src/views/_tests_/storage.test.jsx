import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import Storage from '../Storage/Storage';
import StorageModal from '../Storage/StorageModal';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

const res = { status: 200, data: [] };
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve(res)),
    getInitializedResponse: jest.fn(() => res),
  })),
);

const nmpFile = {
  ...DEFAULT_NMPFILE,
  years: [
    {
      ...DEFAULT_NMPFILE_YEAR,
      year: '2025',
      generatedManures: [
        {
          uniqueMaterialName: 'Manure',
          annualAmount: 100,
          managedManureName: 'Manure',
          uuid: 'id',
        },
      ],
    },
  ],
};

// Set a constant for the data-id so the snapshot is consistent
global.crypto.randomUUID = () => '916859ed-1272-4863-a935-803debaa2d08';

// Snapshot test for Landing Page view
it('Storage renders correctly', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <Storage />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('StorageModal is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockHandleDialogClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <StorageModal
        mode="create"
        unassignedManures={[]}
        handleDialogClose={mockHandleDialogClose}
        isOpen
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});
