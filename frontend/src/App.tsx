import { StyledApp, ViewContainer } from './App.styles';
import { Header, Footer } from './components/common';
import ViewRouter from './routes/ViewRouter';

/**
 * @summary The root component of the application.
 */
function App() {
  return (
    <StyledApp>
      <Header />
      <ViewContainer>
        <ViewRouter />
      </ViewContainer>
      <Footer />
    </StyledApp>
  );
}

export default App;
