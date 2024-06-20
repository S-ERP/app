/* global __DEV__ */
import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';



if (module.hot) {
    // module.hot.accept(); // Acepta los cambios realizados
}

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
