import { render, screen, act } from '@testing-library/react';
import YesNoRadioButtons from './YesNoRadioButtons';

describe('YesNoRadioButton', () => {
  test('False initializes to No', () => {
    render(
      <YesNoRadioButtons
        text=""
        value={false}
        onChange={() => {}}
        aria-label="test"
      />,
    );
    const no = screen.getByText('No');
    expect(no.attributes.getNamedItem('data-selected')?.value).toBe('true');
  });

  test('True initializes to Yes', () => {
    render(
      <YesNoRadioButtons
        text=""
        value
        onChange={() => {}}
        aria-label="test"
      />,
    );
    const yes = screen.getByText('Yes');
    expect(yes.attributes.getNamedItem('data-selected')?.value).toBe('true');
  });

  test('onChange called with correct props and not called without change', () => {
    const onChange = jest.fn();
    render(
      <YesNoRadioButtons
        text=""
        value={false}
        onChange={onChange}
        aria-label="test"
      />,
    );
    const yes = screen.getByText('Yes');
    const no = screen.getByText('No');

    act(() => no.click());
    expect(onChange).not.toHaveBeenCalled();
    act(() => yes.click());
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
