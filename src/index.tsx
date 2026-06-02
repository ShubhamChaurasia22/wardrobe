import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Monkeypatch React DevTools to avoid semver crashes with react-three-fiber under React 19
if (typeof window !== "undefined") {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.registerRenderer) {
        const originalRegister = hook.registerRenderer;
        hook.registerRenderer = function(renderer: any) {
            if (renderer && (!renderer.version || typeof renderer.version !== "string" || renderer.version.trim() === "")) {
                renderer.version = "19.0.0";
            }
            return originalRegister.apply(this, arguments);
        };
    }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
