import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/redirect" element={<Home />} />
        {/* <Route path="/account/verify/:token" element={<Home />} />
        <Route path="/account/reset/:token" element={<Home />} /> */}
      </Routes>
    </div>
  )
}

export default App
