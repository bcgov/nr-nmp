import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressStepper } from '..';
import { FARM_INFORMATION } from '@/constants/RouteConstants';
import useAppService from '@/services/app/useAppService';
import { BrowserRouter } from 'react-router-dom';

// NOTE for future test writers:
// ProgressStepper uses useLocation hook
// Requires renders to wrap component in <BrowserRouter>

// NOTE for future test writers:
// ProgressStepper uses useLocation hook
// Requires renders to wrap component in <BrowserRouter>

jest.mock('@/services/app/useAppService');
const mockUseAppService = jest.mocked(useAppService);

describe('ProgressStepper tests', () => {
  test('Animal step absent when showAnimalsStep is false', () => {
    mockUseAppService.mockImplementation(() => ({
      setNMPFile: () => Promise.resolve(),
      setShowAnimalsStep: () => {},
      state: { nmpFile: '', step: '', showAnimalsStep: false },
    }));
    render(
      <BrowserRouter>
        <ProgressStepper />
      </BrowserRouter>,
    );
    const elem = screen.queryByText('Animals and Manure');
    expect(elem).toBeNull();
  });

  test('Animal step present when showAnimalsStep is true', () => {
    mockUseAppService.mockImplementation(() => ({
      setNMPFile: () => Promise.resolve(),
      setShowAnimalsStep: () => {},
      state: { nmpFile: '', step: '', showAnimalsStep: true },
    }));
    render(
      <BrowserRouter>
        <ProgressStepper />
      </BrowserRouter>,
    );
    const elem = screen.getByText('Animals and Manure');
    expect(elem).toBeInTheDocument();
  });
});
