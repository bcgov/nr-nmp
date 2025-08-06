import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import View from './View';
import { DEFAULT_NMPFILE } from '@/constants';

jest.mock('@/hooks/useAppState');
const mockUseAppService = jest.mocked(useAppState);

describe('View tests', () => {
  test('View renders title and does not render buttons if no functions', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: false },
      dispatch: () => {},
    }));
    render(
      <BrowserRouter>
        <View title="Hi">
          <div />
        </View>
      </BrowserRouter>,
    );

    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  test('View renders buttons when given functions and calls functions when clicked', () => {
    mockUseAppService.mockImplementation(() => ({
      state: { nmpFile: DEFAULT_NMPFILE, showAnimalsStep: false },
      dispatch: () => {},
    }));
    const handleBack = jest.fn();
    const handleNext = jest.fn();
    render(
      <BrowserRouter>
        <View
          title="Hi"
          handleBack={handleBack}
          handleNext={handleNext}
        >
          <div />
        </View>
      </BrowserRouter>,
    );

    const backElem = screen.getByText('Back');
    expect(backElem).toBeInTheDocument();
    act(() => backElem.click());
    expect(handleBack).toHaveBeenCalled();
    expect(handleNext).not.toHaveBeenCalled();
    const nextElem = screen.getByText('Next');
    expect(nextElem).toBeInTheDocument();
    act(() => nextElem.click());
    expect(handleNext).toHaveBeenCalled();
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
