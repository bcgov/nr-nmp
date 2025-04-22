import { render, screen } from '@testing-library/react';
import ViewCard from './ViewCard';

describe('ViewCard tests', () => {
  test('ViewCard does not display buttons if no callback is provided', () => {
    render(
      <ViewCard heading="">
        <span>Hi</span>
      </ViewCard>,
    );

    const next = screen.queryByText('Next');
    expect(next).toBeNull();
    const prev = screen.queryByText('Previous');
    expect(prev).toBeNull();
  });

  test('ViewCard displays buttons when callback is provided and are called on click', () => {
    const handleNext = jest.fn();
    const handlePrev = jest.fn();
    render(
      <ViewCard
        heading=""
        handleNext={handleNext}
        handlePrevious={handlePrev}
      >
        <span>Hi</span>
      </ViewCard>,
    );

    const next = screen.queryByText('Next');
    expect(next).not.toBeNull();
    const prev = screen.queryByText('Back');
    expect(prev).not.toBeNull();

    expect(handleNext).not.toHaveBeenCalled();
    expect(handlePrev).not.toHaveBeenCalled();
    next!.click();
    prev!.click();
    expect(handleNext).toHaveBeenCalled();
    expect(handlePrev).toHaveBeenCalled();
  });

  test('ViewCard callbacks not called when buttons disabled', () => {
    const handleNext = jest.fn();
    const handlePrev = jest.fn();
    render(
      <ViewCard
        heading=""
        handleNext={handleNext}
        nextDisabled
        handlePrevious={handlePrev}
        prevDisabled
      >
        <span>Hi</span>
      </ViewCard>,
    );

    const next = screen.queryByText('Next');
    const prev = screen.queryByText('Back');
    next!.click();
    prev!.click();
    expect(handleNext).not.toHaveBeenCalled();
    expect(handlePrev).not.toHaveBeenCalled();
  });
});
