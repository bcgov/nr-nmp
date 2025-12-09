import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import { DEFAULT_NMPFILE_FIELD } from '../../constants/DefaultNMPFileField';
import NutrientAnalysis from '../NutrientAnalysis/NutrientAnalysis';
import NutrientAnalysisModal from '../NutrientAnalysis/NutrientAnalysisModal';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
    getInitializedResponse: jest.fn(() => ({ status: 200, data: [] })),
  })),
);

it('NutrientAnalysis is correct', async () => {
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
      <NutrientAnalysis />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('NutrientAnalysisModal is correct', async () => {
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
  const mockHandleSubmit = jest.fn();
  const mockHandleDialogClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <NutrientAnalysisModal
        manures={[]}
        storageSystems={[]}
        currentNutrientAnalyses={[]}
        handleSubmit={mockHandleSubmit}
        isOpen
        onCancel={mockHandleDialogClose}
        modalStyle={{ width: '700px' }}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});
