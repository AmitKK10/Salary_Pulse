import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PwaService } from './services/pwaService';
import { NotificationService } from './services/notificationService';

// Initialize PWA Lifecycle and Notification channels
PwaService.init();
NotificationService.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
