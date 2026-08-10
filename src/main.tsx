import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './styles/global.css';
import './styles/app.css';

// `autoUpdate` fetches a new service worker in the background; reloading once it
// has taken control is what makes an update land cleanly on the next visit.
registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
