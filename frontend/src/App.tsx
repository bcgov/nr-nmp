import { Suspense, use } from 'react';
import { StyledApp, ViewContainer } from './App.styles';
import { Header, Footer } from './components/common';
import { APICacheContext } from './context/APICacheContext';
import ViewRouter from './routes/ViewRouter';

/**
 * @summary The root component of the application.
 */
function App() {
  const apiCache = use(APICacheContext);
  const promise = use(apiCache.promise);
  return (
    <StyledApp>
      <Header />
      <ViewContainer>
        {/* TODO: Add better fallback component */}
        <Suspense fallback={<div>Loading...</div>}>
          {promise}
          <ViewRouter />
        </Suspense>
      </ViewContainer>
      <Footer />
    </StyledApp>
  );
}

export default App;
