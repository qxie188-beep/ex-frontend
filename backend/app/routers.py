"""
主路由
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import os
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from . import analyzer
from .analyzer import ExAnalyzer

router = APIRouter()
executor = ThreadPoolExecutor(max_workers=3)


def get_analyzer() -> ExAnalyzer:
    return ExAnalyzer()


@router.post("/create-ex")
async def create_ex(
    name: str = Form(...),
    basic_info: str = Form(""),
    personality: str = Form(""),
    api_key: str = Form(...),
    api_base: str = Form("https://api.openai.com/v1"),
    model: str = Form("gpt-4o-mini"),
    wechat_file: Optional[UploadFile] = File(None),
    qq_file: Optional[UploadFile] = File(None),
    photo_files: list[UploadFile] = File([]),
    plaintext: str = Form(""),
):
    """创建前任 Skill"""
    loop = asyncio.get_event_loop()
    analyzer_ins = get_analyzer()

    # 处理上传的文件
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    files = {}

    if wechat_file:
        path = os.path.join(upload_dir, f"wechat_{wechat_file.filename}")
        with open(path, "wb") as f:
            content = await wechat_file.read()
            f.write(content)
        files["wechat"] = path

    if qq_file:
        path = os.path.join(upload_dir, f"qq_{qq_file.filename}")
        with open(path, "wb") as f:
            content = await qq_file.read()
            f.write(content)
        files["qq"] = path

    if photo_files:
        photo_dir = os.path.join(upload_dir, "photos")
        os.makedirs(photo_dir, exist_ok=True)
        for pf in photo_files:
            path = os.path.join(photo_dir, pf.filename)
            with open(path, "wb") as f:
                f.write(await pf.read())
        files["photos"] = photo_dir

    try:
        result = await loop.run_in_executor(
            executor,
            analyzer_ins.create_ex,
            name, basic_info, personality, files, plaintext, api_key, api_base, model
        )
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat(
    session_id: str = Form(...),
    message: str = Form(...),
    api_key: str = Form(...),
    api_base: str = Form("https://api.openai.com/v1"),
    model: str = Form("gpt-4o-mini"),
):
    """对话"""
    loop = asyncio.get_event_loop()
    analyzer_ins = get_analyzer()

    try:
        reply = await loop.run_in_executor(
            executor,
            analyzer_ins.chat,
            session_id, message, api_key, api_base, model
        )
        return JSONResponse({"reply": reply})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ex-list")
async def list_exes():
    """列出所有已创建的 ex"""
    analyzer_ins = get_analyzer()
    return JSONResponse(analyzer_ins.list_exes())


@router.get("/ex/{slug}")
async def get_ex(slug: str):
    """获取 ex 详情"""
    analyzer_ins = get_analyzer()
    exes = analyzer_ins.list_exes()
    for ex in exes:
        if ex["slug"] == slug:
            return JSONResponse(ex)
    raise HTTPException(status_code=404, detail="Not found")


@router.delete("/ex/{slug}")
async def delete_ex(slug: str):
    """删除 ex"""
    analyzer_ins = get_analyzer()
    analyzer_ins.delete_ex(slug)
    return JSONResponse({"ok": True})
