
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import './src/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="app-loaded">
      <App />
    </div>
  </React.StrictMode>
);
