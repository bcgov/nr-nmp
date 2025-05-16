import { render, screen } from '@testing-library/react';
import AppTitle from './AppTitle';

describe('AppTitle tests', () => {
  test('Title displays', () => {
    render(<AppTitle />);
    const elem = screen.getByText('Nutrient Management Calculator');
    expect(elem).toBeInTheDocument();
  });
});
