import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { NMPFile } from '@/types';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import FarmInformation from '../FarmInformation/FarmInformation';
import { LANDING_PAGE, ADD_ANIMALS, FIELD_LIST } from '@/constants/routes';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn((endpoint) =>
      Promise.resolve(
        (() => {
          if (endpoint === 'api/animals/') {
            return { status: 200, data: [{ id: 1, name: 'Beef Cattle' }] };
          }
          if (endpoint === 'api/regions/') {
            return {
              status: 200,
              data: [
                {
                  id: 2,
                  name: 'Northern Rockies',
                  soiltestphosphorousregioncd: 3.0,
                  soiltestpotassiumregioncd: 3.0,
                  locationid: 1,
                  sortorder: 21,
                },
              ],
            };
          }
          if (endpoint === 'api/subregions/2/') {
            return {
              status: 200,
              data: [
                {
                  id: 78,
                  name: 'Ft. Nelson',
                  annualprecipitation: 505.0,
                  annualprecipitationocttomar: 167.0,
                  regionid: 2,
                },
              ],
            };
          }
          return { status: 200, data: [] };
        })(),
      ),
    ),
  })),
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const farmTestFile: NMPFile = {
  farmDetails: {
    year: '2025',
    farmName: 'Test Farm',
    farmRegion: 2,
    regionLocationId: 1,
    hasAnimals: true,
    hasHorticulturalCrops: false,
    farmSubregion: 78,
    checkedAnimals: ['2'],
  },
  years: [],
};

// Set a constant for the data-id so the snapshot is consistent
global.crypto.randomUUID = () => '916859ed-1272-4863-a935-803debaa2d08';

// Snapshot test for FarmInformation view
it('FarmInformations component snapshot test', async () => {
  mockUseAppService.mockReturnValue({
    state: {
      nmpFile: DEFAULT_NMPFILE,
      showAnimalsStep: false,
      tables: undefined,
    },
    dispatch: jest.fn(),
  });

  const { asFragment } = render(
    <MemoryRouter>
      <FarmInformation />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

describe('FarmInformation navigation tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('FarmInformation allows Next and navigates to the field list page and saves if basic fields are complete and crops is selected', async () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          farmDetails: {
            ...farmTestFile.farmDetails,
            hasAnimals: false,
            hasHorticulturalCrops: true,
            checkedAnimals: [],
          },
          years: [],
        },
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    // wait for subregion selected to show
    await waitFor(() => {
      expect(screen.getAllByText('Ft. Nelson').length).toBeGreaterThan(0);
    });

    const button = screen.getByText('Next');
    fireEvent.click(button);
    // saves to nmp file
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SAVE_FARM_DETAILS',
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(FIELD_LIST);
  });

  it('FarmInformation allows Next and navigates to the add animals page and saves if basic fields are complete and livestock is selected', async () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    // wait for subregion selected to show
    await waitFor(() => {
      expect(screen.getAllByText('Ft. Nelson').length).toBeGreaterThan(0);
    });

    const button = screen.getByText('Next');
    fireEvent.click(button);
    // saves to nmp file
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SAVE_FARM_DETAILS',
        newFarmDetails: expect.objectContaining(farmTestFile.farmDetails),
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(ADD_ANIMALS);
  });

  it('blocks Next if no crop/livestock checked', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          farmDetails: {
            ...farmTestFile.farmDetails,
            hasAnimals: false,
            checkedAnimals: [],
          },
          years: [],
        },
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // when fields filled and user clicks Back redirect modal opens instead of going to landing page
  it('blocks Back when fields filled', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalledWith();
  });

  it('FarmInformation allows Back when fields empty', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [],
        },
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(LANDING_PAGE);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET_NMPFILE',
      }),
    );
  });
});

describe('FarmInformation component unit tests', () => {
  it('loads animals, regions, and subregions', async () => {
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: false,
        tables: undefined,
      },
      dispatch: jest.fn(),
    });

    render(
      <MemoryRouter>
        <FarmInformation />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('checkbox', { name: /I have beef cattle/i }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText('Northern Rockies')).not.toHaveLength(0);
    expect(await screen.findAllByText('Ft. Nelson')).not.toHaveLength(0);
  });
});
