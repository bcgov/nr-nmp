import { Suspense, use, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledApp, ViewContainer } from './App.styles';
import { Header, Footer } from './components/common';
import { APICacheContext } from './context/APICacheContext';
import ViewRouter from './routes/ViewRouter';
import useAppState from './hooks/useAppState';
import ErrorBoundary from './services/ErrorBoundary.tsx';

/**
 * @summary The root component of the application.
 */
function App() {
  const apiCache = use(APICacheContext);
  const wait = use(apiCache.promise);
  const navigate = useNavigate();

  const { dispatch } = useAppState();
  useEffect(() => {
    apiCache.promise.then(() => {
      dispatch({ type: 'CACHE_TABLES', tables: apiCache.getAppStateTables() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledApp>
      <Header />
      <ViewContainer>
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary
            dispatch={dispatch}
            navigate={navigate}
          >
            {wait}
            <ViewRouter />
          </ErrorBoundary>
        </Suspense>
      </ViewContainer>
      <Footer />
    </StyledApp>
  );
}

export default App;
