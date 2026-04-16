import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateExPage from './pages/CreateExPage'
import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={
          <div className="app">
            <header className="header">
              <div className="container">
                <h1>逝爱</h1>
                <p>我会为了你，一万次回到那个夏天</p>
              </div>
            </header>
            <main className="page">
              <HomePage />
            </main>
          </div>
        } />
        <Route path="/create" element={
          <div className="app">
            <header className="header">
              <div className="container">
                <h1>逝爱</h1>
                <p>我会为了你，一万次回到那个夏天</p>
              </div>
            </header>
            <main className="page">
              <CreateExPage />
            </main>
          </div>
        } />
        <Route path="/chat/:slug" element={
          <div className="app">
            <header className="header">
              <div className="container">
                <h1>逝爱</h1>
                <p>我会为了你，一万次回到那个夏天</p>
              </div>
            </header>
            <main className="page">
              <ChatPage />
            </main>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
