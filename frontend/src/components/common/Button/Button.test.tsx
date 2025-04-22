import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button tests', () => {
  test('Button callback only called on click', () => {
    // eslint-disable-next-line no-void
    const mockCallback = jest.fn(() => void 0);
    const { container } = render(
      <Button
        handleClick={mockCallback}
        variant="default"
        size="md"
        text="Test"
        disabled={false}
      />,
    );

    // Check callback before and after click
    expect(mockCallback).not.toHaveBeenCalled();
    const button = container.querySelector('button');
    button?.click();
    expect(mockCallback).toHaveBeenCalled();
  });

  test('Button callback not called when disabled', () => {
    // eslint-disable-next-line no-void
    const mockCallback = jest.fn(() => void 0);
    const { container } = render(
      <Button
        handleClick={mockCallback}
        variant="default"
        size="md"
        text="Test"
        disabled
      />,
    );
    const button = container.querySelector('button');
    button?.click();
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
