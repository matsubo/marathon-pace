import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import OgImage from './OgImage'
import GoogleTagManager from './components/GoogleTagManager'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleTagManager />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/og-image" element={<OgImage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
