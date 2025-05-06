import { render, screen } from '@testing-library/react';
import { ProgressStepper } from '..';
import { FARM_INFORMATION } from '@/constants/RouteConstants';
import useAppService from '@/services/app/useAppService';

jest.mock('@/services/app/useAppService');
const mockUseAppService = jest.mocked(useAppService);

describe('ProgressStepper tests', () => {
  test('Animal step absent when showAnimalsStep is false', () => {
    mockUseAppService.mockImplementation(() => ({
      setNMPFile: () => Promise.resolve(),
      setShowAnimalsStep: () => {},
      state: { nmpFile: '', step: '', showAnimalsStep: false },
    }));
    render(<ProgressStepper step={FARM_INFORMATION} />);
    const elem = screen.queryByText('Animals and Manure');
    expect(elem).toBeNull();
  });

  test('Animal step present when showAnimalsStep is true', () => {
    mockUseAppService.mockImplementation(() => ({
      setNMPFile: () => Promise.resolve(),
      setShowAnimalsStep: () => {},
      state: { nmpFile: '', step: '', showAnimalsStep: true },
    }));
    render(<ProgressStepper step={FARM_INFORMATION} />);
    const elem = screen.getByText('Animals and Manure');
    expect(elem).toBeInTheDocument();
  });
});
