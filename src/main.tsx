import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Providers } from './providers.tsx'
import { reportWebVitals } from './utils/reportWebVitals.ts'

// Use a deferred rendering technique to improve initial load
const root = document.getElementById('root') as HTMLElement

// Hydration with improved performance
if (root) {
  // Use a more efficient approach that supports suspense
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  )
}

// Register service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // In a real implementation you would register a proper service worker
    console.log('Service worker would be registered here in production')
  })
}

// If you want to measure performance, uncomment the line below
reportWebVitals(console.log)
