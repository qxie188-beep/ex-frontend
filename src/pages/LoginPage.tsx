import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 页面加载后显示登录界面
    const timer = setTimeout(() => {
      setShowLogin(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    // 模拟登录过程
    setTimeout(() => {
      setIsLoading(false)
      // 丝滑跳转到主页
      navigate('/home', { replace: true })
    }, 1000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0618 0%, #1a0f2e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        content: '',
        position: 'absolute' as 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        textAlign: 'center',
        zIndex: 10,
        transform: showLogin ? 'translateY(0)' : 'translateY(50px)',
        opacity: showLogin ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontFamily: 'var(--font-serif)',
          color: '#fff',
          marginBottom: '1rem',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>逝爱</h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '3rem',
          letterSpacing: '1px'
        }}>我会为了你，一万次回到那个夏天</p>
        <button 
          style={{
            background: isLoading ? 'linear-gradient(45deg, #666, #999)' : 'linear-gradient(45deg, #ff6b6b, #ee5a6f)',
            border: 'none',
            borderRadius: '50px',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            color: 'white',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          ) : (
            '进入回忆'
          )}
        </button>
      </div>

    </div>
  )
}