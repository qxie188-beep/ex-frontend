# WORKSPACE BRIEFING

## SNAPSHOT

type: single | full-stack  
langs: TypeScript (frontend), Python (backend)  
runtimes: Node.js 18+, Python 3.11+  
pkgManager: npm (frontend), pip (backend)  
deliverables: React SPA + FastAPI server  
rootConfigs: vite.config.ts, ex-frontend/backend/requirements.txt  

---

## PACKAGES

| name | path | type | deps | role |
|------|------|------|------|------|
| shi-ai-frontend | ex-frontend | app | react, react-router-dom, lucide-react | Frontend SPA for ex-list + multi-step form + chat UI |
| backend | ex-frontend/backend | service | fastapi, uvicorn, openai, pypinyin | FastAPI server: ex creation, chat, persistence |

---

## DEPENDENCY GRAPH

ex-frontend/frontend → http://localhost:18000/api (backend)  
ex-frontend/backend → OpenAI API, local file storage  

---

## ARCHITECTURE

### shi-ai-frontend (`ex-frontend/src`)

entry: main.tsx → App.tsx  
routing: BrowserRouter, Routes: / (Landing), /home (HomePage), /create (CreateExPage), /chat/:slug (ChatPage)  
state: localStorage for apiKey, apiBase, ex_list cache  
api: fetch to http://localhost:18000/api/{create-ex, chat, ex-list, ex/:slug}  
build: Vite + React plugin, tsc validation  
dirs: components/ (UI), hooks/ (useSpeechRecognition), pages/ (route components), styles/ (globals.css, CSS vars), utils/  

### backend (`ex-frontend/backend/app`)

entry: __init__.py → FastAPI setup, CORS middleware, router mount  
routing: /api/create-ex (POST), /api/chat (POST), /api/ex-list (GET), /api/ex/:slug (DELETE)  
state: in-memory sessions dict keyed by slug  
persistence: ex-frontend/backend/app/exes/{slug}/ → meta.json, persona.md, memory.md  
db: file-based, local exes/ directory  
auth: none (frontend-side API key management)  
build: Python 3.11+, uvicorn runner  
dirs: exes/ (ex metadata + generated docs), uploads/ (chat history, photos, exported files)  
core: analyzer.py (ExAnalyzer class: create_ex, chat, list_exes, delete_ex)  

---

## STACK

`shi-ai-frontend` → framework: React 19.2.4, routing: react-router-dom 7.1.3, build: Vite 8.0.4  
`backend` → framework: FastAPI 0.109.2, runtime: Uvicorn 0.27.1, llm: OpenAI SDK 1.12.0, utils: pypinyin 0.53.0  

---

## STYLE

- naming: camelCase (JS), snake_case (Python), slug = Chinese→pinyin lowercase alphanumeric  
- imports: ES modules (frontend), explicit relative imports (backend)  
- typing: TypeScript strict, Python type hints in function signatures  
- errors: HTTPException + JSONResponse (backend), try/catch + error state (frontend)  
- testing: none observed  
- lint: ESLint with React + TypeHooks + TypeScript config (eslint.config.js)  
- formatting: no Prettier config, manual spacing  
- patterns: controlled form component (CreateExPage step-based state), async executor pattern (ThreadPoolExecutor for AI calls)  

---

## STRUCTURE

`ex-frontend/src/` → React app root  
`ex-frontend/src/pages/` → route-level components (HomePage, CreateExPage, ChatPage, LandingPage)  
`ex-frontend/src/components/` → reusable UI (ShaderBackground)  
`ex-frontend/src/hooks/` → custom hooks (useSpeechRecognition)  
`ex-frontend/src/styles/` → global CSS, design tokens  
`ex-frontend/backend/app/` → FastAPI app, ExAnalyzer core logic  
`ex-frontend/backend/app/exes/` → persisted ex records  
`ex-frontend/dist/` → Vite build output  

---

## BUILD

workspaceScripts:  
- dev: vite --port 5173  
- build: tsc -b && vite build  
- preview: vite preview  

Backend (run manually):  
```
cd ex-frontend/backend
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 18000
```

envFiles: none  
envPrefixes: ex_* (localStorage keys), UPLOAD_DIR (backend path)  
ci: none  
docker: none  

---

## LOOKUP

### Frontend Routes

add landing content → ex-frontend/src/pages/LandingPage.tsx  
add home page feature → ex-frontend/src/pages/HomePage.tsx  
add create step logic → ex-frontend/src/pages/CreateExPage.tsx  
add chat UI → ex-frontend/src/pages/ChatPage.tsx  
add route → ex-frontend/src/App.tsx  

### Backend Endpoints

add ex creation logic → ex-frontend/backend/app/routers.py (POST /create-ex), ex-frontend/backend/app/analyzer.py (ExAnalyzer.create_ex)  
add chat logic → ex-frontend/backend/app/routers.py (POST /chat), ex-frontend/backend/app/analyzer.py (ExAnalyzer.chat)  
add list/delete → ex-frontend/backend/app/routers.py (GET /ex-list, DELETE /ex/{slug})  
modify AI prompts → ex-frontend/backend/app/analyzer.py (_generate_with_ai method)  

---

## KEY FILES

`ex-frontend/package.json` → project metadata, npm scripts, frontend deps  
`ex-frontend/vite.config.ts` → Vite React plugin, dev server setup  
`ex-frontend/tsconfig.json` → TypeScript build config references  
`ex-frontend/src/App.tsx` → main routing, page layout wrapper  
`ex-frontend/src/main.tsx` → React entry point, DOM mount, styles import  
`ex-frontend/src/pages/HomePage.tsx` → ex list display, delete/edit, API config modal  
`ex-frontend/src/pages/CreateExPage.tsx` → 4-step form (basics, materials, relations, API), file uploads  
`ex-frontend/src/pages/ChatPage.tsx` → chat interface, message history, AI response  
`ex-frontend/index.html` → HTML template, meta tags, root div  
`ex-frontend/backend/requirements.txt` → Python deps (FastAPI, OpenAI, pypinyin)  
`ex-frontend/backend/app/__init__.py` → FastAPI app instance, CORS middleware, router mount  
`ex-frontend/backend/app/routers.py` → HTTP endpoints, file handling, async executor calls  
`ex-frontend/backend/app/analyzer.py` → ExAnalyzer class (create_ex, chat, list_exes, delete_ex), AI prompt generation  
`ex-frontend/src/styles/globals.css` → CSS variables, base styles, component classes (card, btn, tag, form-group)  
`ex-frontend/eslint.config.js` → ESLint config (React, TypeScript, React Hooks, React Refresh)  

---

## DATA FLOW

### Create Ex Flow

1. User fill form (name, basic_info, personality, tags, files, plaintext) → CreateExPage state  
2. User clicks "开始创建" → handleCreate (FormData construction)  
3. POST ex-frontend/backend/app/routers.py::POST /create-ex  
   - File save to exes/uploads/  
   - ExAnalyzer.create_ex called (executor.run_in_executor)  
   - AI prompt: basic_info + personality + chat_text → OpenAI  
   - Response parsed: memory.md + persona.md  
   - Files written: exes/{slug}/{meta.json, persona.md, memory.md}  
   - Session stored in-memory {slug → {name, memory, persona}}  
4. Response: {slug, name, memory_preview, persona_preview}  
5. Frontend navigate to /chat/{slug}  

### Chat Flow

1. User message in ChatPage  
2. POST /api/chat (session_id, message, api_key, api_base, model)  
3. Backend retrieves session {persona, memory}  
4. AI system prompt: persona + memory + chat_rules  
5. OpenAI call with message  
6. Response streamed/returned  
7. UI appends message  

### Ex List Flow

1. HomePage useEffect → GET /api/ex-list  
2. Backend list_exes: scan exes/ dir, read meta.json per slug  
3. Return array of {slug, name, created_at, basic_info, personality}  
4. Display in grid  

---

## STORAGE

### Frontend (localStorage)

- ex_api_key: OpenAI/compatible API key  
- ex_api_base: API base URL  
- ex_list: cached JSON array of ex records  

### Backend (filesystem)

- ex-frontend/backend/app/exes/{slug}/meta.json: {name, slug, created_at, basic_info, personality}  
- ex-frontend/backend/app/exes/{slug}/persona.md: 5-layer persona doc  
- ex-frontend/backend/app/exes/{slug}/memory.md: relationship memory overview  
- ex-frontend/backend/app/uploads/: chat history exports, photos  

---

## API CONTRACTS

### POST /api/create-ex

Request: FormData  
- name (string, required)  
- basic_info (string)  
- personality (string)  
- api_key (string, required)  
- api_base (string, default: https://api.openai.com/v1)  
- model (string, default: gpt-4o-mini)  
- wechat_file (file)  
- qq_file (file)  
- photo_files (files)  
- plaintext (string)  

Response: {slug, name, memory_preview, persona_preview}  

### POST /api/chat

Request: FormData  
- session_id (string, required)  
- message (string, required)  
- api_key (string, required)  
- api_base, model  

Response: {reply: string}  

### GET /api/ex-list

Response: [{slug, name, created_at, basic_info, personality}, ...]  

### DELETE /api/ex/{slug}

Response: {ok: boolean}  

---

## NAMING CONVENTIONS

- Ex = 前任 (ex/former partner)
- Slug = Chinese name → pypinyin → lowercase alphanumeric (e.g., "小明" → "xiaoming")
- Persona = 5-layer behavior/personality profile (hardRules, identity, speech, emotions, relationships)
- Memory = relationship timeline, key moments, shared memories, conflict/sweet records
