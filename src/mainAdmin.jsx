import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppAdmin from './AppAdmin.jsx'
import { BrowserRouter } from 'react-router-dom'

// Admin-only entry point for subdomain deployment
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppAdmin />
    </BrowserRouter>
  </StrictMode>,
)
