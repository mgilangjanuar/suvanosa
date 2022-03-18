import { Layout } from 'antd'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Auth from './pages/Auth'
import Dashboard from './pages/dashboard'
import Home from './pages/Home'

function App() {
  return (
    <Layout className="App">
      <Header />
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="auth/redirect" element={<Auth />} />
        </Route>
      </Routes>
    </Layout>
  )
}

export default App
