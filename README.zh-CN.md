
# 工作区简报

[English](README.md)

---

## 快照

类型：单体 | 全栈  
语言：TypeScript（前端）、Python（后端）  
运行环境：Node.js 18+、Python 3.11+  
包管理：npm（前端）、pip（后端）  
交付物：React SPA + FastAPI 服务端  
根配置：vite.config.ts, ex-frontend/backend/requirements.txt  

---

## 依赖包

| 名称 | 路径 | 类型 | 依赖 | 角色 |
|------|------|------|------|------|
| shi-ai-frontend | ex-frontend | 应用 | react, react-router-dom, lucide-react | 前端 SPA，包含前任列表、多步表单、聊天 UI |
| backend | ex-frontend/backend | 服务 | fastapi, uvicorn, openai, pypinyin | FastAPI 服务端：前任创建、聊天、持久化 |

---

## 依赖关系

ex-frontend/frontend → http://localhost:18000/api（后端）  
ex-frontend/backend → OpenAI API、本地文件存储  

---

## 架构

### shi-ai-frontend（`ex-frontend/src`）

入口：main.tsx → App.tsx  
路由：BrowserRouter，路由：/（Landing），/home（主页），/create（创建页），/chat/:slug（聊天页）  
状态：localStorage 存储 apiKey、apiBase、ex_list 缓存  
API：fetch 到 http://localhost:18000/api/{create-ex, chat, ex-list, ex/:slug}  
构建：Vite + React 插件，tsc 校验  
目录：components/（UI）、hooks/（useSpeechRecognition）、pages/（路由组件）、styles/（全局 CSS）、utils/  

### backend（`ex-frontend/backend/app`）

入口：__init__.py → FastAPI 初始化、CORS 中间件、路由挂载  
路由：/api/create-ex（POST）、/api/chat（POST）、/api/ex-list（GET）、/api/ex/:slug（DELETE）  
状态：内存 sessions 字典，键为 slug  
持久化：ex-frontend/backend/app/exes/{slug}/ → meta.json、persona.md、memory.md  
数据库：基于文件的 exes/ 目录  
认证：无（前端管理 API key）  
构建：Python 3.11+，uvicorn 启动  
目录：exes/（前任数据）、uploads/（聊天记录、照片、导出文件）  
核心：analyzer.py（ExAnalyzer 类：create_ex、chat、list_exes、delete_ex）  

---

## 技术栈

`shi-ai-frontend` → 框架：React 19.2.4，路由：react-router-dom 7.1.3，构建：Vite 8.0.4  
`backend` → 框架：FastAPI 0.109.2，运行：Uvicorn 0.27.1，LLM：OpenAI SDK 1.12.0，工具：pypinyin 0.53.0  

---

## 代码风格

- 命名：camelCase（JS）、snake_case（Python）、slug = 中文转拼音小写字母数字
- 导入：ES 模块（前端）、显式相对导入（后端）
- 类型：TypeScript 严格，Python 函数签名类型注解
- 错误：HTTPException + JSONResponse（后端）、try/catch + error state（前端）
- 测试：暂无
- Lint：ESLint（React + TypeHooks + TypeScript 配置）
- 格式化：无 Prettier，手动排版
- 模式：受控表单组件（CreateExPage 步进状态）、异步执行器模式（AI 调用 ThreadPoolExecutor）

---

## 目录结构

`ex-frontend/src/` → React 应用根目录  
`ex-frontend/src/pages/` → 路由级组件（HomePage, CreateExPage, ChatPage, LandingPage）  
`ex-frontend/src/components/` → 可复用 UI（ShaderBackground）  
`ex-frontend/src/hooks/` → 自定义 hooks（useSpeechRecognition）  
`ex-frontend/src/styles/` → 全局 CSS、设计变量  
`ex-frontend/backend/app/` → FastAPI 应用、ExAnalyzer 核心逻辑  
`ex-frontend/backend/app/exes/` → 持久化前任数据  
`ex-frontend/dist/` → Vite 构建产物  

---

## 构建

workspace 脚本：  
- dev: vite --port 5173  
- build: tsc -b && vite build  
- preview: vite preview  

后端（需手动运行）：  
```
cd ex-frontend/backend
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 18000
```

env 文件：无  
env 前缀：ex_*（localStorage 键）、UPLOAD_DIR（后端路径）  
CI：无  
Docker：无  

---

## 快速查找

### 前端路由

添加 landing 内容 → ex-frontend/src/pages/LandingPage.tsx  
添加主页功能 → ex-frontend/src/pages/HomePage.tsx  
添加创建流程 → ex-frontend/src/pages/CreateExPage.tsx  
添加聊天 UI → ex-frontend/src/pages/ChatPage.tsx  
添加路由 → ex-frontend/src/App.tsx  

### 后端接口

添加前任创建逻辑 → ex-frontend/backend/app/routers.py（POST /create-ex）、ex-frontend/backend/app/analyzer.py（ExAnalyzer.create_ex）  
添加聊天逻辑 → ex-frontend/backend/app/routers.py（POST /chat）、ex-frontend/backend/app/analyzer.py（ExAnalyzer.chat）  
添加列表/删除 → ex-frontend/backend/app/routers.py（GET /ex-list, DELETE /ex/{slug}）  
修改 AI 提示词 → ex-frontend/backend/app/analyzer.py（_generate_with_ai 方法）  

---

## 关键文件

`ex-frontend/package.json` → 项目元数据、npm 脚本、前端依赖  
`ex-frontend/vite.config.ts` → Vite React 插件、开发服务器配置  
`ex-frontend/tsconfig.json` → TypeScript 构建配置  
`ex-frontend/src/App.tsx` → 主路由、页面布局  
`ex-frontend/src/main.tsx` → React 入口、DOM 挂载、样式导入  
`ex-frontend/src/pages/HomePage.tsx` → 前任列表、删除/编辑、API 配置弹窗  
`ex-frontend/src/pages/CreateExPage.tsx` → 4 步表单（基础、资料、关系、API）、文件上传  
`ex-frontend/src/pages/ChatPage.tsx` → 聊天界面、消息历史、AI 回复  
`ex-frontend/index.html` → HTML 模板、meta 标签、root div  
`ex-frontend/backend/requirements.txt` → Python 依赖（FastAPI、OpenAI、pypinyin）  
`ex-frontend/backend/app/__init__.py` → FastAPI 实例、CORS 中间件、路由挂载  
`ex-frontend/backend/app/routers.py` → HTTP 接口、文件处理、异步执行器调用  
`ex-frontend/backend/app/analyzer.py` → ExAnalyzer 类（create_ex、chat、list_exes、delete_ex）、AI 提示生成  
`ex-frontend/src/styles/globals.css` → CSS 变量、基础样式、组件类  
`ex-frontend/eslint.config.js` → ESLint 配置（React、TypeScript、Hooks、热更新）  

---

## 数据流

### 创建前任流程

1. 用户填写表单（姓名、基础信息、性格、标签、文件、纯文本）→ CreateExPage 状态
2. 用户点击“开始创建”→ handleCreate（FormData 构造）
3. POST ex-frontend/backend/app/routers.py::POST /create-ex
	- 文件保存到 exes/uploads/
	- ExAnalyzer.create_ex 调用（executor.run_in_executor）
	- AI 提示：basic_info + personality + chat_text → OpenAI
	- 响应解析：memory.md + persona.md
	- 文件写入：exes/{slug}/{meta.json, persona.md, memory.md}
	- 会话存储于内存 {slug → {name, memory, persona}}
4. 响应：{slug, name, memory_preview, persona_preview}
5. 前端跳转到 /chat/{slug}

### 聊天流程

1. 用户在 ChatPage 输入消息
2. POST /api/chat（session_id, message, api_key, api_base, model）
3. 后端检索会话 {persona, memory}
4. AI 系统提示：persona + memory + chat_rules
5. OpenAI 调用
6. 响应流式/返回
7. UI 追加消息

### 前任列表流程

1. HomePage useEffect → GET /api/ex-list
2. 后端 list_exes：扫描 exes/ 目录，读取每个 slug 的 meta.json
3. 返回数组 {slug, name, created_at, basic_info, personality}
4. 前端网格展示

---

## 存储

### 前端（localStorage）

- ex_api_key: OpenAI/兼容 API key
- ex_api_base: API 基础地址
- ex_list: 缓存的前任记录 JSON 数组

### 后端（文件系统）

- ex-frontend/backend/app/exes/{slug}/meta.json: {name, slug, created_at, basic_info, personality}
- ex-frontend/backend/app/exes/{slug}/persona.md: 5 层人物设定文档
- ex-frontend/backend/app/exes/{slug}/memory.md: 关系记忆总览
- ex-frontend/backend/app/uploads/: 聊天导出、照片

---

## API 协议

### POST /api/create-ex

请求: FormData
- name（必填）
- basic_info
- personality
- api_key（必填）
- api_base（默认：https://api.openai.com/v1）
- model（默认：gpt-4o-mini）
- wechat_file
- qq_file
- photo_files
- plaintext

响应: {slug, name, memory_preview, persona_preview}

### POST /api/chat

请求: FormData
- session_id（必填）
- message（必填）
- api_key（必填）
- api_base, model

响应: {reply: string}

### GET /api/ex-list

响应: [{slug, name, created_at, basic_info, personality}, ...]

### DELETE /api/ex/{slug}

响应: {ok: boolean}

---

## 命名约定

- Ex = 前任
- Slug = 中文名 → pypinyin → 小写字母数字（如“小明”→“xiaoming”）
- Persona = 5 层行为/性格设定（hardRules、identity、speech、emotions、relationships）
- Memory = 关系时间线、关键事件、共同回忆、冲突/甜蜜记录
