import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css'; // We'll create this file next for global styles

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('Renderer process started');
