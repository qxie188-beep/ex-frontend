# 逝爱

把逝爱蒸馏成 AI Skill 的网页界面，无需 OpenClaw，直接本地运行。

记忆是一种不讲道理的存储介质。逝爱，就是把这些不公平的记忆导出来，从生物硬盘到数字硬盘完成格式转换。

---

## 快速开始

### 最简单的方式

1. **双击 `启动后端.bat`**
2. **双击 `启动前端.bat`**
3. 打开浏览器访问 **http://localhost:5173**

### 手动启动

#### 1. 安装依赖

```bash
# 前端
npm install

# 后端
cd backend
pip install -r requirements.txt
pip install pypinyin
cd ..
```

#### 2. 启动后端

```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 18000 --reload
```

#### 3. 启动前端（新窗口）

```bash
npm run dev
```

访问 http://localhost:5173

---

## 使用流程

1. **首次使用**：配置 AI API Key（只保存在本地浏览器）
2. **创建记忆**：填写姓名 + 基本信息 + 上传聊天记录
3. **开始对话**：和记忆中的 ta 聊天

---

## 功能特性

- 📱 **导入聊天记录**：支持微信（txt/html/json）、QQ（txt/mht）
- 📝 **直接粘贴**：直接粘贴聊天记录文本
- 📷 **上传照片**：支持上传照片（提取时间地点）
- 🏷️ **性格标签**：配置性格标签、依恋类型、爱的语言
- 🎤 **语音输入**：浏览器原生语音输入，无需额外依赖
- 🤖 **多API支持**：支持 OpenAI / MiniMax / 智谱 / 阿里通义 等兼容 API

---

## 支持的 AI 服务

- OpenAI (GPT-4o / GPT-4o-mini)
- MiniMax (OpenAI 兼容 / Anthropic 兼容)
- 智谱 GLM
- 阿里通义
- 以及所有 OpenAI 兼容的 API

---

## 技术栈

- **前端**：React 19 + TypeScript + Vite
- **后端**：FastAPI + Python
- **UI**：原生 CSS + 毛玻璃效果
- **AI**：OpenAI SDK 兼容接口

---

## 隐私说明

- API Key 只保存在你的本地浏览器中
- 记忆数据保存在后端服务器（本地或云端）
- 不会将你的数据上传到任何第三方服务器