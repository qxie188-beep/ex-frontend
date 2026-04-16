import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShaderBackground from '../components/ui/ShaderBackground'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // 页面加载后显示内容
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    const content = document.querySelector('.landing-content') as HTMLElement
    if (content) {
      content.style.opacity = '0'
      content.style.transform = 'translate(-50%, -50%) translateY(50px)'
      setTimeout(() => {
        navigate('/home')
      }, 300)
    } else {
      navigate('/home')
    }
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh'
    }}>
      <ShaderBackground />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="landing-content" style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '0 24px',
          transform: showContent ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) translateY(50px)',
          opacity: showContent ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
          position: 'absolute',
          top: '50%',
          left: '50%'
        }}>
          <div style={{
            marginBottom: '40px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '40px',
            borderRadius: '20px',
            transition: 'all 1s ease-in-out'
          }}>
            <h1 style={{
              fontSize: '6rem',
              fontFamily: 'var(--font-serif)',
              color: '#fff',
              marginBottom: '1rem',
              textShadow: '0 0 30px rgba(192, 112, 160, 0.8)',
              animation: 'pulse 3s ease-in-out infinite'
            }}>逝爱</h1>
            <p style={{
              fontSize: '1.4rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontStyle: 'italic',
              letterSpacing: '1px'
            }}>我会为了你，一万次回到那个夏天</p>
          </div>
          <div style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            margin: '40px auto'
          }}></div>
          <button 
            style={{
              background: '#8b5e3c',
              border: 'none',
              borderRadius: '50px',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(139, 94, 60, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={handleStart}
          >
            开始回忆
          </button>
        </div>
      </div>
    </div>
  )
}