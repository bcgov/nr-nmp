import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SSOProvider } from '@bcgov/citz-imb-sso-react';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SSOProvider
      backendURL="http://localhost:3000"
      idpHint="idir"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SSOProvider>
  </StrictMode>,
);
