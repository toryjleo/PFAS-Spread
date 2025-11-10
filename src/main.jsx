import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App';

import './styles.css';
import '@mantine/core/styles.css';

const root = createRoot(document.getElementById('root'));
root.render(
    <MantineProvider defaultColorScheme="dark">
        <App />
    </MantineProvider>);