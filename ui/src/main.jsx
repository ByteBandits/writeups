import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

const rawBase = import.meta.env.BASE_URL || '/';
const normalizedBase = rawBase === '/' ? undefined : rawBase.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={normalizedBase}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
