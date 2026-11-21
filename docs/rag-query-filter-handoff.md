# RAG 判決查詢 Filter 交接資料

> **快照說明（2026-11-21）**：以下是 2026-11-16 的 payload 匯出快照。目前 active collection 已改為 `judgments_v005`、points 為 4,714,967；payload 分佈與缺值比例請重新執行 `scripts/export_qdrant_schema.py`，不要直接把這份 2026-11-16 的分佈當成現況。

- 快照產生時間：`2026-11-16T09:17:38.551183+00:00`
- 快照時 Qdrant alias：`judgments_current`
- 快照時實際 collection：`judgments_v003`
- 快照時 points：`4681502`
- 目前 active collection（2026-11-21）：`judgments_v005`、4,714,967 points
- 向量維度：`1024`
- 抽樣 payload 數：`5000`

> 這份文件由 `scripts/export_qdrant_schema.py` 自動產生；不包含 QDRANT_URL、API key 或任何密鑰。

## P0 實作檔案

- `src/judgment/query_parser.py`：`parse_judgment_query()`、`build_query_filter()`、`violations()`。
- `scripts/backfill_jdate_num.py`：回填 `jdate_num`／`source_year`，並建立 `court`／`title`／`jdate_num` 等 payload index。
- `src/judgment/vector_store.py`：新增 `count()`、`facet()`、`scroll()`。
- `src/judgment/rag.py`：`_search_hits(query_filter=...)`、結構化列舉路徑與後驗 `violations()`。

## 1. Payload 欄位

| 欄位 | 有值 / 抽樣 | 型別 | 範例 | 說明 |
|---|---:|---|---|---|
| `citation_count` | 5000 / 5000 | number×5000 | [4, 1] | 判決引用法規次數。 |
| `court` | 5000 / 5000 | string×5000 | ["臺灣高等法院", "臺灣臺北地方法院"] | 正規化後的法院名稱（keyword）。 |
| `embedding_version` | 4185 / 5000（缺 815） | string×4185 | ["bge-m3@v1"] | 向量版本。 |
| `full_text_length` | 5000 / 5000 | number×5000 | [12706, 779] | 判決全文長度。 |
| `index_recipe_version` | 4185 / 5000（缺 815） | string×4185 | ["doc-head-tail-v1-1600"] | 索引文字規則版本。 |
| `is_current` | 4185 / 5000（缺 815） | bool×4185 | [true] | 是否為 current 向量。 |
| `jdate` | 5000 / 5000 | string×5000 | ["20200624", "20200310"] | 裁判日期，字串 YYYYMMDD。 |
| `jdate_num` | 5000 / 5000 | number×5000 | [20200624, 20200310] | 整數 YYYYMMDD；年份／日期 range filter 使用。 |
| `jid` | 5000 / 5000 | string×5000 | ["TPHV,108,上,1042,20200624,1", "TPDV,109,司票,4687,20200310,1"] | 判決 JID；民國年、案號、西元裁判日期混合。 |
| `matched_laws` | 5000 / 5000 | array[string]×5000 | [["民法", "票據法"], ["票據法"]] | 判決命中的法規名稱陣列。 |
| `model` | 5000 / 5000 | string×5000 | ["bge-m3"] | 索引使用的 embedding 模型。 |
| `pdf_url` | 1663 / 5000（缺 3337） | string×1663 | ["https://data.judicial.gov.tw/opendl/JDocFile/TPHV/108%2c%e4%b8%8a%2c1042%2c20200624%2c1.pdf", "https://data.judicial.gov.tw/opendl/JDocFile/HLDV/113%2c%e7%b0%a1%e4%b8%8a%2c21%2c20250324%2c1.pdf"] | 司法院原判決 PDF。 |
| `snippet` | 5000 / 5000 | string×5000 | ["臺灣高等法院 20200624 債務人異議之訴等 命中法規：民法、票據法 臺灣高等法院民事判決 108年度上字第1042號 上 訴 人 吳武建 訴訟代理人 黃永琛律師 複 代理人 孫誠偉律師 被 上訴人 許耀文 訴訟代理人 黃勝和律師 上列當事人間請求債務人異議之訴等事件，上訴人對於中華民國 108年6月13日臺灣新北…", "臺灣臺北地方法院 20200310 本票裁定 命中法規：票據法 臺灣臺北地方法院民事裁定 109年度司票字第4687號 聲 請 人 裕富數位資融股份有限公司 法定代理人 許國興 相 對 人 黃筠庭 上列當事人間聲請本票准許強制執行事件，本院裁定如下： 主 文 相對人於民國一百零八年五月二十二日簽發之本票內載憑票交付 聲…"] | 索引用 head/tail 摘要，不是全文。 |
| `source_archive` | 5000 / 5000 | string×5000 | ["202006--(20260715Update).rar", "202003--(20260515Update).rar"] | 來源壓縮檔。 |
| `source_year` | 5000 / 5000 | string×5000 | ["2020", "2014"] | 裁判年份，字串 YYYY；適合用 MatchAny 做年份清單。 |
| `title` | 4991 / 5000（缺 9） | string×4991 | ["債務人異議之訴等", "本票裁定"] | 案由（keyword，精確值；不是全文）。 |
| `valid_from_version_id` | 4185 / 5000（缺 815） | number×4185 | [5] | 向量開始有效的索引版本。 |
| `valid_to_version_id` | 0 / 5000（缺 5000） | — | [] | 向量失效的索引版本；null 表示 current。 |

### 欄位缺漏警告

- `embedding_version`：抽樣 5000 筆中 815 筆沒有值。使用此欄位做 filter 會排除這些點。
- `index_recipe_version`：抽樣 5000 筆中 815 筆沒有值。使用此欄位做 filter 會排除這些點。
- `is_current`：抽樣 5000 筆中 815 筆沒有值。使用此欄位做 filter 會排除這些點。
- `pdf_url`：抽樣 5000 筆中 3337 筆沒有值。使用此欄位做 filter 會排除這些點。
- `title`：抽樣 5000 筆中 9 筆沒有值。使用此欄位做 filter 會排除這些點。
- `valid_from_version_id`：抽樣 5000 筆中 815 筆沒有值。使用此欄位做 filter 會排除這些點。
- `valid_to_version_id`：抽樣 5000 筆中 5000 筆沒有值。使用此欄位做 filter 會排除這些點。

> 目前 `jdate_num` 與 `source_year` 已完成回填（缺值 0）；年份 filter 請使用數值 `jdate_num` 的 range。`valid_to_version_id` 的 null 代表 current，`pdf_url` 缺漏不影響 filter。

### 欄位判讀

- `court` 是正規化後的法院名稱，不是判決全文中的原始字串。2000–2010 的舊判決可能同時以 `臺灣新北地方法院` 或 `臺灣板橋地方法院` 出現；filter 應同時包含兩者。
- `jdate` 是 `YYYYMMDD` 字串；`source_year` 是 `YYYY` 字串。Qdrant 的 `range` 不適合直接套在字串欄位，年份請用 `source_year` 的 `MatchAny` 清單，或先在索引加入數值欄位。
- `title` 是案由的精確 keyword，不是全文索引。詐騙類常見值為 `詐欺`、`詐欺等`；不要用 `match: {text: ...}` 期待它做全文搜尋。
- 目前沒有獨立的 `case_type`／`crime_type` 欄位；案由與 `matched_laws` 只能作為輔助條件，不能取代判決全文語意。

## 2. 法院值分佈

| 法院 | 筆數 |
|---|---:|
| 臺灣臺北地方法院 | 990 |
| 臺灣臺中地方法院 | 499 |
| 臺灣新北地方法院 | 482 |
| 臺灣高雄地方法院 | 478 |
| 臺灣士林地方法院 | 429 |
| 臺灣桃園地方法院 | 413 |
| 臺灣臺南地方法院 | 260 |
| 臺灣高等法院 | 159 |
| 臺灣彰化地方法院 | 150 |
| 臺灣新竹地方法院 | 134 |
| 臺灣屏東地方法院 | 102 |
| 臺灣橋頭地方法院 | 93 |
| 臺灣嘉義地方法院 | 87 |
| 最高法院 | 81 |
| 臺灣宜蘭地方法院 | 80 |
| 臺灣雲林地方法院 | 68 |
| 臺灣基隆地方法院 | 68 |
| 臺灣南投地方法院 | 62 |
| 臺灣苗栗地方法院 | 54 |
| 臺灣高等法院臺中分院 | 48 |
| 臺灣花蓮地方法院 | 43 |
| 臺北高等行政法院 | 36 |
| 臺灣高等法院臺南分院 | 30 |
| 臺灣高等法院高雄分院 | 26 |
| 臺灣臺東地方法院 | 25 |
| 臺中高等行政法院 | 24 |
| 高雄高等行政法院 | 24 |
| 最高行政法院 | 10 |
| 臺灣澎湖地方法院 | 10 |
| 福建金門地方法院 | 9 |

### 法院別名建議

| 使用者可能輸入 | 建議 filter 值 |
|---|---|
| 板橋地方法院 | `臺灣新北地方法院`, `臺灣板橋地方法院` |
| 新北地方法院 | `臺灣新北地方法院`, `臺灣板橋地方法院` |
| 臺北地方法院 | `臺灣臺北地方法院` |
| 士林地方法院 | `臺灣士林地方法院` |
| 桃園地方法院 | `臺灣桃園地方法院` |
| 新竹地方法院 | `臺灣新竹地方法院` |
| 苗栗地方法院 | `臺灣苗栗地方法院` |
| 臺中地方法院 | `臺灣臺中地方法院` |
| 彰化地方法院 | `臺灣彰化地方法院` |
| 南投地方法院 | `臺灣南投地方法院` |
| 雲林地方法院 | `臺灣雲林地方法院` |
| 嘉義地方法院 | `臺灣嘉義地方法院` |
| 臺南地方法院 | `臺灣臺南地方法院` |
| 橋頭地方法院 | `臺灣橋頭地方法院` |
| 高雄地方法院 | `臺灣高雄地方法院` |
| 屏東地方法院 | `臺灣屏東地方法院` |
| 宜蘭地方法院 | `臺灣宜蘭地方法院` |
| 花蓮地方法院 | `臺灣花蓮地方法院` |
| 臺東地方法院 | `臺灣臺東地方法院` |
| 澎湖地方法院 | `臺灣澎湖地方法院` |
| 基隆地方法院 | `臺灣基隆地方法院` |
| 金門地方法院 | `福建金門地方法院` |
| 連江地方法院 | `福建連江地方法院` |

## 3. 年份與案由分佈

- `jdate` 範圍：`19960126` – `20260831`

| source_year | 筆數 |
|---|---:|
| 1996 | 2 |
| 1997 | 1 |
| 1998 | 2 |
| 1999 | 1 |
| 2000 | 40 |
| 2001 | 49 |
| 2002 | 54 |
| 2003 | 38 |
| 2004 | 58 |
| 2005 | 55 |
| 2006 | 177 |
| 2007 | 322 |
| 2008 | 194 |
| 2009 | 151 |
| 2010 | 151 |
| 2011 | 170 |
| 2012 | 156 |
| 2013 | 171 |
| 2014 | 187 |
| 2015 | 182 |
| 2016 | 191 |
| 2017 | 222 |
| 2018 | 214 |
| 2019 | 213 |
| 2020 | 243 |
| 2021 | 230 |
| 2022 | 232 |
| 2023 | 267 |
| 2024 | 336 |
| 2025 | 393 |
| 2026 | 298 |

### 案由 top 40

| 案由 | 筆數 |
|---|---:|
| 本票裁定 | 1851 |
| 損害賠償 | 262 |
| 拍賣抵押物 | 164 |
| 支付命令 | 147 |
| 侵權行為損害賠償 | 135 |
| 續予收容 | 134 |
| 清償借款 | 115 |
| 本票裁定強制執行 | 100 |
| 詐欺等 | 92 |
| 清償債務 | 67 |
| 洗錢防制法等 | 62 |
| 給付票款 | 58 |
| 離婚 | 56 |
| 公示送達 | 56 |
| 監護宣告 | 46 |
| 分割共有物 | 43 |
| 返還借款 | 38 |
| 拋棄繼承 | 37 |
| 返還不當得利 | 29 |
| 侵權行為損害賠償(交通) | 26 |
| 給付簽帳卡消費款 | 25 |
| 遷讓房屋等 | 25 |
| 給付貨款 | 23 |
| 給付工程款 | 22 |
| 損害賠償(交通) | 21 |
| 拆屋還地 | 21 |
| 損害賠償等 | 20 |
| 違反洗錢防制法等 | 20 |
| 選任遺產管理人 | 18 |
| 公示催告 | 18 |
| 加重詐欺等 | 17 |
| 拆屋還地等 | 16 |
| 確認本票債權不存在 | 16 |
| 違反動產擔保交易法 | 16 |
| 債務人異議之訴 | 16 |
| 更生事件 | 15 |
| 分割遺產 | 15 |
| 聲明異議 | 14 |
| 死亡宣告 | 14 |
| 所有權移轉登記 | 13 |

## 4. 建議的 Qdrant filter

以「2000–2010 年、板橋／新北地院、詐騙」為例：

```json
{
  "must": [
    {
      "key": "court",
      "match": {
        "any": [
          "臺灣新北地方法院",
          "臺灣板橋地方法院"
        ]
      }
    },
    {
      "key": "source_year",
      "match": {
        "any": [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010"
        ]
      }
    },
    {
      "key": "title",
      "match": {
        "any": [
          "詐欺",
          "詐欺等",
          "詐騙",
          "詐騙等"
        ]
      }
    }
  ]
}
```

注意：`jdate_num` 已建立 integer index，年份／日期請用 range；`title` 是 keyword，動態值用 facet 取得。新匯入資料必須同步寫入 `jdate_num`／`source_year`，否則新 points 會缺欄位。

## 5. 目前 `parse_question` 的程式碼

位置：`src/judgment/rag.py`。trace 只做去除空白與長度記錄；結構化日期／法院／案由解析已由 `src/judgment/query_parser.py` 的 `parse_judgment_query()` 實作。

```python
    parsed_query = parse_judgment_query(raw_question)
    with trace_segment(
        "rag.parse_question",
        module=__name__,
        function="answer_question",
        params={
            "input_length": len(raw_question),
            "normalized_length": len(raw_question.strip()),
        },
    ) as parse_segment:
        question = raw_question.strip()
        if not question:
            raise ValueError("問題不可為空")
        if parse_segment is not None:
            parse_segment["metadata"].update(
                {
                    "input_length": len(raw_question),
                    "normalized_length": len(question),
                    "trimmed_chars": len(raw_question) - len(question),
                    "parsed_query": parsed_query.to_dict(),
                }
            )

    def emit_partial(payload: Dict[str, Any]) -> None:
        if on_partial is None:
            return
        try:
            on_partial(payload)
        except Exception:
            logger.debug("partial answer callback failed", exc_info=True)

    active_index = active_version(
        session_factory, alias_name=settings.judgment_vector_alias
    )
    collection = (
        active_index["physical_collection"]
```

## 6. 目前判決向量檢索的入口

位置：`src/judgment/rag.py` 的 `_search_hits()`。目前接受 `query_filter` 並傳給 `QdrantStore.search()`；列舉路徑另用 `count()` + `scroll(order_by=jdate_num)`。

```python
def _search_hits(
    *,
    settings: Settings,
    question: str,
    store: QdrantStore,
    embedder: OllamaEmbedder,
    collection: Optional[str] = None,
    limit: Optional[int] = None,
    vector: Optional[Sequence[float]] = None,
    query_filter: Optional[Dict[str, Any]] = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    collection = collection or settings.judgment_vector_collection
    search_limit = max(1, int(limit or settings.rag_top_k))
    if not vector:
        vector = _embed_question(
            settings=settings,
            question=question,
            embedder=embedder,
        )
    started = time.perf_counter()
    with trace_segment(
        "rag.qdrant_search",
        module=__name__,
        function="QdrantStore.search",
        params={
            "collection": collection,
            "limit": search_limit,
            "score_threshold": settings.rag_score_threshold,
        },
    ) as qdrant_segment:
        hits = store.search(
            collection,
            vector,
            limit=search_limit,
            score_threshold=settings.rag_score_threshold,
            query_filter=query_filter,
        )
    latency_ms = _elapsed_ms(started)
    deduped: List[Dict[str, Any]] = []
    seen = set()
    for hit in hits:
        payload = hit.get("payload") or {}
        jid = str(payload.get("jid") or "")
        if not jid or jid in seen:
            continue
        seen.add(jid)
```

## 7. 建議的 parser 契約

```json
{
  "year_from": 2000,
  "year_to": 2010,
  "courts": [
    "臺灣新北地方法院",
    "臺灣板橋地方法院"
  ],
  "title_terms": [
    "詐欺",
    "詐欺等",
    "詐騙",
    "詐騙等"
  ],
  "active": true
}
```

驗收方式：準備 20 題帶條件的問題，對 `/api/rag/query` 回傳的每一筆 `judgments` 檢查 `jdate` 年份、`court`、`title` 是否符合parser 輸出；不符合即視為 filter 回歸失敗。

## 8. 抽樣 payload

```json
[
  {
    "jid": "TCDM,111,原金訴,56,20220630,1",
    "court": "臺灣臺中地方法院",
    "title": "詐欺等",
    "jdate": "20220630",
    "matched_laws": [
      "洗錢防制法"
    ],
    "citation_count": 3,
    "source_archive": "202206--(20260815Update).rar",
    "pdf_url": "https://data.judicial.gov.tw/opendl/JDocFile/TCDM/111%2c%e5%8e%9f%e9%87%91%e8%a8%b4%2c56%2c20220630%2c1.pdf",
    "full_text_length": 8606,
    "snippet": "臺灣臺中地方法院 20220630 詐欺等 命中法規：洗錢防制法\n臺灣臺中地方法院刑事判決 111年度原金訴字第56號 公 訴 人 臺灣臺中地方檢察署檢察官 被 告 林立峰 指定辯護人 邱毓嫺 律師 上列被告因詐欺等案件，經檢察官提起公訴（111年度偵字第124 07號），被告於本院準備程序中就被訴事實為有罪之陳述，受命 法官於聽取當事人之意見後，本院合議庭裁定改由受命法官獨任 以簡式審判程序審理，判決如下： 主 文 甲○○犯三人以上共同詐欺取財罪，處有期徒刑壹年壹月；未扣案 之犯罪所得新臺幣參仟元沒收，如全部或一部不能沒收或不宜執 行沒收時，追徵其價額。 犯罪事實 一、甲○○（違反組織犯罪防制條例部分，經臺灣臺中地方檢察署 提起公訴，現繫屬於本院110年度原金訴字第48號案件審理 中，不在本件起訴範圍）自民國110年6月底某日起，加入真 實姓名年籍不詳、在通訊軟體Telegram匿稱「變態」之人， 及乙○○（通緝中）、林添丁（檢察官另案偵辦中）、張嘉豪 、王威盛等及其餘成員所組成之詐欺集團（均無證據證明未 滿18歲），負責擔任領取包裹（俗稱取簿手）之工作，並約 定其領取包裹可獲得所領得詐騙金額百分之2之報酬；其等 遂共同基於意圖為自己不法所有之三人以上共同犯詐欺取財 及洗錢之犯意聯絡，先由甲○○依張嘉豪之指示前去不詳便利 商店領取內含提款卡之包裹，嗣該詐欺集團之其他成員於如 附表",
    "model": "bge-m3",
    "embedding_version": "bge-m3@v1",
    "index_recipe_version": "doc-head-tail-v1-1600",
    "source_year": "2022",
    "valid_from_version_id": 5,
    "valid_to_version_id": null,
    "is_current": true,
    "jdate_num": 20220630
  },
  {
    "jid": "TPHV,108,上,1042,20200624,1",
    "court": "臺灣高等法院",
    "title": "債務人異議之訴等",
    "jdate": "20200624",
    "matched_laws": [
      "民法",
      "票據法"
    ],
    "citation_count": 4,
    "source_archive": "202006--(20260715Update).rar",
    "pdf_url": "https://data.judicial.gov.tw/opendl/JDocFile/TPHV/108%2c%e4%b8%8a%2c1042%2c20200624%2c1.pdf",
    "full_text_length": 12706,
    "snippet": "臺灣高等法院 20200624 債務人異議之訴等 命中法規：民法、票據法\n臺灣高等法院民事判決 108年度上字第1042號 上 訴 人 吳武建 訴訟代理人 黃永琛律師 複 代理人 孫誠偉律師 被 上訴人 許耀文 訴訟代理人 黃勝和律師 上列當事人間請求債務人異議之訴等事件，上訴人對於中華民國 108年6月13日臺灣新北地方法院107年度訴字第1007號第一審判 決提起上訴，本院於109年6月3日言詞辯論終結，判決如下： 主 文 原判決廢棄。 確認被上訴人持有臺灣臺北地方法院一○五年度司票字第一五二 三三號裁定所載如附表所示本票，對上訴人之本票債權不存在。 被上訴人應返還上訴人新臺幣捌拾玖萬伍仟柒佰壹拾柒元，及自 民國一○八年一月十八日起至清償日止，按週年利率百分之五計 算之利息。 被上訴人不得再以臺灣新北地方法院一○七年十一月二十一日新 北院輝一○六司執水字第五九九六一號債權憑證為執行名義，對 上訴人為強制執行。 第一、二審訴訟費用均由被上訴人負擔。 事實及理由 一、上訴人主張：伊與訴外人惠宏開發建設有限公司（下稱惠宏 公司）於民國105年間成立居間契約（下稱系爭居間契約） ，約定若伊居間撮合惠宏公司與訴外人立豐開發不動產有限 公司（下稱立豐公司）就坐落臺北市萬華區○○段○小段00-4 、00-5、00、00-2、00-3、00-4、00-5、00-2、00、00-1地 號等10筆",
    "model": "bge-m3",
    "embedding_version": "bge-m3@v1",
    "index_recipe_version": "doc-head-tail-v1-1600",
    "source_year": "2020",
    "valid_from_version_id": 5,
    "valid_to_version_id": null,
    "is_current": true,
    "jdate_num": 20200624
  },
  {
    "jid": "TPDV,109,司票,4687,20200310,1",
    "court": "臺灣臺北地方法院",
    "title": "本票裁定",
    "jdate": "20200310",
    "matched_laws": [
      "票據法"
    ],
    "citation_count": 1,
    "source_archive": "202003--(20260515Update).rar",
    "pdf_url": "",
    "full_text_length": 779,
    "snippet": "臺灣臺北地方法院 20200310 本票裁定 命中法規：票據法\n臺灣臺北地方法院民事裁定 109年度司票字第4687號 聲 請 人 裕富數位資融股份有限公司 法定代理人 許國興 相 對 人 黃筠庭 上列當事人間聲請本票准許強制執行事件，本院裁定如下： 主 文 相對人於民國一百零八年五月二十二日簽發之本票內載憑票交付 聲請人新臺幣陸萬壹仟零捌拾元，其中之新臺幣肆萬參仟貳佰陸 拾伍元及自民國一百零九年一月二十三日起至清償日止，按年息 百分之二十計算之利息，得為強制執行。 聲請程序費用新臺幣伍佰元由相對人負擔。 理 由 一、本件聲請意旨略以：聲請人執有相對人於民國108年5月22日 簽發之本票1紙，內載金額新臺幣（下同）61,080元，付款 地在臺北市，利息約定自到期日起按年息20%計算，免除作 成拒絕證書，到期日109年1月22日，詎於到期後經提示僅支 付其中部分外，其餘43,265元未獲付款，為此提出本票1紙 ，聲請裁定就上開金額及依約定年息計算之利息准許強制執 行等語。 二、本件聲請核與票據法第123條規定相符，應予准許。 三、依非訟事件法第21條第2項、民事訴訟法第78條裁定如主文 。 四、如不服本裁定，應於裁定送達後10日內向本院提出抗告狀， 並繳納抗告費新臺幣1,000元。 五、發票人如主張本票係偽造、變造者，於接到本裁定後20日內 ，得對執票人向本院另行提起確認債權不存在之",
    "model": "bge-m3",
    "embedding_version": "bge-m3@v1",
    "index_recipe_version": "doc-head-tail-v1-1600",
    "source_year": "2020",
    "valid_from_version_id": 5,
    "valid_to_version_id": null,
    "is_current": true,
    "jdate_num": 20200310
  }
]
```
