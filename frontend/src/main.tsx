import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { APICacheProvider } from './context/APICacheContext.tsx';
import { AppStateProvider } from './context/AppStateContext.tsx';

createRoot(document.getElementById('root')!).render(
  <AppStateProvider>
    <APICacheProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </APICacheProvider>
  </AppStateProvider>,
);
