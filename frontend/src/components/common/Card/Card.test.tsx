import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card tests', () => {
  test('Card renders child props', () => {
    render(
      <Card>
        <span>Hi</span>
      </Card>,
    );
    const elem = screen.getByText('Hi');
    expect(elem).toBeInTheDocument();
  });
});
