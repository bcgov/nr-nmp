import StyledApp from './App.styles';
import '@bcgov/bc-sans/css/BC_Sans.css';

/**
 * @summary The root component of the application.
 */
const App = () => (
  <StyledApp>
    <div />
    <h1>Vite + React</h1>
    <div className="card">
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
    <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
  </StyledApp>
);

export default App;
