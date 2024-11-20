import StyledApp from './App.styles';
import { Header } from './components/common';
import ViewRouter from './routes/ViewRouter';

/**
 * @summary The root component of the application.
 */
function App() {
  return (
    <StyledApp>
      <Header />
      <ViewRouter />
    </StyledApp>
  );
}

export default App;
