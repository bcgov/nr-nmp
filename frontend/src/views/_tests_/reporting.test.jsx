import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import Reporting from '../Reporting/Reporting';
import { DAIRY_COW_ID } from '../../constants';

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
      farmAnimals: [{ animalId: DAIRY_COW_ID }]
    },
  ],
};

// Snapshot test for Landing Page view
it('Reporting renders correctly', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <Reporting />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});
