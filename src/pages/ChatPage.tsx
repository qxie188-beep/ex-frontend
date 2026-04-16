import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, SendHorizonal } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { API_BASE_URL } from '../config/api'

interface Message {
  role: 'user' | 'ex'
  content: string
  time: string
}

interface ExMeta {
  slug: string
  name: string
  basic_info?: string
  personality?: string
}

export default function ChatPage() {
  const { slug } = useParams<{ slug: string }>()
  const [meta, setMeta] = useState<ExMeta | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const apiKey = localStorage.getItem('ex_api_key') || ''
  const apiBase = localStorage.getItem('ex_api_base') || 'https://api.openai.com/v1'
  const model = localStorage.getItem('ex_model') || 'gpt-4o-mini'

  const { isListening, startListening, stopListening, transcript, resetTranscript } = useSpeechRecognition()

  // 加载会话
  useEffect(() => {
    if (!slug) return

    // 尝试从后端获取 meta
    fetch(`${API_BASE_URL}/api/ex-list`)
      .then(r => r.json())
      .then((list: ExMeta[]) => {
        const found = list.find((e: ExMeta) => e.slug === slug)
        if (found) {
          setMeta(found)
          setConnected(true)
        }
      })
      .catch(() => {
        // 后端未启动，尝试加载本地缓存
        const cached = localStorage.getItem(`ex_meta_${slug}`)
        if (cached) setMeta(JSON.parse(cached))
      })
  }, [slug])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 语音输入
  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          session_id: slug || '',
          message: text,
          api_key: apiKey,
          api_base: apiBase,
          model,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'ex',
        content: data.reply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ex',
        content: '（无法连接后端服务，请确保后端已启动）',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const toggleMic = () => {
    if (isListening) stopListening()
    else startListening()
  }

  const initMessages: Message[] = meta ? [{
    role: 'ex',
    content: getInitMessage(meta),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }] : []

  const [allMessages] = useState<Message[]>(initMessages)
  const displayedMessages = messages.length > 0 ? messages : allMessages

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <Link to="/" className="btn btn-ghost" style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="chat-avatar">
          {meta?.name?.[0] || '?'}
        </div>
        <div className="chat-info">
          <h3>{meta?.name || slug || '前任'}</h3>
          <p>{connected ? '在线' : '本地模式'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {displayedMessages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'ex' && (
              <div className="chat-avatar" style={{ width: 32, height: 32, fontSize: 14, flexShrink: 0 }}>
                {meta?.name?.[0] || '?'}
              </div>
            )}
            <div>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ex">
            <div className="chat-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>
              {meta?.name?.[0] || '?'}
            </div>
            <div>
              <div className="message-content" style={{ color: 'var(--text-muted)' }}>
                正在输入...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <button
            className={`mic-btn ${isListening ? 'recording' : ''}`}
            onClick={toggleMic}
            title={isListening ? '停止录音' : '语音输入'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发消息..."
            rows={1}
          />
          <button
            className="mic-btn"
            onClick={send}
            disabled={!input.trim() || loading}
            style={input.trim() ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}
          >
            <SendHorizonal size={18} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}

function getInitMessage(meta: ExMeta): string {
  if (!meta?.basic_info && !meta?.personality) {
    return '...'
  }
  const info = [
    meta.basic_info,
    meta.personality,
  ].filter(Boolean).join('；')
  return info
}
