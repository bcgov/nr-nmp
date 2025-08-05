import { render, screen, act } from '@testing-library/react';
import Form from './Form';

// Unfortunately, can't call onConfirm or onCalculate bc of a recorded jest issue: https://github.com/jsdom/jsdom/issues/3117

describe('Form tests', () => {
  test('Form does not render Calculate when no function given', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
      <Form
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        <div />
      </Form>,
    );

    const cancelButton = screen.getByText('Cancel');
    act(() => cancelButton.click());
    expect(onCancel).toHaveBeenCalled();

    expect(screen.queryByText('Calculate')).not.toBeInTheDocument();
  });

  test('Form renders Calculate when function given', () => {
    const onCancel = jest.fn();
    const onCalculate = jest.fn();
    const onConfirm = jest.fn();
    render(
      <Form
        onCancel={onCancel}
        onCalculate={onCalculate}
        onConfirm={onConfirm}
      >
        <div />
      </Form>,
    );
    expect(screen.queryByText('Calculate')).toBeInTheDocument();
  });
});
