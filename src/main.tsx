import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PrinterProvider } from './context/PrinterContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrinterProvider>
      <App />
    </PrinterProvider>
  </StrictMode>,
);
