import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider } from '../src/context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CustomThemeProvider>
    <CssBaseline />
    <App />
  </CustomThemeProvider>
);
