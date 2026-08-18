import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { initializeAppstorePcI18n } from '@sdkwork/appstore-pc-product';
import App from './App.tsx';
import './index.css';

initializeAppstorePcI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
