import { render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { ManureType, NMPFile } from '@/types';
import AddAnimals from '@/views/AddAnimals/AddAnimals';
import AddAnimalsModal from '@/views/AddAnimals/AddAnimalsModal';
import {
  calculateAnnualLiquidManure,
  calculateAnnualSolidManure,
  calculateAnnualWashWater,
  calculatePoultryAnnualLiquidManure,
  calculatePoultryAnnualSolidManure,
} from '../AddAnimals/utils';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/routes';
import { INITIAL_BEEF_FORM_DATA } from '@/constants';

jest.mock('@/hooks/useAppState');
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

// Add farm information to nmpfile
const farmTestFile: NMPFile = {
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
      farmAnimals: [],
    } as any,
  ],
};

it('AddAnimals component snapshot test', async () => {
  mockUseAppService.mockReturnValue({
    state: {
      nmpFile: farmTestFile,
      showAnimalsStep: true,
      tables: undefined,
    },
    dispatch: jest.fn(),
  });

  const { asFragment } = render(
    <MemoryRouter>
      <AddAnimals />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('AddAnimalsModal component snapshot test', async () => {
  mockUseAppService.mockReturnValue({
    state: {
      nmpFile: farmTestFile,
      showAnimalsStep: true,
      tables: undefined,
    },
    dispatch: jest.fn(),
  });
  const mockHandleDialogClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <AddAnimalsModal
        isOpen
        initialModalData={undefined}
        rowEditIndex={undefined}
        setAnimalList={jest.fn()}
        onClose={mockHandleDialogClose}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});

describe('AddAnimals calculations', () => {
  it('calculateAnnualSolidManure', () => {
    // The solid manure equation divides by 2000 to convert pounds to tons,
    // so I'm using 20 * 100 to make calculations easier
    expect(calculateAnnualSolidManure(20, 100)).toBe(365);
    expect(calculateAnnualSolidManure(20, 100, 5, 2)).toBe(10);
    expect(() => calculateAnnualSolidManure(20, 100, 367)).toThrow();
    expect(() => calculateAnnualSolidManure(20, 100, -1)).toThrow();
  });

  it('calculatePoultryAnnualSolidManure', () => {
    expect(calculatePoultryAnnualSolidManure(20, 10, 10, 365)).toBe(365);
    expect(() => calculatePoultryAnnualSolidManure(20, 10, 10, 367)).toThrow();
    expect(() => calculatePoultryAnnualSolidManure(20, 10, 10, -1)).toThrow();
  });

  it('calculateAnnualSolidManure', () => {
    // Liquid manure doesn't perform unit conversion
    expect(calculateAnnualLiquidManure(2, 10)).toBe(7300);
    expect(calculateAnnualLiquidManure(2, 10, 5, 2)).toBe(200);
    expect(() => calculateAnnualLiquidManure(20, 100, 367)).toThrow();
    expect(() => calculateAnnualLiquidManure(20, 100, -1)).toThrow();
  });

  it('calculatePoultryAnnualLiquidManure', () => {
    expect(calculatePoultryAnnualLiquidManure(2, 1, 10, 365)).toBe(7300);
    expect(() => calculatePoultryAnnualLiquidManure(20, 10, 10, 367)).toThrow();
    expect(() => calculatePoultryAnnualLiquidManure(20, 10, 10, -1)).toThrow();
  });

  it('calculateAnnualWashWater', () => {
    expect(calculateAnnualWashWater(10, 'PER_DAY', 10)).toBe(3650);
    expect(calculateAnnualWashWater(10, 'PER_DAY_PER_ANIMAL', 10)).toBe(36500);
  });
});

describe('AddAnimals component unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls AppService dispatch on render', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
        tables: undefined,
      },
      dispatch: mockDispatch,
    });
    render(
      <MemoryRouter>
        <AddAnimals />
      </MemoryRouter>,
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SHOW_ANIMALS_STEP',
      showAnimalsStep: true,
    });
  });

  it('allows Next if an animal is added', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: {
          ...farmTestFile,
          years: [
            { farmAnimals: [{ animalId: '1', manureType: ManureType.Solid, uuid: 'blah' }] } as any,
          ],
        },
        showAnimalsStep: true,
        tables: undefined,
      },
      dispatch: mockDispatch,
    });

    render(
      <MemoryRouter>
        <AddAnimals />
      </MemoryRouter>,
    );
    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(MANURE_IMPORTS);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SAVE_ANIMALS' }));
  });

  it('blocks Next if no animals added', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
        tables: undefined,
      },
      dispatch: mockDispatch,
    });

    render(
      <MemoryRouter>
        <AddAnimals />
      </MemoryRouter>,
    );
    mockDispatch.mockClear(); // clear call on render
    const button = screen.getByText('Next');
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('allows Previous redirect regardless', () => {
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
        tables: undefined,
      },
      dispatch: jest.fn(),
    });

    render(
      <MemoryRouter>
        <AddAnimals />
      </MemoryRouter>,
    );
    const button = screen.getByText('Back');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(FARM_INFORMATION);
  });
});

describe('AddAnimalsModal component unit tests', () => {
  it('onConfirm called for beef cattle', async () => {
    mockUseAppService.mockReturnValue({
      state: {
        nmpFile: farmTestFile,
        showAnimalsStep: true,
        tables: undefined,
      },
      dispatch: jest.fn(),
    });
    const mockSetAnimalList = jest.fn();

    await waitFor(() => {
      render(
        <AddAnimalsModal
          isOpen
          initialModalData={{
            ...INITIAL_BEEF_FORM_DATA,
            uuid: 'blah',
            // Pre-setting, as we don't know how to set w/ user events
            subtype: '0',
            animalsPerFarm: 10,
            // Shouldn't be needed if manure collection is false
            daysCollected: undefined,
          }}
          rowEditIndex={undefined}
          setAnimalList={mockSetAnimalList}
          onClose={jest.fn()}
        />,
      );
    });

    const confirm = screen.getByText('Confirm');
    act(() => fireEvent.click(confirm));
    expect(mockSetAnimalList).toHaveBeenCalled();
  });
});
