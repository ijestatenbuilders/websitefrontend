import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyPerfFlags } from './utils/perf';

// Stamp device-tier flags on <html> before first paint so the global perf CSS
// can strip expensive effects on low-end / touch devices with zero JS cost.
applyPerfFlags();

const container = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hydrate prerendered route snapshots and render normally for SPA routes.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send results to an analytics endpoint.
reportWebVitals();
