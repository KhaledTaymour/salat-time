import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// ─── Flash Prevention ─────────────────────────────────────────────────────────
// Synchronously read persisted settings BEFORE React mounts to prevent
// theme/direction flash on page load.
try {
  const raw = localStorage.getItem('salat-settings');
  if (raw) {
    const stored = JSON.parse(raw) as { state?: { theme?: string; language?: string } };
    const theme = stored?.state?.theme ?? 'dark';
    const language = stored?.state?.language ?? 'en';
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }
} catch {
  // Malformed storage — fall back to defaults (already set in index.html)
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
