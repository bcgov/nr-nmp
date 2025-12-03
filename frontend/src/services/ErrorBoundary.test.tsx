import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { FARM_INFORMATION } from '@/constants/routes';

describe('ErrorBoundary tests', () => {
  it('renders fallback and calls reset logic on button click', () => {
    const mockDispatch = jest.fn();
    const mockNavigate = jest.fn();

    // test component that throws error during render
    const Thrower = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary
        dispatch={mockDispatch}
        navigate={mockNavigate}
      >
        <Thrower />
      </ErrorBoundary>,
    );

    // expect fallback UI should appear
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();

    // click the go to home button
    fireEvent.click(screen.getByRole('button', { name: /Go to Home/i }));

    // check that dispatch and navigate were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_NMPFILE' });
    expect(mockNavigate).toHaveBeenCalledWith(FARM_INFORMATION);
  });
});
