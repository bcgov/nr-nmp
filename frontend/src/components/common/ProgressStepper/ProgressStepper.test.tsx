import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressStepper } from '..';
import { FARM_INFORMATION } from '@/constants/routes';
import useAppState from '@/hooks/useAppState';
import { DEFAULT_NMPFILE } from '@/constants';
import { AppStateAction } from '@/hooks/reducers/appStateReducer';

// NOTE for future test writers:
// ProgressStepper uses useLocation hook
// Requires renders to wrap component in <BrowserRouter>

// NOTE for future test writers:
// ProgressStepper uses useLocation hook
// Requires renders to wrap component in <BrowserRouter>

jest.mock('@/hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

describe('ProgressStepper tests', () => {
  test('Animal step absent when showAnimalsStep is false', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: false },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dispatch: (_action: AppStateAction) => {},
    }));
    render(
      <BrowserRouter>
        <ProgressStepper step={FARM_INFORMATION} />
      </BrowserRouter>,
    );
    const elem = screen.queryByText('Animals and Manure');
    expect(elem).toBeNull();
  });

  test('Animal step present when showAnimalsStep is true', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: true },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dispatch: (_action: AppStateAction) => {},
    }));
    render(
      <BrowserRouter>
        <ProgressStepper step={FARM_INFORMATION} />
      </BrowserRouter>,
    );
    const elem = screen.getByText('Animals and Manure');
    expect(elem).toBeInTheDocument();
  });
});
