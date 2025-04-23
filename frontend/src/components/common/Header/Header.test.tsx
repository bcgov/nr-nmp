import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header tests', () => {
  test('Title displays', () => {
    render(<Header />);
    const elem = screen.getByText('Nutrient Management Calculator');
    expect(elem).toBeInTheDocument();
  });
});
