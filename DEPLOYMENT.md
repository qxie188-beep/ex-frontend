# 逝爱 - 部署指南

## 仓库名称

GitHub 仓库名称：`逝爱` 或 `shi-ai` （根据你的实际仓库名）

## 部署步骤

### 第一步：部署后端到 Railway

1. 登录 [Railway.app](https://railway.app)，使用 GitHub 登录
2. 点击 "New Project" → "Deploy from GitHub"
3. 选择你的仓库（`逝爱`）
4. Railway 会自动检测 FastAPI，确认以下配置：
   - 构建命令：保持默认
   - 启动命令：`cd backend && python -m uvicorn app:app --host 0.0.0.0 --port $PORT`
5. 点击 "Deploy"
6. 部署成功后，复制你的 Railway URL（例如：`https://your-app.railway.app`）

### 第二步：修改前端 API 地址

在 Vercel 部署时设置环境变量：

1. 登录 [Vercel.com](https://vercel.com)，使用 GitHub 登录
2. 点击 "Import Project" → 选择你的仓库
3. 在 "Environment Variables" 部分，添加：
   - 名称：`VITE_API_BASE_URL`
   - 值：你的 Railway URL（例如：`https://your-app.railway.app`）
4. 点击 "Deploy"

### 第三步：访问应用

前端部署成功后，你会得到一个 Vercel URL（例如：`https://shi-ai.vercel.app`）

分享这个链接给别人，他们就可以使用了！

## 本地开发

本地开发时，`.env` 文件会自动使用 `http://localhost:18000`。

## 注意事项

- **免费额度**：Railway 每月 500 小时，Vercel 每月 100G 带宽
- **AI API Key**：Key 只保存在用户本地浏览器中，不会上传到服务器
- **记忆数据**：所有记忆数据保存在 Railway 的临时存储中（重启会丢失），如需持久化需要配置数据库
