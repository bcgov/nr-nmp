import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import DEFAULT_NMPFILE_YEAR from '../../constants/DefaultNMPFileYear';
import DEFAULT_NMPFILE_FIELD from '../../constants/DefaultNMPFileField';
import FieldList from '../FieldList/FieldList';
import { FieldListModal } from '../../components/common';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
    getInitializedResponse: jest.fn(() => ({ status: 200, data: [] })),
  })),
);

const nmpFile = {
  ...DEFAULT_NMPFILE,
  years: [
    {
      ...DEFAULT_NMPFILE_YEAR,
      year: '2025',
      fields: [
        {
          ...DEFAULT_NMPFILE_FIELD,
        },
      ],
    },
  ],
};

// Set a constant for the data-id so the snapshot is consistent
global.crypto.randomUUID = () => '916859ed-1272-4863-a935-803debaa2d08';

// Copy in for tests that use structuredClone
const mockStructuredClone = jest.fn((x) => x);
global.structuredClone = () => mockStructuredClone();

it('FieldList is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));

  const { asFragment } = render(
    <MemoryRouter>
      <FieldList />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(asFragment()).toBeDefined();
  });

  // match snapshot
  expect(asFragment()).toMatchSnapshot();
});

it('Field modal on Field List is correct', async () => {
  mockUseAppService.mockImplementation(() => ({
    state: {
      nmpFile,
      showAnimalsStep: false,
    },
    dispatch: jest.fn(),
  }));
  const mockSetFieldList = jest.fn();
  const mockSetNameIsUnique = jest.fn();
  const mockOnClose = jest.fn();

  // IMPORTANT: For modals, you need to check the baseElement, not the container or fragment
  let baseElement;
  // If you see an error about wrapping in an act(), use waitFor()
  await waitFor(() => {
    const r = render(
      <FieldListModal
        mode="Add Field"
        setFieldList={mockSetFieldList}
        isFieldNameUnique={mockSetNameIsUnique}
        isOpen
        onClose={mockOnClose}
      />,
    );
    baseElement = r.baseElement;
  });

  // match snapshot
  expect(baseElement).toMatchSnapshot();
});
