const STORAGE_KEY = "judgment.theme";
export const DEFAULT_THEME = "nvidia";

export const THEMES = [
  {
    id: "vercel",
    name: "Vercel",
    description: "黑白精準 · Geist · 幾何留白",
    swatches: ["#0070f3", "#171717", "#fafafa"],
    metaColor: "#ffffff",
  },
  {
    id: "apple",
    name: "Apple",
    description: "SF Pro · 大圓角 · 沉浸留白",
    swatches: ["#0066cc", "#1d1d1f", "#f5f5f7"],
    metaColor: "#fbfbfd",
  },
  {
    id: "meta",
    name: "Meta",
    description: "Optimistic · 明亮藍 · 膠囊元件",
    swatches: ["#0064e0", "#0091ff", "#f1f4f7"],
    metaColor: "#ffffff",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    description: "GPU 綠 · 黑底 · 銳利直角",
    swatches: ["#76b900", "#000000", "#f7f7f7"],
    metaColor: "#000000",
  },
  {
    id: "ibm",
    name: "IBM",
    description: "Carbon · Plex Sans · 企業藍",
    swatches: ["#0f62fe", "#161616", "#f4f4f4"],
    metaColor: "#161616",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "紫靛漸層 · 精密金融感",
    swatches: ["#635bff", "#ea2261", "#f6f9fc"],
    metaColor: "#ffffff",
  },
  {
    id: "linear",
    name: "Linear",
    description: "深空黑 · 靛紫 · 極簡線條",
    swatches: ["#17171d", "#5e6ad2", "#e8e8ec"],
    metaColor: "#010102",
  },
  {
    id: "figma",
    name: "Figma",
    description: "多彩色塊 · 協作感 · 藍色焦點",
    swatches: ["#0d99ff", "#a259ff", "#0acf83"],
    metaColor: "#ffffff",
  },
  {
    id: "notion",
    name: "Notion",
    description: "暖白紙張 · 襯線標題 · 知識庫",
    swatches: ["#0075de", "#191918", "#f7f6f3"],
    metaColor: "#ffffff",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "暖灰畫布 · 黑色行動 · 綠色訊號",
    swatches: ["#10a37f", "#0d0d0d", "#f9f9f7"],
    metaColor: "#f9f9f7",
  },
];

const THEME_MAP = new Map(THEMES.map((theme) => [theme.id, theme]));

export function isThemeId(value) {
  return THEME_MAP.has(value);
}

export function getTheme(id) {
  return THEME_MAP.get(id) || THEME_MAP.get(DEFAULT_THEME);
}

export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME;
  } catch (error) {
    return DEFAULT_THEME;
  }
}

export function applyTheme(id, { persist = true } = {}) {
  const theme = getTheme(id);
  document.documentElement.dataset.theme = theme.id;
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.setAttribute("content", theme.metaColor);

  document.querySelectorAll(".theme-option").forEach((option) => {
    const active = option.dataset.themeId === theme.id;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-checked", active ? "true" : "false");
  });

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme.id);
    } catch (error) {
      /* storage may be unavailable */
    }
  }

  window.dispatchEvent(new CustomEvent("judgment:theme", { detail: { theme: theme.id } }));
  return theme;
}
