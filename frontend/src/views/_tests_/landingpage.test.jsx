import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import LandingPage from '../LandingPage/LandingPage';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
  })),
);

// Snapshot test for Landing Page view
it('renders correctly', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: DEFAULT_NMPFILE,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});
