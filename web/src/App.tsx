import { Layout } from 'antd'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Auth from './pages/Auth'
import Dashboard from './pages/dashboard'
import Forms from './pages/forms'
import Home from './pages/Home'

function App() {
  return (
    <Layout className="App">
      <Header />
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="dashboard">
            <Route index element={<Dashboard />} />
            <Route path=":page">
              <Route index element={<Dashboard />} />
              <Route path=":id" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="forms">
            <Route path=":id" element={<Forms />} />
          </Route>
          <Route path="auth/redirect" element={<Auth />} />
        </Route>
      </Routes>
    </Layout>
  )
}

export default App
