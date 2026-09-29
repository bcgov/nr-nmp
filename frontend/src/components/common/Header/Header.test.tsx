import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Header tests', () => {
  test('Title displays', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const elem = screen.getByText('Nutrient Management Calculator');
    expect(elem).toBeInTheDocument();
  });

  // TODO: Add testing for the new alert modal
});
