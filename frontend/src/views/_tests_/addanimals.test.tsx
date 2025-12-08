import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { NMPFile } from '@/types';
import AddAnimals from '@/views/AddAnimals/AddAnimals';
import AddAnimalsModal from '@/views/AddAnimals/AddAnimalsModal';

jest.mock('@/hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
  })),
);

// Add farm information to nmpfile
const farmTestFile: NMPFile = {
  farmDetails: {
    year: '2020',
    farmName: 'Test Farm',
    farmRegion: 1,
    regionLocationId: 1,
    farmAnimals: [],
    hasHorticulturalCrops: false,
  },
  years: [
    {
      farmAnimals: [],
    } as any,
  ],
};

// Snapshot test for Add Animals view
it('renders add animals view correctly', async () => {
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

// Snapshot test for Add Animals view with add animals modal open
it('renders correctly when add animals modal is open', async () => {
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

import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { NMPFile } from '@/types';
import AddAnimals from '@/views/AddAnimals/AddAnimals';
import AddAnimalsModal from '@/views/AddAnimals/AddAnimalsModal';

jest.mock('@/hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
  })),
);

// Add farm information to nmpfile
const farmTestFile: NMPFile = {
  farmDetails: {
    year: '2020',
    farmName: 'Test Farm',
    farmRegion: 1,
    regionLocationId: 1,
    farmAnimals: [],
    hasHorticulturalCrops: false,
  },
  years: [
    {
      farmAnimals: [],
    } as any,
  ],
};

// Snapshot test for Add Animals view with add animals modal open
it('renders correctly when add animals modal is closed', async () => {
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

it('renders correctly when add animals modal is open', async () => {
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
      <AddAnimalsModal
        isOpen
        initialModalData={undefined}
        rowEditIndex={undefined}
        setAnimalList={jest.fn()}
        onClose={() => {}}
      />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

// Snapshot test for Add Animals view with add animals modal open and closed
it('renders correctly when add animals modal is closed', async () => {
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

// Snapshot test for Add Animals view with add animals modal closed
it('renders correctly when add animals modal is open', async () => {
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
      <AddAnimalsModal
        isOpen={false}
        initialModalData={undefined}
        rowEditIndex={undefined}
        setAnimalList={jest.fn()}
        onClose={() => {}}
      />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});
