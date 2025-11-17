import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// PERFORMANCE: Add performance marks for monitoring
performance.mark('app-start');

createRoot(document.getElementById("root")!).render(<App />);

performance.mark('app-render');
performance.measure('app-initial-load', 'app-start', 'app-render');

// Log performance metrics in development
if (import.meta.env.DEV) {
  const measure = performance.getEntriesByName('app-initial-load')[0];
  console.log(`[Performance] App initial load: ${measure.duration.toFixed(2)}ms`);
}
