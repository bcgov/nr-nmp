import React, { Component, ErrorInfo } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { FARM_INFORMATION } from '@/constants/routes';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  dispatch: React.Dispatch<any>;
  navigate: NavigateFunction;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  // if error thrown in a child component, update state to show fallback UI
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // logs error information
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // send user to homepage, reset npm file, and clear error
  handleReset = () => {
    const { dispatch, navigate } = this.props;
    dispatch({ type: 'RESET_NMPFILE' });
    navigate(FARM_INFORMATION);
    this.setState({ hasError: false });
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    // inform user of error and give button to home
    if (hasError) {
      return (
        <div>
          <h2 style={{ textAlign: 'center', margin: 0 }}>Something went wrong</h2>
          {error && <p>{error.message}</p>}
          <button
            onClick={() => this.handleReset()}
            type="button"
          >
            Go to Home
          </button>
        </div>
      );
    }

    return children;
  }
}
