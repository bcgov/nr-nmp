import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressStepper } from '..';
import useAppState from '@/hooks/useAppState';
import { DEFAULT_NMPFILE } from '@/constants';

// NOTE for future test writers:
// ProgressStepper uses useLocation hook
// Requires renders to wrap component in <BrowserRouter>

jest.mock('@/hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

describe('ProgressStepper tests', () => {
  test('Only the Home and Farm Information steps should be visible initially', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: false },
      dispatch: () => {},
    }));
    render(
      <BrowserRouter>
        <ProgressStepper />
      </BrowserRouter>,
    );
    const elem1 = screen.queryByText('Home');
    const elem2 = screen.queryByText('Farm Information');
    expect(elem1).toBeInTheDocument();
    expect(elem2).toBeInTheDocument();
  });

  test('All other steps should not be present initially', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: true },
      dispatch: () => {},
    }));
    render(
      <BrowserRouter>
        <ProgressStepper />
      </BrowserRouter>,
    );
    const elem1 = screen.queryByText('Animals and Manure');
    const elem2 = screen.queryByText('Fields and Soil');
    const elem3 = screen.queryByText('Calculate Nutrients');
    const elem4 = screen.queryByText('Reporting');
    expect(elem1).toBeNull();
    expect(elem2).toBeNull();
    expect(elem3).toBeNull();
    expect(elem4).toBeNull();
  });
});
