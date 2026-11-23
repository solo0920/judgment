from __future__ import annotations

import calendar
import logging
import re
from dataclasses import dataclass, field
from datetime import date
from typing import Any, Dict, List, Optional, Tuple

from .courts import CANONICAL_COURTS

logger = logging.getLogger(__name__)

_DISTRICTS = [
    "臺北",
    "士林",
    "新北",
    "板橋",
    "桃園",
    "新竹",
    "苗栗",
    "臺中",
    "彰化",
    "南投",
    "雲林",
    "嘉義",
    "臺南",
    "橋頭",
    "高雄",
    "屏東",
    "宜蘭",
    "花蓮",
    "臺東",
    "澎湖",
    "基隆",
    "金門",
    "連江",
]


def _court_values(short: str) -> List[str]:
    if short in ("新北", "板橋"):
        # 同一法院的歷史名稱；日期 filter 會限制實際有效的年代。
        return ["臺灣新北地方法院", "臺灣板橋地方法院"]
    if short in ("金門", "連江"):
        return [f"福建{short}地方法院"]
    return [f"臺灣{short}地方法院"]


COURT_ALIASES = {short: _court_values(short) for short in _DISTRICTS}

# (問題中的關鍵字, 要比對 title 的子字串)
TOPIC_RULES = [
    ("詐騙", "詐欺"),
    ("詐欺", "詐欺"),
    ("洗錢", "洗錢"),
]

LIST_ANALYSIS_TERMS = (
    "責任",
    "刑責",
    "規定",
    "罰則",
    "要件",
    "適用",
    "法律效果",
    "如何",
    "為什麼",
    "是否",
    "構成",
    "定義",
    "範圍",
    "量刑",
    "爭點",
    "理由",
    "態樣",
    "比較",
    "差異",
    "評價",
    "沒收",
    "舉證",
    "證據",
    "論罪",
    "科刑",
    "競合",
    "成立",
    "認定",
)

_YEAR_RANGE = re.compile(
    r"(?:民國)?(?<!\d)(\d{2,4})\s*年?\s*"
    r"(?:至|到|~|～|-|－|—|–|−)\s*"
    r"(?:民國)?(\d{2,4})\s*年?"
)
_YEAR_ONE = re.compile(r"(?:民國)?(?<!\d)(\d{2,4})\s*年(?!代|度)")
_LIST_INTENT = re.compile(
    r"有哪些|有那些|有什麼|列出|清單|所有|全部|幾筆|多少"
)
_RELATIVE_RANGE = re.compile(
    r"(?:近|最近|過去)\s*(\d{1,2}|[一二三四五六七八九十兩两]+)\s*"
    r"(年|個月|月)"
)
_RELATIVE_WITHIN = re.compile(
    r"(?<!\d)(\d{1,2}|[一二三四五六七八九十兩两]+)\s*"
    r"(年|個月|月)\s*內"
)
_CN_DIGITS = {
    "一": 1,
    "二": 2,
    "兩": 2,
    "两": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
}


def _chinese_int(value: str) -> int:
    value = value.strip()
    if value.isdigit():
        return int(value)
    if value == "十":
        return 10
    if value.startswith("十"):
        return 10 + _CN_DIGITS.get(value[1:], 0)
    if "十" in value:
        left, right = value.split("十", 1)
        return _CN_DIGITS.get(left, 1) * 10 + (
            _CN_DIGITS.get(right, 0) if right else 0
        )
    return _CN_DIGITS.get(value, 0)


def _shift_date(today: date, count: int, unit: str) -> date:
    if unit == "年":
        try:
            return today.replace(year=today.year - count)
        except ValueError:
            return today.replace(year=today.year - count, day=28)
    months = today.year * 12 + today.month - 1 - count
    year, month_index = divmod(months, 12)
    month = month_index + 1
    day = min(today.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


@dataclass
class ParsedJudgmentQuery:
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    courts: List[str] = field(default_factory=list)
    topics: List[str] = field(default_factory=list)
    list_intent: bool = False

    @property
    def has_filter(self) -> bool:
        return bool(
            self.courts
            or self.topics
            or self.year_from is not None
            or self.date_from is not None
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "year_from": self.year_from,
            "year_to": self.year_to,
            "date_from": self.date_from,
            "date_to": self.date_to,
            "courts": list(self.courts),
            "topics": list(self.topics),
            "list_intent": self.list_intent,
        }


def _to_ad(value: int) -> Optional[int]:
    year = value + 1911 if 1 <= value <= 199 else value
    return year if 1990 <= year <= 2100 else None


def parse_judgment_query(
    question: str,
    *,
    today: Optional[date] = None,
) -> ParsedJudgmentQuery:
    text = (question or "").strip().replace("台", "臺")
    parsed = ParsedJudgmentQuery()
    now = today or date.today()

    match = _YEAR_RANGE.search(text)
    if match:
        start = _to_ad(int(match.group(1)))
        end = _to_ad(int(match.group(2)))
        if start is not None and end is not None:
            parsed.year_from, parsed.year_to = sorted((start, end))
    # 相對時間（近二年／最近兩年／三年內…）優先於單一年份解析。
    # 否則「近80年」會被 _YEAR_ONE 誤讀成西元 1980 年代。
    relative = _RELATIVE_RANGE.search(text) or _RELATIVE_WITHIN.search(text)
    if parsed.year_from is None and relative is None:
        match = _YEAR_ONE.search(text)
        if match:
            year = _to_ad(int(match.group(1)))
            if year is not None:
                parsed.year_from = parsed.year_to = year

    # 相對時間轉成以今日為終點的絕對日期範圍。
    if relative and parsed.year_from is None:
        count = _chinese_int(relative.group(1))
        unit = relative.group(2)
        if count > 0:
            parsed.date_from = _shift_date(now, count, unit).isoformat()
            parsed.date_to = now.isoformat()

    seen: List[str] = []
    for short, values in COURT_ALIASES.items():
        if re.search(rf"(?:臺灣|福建)?{short}(?:地方法院|地院|法院)", text):
            for value in values:
                if value not in seen:
                    seen.append(value)
    # Also recognize appellate/administrative/supreme courts and other
    # canonical names that are not in the district alias table.
    for name in CANONICAL_COURTS:
        short = name.replace("臺灣", "").replace("福建", "")
        if name in text or (short and short in text):
            if name not in seen:
                seen.append(name)
    parsed.courts = seen

    parsed.topics = sorted(
        {substring for keyword, substring in TOPIC_RULES if keyword in text}
    )
    parsed.list_intent = bool(_LIST_INTENT.search(text))
    return parsed


def build_base_filter(
    parsed: ParsedJudgmentQuery,
) -> Optional[Dict[str, Any]]:
    must: List[Dict[str, Any]] = []
    if parsed.courts:
        must.append(
            {"key": "court", "match": {"any": list(parsed.courts)}}
        )
    if parsed.date_from is not None and parsed.date_to is not None:
        start = int(parsed.date_from.replace("-", ""))
        end = int(parsed.date_to.replace("-", ""))
    elif parsed.year_from is not None and parsed.year_to is not None:
        start = parsed.year_from * 10000 + 101
        end = parsed.year_to * 10000 + 1231
    else:
        start = end = None
    if start is not None and end is not None:
        must.append(
            {
                "key": "jdate_num",
                "range": {"gte": start, "lte": end},
            }
        )
    return {"must": must} if must else None


def build_query_filter(
    store,
    collection: str,
    parsed: ParsedJudgmentQuery,
    *,
    facet_limit: int = 5000,
) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    """Return ``(qdrant_filter_or_None, trace_metadata)``.

    Court/date conditions are applied first.  Title values are resolved
    dynamically within that scope so values such as ``加重詐欺等`` or
    ``常業詐欺`` are not lost to a hand-written allowlist.
    """

    base = build_base_filter(parsed)
    meta: Dict[str, Any] = {
        "year_from": parsed.year_from,
        "year_to": parsed.year_to,
        "date_from": parsed.date_from,
        "date_to": parsed.date_to,
        "courts": list(parsed.courts),
        "topics": list(parsed.topics),
        "titles": [],
        "titles_count": 0,
        "title_unresolved": False,
        "facet_truncated": False,
        "facet_error": False,
    }
    if not parsed.has_filter:
        return None, meta

    must = list(base["must"]) if base else []
    if parsed.topics:
        try:
            hits = store.facet(
                collection,
                "title",
                query_filter=base,
                limit=facet_limit,
                exact=True,
            )
        except Exception:
            logger.warning(
                "title facet failed; falling back to unfiltered titles",
                exc_info=True,
            )
            hits = []
            meta["facet_error"] = True
        meta["facet_truncated"] = len(hits) >= facet_limit
        if meta["facet_truncated"]:
            logger.warning(
                "title facet reached limit %s; some titles may be missing",
                facet_limit,
            )
        titles = sorted(
            {
                str(hit.get("value"))
                for hit in hits
                if any(
                    topic in str(hit.get("value") or "")
                    for topic in parsed.topics
                )
            }
        )
        meta["titles"] = titles[:200]
        meta["titles_count"] = len(titles)
        if titles:
            must.append({"key": "title", "match": {"any": titles}})
        elif not meta["facet_error"]:
            meta["title_unresolved"] = True
    return ({"must": must} if must else None), meta


def is_structured_case_list(question: str) -> bool:
    """Return True for a case list with explicit hard filters.

    This covers phrasings such as "涉及詐欺的板橋地院判決，時間限定在
    2000–2010 年" that do not contain 有哪些/列出 but are still enumeration
    requests.  Analysis terms suppress the list path.
    """

    text = str(question or "").strip()
    if not text:
        return False
    parsed = parse_judgment_query(text)
    if not (
        parsed.courts
        or parsed.year_from is not None
        or parsed.date_from is not None
    ):
        return False
    if not parsed.topics:
        return False
    return not any(term in text for term in LIST_ANALYSIS_TERMS)


def violations(
    payload: Dict[str, Any],
    parsed: ParsedJudgmentQuery,
) -> List[str]:
    """Return hard-constraint violations for one judgment payload."""

    errors: List[str] = []
    jdate = str(payload.get("jdate") or "")
    if len(jdate) == 8 and jdate.isdigit():
        value = int(jdate)
        if (
            parsed.date_from is not None
            and parsed.date_to is not None
        ):
            start = int(parsed.date_from.replace("-", ""))
            end = int(parsed.date_to.replace("-", ""))
            if not (start <= value <= end):
                errors.append(f"date={jdate}")
        elif (
            parsed.year_from is not None
            and parsed.year_to is not None
        ):
            year = int(jdate[:4])
            if not (parsed.year_from <= year <= parsed.year_to):
                errors.append(f"year={year}")
    if parsed.courts and payload.get("court") not in parsed.courts:
        errors.append(f"court={payload.get('court')}")
    title = str(payload.get("title") or "")
    if parsed.topics and not any(
        topic in title for topic in parsed.topics
    ):
        errors.append(f"title={title}")
    return errors
