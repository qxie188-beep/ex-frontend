# 前任.skill 网页版

把前任蒸馏成 AI Skill 的网页界面，无需 OpenClaw，直接本地运行。

---

## 快速启动

### 1. 安装后端依赖

```bash
cd ex-frontend/backend
pip3 install -r requirements.txt
pip3 install pypinyin   # 中文转拼音（生成 slug 用）
```

### 2. 安装前端依赖

```bash
cd ../frontend
npm install
```

### 3. 启动后端

```bash
cd ../backend
uvicorn app:app --host 0.0.0.0 --port 18000 --reload
```

### 4. 启动前端（新窗口）

```bash
cd frontend
npm run dev
```

访问 http://localhost:5173

---

## 使用流程

1. **首次使用**：配置 OpenAI / MiniMax API Key（只存在本地）
2. **新建前任**：填写代号 + 基本信息 + 上传聊天记录
3. **开始对话**：和记忆中的 ta 聊天

---

## 功能

- 导入微信聊天记录（txt / html / json）
- 导入 QQ 聊天记录（txt / mht）
- 直接粘贴聊天记录
- 上传照片（提取时间地点）
- 性格标签、依恋类型、爱的语言配置
- 语音输入（浏览器原生，不需要额外依赖）
- 支持 OpenAI / MiniMax / 智谱 / 阿里通义 等兼容 API

---

## 界面风格

朴素高级 — 米白底色 + 衬线标题，像翻一本旧日记。
