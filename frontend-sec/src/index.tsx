import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Comprehensive suppression of ResizeObserver loop errors
if (typeof window !== 'undefined') {
    const IGNORED_ERRORS = [
        'ResizeObserver loop completed with undelivered notifications',
        'ResizeObserver loop limit exceeded',
        'Script error.'
    ];

    const isIgnored = (err: any) => {
        const message = err?.message || String(err);
        return IGNORED_ERRORS.some(m => message.includes(m));
    };

    // 1. Wrap console.error
    const originalError = console.error;
    console.error = (...args) => {
        if (args.length > 0 && isIgnored(args[0])) return;
        originalError.apply(console, args);
    };

    // 2. Window error event (captures most browser-thrown loop errors)
    window.addEventListener('error', (e) => {
        if (isIgnored(e.message)) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    // 3. Unhandled rejections
    window.addEventListener('unhandledrejection', (e) => {
        if (isIgnored(e.reason?.message)) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
