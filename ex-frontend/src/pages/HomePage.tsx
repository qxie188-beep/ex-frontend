import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { StackedCardsInteraction } from '../components/ui/stacked-cards-interaction'

interface ExMeta {
  slug: string
  name: string
  created_at: string
  basic_info?: string
  personality?: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const [exes, setExes] = useState<ExMeta[]>([])
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiBase, setApiBase] = useState('https://api.openai.com/v1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('ex_api_key')
    if (saved) setApiKey(saved)
    fetchExes()
  }, [])

  const fetchExes = async () => {
    try {
      const res = await fetch('http://localhost:18000/api/ex-list')
      if (res.ok) {
        const data = await res.json()
        setExes(data)
      }
    } catch {
      // 后端未启动，显示本地缓存
      const cached = localStorage.getItem('ex_list')
      if (cached) setExes(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('确定要放下这段记忆吗？')) return
    try {
      await fetch(`http://localhost:18000/api/ex/${slug}`, { method: 'DELETE' })
    } catch {}
    setExes(prev => prev.filter(e => e.slug !== slug))
    localStorage.setItem('ex_list', JSON.stringify(exes.filter(e => e.slug !== slug)))
  }

  const saveApiKey = () => {
    localStorage.setItem('ex_api_key', apiKey)
    localStorage.setItem('ex_api_base', apiBase)
    setShowApiModal(false)
  }

  const needsApiKey = !localStorage.getItem('ex_api_key')

  return (
    <div className="container">
      {/* 逝爱简介 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 180,
        padding: '20px'
      }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(to bottom, #fffbe6 0%, #fff9e0 100%)',
          padding: '40px 35px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(-1.5deg)',
          maxWidth: '900px',
          width: '100%'
        }}>
          {/* 左上角胶带 */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '30px',
            width: '80px',
            height: '28px',
            background: 'linear-gradient(to bottom, #ffd54f 0%, #ffca28 50%, #ffc107 100%)',
            opacity: 0.85,
            transform: 'rotate(-5deg)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}></div>
          
          {/* 右上角胶带 */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '30px',
            width: '80px',
            height: '28px',
            background: 'linear-gradient(to bottom, #ffd54f 0%, #ffca28 50%, #ffc107 100%)',
            opacity: 0.85,
            transform: 'rotate(5deg)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}></div>
          
          <h2 style={{ 
            fontSize: 24, 
            marginBottom: 20, 
            fontFamily: 'var(--font-serif)',
            color: '#2c3e50',
            textAlign: 'center'
          }}>逝爱</h2>
          
          <p style={{ 
            fontSize: 15, 
            color: '#4a4a4a', 
            lineHeight: 2, 
            marginBottom: 25,
            textAlign: 'center'
          }}>
            记忆是一种不讲道理的存储介质。<br/>
            你记不住高数公式，记不住车牌号，记不住今天是几号，但你清楚记得四年前的一个下午ta穿了一件白T恤站在便利店门口等你，手里拿着两根冰棍，一根给你，一根ta自己。<br/>
            这不公平。<br/>
            "逝爱"就是把这些不公平的记忆导出来，从生物硬盘到数字硬盘完成格式转换。<br/>
            导完以后你或许会发现，ta也没那么好。ta也没那么差。ta就是那样一个人。会在吵完架两小时后问你吃了吗。会在纪念日那天忘了发消息然后第二天假装什么都没发生。<br/>
            是的，此刻，阳光在江面碎成一万个夏天，闪烁，又汇聚成一个冬天。这一切在你午睡时发生，你从未察觉。
          </p>
          
          <p style={{ 
            fontSize: 15, 
            color: '#8b5e3c', 
            fontWeight: '600', 
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            👇 往下滑动，开始创建你的第一个记忆
          </p>
        </div>
      </div>

      {/* 新建 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-serif)' }}>记忆列表</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {exes.length} 段记忆
          </p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={16} /> 新建挚爱
        </Link>
      </div>

      {/* 列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          加载中...
        </div>
      ) : exes.length === 0 ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <StackedCardsInteraction
            cards={[
              {
                id: 'demo1',
                image: '',
                title: '示例记忆 1',
                description: '点击上方「新建挚爱」，开始一段新的记忆'
              },
              {
                id: 'demo2',
                image: '',
                title: '示例记忆 2',
                description: '记录属于你们的美好时光'
              },
              {
                id: 'demo3',
                image: '',
                title: '示例记忆 3',
                description: '导出来自生物硬盘的记忆'
              }
            ]}
          />
        </div>
      ) : (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <StackedCardsInteraction
            cards={exes.map(ex => ({
              id: ex.slug,
              image: '',
              title: ex.name,
              description: ex.basic_info || 'Ta 还在这里等着你'
            }))}
            onCardClick={(id) => navigate(`/chat/${id}`)}
            onCardEdit={(id) => navigate(`/create?edit=${id}`)}
            onCardDelete={(id) => handleDelete(id)}
          />
        </div>
      )}

      {/* API 配置弹窗 */}
      {showApiModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', margin: 0 }}>
            <h2 style={{ marginBottom: 20 }}>配置 AI 接口</h2>

            <div className="form-group">
              <label>API 类型</label>
              <select value={apiBase} onChange={e => setApiBase(e.target.value)}>
                <option value="https://api.openai.com/v1">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="https://api.minimaxi.com/v1">MiniMax (OpenAI兼容)</option>
                <option value="https://api.minimaxi.com/anthropic">MiniMax (Anthropic兼容)</option>
                <option value="https://open.bigmodel.cn/api/paas/v1">智谱 GLM</option>
                <option value="https://dashscope.aliyuncs.com/compatible-mode/v1">阿里 通义</option>
                <option value="https://api.minimax.chat/v1">MiniMax (旧版)</option>
              </select>
            </div>

            <div className="form-group">
              <label>API Base URL</label>
              <input
                type="text"
                value={apiBase}
                onChange={e => setApiBase(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="form-hint">Key 只保存在本地浏览器中，不会上传到任何服务器</p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowApiModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={saveApiKey} disabled={!apiKey}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
