import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import LegalPage from './components/LegalPage.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:doc" element={<LegalPage />} />
        <Route path="/:app/:doc" element={<LegalPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
