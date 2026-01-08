import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import ManureAndImports from '../ManureAndImports/ManureAndImports';
import ManureImportModal from '../ManureAndImports/ManureImportModal';
import { ADD_ANIMALS, CROPS, NUTRIENT_ANALYSIS, STORAGE } from '../../constants/routes';

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

const farmTestFile = {
  farmDetails: {
    year: '2020',
    farmName: 'Test Farm',
    farmRegion: 1,
    regionLocationId: 1,
    hasHorticulturalCrops: false,
    hasAnimals: true,
  },
  years: [
    {
      fields: [],
      farmAnimals: [
        {
          animalId: '1',
          subtype: '3',
          daysCollected: 1,
          manureType: 2,
          uuid: '4928bba8-dc65-4ed9-af16-9c0cc30a74b2',
          animalsPerFarm: 111,
          manureData: {
            name: 'Backgrounding to Feedlot (400-850 lb)',
            manureType: 2,
            annualSolidManure: 1.588188,
          },
        },
        {
          animalId: '2',
          subtype: '4',
          breed: '1',
          grazingDaysPerYear: 222,
          uuid: 'c808465d-41e7-4700-9284-f8f7389b8106',
          animalsPerFarm: 222,
          manureType: 1,
          manureData: {
            name: 'Calves (0 to 3 months old)',
            annualLiquidManure: 58698.354,
          },
        },
        {
          manureType: 2,
          daysCollected: 1,
          animalId: '4',
          uuid: '3e528391-5210-4007-a9d8-4531c847c0cd',
          subtype: '11',
          animalsPerFarm: 333,
          manureData: {
            name: 'Goats',
            annualSolidManure: 0.764568,
          },
        },
        {
          manureType: 2,
          daysCollected: 1,
          animalId: '5',
          uuid: '8c2d6ff2-a50e-4a1e-860c-16c271b1e8f4',
          subtype: '12',
          animalsPerFarm: 444,
          manureData: {
            name: 'Horse',
            annualSolidManure: 17.316444,
          },
        },
        {
          animalId: '6',
          subtype: '16',
          birdsPerFlock: 555,
          flocksPerYear: 555,
          daysPerFlock: 1,
          uuid: 'c38d1106-ca50-433e-8476-e19c3c88cedd',
          manureType: 1,
          manureData: {
            name: 'Broiler Breeder Layer- Cage Housing',
            annualLiquidManure: 77622.3,
          },
        },
        {
          manureType: 2,
          daysCollected: 1,
          animalId: '7',
          uuid: 'b914672f-f857-4457-b077-5547e3f2476d',
          subtype: '24',
          animalsPerFarm: 666,
          manureData: {
            name: 'Doe and Litter',
            annualSolidManure: 0.333999,
          },
        },
        {
          manureType: 2,
          daysCollected: 1,
          animalId: '8',
          uuid: '023d1b54-3f3a-4afc-9983-11f147b7bb63',
          subtype: '25',
          animalsPerFarm: 777,
          manureData: {
            name: ' Ewe or Ram',
            annualSolidManure: 2.593626,
          },
        },
        {
          manureType: 1,
          daysCollected: 1,
          animalId: '9',
          uuid: '81ef825c-ef73-4e4e-9944-d37cd24d5296',
          subtype: '26',
          animalsPerFarm: 888,
          manureData: {
            name: 'Dry Sow, Boar, or Gilts',
            annualLiquidManure: 3706.512,
          },
        },
      ],
      importedManures: [],
      manureStorageSystems: [],
      nutrientAnalyses: [],
      year: '2027',
      derivedManures: [],
    },
  ],
};

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = () => mockStructuredClone();

describe('manureAndImports navigation tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ManureAndImports is correct', async () => {
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
        tables: undefined,
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
});

describe('manureAndImports navigation tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('manureAndImports can navigate to next page (/nutrient_analysis)', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [],
        },
        showAnimalsStep: false,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <ManureAndImports />
      </MemoryRouter>,
    );

    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(NUTRIENT_ANALYSIS);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SAVE_IMPORTED_MANURE' }),
    );
  });

  it.only('manureAndImports can navigate to next page (/storage)', async () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
      },
      dispatch: mockDispatch,
    }));
    await act(async () =>
      render(
        <MemoryRouter>
          <ManureAndImports />
        </MemoryRouter>,
      ),
    );

    const button = await screen.getByText('Next');
    await fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(STORAGE);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SAVE_IMPORTED_MANURE' }),
    );
  });

  it('manureAndImports can navigate to back a page (/crops)', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [],
        },
        showAnimalsStep: false,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <ManureAndImports />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(CROPS);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SAVE_IMPORTED_MANURE' }),
    );
  });

  it('manureAndImports can navigate to back a page (/add-animals)', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {
        nmpFile: {
          ...DEFAULT_NMPFILE,
          years: [],
        },
        showAnimalsStep: true,
      },
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <ManureAndImports />
      </MemoryRouter>,
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(ADD_ANIMALS);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SAVE_IMPORTED_MANURE' }),
    );
  });
});
