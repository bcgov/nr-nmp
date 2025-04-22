import { render, screen } from '@testing-library/react';
import PageTitle from './PageTitle';

describe('PageTitle tests', () => {
  test('PageTitle renders input text', () => {
    render(<PageTitle title="Hi" />);
    const elem = screen.getByText('Hi');
    expect(elem).toBeInTheDocument();
  });
});
