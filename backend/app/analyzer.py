"""
核心分析器：整合所有解析工具，生成 persona + memory
"""
import os
import json
import re
import shutil
from datetime import datetime
from typing import Optional

# MiniMax API 实际端点（OpenAI SDK 兼容）
MINIMAX_API_BASE = "https://api.minimaxi.com/v1"

# 复用 ex-skill 的解析器工具
SKILL_TOOLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "..", "..", "..", "ex-skill", "tools"
)


class ExAnalyzer:
    """前任分析器"""

    def __init__(self):
        self.exes_dir = os.path.join(os.path.dirname(__file__), "exes")
        os.makedirs(self.exes_dir, exist_ok=True)
        self.sessions = {}  # 内存会话

    def create_ex(
        self,
        name: str,
        basic_info: str,
        personality: str,
        files: dict,
        plaintext: str,
        api_key: str,
        api_base: str,
        model: str,
    ) -> dict:
        """
        整合所有输入，生成 persona.md + memory.md
        """
        # 1. 解析聊天记录
        chat_text = ""
        if files.get("wechat"):
            chat_text += self._parse_wechat(files["wechat"], name)
        if files.get("qq"):
            chat_text += self._parse_qq(files["qq"], name)
        if plaintext:
            chat_text += f"\n\n## 用户口述\n{plaintext}\n"

        # 2. 生成 slug
        slug = self._to_slug(name)

        # 3. 构建输出目录
        ex_dir = os.path.join(self.exes_dir, slug)
        os.makedirs(ex_dir, exist_ok=True)

        # 4. 调用 AI 生成 persona + memory
        memory_md, persona_md = self._generate_with_ai(
            name=name,
            basic_info=basic_info,
            personality=personality,
            chat_text=chat_text,
            api_key=api_key,
            api_base=api_base,
            model=model,
        )

        # 5. 写入文件
        memory_path = os.path.join(ex_dir, "memory.md")
        persona_path = os.path.join(ex_dir, "persona.md")
        meta_path = os.path.join(ex_dir, "meta.json")

        with open(memory_path, "w", encoding="utf-8") as f:
            f.write(memory_md)
        with open(persona_path, "w", encoding="utf-8") as f:
            f.write(persona_md)

        meta = {
            "name": name,
            "slug": slug,
            "created_at": datetime.now().isoformat(),
            "basic_info": basic_info,
            "personality": personality,
        }
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        # 6. 保存会话上下文
        self.sessions[slug] = {
            "name": name,
            "memory": memory_md,
            "persona": persona_md,
        }

        return {
            "slug": slug,
            "name": name,
            "memory_preview": memory_md[:500],
            "persona_preview": persona_md[:500],
        }

    def chat(
        self,
        session_id: str,
        message: str,
        api_key: str,
        api_base: str,
        model: str,
    ) -> str:
        """对话"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")

        session = self.sessions[session_id]
        persona = session["persona"]
        memory = session["memory"]

        # 构造 prompt
        system_prompt = f"""你是 {session['name']}，不是AI助手。

{persona}

{memory}

## 对话规则
1. 先由 Persona 判断：{session['name']} 会怎么回应？
2. 再由 Memory 补充：结合你们的共同记忆，让回应更真实
3. 始终保持 {session['name']} 的说话风格，包括口头禅、语气词
4. 如果被问到不想回答的问题，可以回避、敷衍、转移话题

直接开始对话，不要说"作为AI"之类的话。"""

        import requests
        resolved_base = self._resolve_api_base(api_base)
        resolved_model = self._resolve_model(model, resolved_base)
        
        # 根据 API 类型构造不同的请求
        if "anthropic" in resolved_base:
            # 使用 Anthropic API 格式
            url = f"{resolved_base}/messages"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            data = {
                "model": resolved_model,
                "max_tokens": 1000,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": message
                            }
                        ]
                    }
                ],
                "temperature": 0.8,
                "thinking": True
            }
            
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            
            # 处理 Anthropic API 响应格式
            answer = ""
            for block in result.get("content", []):
                if block.get("type") == "text":
                    answer += block.get("text", "")
                elif block.get("type") == "thinking":
                    # 可选：处理思考内容
                    pass
        else:
            # 使用 OpenAI API 格式
            url = f"{resolved_base}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            data = {
                "model": resolved_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.8,
            }
            
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            answer = result["choices"][0]["message"]["content"]
        
        return answer

    def list_exes(self):
        """列出所有 ex"""
        exes = []
        if not os.path.exists(self.exes_dir):
            return exes
        for slug in os.listdir(self.exes_dir):
            meta_path = os.path.join(self.exes_dir, slug, "meta.json")
            if os.path.exists(meta_path):
                with open(meta_path, encoding="utf-8") as f:
                    meta = json.load(f)
                exes.append(meta)
        return exes

    def delete_ex(self, slug: str):
        """删除 ex"""
        ex_dir = os.path.join(self.exes_dir, slug)
        if os.path.exists(ex_dir):
            shutil.rmtree(ex_dir)
        if slug in self.sessions:
            del self.sessions[slug]

    def _resolve_model(self, model: str, api_base: str) -> str:
        """根据 API 类型解析正确的模型名称"""
        # 根据 MiniMax 文档，直接使用模型名称，不需要映射
        return model

    def _resolve_api_base(self, api_base: str) -> str:
        """统一解析 API Base URL"""
        if "minimax" in api_base.lower():
            return MINIMAX_API_BASE
        return api_base

    # ─── 内部方法 ───

    def _to_slug(self, name: str) -> str:
        """中文转 slug"""
        import pypinyin
        py = pypinyin.lazy_pinyin(name)
        slug = "".join(py)
        # 英文原样，小写
        slug = re.sub(r'[^a-z0-9]', '', slug.lower())
        return slug or "ex"

    def _parse_wechat(self, path: str, target: str) -> str:
        """调用 wechat_parser.py"""
        import subprocess
        output = "/tmp/wechat_parsed.txt"
        try:
            subprocess.run(
                ["python3", f"{SKILL_TOOLS_DIR}/wechat_parser.py",
                 "--file", path, "--target", target, "--output", output],
                check=True,
            )
            with open(output, encoding="utf-8") as f:
                return f.read()
        except Exception:
            # 降级：直接读文件
            with open(path, encoding="utf-8", errors="ignore") as f:
                return f.read()[:20000]

    def _parse_qq(self, path: str, target: str) -> str:
        """调用 qq_parser.py"""
        import subprocess
        output = "/tmp/qq_parsed.txt"
        try:
            subprocess.run(
                ["python3", f"{SKILL_TOOLS_DIR}/qq_parser.py",
                 "--file", path, "--target", target, "--output", output],
                check=True,
            )
            with open(output, encoding="utf-8") as f:
                return f.read()
        except Exception:
            with open(path, encoding="utf-8", errors="ignore") as f:
                return f.read()[:20000]

    def _generate_with_ai(
        self,
        name: str,
        basic_info: str,
        personality: str,
        chat_text: str,
        api_key: str,
        api_base: str,
        model: str,
    ) -> tuple[str, str]:
        """调用 AI 生成 persona 和 memory"""
        import requests
        resolved_base = self._resolve_api_base(api_base)
        resolved_model = self._resolve_model(model, resolved_base)
        
        prompt = f"""你是一个关系记忆分析助手。用户提供了关于前任「{name}」的信息，请分析并生成两份文档。

## 用户提供的信息

**基本信息**：
{basic_info or "（未提供）"}

**性格画像**：
{personality or "（未提供）"}

**聊天记录/原材料**：
{chat_text[:10000] if chat_text else "（无聊天记录）"}

---

## 任务

请生成两份 Markdown 文档：

### 文档1：memory.md（关系记忆）
包含以下章节：
- 关系概览（在一起多久、分手多久、认识方式）
- 时间线（认识→在一起→关键事件→分手）
- 共同记忆（常去的地方、Inside Jokes、关键记忆片段）
- 日常模式（联系习惯、约会模式）
- 争吵档案
- 甜蜜档案
- 分手档案

### 文档2：persona.md（人物性格）
包含以下5层：
- Layer 0 硬规则（不可违背的行为准则）
- Layer 1 身份锚定（名字、MBTI、星座、职业等）
- Layer 2 说话风格（口头禅、语气词、标点习惯、emoji偏好）
- Layer 3 情感模式（依恋类型、爱的方式、情绪触发器）
- Layer 4 关系行为（争吵模式、日常互动、边界与底线）

请用中文输出，格式如下：
```
---MEMORY---
[memory.md 全部内容]
---PERSONA---
[persona.md 全部内容]
```

只输出文档内容，不要有其他说明。"""
        
        # 根据 API 类型构造不同的请求
        if "anthropic" in resolved_base:
            # 使用 Anthropic API 格式
            url = f"{resolved_base}/messages"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            data = {
                "model": resolved_model,
                "max_tokens": 4000,
                "system": "你是一个关系记忆分析助手",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                "temperature": 0.7,
                "thinking": True
            }
            
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            
            # 处理 Anthropic API 响应格式
            content = ""
            for block in result.get("content", []):
                if block.get("type") == "text":
                    content += block.get("text", "")
        else:
            # 使用 OpenAI API 格式
            from openai import OpenAI
            import os
            # 保存原始环境变量
            original_proxy = os.environ.get('OPENAI_PROXY')
            original_http_proxy = os.environ.get('HTTP_PROXY')
            original_https_proxy = os.environ.get('HTTPS_PROXY')
            
            try:
                # 临时移除可能影响的环境变量
                if 'OPENAI_PROXY' in os.environ:
                    del os.environ['OPENAI_PROXY']
                if 'HTTP_PROXY' in os.environ:
                    del os.environ['HTTP_PROXY']
                if 'HTTPS_PROXY' in os.environ:
                    del os.environ['HTTPS_PROXY']
                
                # 只传递必要的参数
                client = OpenAI(api_key=api_key, base_url=resolved_base)
            finally:
                # 恢复原始环境变量
                if original_proxy is not None:
                    os.environ['OPENAI_PROXY'] = original_proxy
                if original_http_proxy is not None:
                    os.environ['HTTP_PROXY'] = original_http_proxy
                if original_https_proxy is not None:
                    os.environ['HTTPS_PROXY'] = original_https_proxy

            response = client.chat.completions.create(
                model=resolved_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )

            content = response.choices[0].message.content

        # 分割两部分
        parts = content.split("---MEMORY---")
        if len(parts) < 2:
            return content[:3000], "（生成失败，请重试）"

        memory_and_persona = parts[1]
        persona_parts = memory_and_persona.split("---PERSONA---")
        memory_md = persona_parts[0].strip()
        persona_md = persona_parts[1].strip() if len(persona_parts) > 1 else "（生成失败）"

        return memory_md, persona_md
