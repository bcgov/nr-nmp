import { Suspense, use, useEffect } from 'react';
import { StyledApp, ViewContainer } from './App.styles';
import { Header, Footer } from './components/common';
import { APICacheContext } from './context/APICacheContext';
import ViewRouter from './routes/ViewRouter';
import useAppState from './hooks/useAppState';

/**
 * @summary The root component of the application.
 */
function App() {
  const apiCache = use(APICacheContext);
  const wait = use(apiCache.promise);

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
        {/* TODO: Add better fallback component */}
        <Suspense fallback={<div>Loading...</div>}>
          {wait}
          <ViewRouter />
        </Suspense>
      </ViewContainer>
      <Footer />
    </StyledApp>
  );
}

export default App;
