import { escapeHtml, icon } from "../utils.js";

const SECTIONS = [
  {
    route: "rag",
    icon: "message",
    kicker: "RAG",
    title: "RAG 提問",
    summary: "用自然語言找到法規與判決，答案附上可回溯的引用來源。",
    description:
      "Qdrant 向量檢索、LLM 生成回答、引用驗證與 pipeline waterfall，都在同一個工作區完成。",
    metric: "Citations first",
    tone: "feature",
  },
  {
    route: "data",
    icon: "database",
    kicker: "EXPLORE",
    title: "資料庫查詢",
    summary: "跨 PostgreSQL、Parquet、Qdrant 與 IndexedDB 探索資料。",
    description:
      "以 metadata、SQL 或語意查詢檢視資料表，支援分頁、排序與 CSV／JSON 匯出。",
    metric: "4 種資料來源",
    tone: "blue",
  },
  {
    route: "quality",
    icon: "shield",
    kicker: "QUALITY",
    title: "資料品質",
    summary: "用 DuckDB 直接檢查原始判決資料的完整性。",
    description:
      "檢查重複、缺漏、引用一致性與 archive 統計，並維護題庫與 benchmark 題組。",
    metric: "DuckDB native",
    tone: "green",
  },
  {
    route: "performance",
    icon: "activity",
    kicker: "OBSERVE",
    title: "效能報表",
    summary: "從單次請求到整體索引，追蹤每一個時間片段。",
    description:
      "完整 Flow、RAG Pipeline waterfall、Token、TTFT、索引吞吐與 RAG Benchmark 一次看完。",
    metric: "ms-level trace",
    tone: "amber",
  },
  {
    route: "processing",
    icon: "sliders",
    kicker: "PIPELINE",
    title: "資料處理",
    summary: "下載、匯入、備份、索引，集中管理資料生命週期。",
    description:
      "追蹤法規、命令與判決流程，管理 Ollama 主機優先順序與線上更新檢查。",
    metric: "End-to-end",
    tone: "violet",
  },
  {
    route: "status",
    icon: "server",
    kicker: "STATUS",
    title: "系統狀態",
    summary: "即時掌握每一個服務與基礎設施的運作狀態。",
    description:
      "FastAPI、PostgreSQL、Qdrant、Ollama、Docker／volume、磁碟與資料版本。",
    metric: "Live health",
    tone: "slate",
  },
  {
    route: "tests",
    icon: "check",
    kicker: "VERIFY",
    title: "系統測試",
    summary: "在上線前確認 API、模型與測試 Flow 都準備好了。",
    description:
      "設定 API Base、測試模式與 LLM chat 能力，執行多模型測試並檢查結果。",
    metric: "Model ready",
    tone: "rose",
  },
];

function renderSectionTile(section) {
  return `<a class="home-tile tone-${escapeHtml(section.tone)}" href="#/${section.route}">
    <span class="home-tile-watermark" aria-hidden="true">${icon(section.icon, 132)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${icon(section.icon, 22)}</span>
      <span class="home-tile-kicker">${escapeHtml(section.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${escapeHtml(section.title)}</strong>
      <span>${escapeHtml(section.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric">${escapeHtml(section.metric)}</span>
      <span class="home-tile-cta">探索 ${icon("arrowRight", 13)}</span>
    </span>
  </a>`;
}

export async function render(root, ctx) {
  const feature = SECTIONS[0];
  const tiles = SECTIONS.slice(1).map(renderSectionTile).join("");
  root.innerHTML = `<section class="page home-page">
    <div class="home-stage">
      <span class="home-stage-halo" aria-hidden="true"></span>
      <div class="home-stage-inner">
        <span class="home-eyebrow">JUDGMENT · LEGAL RAG</span>
        <h1 class="home-title">讓每一個答案，<span>都能回到法規與判決。</span></h1>
        <p class="home-lead">以金融法規的現行條文與判決片段為檢索基礎。
          先從 Qdrant 找出相似判決，再由 LLM 生成附引用來源的回答；若模型尚未就緒，系統只顯示可驗證的檢索結果。</p>
        <form class="home-ask" id="home-ask-form" autocomplete="off">
          <label class="sr-only" for="home-question">輸入法律問題</label>
          <div class="home-ask-box">
            <textarea class="home-ask-input" id="home-question" name="question" rows="1"
              maxlength="500" placeholder="問一個法律問題，例如：金融消費者保護法如何處理金融消費爭議？"
              aria-describedby="home-ask-help"></textarea>
            <button class="btn btn-primary home-ask-submit" type="submit">
              ${icon("sparkles", 16)}<span>開始檢索</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> 送出</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> 換行</span>
            <span>送出後在 RAG 提問中開啟</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${icon("shield", 13)}可回溯引用</span>
          <span>${icon("database", 13)}法規＋判決</span>
          <span>${icon("activity", 13)}Pipeline waterfall</span>
        </div>
      </div>
    </div>

    <div class="home-showcase">
      <div class="home-showcase-head">
        <div>
          <span class="home-kicker">EXPLORE THE CONSOLE</span>
          <h2>一套系統，從提問走到資料維運。</h2>
        </div>
        <p>每個工作區都直接連到可驗證的資料來源與模型服務，沒有模擬資料，也不以推測補齊。</p>
      </div>

      <a class="home-feature" href="#/${feature.route}">
        <span class="home-feature-glow" aria-hidden="true"></span>
        <div class="home-feature-copy">
          <span class="home-feature-kicker">${escapeHtml(feature.kicker)} · ${escapeHtml(feature.metric)}</span>
          <h3>${escapeHtml(feature.title)}<br /><span>${escapeHtml(feature.summary)}</span></h3>
          <p>${escapeHtml(feature.description)}</p>
          <span class="home-feature-cta">開始提問 ${icon("arrowRight", 14)}</span>
        </div>
        <div class="home-feature-art" aria-hidden="true">
          <span class="home-feature-orbit orbit-one"></span>
          <span class="home-feature-orbit orbit-two"></span>
          <span class="home-feature-core">${icon(feature.icon, 46)}</span>
          <span class="home-feature-chip chip-qdrant">Qdrant</span>
          <span class="home-feature-chip chip-llm">LLM</span>
          <span class="home-feature-chip chip-cite">Citations</span>
        </div>
      </a>

      <div class="home-tile-grid">${tiles}</div>
    </div>

    <section class="home-trust" aria-label="系統原則">
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("shield", 18)}</span>
        <strong>來源優先</strong>
        <p>回答只根據檢索到的法規與判決片段生成，引用編號可回到原始資料。</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("server", 18)}</span>
        <strong>本機模型</strong>
        <p>透過 Ollama 使用本機或區網模型，模型與主機優先順序都可調整。</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("layers", 18)}</span>
        <strong>版本可追溯</strong>
        <p>法規、判決與向量索引保留版本與更新紀錄，資料變更不會默默消失。</p>
      </div>
    </section>
  </section>`;

  const form = root.querySelector("#home-ask-form");
  const input = root.querySelector("#home-question");

  const submitQuestion = () => {
    const question = String(input?.value || "").trim().slice(0, 500);
    if (!question) {
      input?.focus();
      return;
    }
    try {
      window.sessionStorage.setItem("judgment.pending_question", question);
    } catch (error) {
      /* session storage is optional; the in-memory fallback is enough */
    }
    window.__judgmentPendingQuestion = question;
    if (ctx && typeof ctx.navigate === "function") ctx.navigate("rag");
    else window.location.hash = "#/rag";
  };

  const resizeInput = () => {
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  };

  input?.addEventListener("input", resizeInput);
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion();
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitQuestion();
    }
  });
  resizeInput();
  input?.focus({ preventScroll: true });
}
