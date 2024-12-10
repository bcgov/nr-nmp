import StyledApp from './App.styles';
import { Header, Footer } from './components/common';
import ViewRouter from './routes/ViewRouter';

/**
 * @summary The root component of the application.
 */
function App() {
  console.log('ijerijfer');
  return (
    <StyledApp>
      <Header />
      <ViewRouter />
      <Footer />
    </StyledApp>
  );
}

export default App;
