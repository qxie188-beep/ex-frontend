import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ArrowLeft, Check } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

const PERSONALITY_TAGS = [
  '话痨', '闷骚', '嘴硬心软', '冷暴力', '粘人', '独立',
  '浪漫主义', '实用主义', '完美主义', '拖延症', '工作狂',
  '控制欲', '没有安全感', '报复性熬夜', '秒回选手', '已读不回',
]

const ATTACHMENT_STYLES = ['安全型', '焦虑型', '回避型', '混乱型']
const LOVE_LANGUAGES = ['肯定的言辞', '精心的时刻', '接受礼物', '服务的行动', '身体的接触']

interface FormData {
  name: string
  basicInfo: string
  personality: string
  attachmentStyle: string
  loveLanguage: string
  selectedTags: string[]
  customTags: string
  wechatFile: File | null
  qqFile: File | null
  photos: File[]
  plaintext: string
  apiKey: string
  apiBase: string
  model: string
}

export default function CreateExPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    name: '',
    basicInfo: '',
    personality: '',
    attachmentStyle: '',
    loveLanguage: '',
    selectedTags: [],
    customTags: '',
    wechatFile: null,
    qqFile: null,
    photos: [],
    plaintext: '',
    apiKey: localStorage.getItem('ex_api_key') || '',
    apiBase: localStorage.getItem('ex_api_base') || 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [showApiReminder, setShowApiReminder] = useState(true)
  const [showApiModal, setShowApiModal] = useState(true)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [modalApiKey, setModalApiKey] = useState('')
  const [modalApiBase, setModalApiBase] = useState(localStorage.getItem('ex_api_base') || 'https://api.openai.com/v1')
  const [modalModel, setModalModel] = useState(localStorage.getItem('ex_api_model') || 'gpt-4o-mini')

  const wechatRef = useRef<HTMLInputElement>(null)
  const qqRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 检查是否是编辑模式
    const params = new URLSearchParams(location.search)
    const editSlug = params.get('edit')
    if (editSlug) {
      setEditingSlug(editSlug)
      loadExData(editSlug)
    } else if (!localStorage.getItem('ex_api_key')) {
      // 首次使用，显示 API 配置弹窗
      setShowApiModal(true)
    }
  }, [location.search])

  const loadExData = async (slug: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ex/${slug}`)
      if (res.ok) {
        const data = await res.json()
        // 解析性格信息
        const personalityText = data.personality || ''
        const selectedTags: string[] = []
        let attachmentStyle = ''
        let loveLanguage = ''
        let personalityDesc = ''
        
        // 解析性格标签
        const tagsMatch = personalityText.match(/性格标签：([^；]+)/)
        if (tagsMatch) {
          selectedTags.push(...tagsMatch[1].split('、'))
        }
        
        // 解析依恋类型
        const attachmentMatch = personalityText.match(/依恋类型：([^；]+)/)
        if (attachmentMatch) {
          attachmentStyle = attachmentMatch[1]
        }
        
        // 解析爱的语言
        const loveMatch = personalityText.match(/爱的语言：([^；]+)/)
        if (loveMatch) {
          loveLanguage = loveMatch[1]
        }
        
        // 提取基本性格描述（去掉标签部分）
        personalityDesc = personalityText
          .replace(/性格标签：[^；]+；?/g, '')
          .replace(/依恋类型：[^；]+；?/g, '')
          .replace(/爱的语言：[^；]+；?/g, '')
          .trim()
        
        // 填充表单数据
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          basicInfo: data.basic_info || '',
          personality: personalityDesc,
          attachmentStyle,
          loveLanguage,
          selectedTags
        }))
      }
    } catch (e) {
      console.error('加载数据失败:', e)
      setError('加载数据失败，请重试')
    }
  }



  const update = (key: keyof FormData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const saveModalApiKey = () => {
    localStorage.setItem('ex_api_key', modalApiKey)
    localStorage.setItem('ex_api_base', modalApiBase)
    localStorage.setItem('ex_api_model', modalModel)
    update('apiKey', modalApiKey)
    update('apiBase', modalApiBase)
    update('model', modalModel)
    setShowApiModal(false)
    setShowApiReminder(false)
  }

  const toggleTag = (tag: string) =>
    setForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }))

  const handleWechat = (e: React.ChangeEvent<HTMLInputElement>) =>
    update('wechatFile', e.target.files?.[0] || null)

  const handleQq = (e: React.ChangeEvent<HTMLInputElement>) =>
    update('qqFile', e.target.files?.[0] || null)

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    update('photos', [...form.photos, ...files].slice(0, 20))
    setShowPhotoModal(false)
  }

  const openPhotoModal = () => {
    setShowPhotoModal(true)
  }

  const removePhoto = (i: number) =>
    update('photos', form.photos.filter((_, idx) => idx !== i))

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('请输入代号'); return }
    if (!form.apiKey) { setError('请先配置 API Key'); return }
    setError('')
    setCreating(true)

    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('basic_info', form.basicInfo)
      // 处理自定义标签
      let allTags = [...form.selectedTags];
      if (form.customTags) {
        const customTagsArray = form.customTags.split(',').map(tag => tag.trim()).filter(Boolean);
        allTags = [...allTags, ...customTagsArray];
      }
      
      const personality = [
        form.personality,
        form.attachmentStyle ? `依恋类型：${form.attachmentStyle}` : '',
        form.loveLanguage ? `爱的语言：${form.loveLanguage}` : '',
        allTags.length ? `性格标签：${allTags.join('、')}` : '',
      ].filter(Boolean).join('；')
      fd.append('personality', personality)
      fd.append('plaintext', form.plaintext)
      fd.append('api_key', form.apiKey)
      fd.append('api_base', form.apiBase)
      fd.append('model', form.model)
      if (form.wechatFile) fd.append('wechat_file', form.wechatFile)
      if (form.qqFile) fd.append('qq_file', form.qqFile)
      form.photos.forEach(p => fd.append('photo_files', p))

      let res
      if (editingSlug) {
        // 编辑模式：发送PUT请求
        res = await fetch(`${API_BASE_URL}/api/ex/${editingSlug}`, {
          method: 'PUT',
          body: fd,
        })
      } else {
        res = await fetch(`${API_BASE_URL}/api/create-ex`, {
          method: 'POST',
          body: fd,
        })
      }

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      navigate(`/chat/${data.slug || editingSlug}`)
    } catch (e: any) {
      setError('操作失败：' + e.message)
      setCreating(false)
    }
  }

  const totalSteps = 4

  return (
    <div className="container">


      {/* 步骤指示 */}
      <div className="step-indicator">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`step-dot ${step === i + 1 ? 'active' : step > i + 1 ? 'active' : ''}`} />
        ))}
      </div>
      
      {/* 编辑模式提示 */}
      {editingSlug && (
        <div style={{ 
          background: 'rgba(255, 215, 0, 0.1)', 
          border: '1px solid #ffd700', 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#ffd700' }}>
            编辑模式：正在修改「{form.name || '记忆'}」
          </p>
        </div>
      )}

      {/* Step 1: 基础信息 */}
      {step === 1 && (
        <>
          <button className="btn btn-ghost" onClick={() => navigate('/home')} style={{ marginBottom: 16 }}>
            <ArrowLeft size={16} /> 返回
          </button>
          
          <div className="card">
            <h2>给他取个专属称呼</h2>
            <div className="form-group">
              <label>专属称呼 *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="比如：小明、那个人、初恋"
              />
            </div>
          </div>

          <div className="card">
            <h2>基本信息</h2>
            <div className="form-group">
              <label>一句话介绍</label>
              <input
                type="text"
                value={form.basicInfo}
                onChange={e => update('basicInfo', e.target.value)}
                placeholder="在一起多久 / 分手多久 / 做什么的"
              />
              <p className="form-hint">比如：在一起两年 分手半年 互联网产品经理</p>
            </div>

            <div className="form-group">
              <label>性格画像</label>
              <textarea
                value={form.personality}
                onChange={e => update('personality', e.target.value)}
                placeholder="MBTI / 星座 / 性格特点 / 印象"
                rows={3}
              />
            </div>
          </div>

          <div className="card">
            <h2>性格标签</h2>
            <div className="tag-list">
              {PERSONALITY_TAGS.map(tag => (
                <span
                  key={tag}
                  className={`tag ${form.selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>自定义标签</label>
              <input
                type="text"
                value={form.customTags}
                onChange={e => update('customTags', e.target.value)}
                placeholder="输入其他性格标签，用逗号分隔"
              />
              <p className="form-hint">例如：温柔、幽默、细心</p>
            </div>
          </div>

          <button className="btn btn-primary btn-full" onClick={() => setStep(2)}>
            下一步：导入原材料
          </button>
        </>
      )}

      {/* Step 2: 原材料导入 */}
      {step === 2 && (
        <>
          <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginBottom: 16 }}>
            <ArrowLeft size={16} /> 返回
          </button>

          <div className="card">
            <h2>聊天记录</h2>

            <div className="form-group">
              <label>微信聊天记录</label>
              <div className="file-upload" onClick={() => wechatRef.current?.click()}>
                <input ref={wechatRef} type="file" accept=".txt,.html,.json" onChange={handleWechat} />
                <div className="file-upload-icon">💬</div>
                <p>点击上传微信聊天记录</p>
                <p className="form-hint">支持 txt / html / json 格式</p>
                {form.wechatFile && <p className="file-name">✓ {form.wechatFile.name}</p>}
              </div>
            </div>

            <div className="form-group">
              <label>QQ 聊天记录</label>
              <div className="file-upload" onClick={() => qqRef.current?.click()}>
                <input ref={qqRef} type="file" accept=".txt,.mht,.mhtml" onChange={handleQq} />
                <div className="file-upload-icon">🐧</div>
                <p>点击上传 QQ 聊天记录</p>
                <p className="form-hint">支持 txt / mht 格式</p>
                {form.qqFile && <p className="file-name">✓ {form.qqFile.name}</p>}
              </div>
            </div>

            <div className="divider">或者</div>

            <div className="form-group">
              <label>直接粘贴聊天记录</label>
              <textarea
                value={form.plaintext}
                onChange={e => update('plaintext', e.target.value)}
                placeholder="把记得的聊天内容直接粘贴在这里..."
                rows={6}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-full" onClick={() => setStep(3)} style={{ marginTop: 8 }}>
            下一步：设置关系
          </button>
        </>
      )}

      {/* Step 3: 关系配置 */}
      {step === 3 && (
        <>
          <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ marginBottom: 16 }}>
            <ArrowLeft size={16} /> 返回
          </button>

          <div className="card">
            <h2>依恋类型</h2>
            <div className="tag-list">
              {ATTACHMENT_STYLES.map(s => (
                <span
                  key={s}
                  className={`tag ${form.attachmentStyle === s ? 'active' : ''}`}
                  onClick={() => update('attachmentStyle', form.attachmentStyle === s ? '' : s)}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>爱的语言</h2>
            <div className="tag-list">
              {LOVE_LANGUAGES.map(l => (
                <span
                  key={l}
                  className={`tag ${form.loveLanguage === l ? 'active' : ''}`}
                  onClick={() => update('loveLanguage', form.loveLanguage === l ? '' : l)}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>照片（可选）</h2>
            <button 
              className="btn btn-secondary" 
              onClick={openPhotoModal}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              📷 上传 ta 的照片
            </button>
            <p className="form-hint" style={{ textAlign: 'center', marginTop: 8 }}>
              用于提取时间和地点信息，也可作为头像
            </p>
            {form.photos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {form.photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', width: 60, height: 60 }}>
                    <img
                      src={URL.createObjectURL(p)}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#fff', border: '1px solid var(--border)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-full" onClick={() => setStep(4)} style={{ marginTop: 8 }}>
            下一步：确认信息
          </button>
        </>
      )}

      {/* Step 4: 确认信息 & 生成 */}
      {step === 4 && (
        <>
          <button className="btn btn-ghost" onClick={() => setStep(3)} style={{ marginBottom: 16 }}>
            <ArrowLeft size={16} /> 返回
          </button>

          {/* 汇总 */}
          <div className="card">
            <h2>确认创建</h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p><strong>专属称呼：</strong>{form.name || '（未填写）'}</p>
              <p><strong>基本信息：</strong>{form.basicInfo || '（未填写）'}</p>
              <p><strong>性格画像：</strong>{form.personality || '（未填写）'}</p>
              <p><strong>依恋类型：</strong>{form.attachmentStyle || '（未选择）'}</p>
              <p><strong>爱的语言：</strong>{form.loveLanguage || '（未选择）'}</p>
              <p><strong>性格标签：</strong>
                {(() => {
                  let allTags = [...form.selectedTags];
                  if (form.customTags) {
                    const customTagsArray = form.customTags.split(',').map(tag => tag.trim()).filter(Boolean);
                    allTags = [...allTags, ...customTagsArray];
                  }
                  return allTags.length > 0 ? allTags.join('、') : '（未选择）';
                })()}
              </p>
              <p><strong>聊天记录：</strong>{form.wechatFile?.name || form.qqFile?.name || '（未上传）'}</p>
              <p><strong>照片：</strong>{form.photos.length > 0 ? `${form.photos.length} 张` : '（未上传）'}</p>
            </div>
          </div>

          {error && (
            <p style={{ color: '#e57373', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? (
              <>生成中，请稍候...</>
            ) : (
              <>
                <Check size={16} /> 开始创建「{form.name}」
              </>
            )}
          </button>
        </>
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
              <select value={modalApiBase} onChange={e => setModalApiBase(e.target.value)}>
                <option value="https://api.openai.com/v1">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="https://api.minimaxi.com/v1">MiniMax (OpenAI兼容)</option>
                <option value="https://api.minimaxi.com/anthropic">MiniMax (Anthropic兼容)</option>
                <option value="https://open.bigmodel.cn/api/paas/v1">智谱 GLM</option>
                <option value="https://dashscope.aliyuncs.com/compatible-mode/v1">阿里 通义</option>
                <option value="https://api.minimax.chat/v1">MiniMax (旧版)</option>
              </select>
            </div>

            <div className="form-group">
              <label>模型</label>
              <select value={modalModel} onChange={e => setModalModel(e.target.value)}>
                <option value="gpt-4o-mini">GPT-4o mini (便宜快速)</option>
                <option value="gpt-4o">GPT-4o (功能强大)</option>
                <option value="MiniMax-M2.7">MiniMax-M2.7</option>
                <option value="MiniMax-M2.7-highspeed">MiniMax-M2.7-highspeed</option>
                <option value="MiniMax-M2.5">MiniMax-M2.5</option>
                <option value="MiniMax-M2.5-highspeed">MiniMax-M2.5-highspeed</option>
                <option value="MiniMax-M2.1">MiniMax-M2.1</option>
                <option value="MiniMax-M2.1-highspeed">MiniMax-M2.1-highspeed</option>
                <option value="MiniMax-M2">MiniMax-M2</option>
              </select>
            </div>

            <div className="form-group">
              <label>API Base URL</label>
              <input
                type="text"
                value={modalApiBase}
                onChange={e => setModalApiBase(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={modalApiKey}
                onChange={e => setModalApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="form-hint">Key 只保存在本地浏览器中，不会上传到任何服务器</p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowApiModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={saveModalApiKey} disabled={!modalApiKey}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 照片上传弹窗 */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', margin: 0 }}>
            <h2 style={{ marginBottom: 20 }}>上传照片</h2>

            <div className="form-group">
              <label>选择照片</label>
              <div className="file-upload" onClick={() => photoRef.current?.click()}>
                <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotos} />
                <div className="file-upload-icon">📷</div>
                <p>点击选择照片</p>
                <p className="form-hint">支持多张照片，最多 20 张</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowPhotoModal(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {creating && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p className="loading-text">正在分析聊天记录，生成记忆和人格...</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, textAlign: 'center' }}>
            这需要几分钟，取决于聊天记录的长度
          </p>
        </div>
      )}
    </div>
  )
}
