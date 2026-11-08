from __future__ import annotations

import re
from typing import Dict, Iterable, List, Optional, Tuple

# Canonical court names. Historical names are kept when the court was actually
# renamed (for example 智慧財產法院 -> 智慧財產及商業法院) so old judgments keep
# the name they were issued under.
CANONICAL_COURTS: Tuple[str, ...] = (
    "最高法院",
    "最高行政法院",
    "憲法法庭",
    "懲戒法院",
    "公務員懲戒委員會",
    "智慧財產及商業法院",
    "智慧財產法院",
    "臺灣高等法院",
    "臺灣高等法院臺中分院",
    "臺灣高等法院臺南分院",
    "臺灣高等法院高雄分院",
    "臺灣高等法院花蓮分院",
    "福建高等法院金門分院",
    "臺北高等行政法院",
    "臺中高等行政法院",
    "高雄高等行政法院",
    "臺灣臺北地方法院",
    "臺灣士林地方法院",
    "臺灣新北地方法院",
    "臺灣桃園地方法院",
    "臺灣新竹地方法院",
    "臺灣苗栗地方法院",
    "臺灣臺中地方法院",
    "臺灣彰化地方法院",
    "臺灣南投地方法院",
    "臺灣雲林地方法院",
    "臺灣嘉義地方法院",
    "臺灣臺南地方法院",
    "臺灣橋頭地方法院",
    "臺灣高雄地方法院",
    "臺灣屏東地方法院",
    "臺灣宜蘭地方法院",
    "臺灣花蓮地方法院",
    "臺灣臺東地方法院",
    "臺灣澎湖地方法院",
    "臺灣基隆地方法院",
    "福建金門地方法院",
    "福建連江地方法院",
    "臺灣高雄少年及家事法院",
    "臺灣高雄少年法院",
)

COURT_NAMES = frozenset(CANONICAL_COURTS)

# Last-resort fallback for judgments whose text only says 本院 or uses a
# 宣示筆錄 header. The JID prefix is an official court code.
JID_COURT_PREFIXES: Dict[str, Tuple[str, ...]] = {
    "憲法法庭": ("JCCC",),
    "懲戒法院": ("TPJP", "TPPP"),
    "智慧財產及商業法院": ("IPCA", "IPCM", "IPCV"),
    "最高法院": ("TPSM", "TPSU", "TPSV"),
    "福建連江地方法院": ("LCDM", "LCDV"),
    "福建金門地方法院": ("KMDM", "KMDV", "KMEM", "KMEV"),
    "福建高等法院金門分院": ("KMHM", "KMHV"),
    "臺中高等行政法院": ("TCBA", "TCTA"),
    "臺北高等行政法院": ("TPAA", "TPBA", "TPTA"),
    "高雄高等行政法院": ("KSBA", "KSTA"),
    "臺灣南投地方法院": ("NTDM", "NTDV", "NTEV"),
    "臺灣嘉義地方法院": ("CYDM", "CYDV", "CYEV"),
    "臺灣基隆地方法院": ("KLDM", "KLDV"),
    "臺灣士林地方法院": ("NHEV", "SLDM", "SLDV", "SLEM", "SLEV"),
    "臺灣宜蘭地方法院": ("ILDM", "ILDV", "ILEV", "LTEV"),
    "臺灣屏東地方法院": ("CCEV", "PTDM", "PTDV", "PTEV"),
    "臺灣彰化地方法院": ("CHDM", "CHDV", "CHEV", "OLEV", "PDEV"),
    "臺灣新北地方法院": ("PCDM", "PCDV", "PCEM", "PCEV", "SJEV"),
    "臺灣新竹地方法院": ("CPEM", "CPEV", "SCDM", "SCDV"),
    "臺灣桃園地方法院": ("CLEM", "CLEV", "TYDM", "TYDV", "TYEM", "TYEV"),
    "臺灣橋頭地方法院": ("CDEV", "CSEV", "CTDM", "CTDV", "GSEV"),
    "臺灣澎湖地方法院": ("MKEM", "MKEV", "PHDM", "PHDV"),
    "臺灣臺中地方法院": (
        "FYEM",
        "FYEV",
        "SDEM",
        "SDEV",
        "TCDM",
        "TCDV",
        "TCEM",
        "TCEV",
    ),
    "臺灣臺北地方法院": ("STEV", "TPDM", "TPDV", "TPEV"),
    "臺灣臺南地方法院": ("SSEM", "SSEV", "SYEM", "SYEV", "TNDM", "TNDV", "TNEV"),
    "臺灣臺東地方法院": ("TTDM", "TTDV", "TTEV"),
    "臺灣花蓮地方法院": ("HLDM", "HLDV", "HLEV"),
    "臺灣苗栗地方法院": ("MLDM", "MLDV"),
    "臺灣雲林地方法院": ("HUEV", "PKEV", "TLEV", "ULDM", "ULDV"),
    "臺灣高等法院": ("TPHM", "TPHV"),
    "臺灣高等法院臺中分院": ("TCHM", "TCHV"),
    "臺灣高等法院臺南分院": ("TNHM", "TNHV"),
    "臺灣高等法院花蓮分院": ("HLHM", "HLHV"),
    "臺灣高等法院高雄分院": ("KSHM", "KSHV"),
    "臺灣高雄地方法院": ("FSEV", "KSDM", "KSDV", "KSEV"),
    "臺灣高雄少年及家事法院": ("KSYV",),
}

JID_PREFIX_COURTS: Dict[str, str] = {
    prefix: court
    for court, prefixes in JID_COURT_PREFIXES.items()
    for prefix in prefixes
}

# Match the longest names first so 臺灣高等法院臺中分院 wins over 臺灣高等法院.
_COURT_RE = re.compile(
    "|".join(re.escape(name) for name in sorted(COURT_NAMES, key=len, reverse=True))
)

DISTRICT_COURTS: Dict[str, str] = {
    "臺北": "臺灣臺北地方法院",
    "士林": "臺灣士林地方法院",
    "新北": "臺灣新北地方法院",
    "桃園": "臺灣桃園地方法院",
    "新竹": "臺灣新竹地方法院",
    "苗栗": "臺灣苗栗地方法院",
    "臺中": "臺灣臺中地方法院",
    "彰化": "臺灣彰化地方法院",
    "南投": "臺灣南投地方法院",
    "雲林": "臺灣雲林地方法院",
    "嘉義": "臺灣嘉義地方法院",
    "臺南": "臺灣臺南地方法院",
    "橋頭": "臺灣橋頭地方法院",
    "高雄": "臺灣高雄地方法院",
    "屏東": "臺灣屏東地方法院",
    "宜蘭": "臺灣宜蘭地方法院",
    "花蓮": "臺灣花蓮地方法院",
    "臺東": "臺灣臺東地方法院",
    "澎湖": "臺灣澎湖地方法院",
    "基隆": "臺灣基隆地方法院",
    "金門": "福建金門地方法院",
    "連江": "福建連江地方法院",
}

_DISTRICT_RE = re.compile(
    "(" + "|".join(sorted(DISTRICT_COURTS, key=len, reverse=True)) + ")"
    r"(?:地方|地方法)(?:院)?"
)
_ADMIN_HIGH_RE = re.compile(r"(臺北|臺中|高雄)高等行政(?:法院)?")
_BRANCH_RE = re.compile(r"(臺中|臺南|高雄|花蓮)分院")
_FUJIAN_BRANCH_RE = re.compile(r"福建高等(?:法院)?金門分院")

# 簡易庭 names that do not always include the parent district court. Used only
# when the head of the full text does not name a court directly.
SIMPLE_COURT_PARENTS: Dict[str, str] = {
    "臺北": "臺灣臺北地方法院",
    "新店": "臺灣臺北地方法院",
    "士林": "臺灣士林地方法院",
    "內湖": "臺灣士林地方法院",
    "板橋": "臺灣新北地方法院",
    "三重": "臺灣新北地方法院",
    "新北": "臺灣新北地方法院",
    "桃園": "臺灣桃園地方法院",
    "中壢": "臺灣桃園地方法院",
    "新竹": "臺灣新竹地方法院",
    "竹北": "臺灣新竹地方法院",
    "苗栗": "臺灣苗栗地方法院",
    "竹南": "臺灣苗栗地方法院",
    "臺中": "臺灣臺中地方法院",
    "豐原": "臺灣臺中地方法院",
    "沙鹿": "臺灣臺中地方法院",
    "大里": "臺灣臺中地方法院",
    "彰化": "臺灣彰化地方法院",
    "員林": "臺灣彰化地方法院",
    "北斗": "臺灣彰化地方法院",
    "和美": "臺灣彰化地方法院",
    "南投": "臺灣南投地方法院",
    "埔里": "臺灣南投地方法院",
    "雲林": "臺灣雲林地方法院",
    "虎尾": "臺灣雲林地方法院",
    "北港": "臺灣雲林地方法院",
    "嘉義": "臺灣嘉義地方法院",
    "朴子": "臺灣嘉義地方法院",
    "臺南": "臺灣臺南地方法院",
    "新市": "臺灣臺南地方法院",
    "柳營": "臺灣臺南地方法院",
    "麻豆": "臺灣臺南地方法院",
    "橋頭": "臺灣橋頭地方法院",
    "高雄": "臺灣高雄地方法院",
    "岡山": "臺灣高雄地方法院",
    "鳳山": "臺灣高雄地方法院",
    "旗山": "臺灣高雄地方法院",
    "屏東": "臺灣屏東地方法院",
    "潮州": "臺灣屏東地方法院",
    "宜蘭": "臺灣宜蘭地方法院",
    "羅東": "臺灣宜蘭地方法院",
    "花蓮": "臺灣花蓮地方法院",
    "玉里": "臺灣花蓮地方法院",
    "臺東": "臺灣臺東地方法院",
    "成功": "臺灣臺東地方法院",
    "澎湖": "臺灣澎湖地方法院",
    "基隆": "臺灣基隆地方法院",
    "金門": "福建金門地方法院",
    "連江": "福建連江地方法院",
}

_SIMPLE_COURT_RE = re.compile(
    "(" + "|".join(sorted(SIMPLE_COURT_PARENTS, key=len, reverse=True)) + ")簡易庭"
)


def _clean(text: str) -> str:
    text = str(text or "").replace("台", "臺")
    text = re.sub(r"\s+", "", text)
    return text.replace("○", "")


def _match_court(text: str) -> Optional[str]:
    if not text:
        return None

    candidates: List[Tuple[int, int, str]] = []

    def add(match: Optional[re.Match[str]], court: Optional[str]) -> None:
        if match and court:
            candidates.append((match.start(), -len(match.group(0)), court))

    match = _COURT_RE.search(text)
    if match:
        add(match, match.group(0))

    match = _DISTRICT_RE.search(text)
    if match:
        add(match, DISTRICT_COURTS.get(match.group(1)))

    match = _ADMIN_HIGH_RE.search(text)
    if match:
        add(match, f"{match.group(1)}高等行政法院")

    match = _FUJIAN_BRANCH_RE.search(text)
    if match:
        add(match, "福建高等法院金門分院")

    match = _BRANCH_RE.search(text)
    if match:
        add(match, f"臺灣高等法院{match.group(1)}分院")

    match = _SIMPLE_COURT_RE.search(text)
    if match:
        add(match, SIMPLE_COURT_PARENTS.get(match.group(1)))

    if not candidates:
        return None

    candidates.sort()
    return candidates[0][2]


def court_from_jid(jid: str) -> str:
    prefix = str(jid or "").split(",", 1)[0].strip().upper()
    return JID_PREFIX_COURTS.get(prefix, "")


def canonical_court_prefix(raw: str) -> str:
    """Return the canonical court name only when the raw value starts with it."""

    match = _COURT_RE.match(_clean(raw))
    return match.group(0) if match else ""


def normalize_court(raw: str = "", full_text: str = "", jid: str = "") -> str:
    """Return a canonical court name for a judgment.

    A raw value that already starts with a canonical court name is trusted
    without scanning the full text. Otherwise the head of the full text is
    authoritative because the first line of a judgment contains the issuing
    court, sometimes with spaces between every character (for example
    ``最 高 行 政 法 院 判 決``). The JID prefix is the final fallback for
    records that only say 本院.
    """

    raw_clean = _clean(raw)
    if raw_clean:
        match = _COURT_RE.match(raw_clean)
        if match:
            return match.group(0)

    if full_text:
        found = _match_court(_clean(str(full_text)[:8000]))
        if found:
            return found

    if raw_clean:
        found = _match_court(raw_clean)
        if found:
            return found

    return court_from_jid(jid)


def court_coverage(values: Iterable[str]) -> Tuple[int, int]:
    """Return (matched, total) for a series of raw court strings."""

    total = 0
    matched = 0
    for value in values:
        total += 1
        if normalize_court(raw=value):
            matched += 1
    return matched, total
