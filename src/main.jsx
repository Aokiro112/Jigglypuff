/**
 * main.jsx — React entry point.
 * Imports all global CSS before mounting the app.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

// Global styles (order matters)
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';

import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
