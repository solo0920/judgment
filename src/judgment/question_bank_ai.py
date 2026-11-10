from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Sequence, Tuple

import httpx
from sqlalchemy import select

from .config import Settings
from .law_rag import law_sources_for_question
from .models import QuestionBankItem
from .question_bank import (
    DIFFICULTIES,
    QUESTION_TYPES,
    VISIBILITIES,
    QuestionBankError,
    create_item,
    question_fingerprint,
    update_item,
    validate_payload,
)

AI_SOURCE = "ollama_auto"
MAX_CONTEXT_CHARS = 2600
MAX_ANSWER_CHARS = 4000
MAX_NOTES_CHARS = 4000
AI_ARTICLE_LIMIT = 7
AI_ARTICLE_BUDGET = 8000

ANSWER_SYSTEM_PROMPT = (
    "你是嚴謹的台灣金融法規助手。"
    "只能根據使用者提供的現行法規／條文候選作答，不得發明法規名稱或條號。"
    "請用繁體中文回答，不要輸出 JSON 或 Markdown。"
)

LABEL_SYSTEM_PROMPT = (
    "你是台灣金融法規題庫的標註助手。"
    "只能根據使用者提供的候選法規、候選條文與答案輸出單一 JSON。"
    "不要 Markdown、不要程式碼區塊、不要額外解釋。"
)


def _article_key(value: Any) -> str:
    text = re.sub(r"\s+", "", str(value or ""))
    return text.replace("第", "").replace("條", "").replace("之", "-")


def _choice(value: Any, allowed: Sequence[str], default: str) -> str:
    for part in re.split(r"[|/,，、]", str(value or "")):
        candidate = part.strip()
        if candidate in allowed:
            return candidate
    return default


def _looks_like_refusal(answer: str) -> bool:
    text = re.sub(r"\s+", "", str(answer or ""))
    return bool(
        re.match(
            r"^(抱歉|對不起|無法|目前.{0,12}(資料|資訊).{0,12}不足|"
            r"現有.{0,12}(資料|資訊).{0,12}不足|查無|找不到)",
            text,
        )
    )


def _parse_json_object(content: str) -> Optional[Dict[str, Any]]:
    cleaned = str(content or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        match = re.search(r"\{.*\}", cleaned, re.S)
        if not match:
            return None
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None


def _law_candidates(
    law_sources: Sequence[Dict[str, Any]],
) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    laws: List[Dict[str, str]] = []
    articles: List[Dict[str, str]] = []
    seen_laws = set()
    seen_articles = set()
    for source in law_sources:
        law_name = str(source.get("law_name") or "").strip()
        if not law_name:
            continue
        source_type = str(source.get("source_type") or "law").strip() or "law"
        law_key = (law_name, source_type)
        if law_key not in seen_laws:
            seen_laws.add(law_key)
            laws.append({"law_name": law_name, "source_type": source_type})
        for article in source.get("articles") or []:
            article_no = str(article.get("article_no") or "").strip()
            article_key = _article_key(article_no)
            if not article_key:
                continue
            pair = (law_name, article_key)
            if pair in seen_articles:
                continue
            seen_articles.add(pair)
            articles.append(
                {
                    "law_name": law_name,
                    "source_type": source_type,
                    "article_no": article_no,
                    "article_key": article_key,
                }
            )
    return laws, articles


def _law_context(
    law_sources: Sequence[Dict[str, Any]],
    *,
    limit_chars: int = MAX_CONTEXT_CHARS,
) -> str:
    lines: List[str] = []
    for source in law_sources:
        lines.append(
            f"法規：{source.get('law_name') or ''}"
            f"（{source.get('source_label') or '法規'}）"
        )
        for article in source.get("articles") or []:
            content = re.sub(
                r"\s+", " ", str(article.get("article_content") or "")
            ).strip()
            lines.append(
                f"  {article.get('article_no') or '條文'}：{content[:300]}"
            )
    return "\n".join(lines)[:limit_chars]


def _answer_prompt(question: str, context: str) -> str:
    return f"""題目：
{question}

現行法規／條文候選：
{context or "（檢索不到相符的現行法規／條文候選）"}

請用繁體中文以 2-5 句回答上述題目。只能根據候選條文；若候選資料不足，請明確說明無法回答。回答時請在句中引用所依據的條號（例如「第 7 條」）。不要輸出 JSON、不要 Markdown、不要條列。"""


def _label_prompt(
    question: str,
    answer: str,
    laws: Sequence[Dict[str, str]],
    articles: Sequence[Dict[str, str]],
) -> str:
    law_lines = "\n".join(
        f"- {law['law_name']}" for law in laws
    ) or "（無）"
    article_lines = "\n".join(
        f"- {item['law_name']} {item['article_no']}" for item in articles
    ) or "（無）"
    return f"""題目：
{question}

答案：
{answer}

候選法規：
{law_lines}

候選條文：
{article_lines}

請輸出以下 JSON：
{{
  "question_type": "law_concept",
  "difficulty": "medium",
  "visibility": "shared",
  "expected_laws": [{{"law_name": "法規名稱", "source_type": "law"}}],
  "expected_articles": [{{"law_name": "法規名稱", "article_no": "第 X 條"}}],
  "tags": ["2-6 個繁體中文標籤"],
  "rubric": {{"must_refuse": false}}
}}

規則：
- question_type 只能是 law_concept、article_lookup、judgment_lookup、structured、general、refusal。
- difficulty 只能是 easy、medium、hard；visibility 只能是 shared、holdout。
- expected_laws 只能使用候選法規；expected_articles 只能使用候選條文。
- 若答案表示資料不足或超出範圍，question_type 設 refusal、rubric.must_refuse 設 true，expected_laws 與 expected_articles 留空。
- 只輸出 JSON。"""


def _ollama_chat(
    *,
    settings: Settings,
    messages: Sequence[Dict[str, str]],
    json_mode: bool,
    num_predict: int,
    num_ctx: int,
) -> str:
    if not settings.llm_url or not settings.llm_model:
        raise QuestionBankError(
            "本機 Ollama 未設定。",
            errors=["請設定 LLM_URL 與 LLM_MODEL 後再使用 AI 出題。"],
        )
    url = f"{settings.llm_url.rstrip('/')}/api/chat"
    payload = {
        "model": settings.llm_model,
        "messages": list(messages),
        "stream": False,
        "keep_alive": settings.llm_keep_alive,
        "options": {
            "temperature": 0.1,
            "num_ctx": max(int(num_ctx or 0), 4096),
            "num_predict": num_predict,
        },
    }
    if json_mode:
        payload["format"] = "json"
    try:
        response = httpx.post(
            url,
            json=payload,
            timeout=settings.llm_timeout_seconds,
        )
        response.raise_for_status()
        body = response.json()
    except Exception as exc:
        raise QuestionBankError(
            "Ollama 產生失敗。",
            errors=[f"{exc.__class__.__name__}: {exc}"],
        ) from exc
    return str((body.get("message") or {}).get("content") or "").strip()


def _ollama_answer(
    *,
    settings: Settings,
    question: str,
    context: str,
) -> str:
    messages = [
        {"role": "system", "content": ANSWER_SYSTEM_PROMPT},
        {"role": "user", "content": _answer_prompt(question, context)},
    ]
    last_content = ""
    for attempt in range(2):
        current = list(messages)
        if attempt:
            current.append(
                {
                    "role": "user",
                    "content": (
                        "上一次回答是空的。請務必用繁體中文回答 2-5 句；"
                        "若候選資料不足，請直接說明無法回答。"
                    ),
                }
            )
        content = _ollama_chat(
            settings=settings,
            messages=current,
            json_mode=False,
            num_predict=600,
            num_ctx=max(int(settings.llm_num_ctx or 0), 8192),
        )
        if content:
            return content[:MAX_ANSWER_CHARS]
        last_content = content
    raise QuestionBankError(
        "Ollama 沒有產生回答。",
        errors=["模型連續兩次回傳空回答。", last_content[:800]],
    )


def _ollama_labels(
    *,
    settings: Settings,
    question: str,
    answer: str,
    laws: Sequence[Dict[str, str]],
    articles: Sequence[Dict[str, str]],
) -> Tuple[Dict[str, Any], List[str]]:
    messages = [
        {"role": "system", "content": LABEL_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": _label_prompt(question, answer, laws, articles),
        },
    ]
    last_content = ""
    for attempt in range(2):
        current = list(messages)
        if attempt:
            current.append(
                {
                    "role": "user",
                    "content": (
                        "上一次回應不是有效的 JSON。請只輸出一個完整 JSON 物件，"
                        "不要 Markdown，也不要空白回應。"
                    ),
                }
            )
        content = _ollama_chat(
            settings=settings,
            messages=current,
            json_mode=True,
            num_predict=600,
            num_ctx=4096,
        )
        parsed = _parse_json_object(content)
        if parsed:
            return parsed, []
        last_content = content
    return {}, [
        "Ollama 未能產生標註 JSON，已用答案自動推斷法規／條文。"
        + (f" 原始回應：{last_content[:200]}" if last_content else "")
    ]


def _draft_payload(
    *,
    question: str,
    parsed: Dict[str, Any],
    laws: Sequence[Dict[str, str]],
    articles: Sequence[Dict[str, str]],
    model: str,
) -> Tuple[Dict[str, Any], List[str]]:
    warnings: List[str] = []
    law_by_name = {item["law_name"]: item for item in laws}
    selected_laws: List[Dict[str, str]] = []
    selected_articles: List[Dict[str, str]] = []
    seen_laws = set()
    seen_articles = set()

    raw_laws = parsed.get("expected_laws")
    if not isinstance(raw_laws, list):
        raw_laws = []
    for raw in raw_laws:
        if isinstance(raw, str):
            law_name = raw.strip()
        elif isinstance(raw, dict):
            law_name = str(
                raw.get("law_name") or raw.get("name") or ""
            ).strip()
        else:
            continue
        chosen = law_by_name.get(law_name)
        if chosen is None:
            warnings.append(f"忽略不在候選清單的法規：{law_name or '空白'}")
            continue
        pair = (chosen["law_name"], chosen["source_type"])
        if pair in seen_laws:
            continue
        seen_laws.add(pair)
        selected_laws.append(
            {
                "law_name": chosen["law_name"],
                "source_type": chosen["source_type"],
            }
        )

    raw_articles = parsed.get("expected_articles")
    if not isinstance(raw_articles, list):
        raw_articles = []
    for raw in raw_articles:
        law_name = ""
        article_no = ""
        if isinstance(raw, str):
            if "|" in raw:
                law_name, article_no = [
                    part.strip() for part in raw.split("|", 1)
                ]
            else:
                article_no = raw.strip()
        elif isinstance(raw, dict):
            law_name = str(
                raw.get("law_name") or raw.get("law") or ""
            ).strip()
            article_no = str(
                raw.get("article_no") or raw.get("article") or ""
            ).strip()
        else:
            continue
        article_key = _article_key(article_no)
        if not article_key:
            continue
        match = None
        if law_name:
            match = next(
                (
                    item
                    for item in articles
                    if item["law_name"] == law_name
                    and item["article_key"] == article_key
                ),
                None,
            )
        if match is None:
            same_article = [
                item for item in articles if item["article_key"] == article_key
            ]
            if len(same_article) == 1:
                match = same_article[0]
        if match is None:
            warnings.append(
                f"忽略無法對應現行條文的標註："
                f"{law_name or '未指定法規'} {article_no or '空白'}"
            )
            continue
        pair = (match["law_name"], match["article_key"])
        if pair in seen_articles:
            continue
        seen_articles.add(pair)
        selected_articles.append(
            {
                "law_name": match["law_name"],
                "source_type": match["source_type"],
                "article_no": match["article_no"],
            }
        )

    raw_type = str(parsed.get("question_type") or "").strip()
    question_type = _choice(raw_type, QUESTION_TYPES, "")
    if not question_type:
        if re.search(r"第\s*\d+(?:-\d+)?\s*條", question):
            question_type = "article_lookup"
        elif selected_laws or selected_articles:
            question_type = "law_concept"
        else:
            question_type = "general"
    difficulty = _choice(parsed.get("difficulty"), DIFFICULTIES, "medium")
    visibility = _choice(parsed.get("visibility"), VISIBILITIES, "shared")
    rubric = parsed.get("rubric")
    if not isinstance(rubric, dict):
        rubric = {}
    must_refuse = bool(rubric.get("must_refuse")) or question_type == "refusal"
    if must_refuse:
        question_type = "refusal"
        selected_laws = []
        selected_articles = []

    answer = str(
        parsed.get("reference_answer") or parsed.get("answer") or ""
    ).strip()
    if not answer:
        if must_refuse:
            answer = "目前資料不足以回答此問題。"
        else:
            raise QuestionBankError(
                "Ollama 沒有產生參考答案。",
                errors=["模型回應缺少 reference_answer。"],
            )
    answer = answer[:MAX_ANSWER_CHARS]
    if not must_refuse and _looks_like_refusal(answer):
        must_refuse = True
        question_type = "refusal"
        selected_laws = []
        selected_articles = []

    if not must_refuse:
        for matched_no in re.findall(r"第\s*\d+(?:-\d+)?\s*條", answer):
            article_key = _article_key(matched_no)
            matches = [
                item
                for item in articles
                if item["article_key"] == article_key
            ]
            if len(matches) != 1:
                continue
            matched = matches[0]
            pair = (matched["law_name"], matched["article_key"])
            if pair in seen_articles:
                continue
            seen_articles.add(pair)
            selected_articles.append(
                {
                    "law_name": matched["law_name"],
                    "source_type": matched["source_type"],
                    "article_no": matched["article_no"],
                }
            )

    for article in selected_articles:
        pair = (article["law_name"], article["source_type"])
        if pair not in seen_laws:
            seen_laws.add(pair)
            selected_laws.append(
                {
                    "law_name": article["law_name"],
                    "source_type": article["source_type"],
                }
            )

    if not raw_type and not must_refuse:
        if selected_articles:
            question_type = "article_lookup"
        elif selected_laws:
            question_type = "law_concept"

    raw_tags = parsed.get("tags")
    if isinstance(raw_tags, str):
        raw_tags = re.split(r"[,，、;；]", raw_tags)
    elif not isinstance(raw_tags, list):
        raw_tags = []
    tags: List[str] = []
    for value in raw_tags:
        tag = str(value).strip()
        if not tag:
            continue
        if "標籤" in tag or re.search(r"\d+\s*-\s*\d+", tag):
            continue
        if tag not in tags:
            tags.append(tag)
        if len(tags) >= 8:
            break
    if not tags:
        tags = [
            law["law_name"]
            for law in laws
            if law["law_name"] in question
        ][:4]
    if not tags and selected_laws:
        tags = [law["law_name"] for law in selected_laws[:4]]

    model_notes = str(parsed.get("notes") or "").strip()
    notes = (
        f"由本機 Ollama（{model}）自動產生；狀態待審，請人工覆核。"
        f"{(' ' + model_notes) if model_notes else ''}"
    )[:MAX_NOTES_CHARS]

    return {
        "question": question,
        "question_type": question_type,
        "difficulty": difficulty,
        "visibility": visibility,
        "expected_laws": selected_laws,
        "expected_articles": selected_articles,
        "expected_judgments": [],
        "reference_answer": answer,
        "rubric": {"must_refuse": must_refuse},
        "tags": tags,
        "source": AI_SOURCE,
        "notes": notes,
        "status": "pending_review",
    }, warnings


def create_ai_item(
    session_factory,
    *,
    settings: Settings,
    law_data_dir,
    question: str,
    actor: str = "",
) -> Dict[str, Any]:
    question = str(question or "").strip()
    if len(question) < 4:
        raise QuestionBankError(
            "題目至少需要 4 個字。",
            errors=["題目至少需要 4 個字。"],
        )

    with session_factory() as session:
        existing = session.scalars(
            select(QuestionBankItem).where(
                QuestionBankItem.fingerprint == question_fingerprint(question)
            )
        ).first()
        existing_id = int(existing.id) if existing is not None else None
        existing_deleted = bool(
            existing is not None and existing.deleted_at is not None
        )
    if existing_id is not None and not existing_deleted:
        raise QuestionBankError(
            "題目已存在。",
            errors=[f"題目已存在（題庫編號 {existing_id}）。"],
        )

    law_sources = law_sources_for_question(
        session_factory,
        law_data_dir,
        question,
        limit=5,
        article_limit=AI_ARTICLE_LIMIT,
        article_budget=AI_ARTICLE_BUDGET,
    )
    laws, articles = _law_candidates(law_sources)
    context = _law_context(law_sources)
    answer = _ollama_answer(
        settings=settings,
        question=question,
        context=context,
    )
    labels, label_warnings = _ollama_labels(
        settings=settings,
        question=question,
        answer=answer,
        laws=laws,
        articles=articles,
    )
    payload, warnings = _draft_payload(
        question=question,
        parsed={**labels, "reference_answer": answer},
        laws=laws,
        articles=articles,
        model=settings.llm_model,
    )
    warnings = label_warnings + warnings

    validation = validate_payload(session_factory, payload)
    warnings = warnings + list(validation["warnings"])
    if not validation["valid"]:
        raise QuestionBankError(
            "Ollama 產生的題目驗證失敗。",
            errors=validation["errors"],
            warnings=warnings,
        )

    if existing_id is not None:
        item = update_item(
            session_factory,
            existing_id,
            payload,
            actor=actor,
            change_note="由本機 Ollama 重新產生並還原題目",
            restore=True,
        )
    else:
        item = create_item(session_factory, payload, actor=actor)
    return {
        "item": item,
        "model": settings.llm_model,
        "warnings": warnings,
        "law_candidates": laws,
        "article_candidates": articles,
    }
