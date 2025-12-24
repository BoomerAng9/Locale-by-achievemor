
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Locale app bootstrapping...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Failure: Root element #root not found in DOM.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Locale app mounted successfully.");
} catch (error) {
  console.error("Locale app failed to mount:", error);
  rootElement.innerHTML = `
    <div style="color: #ff4444; padding: 20px; font-family: sans-serif; text-align: center; background: #1a1d21; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="font-size: 24px; margin-bottom: 10px;">Application Error</h1>
      <p style="margin-bottom: 20px; color: #94a3b8;">The application failed to start. Please check the console for details.</p>
      <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Retry Loading</button>
    </div>
  `;
}
