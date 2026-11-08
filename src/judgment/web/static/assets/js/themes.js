import { escapeHtml, icon } from "./utils.js";

const STORAGE_KEY = "judgment.theme";
export const DEFAULT_THEME = "nvidia";

export const THEMES = [
  {
    id: "vercel",
    name: "Vercel",
    description: "黑白精準 · Geist · 幾何留白",
    swatches: ["#171717", "#0070f3", "#fafafa"],
    metaColor: "#ffffff",
  },
  {
    id: "apple",
    name: "Apple",
    description: "SF Pro · 大圓角 · 沉浸留白",
    swatches: ["#1d1d1f", "#0071e3", "#f5f5f7"],
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
    swatches: ["#5e6ad2", "#010102", "#e8e8ec"],
    metaColor: "#010102",
  },
  {
    id: "figma",
    name: "Figma",
    description: "多彩色塊 · 協作感 · 藍色焦點",
    swatches: ["#f24e1e", "#a259ff", "#0acf83"],
    metaColor: "#ffffff",
  },
  {
    id: "notion",
    name: "Notion",
    description: "暖白紙張 · 襯線標題 · 知識庫",
    swatches: ["#191918", "#0075de", "#f7f6f3"],
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

  const label = document.getElementById("theme-label");
  if (label) label.textContent = theme.name;

  const swatches = document.getElementById("theme-swatches");
  if (swatches) {
    swatches.innerHTML = theme.swatches
      .map((color) => `<i class="style-swatch" style="--swatch:${escapeHtml(color)}"></i>`)
      .join("");
  }

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

function renderThemeMenu(menu) {
  const options = THEMES.map((theme, index) => {
    const swatches = theme.swatches
      .map((color) => `<i style="--swatch:${escapeHtml(color)}"></i>`)
      .join("");
    return `<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${theme.id}" aria-checked="false">
        <span class="theme-option-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${escapeHtml(theme.name)}</span>
          <span class="theme-option-desc">${escapeHtml(theme.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${swatches}</span>
        <span class="theme-option-check" aria-hidden="true">${icon("check", 14)}</span>
      </button>`;
  }).join("");

  menu.innerHTML = `<div class="style-menu-head">
      <strong>選擇介面風格</strong>
      <span>10 種科技品牌語言</span>
    </div>${options}`;
}

export function initThemePicker() {
  const picker = document.getElementById("style-picker");
  const trigger = document.getElementById("style-trigger");
  const menu = document.getElementById("style-menu");
  if (!picker || !trigger || !menu) return;

  renderThemeMenu(menu);
  applyTheme(getStoredTheme(), { persist: false });

  const options = () => Array.from(menu.querySelectorAll(".theme-option"));

  const open = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const active = menu.querySelector(".theme-option.is-active") || options()[0];
    if (active) active.focus();
  };

  const close = ({ restoreFocus = false } = {}) => {
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };

  trigger.addEventListener("click", () => {
    if (menu.hidden) open();
    else close({ restoreFocus: true });
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  });

  menu.addEventListener("click", (event) => {
    const option = event.target.closest(".theme-option");
    if (!option) return;
    applyTheme(option.dataset.themeId);
    close({ restoreFocus: true });
  });

  menu.addEventListener("keydown", (event) => {
    const items = options();
    const index = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close({ restoreFocus: true });
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = items[(index + delta + items.length) % items.length];
      if (next) next.focus();
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? items[0] : items[items.length - 1];
      if (next) next.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!picker.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
