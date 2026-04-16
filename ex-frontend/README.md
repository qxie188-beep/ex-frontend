# 逝爱

保存那些美好的回忆

## 🚀 快速开始（Windows用户推荐）

### 最简单的方式

1. 确保已安装：
   - Python 3.10+ (https://www.python.org/downloads/)
   - Node.js 18+ (https://nodejs.org/)

2. **双击 `快速启动.bat`**

3. 等待依赖安装完成（首次运行需要）

4. 在浏览器中打开 http://localhost:5173

---

## 简介

记忆是一种不讲道理的存储介质。你记不住高数公式，记不住车牌号，记不住今天是几号，但你清楚记得四年前的一个下午ta穿了一件白T恤站在便利店门口等你，手里拿着两根冰棍，一根给你，一根ta自己。

这不公平。

"逝爱"就是把这些不公平的记忆导出来，从生物硬盘到数字硬盘完成格式转换。

导完以后你或许会发现，ta也没那么好。ta也没那么差。ta就是那样一个人。会在吵完架两小时后问你吃了吗。会在纪念日那天忘了发消息然后第二天假装什么都没发生。

是的，此刻，阳光在江面碎成一万个夏天，闪烁，又汇聚成一个冬天。这一切在你午睡时发生，你从未察觉。

## 功能特性

- 创建和管理记忆卡片
- 与AI对话，模拟与记忆中的人交流
- 支持多种AI模型（OpenAI、MiniMax等）
- 精美的UI设计，包含便签效果和卡片堆叠动画
- 所有数据存储在本地，保护隐私

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Python + FastAPI
- **AI模型**: OpenAI API兼容接口（支持MiniMax等）

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- pip

### 安装依赖

```bash
# 一键安装所有依赖（前端和后端）
npm run install:all
```

或者分别安装：

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
pip install -r requirements.txt
cd ..
```

### 启动应用

```bash
# 一键启动前端和后端
npm run dev
```

这会同时启动：
- 前端开发服务器: http://localhost:5173
- 后端API服务器: http://localhost:18000

### 单独启动

如果需要单独启动：

```bash
# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend
```

## 配置

首次使用需要配置API接口：

1. 打开应用后，点击配置按钮
2. 选择API类型（推荐使用MiniMax）
3. 输入你的API Key
4. 保存配置

### 支持的API服务

- OpenAI (GPT-4o / GPT-4o-mini)
- MiniMax (OpenAI兼容)
- MiniMax (Anthropic兼容)
- 智谱 GLM
- 阿里 通义

## 项目结构

```
shi-ai/
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── components/   # UI组件
│   │   ├── pages/        # 页面组件
│   │   └── App.tsx       # 主应用
│   └── package.json
└── backend/              # 后端代码
    ├── app/
    │   ├── exes/         # 记忆数据存储
    │   ├── analyzer.py   # AI分析器
    │   └── routers.py    # API路由
    └── requirements.txt
```

## 数据存储

所有记忆数据存储在 `backend/app/exes/` 目录中，包含：
- `memory.md` - 记忆内容
- `persona.md` - 人物设定
- `meta.json` - 元数据

这些数据不会被提交到Git。

## 构建生产版本

```bash
# 构建前端
npm run build
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 致谢

感谢所有美好的回忆 ❤️
