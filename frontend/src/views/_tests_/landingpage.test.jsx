import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import useAppState from '../../hooks/useAppState';
import DEFAULT_NMPFILE from '../../constants/DefaultNMPFile';
import LandingPage from '../LandingPage/LandingPage';
import { FARM_INFORMATION } from '../../constants/routes';

jest.mock('../../hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);
jest.mock('../../services/APICache', () =>
  jest.fn().mockImplementation(() => ({
    callEndpoint: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
  })),
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

describe('Buttons perform correct functions', () => {
  it('Get started calls hooks properly', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {},
      dispatch: mockDispatch,
    }));

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const button = screen.getByText('Get Started');
    fireEvent.click(button);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_NMPFILE' });
    expect(mockNavigate).toHaveBeenCalledWith(FARM_INFORMATION);
  });

  it('Upload file prompts upload', () => {
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {},
      dispatch: mockDispatch,
    }));
    const readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');

    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const fileInput = container.querySelector('#fileUp');
    const str = JSON.stringify({ year: '2025' });
    const blob = new Blob([str]);
    const file = new File([blob], 'file.nmp');
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(readAsTextSpy).toHaveBeenCalled();
  });

  it('Uploading non-nmp file does not prompt upload', () => {
    jest.clearAllMocks();
    const mockDispatch = jest.fn();
    mockUseAppService.mockImplementation(() => ({
      state: {},
      dispatch: mockDispatch,
    }));
    const readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');

    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const fileInput = container.querySelector('#fileUp');
    const str = JSON.stringify({ year: '2025' });
    const blob = new Blob([str]);
    const file = new File([blob], 'file.json');
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(readAsTextSpy).not.toHaveBeenCalled();
  });
});
