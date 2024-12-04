import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SSOProvider } from '@bcgov/citz-imb-sso-react';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SSOProvider
      backendURL={import.meta.env.VITE_BACKEND_URL}
      idpHint="idir"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SSOProvider>
  </StrictMode>,
);
