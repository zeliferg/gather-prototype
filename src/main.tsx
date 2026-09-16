import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './app.css';
import { router } from './router';
import { PrototypeStateProvider } from './state';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrototypeStateProvider>
      <RouterProvider router={router} />
    </PrototypeStateProvider>
  </React.StrictMode>,
);
