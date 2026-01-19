import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import userEvent from '@testing-library/user-event';
import useAppState from '@/hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import FarmInformation from '../FarmInformation/FarmInformation';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn((endpoint) =>
      Promise.resolve(
        (() => {
          if (endpoint === '/api/animals/') {
            return { status: 200, data: [{ id: 1, name: 'Beef Cattle' }] };
          }
          if ((endpoint as string).includes('subtypes')) {
            return { status: 200, data: [{ id: 0, name: 'Blah' }] };
          }
          return { status: 200, data: [] };
        })(),
      ),
    ),
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
  years: [],
};

afterEach(() => {
  jest.clearAllMocks();
});

// Snapshot test for FarmInformation view
it('renders correctly', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
      tables: undefined,
    },
    dispatch: jest.fn(),
  }));
  const { asFragment } = await act(async () =>
    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    ),
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('To not navigate to next page with no data', async () => {
  const mockDispatch = jest.fn();
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
      tables: undefined,
    },
    dispatch: mockDispatch,
  }));
  await act(async () =>
    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    ),
  );

  const button = await screen.getByText('Next');
  await fireEvent.click(button);

  expect(mockDispatch).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});

it('Input the proper data', async () => {
  const testFarm = 'Random farm name';
  await act(async () =>
    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    ),
  );

  const input1 = await screen.getByLabelText('Farm Name (required)');
  await userEvent.type(input1, testFarm);
  expect(input1).toHaveValue(testFarm);
});

it.only('To navigate to next page with data', async () => {
  const mockDispatch = jest.fn();
  await mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile: {
        farmDetails: {
          year: '2026',
          farmName: 'Test',
          farmRegion: 1,
          regionLocationId: 1,
          hasAnimals: false,
          hasHorticulturalCrops: true,
        },
        years: [],
      },
      showAnimalsStep: false,
      tables: undefined,
    },
    dispatch: mockDispatch,
  }));
  await act(async () =>
    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    ),
  );
  const handleOnSubmitMock = jest.fn();

  // screen.getByRole('Form').onsubmit = handleOnSubmitMock;
  // const button = screen.getByLabelText('Region (required)');
  const form = await screen.getByRole('Form', { name: 'test' });
  form.onsubmit = handleOnSubmitMock;

  const button = await screen.getByText('Next');
  await fireEvent.click(button);
  expect(handleOnSubmitMock).toHaveBeenCalled();
  // await waitFor(() => {
  //   userEvent.sub
  //   expect(handleOnSubmitMock).toHaveBeenCalled();
  // expect(mockNavigate).toHaveBeenCalled();
  // });
});
