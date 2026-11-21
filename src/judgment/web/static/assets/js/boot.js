(function () {
  try {
    var theme = localStorage.getItem("judgment.theme");
    var allowed = [
      "vercel",
      "apple",
      "meta",
      "nvidia",
      "ibm",
      "stripe",
      "linear",
      "figma",
      "notion",
      "openai",
    ];
    if (theme && allowed.indexOf(theme) !== -1) {
      document.documentElement.dataset.theme = theme;
    }
    var appearance = localStorage.getItem("judgment.appearance");
    if (["light", "dark", "system"].indexOf(appearance) === -1) {
      appearance = "light";
    }
    var resolvedAppearance =
      appearance === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : appearance;
    document.documentElement.dataset.appearance = resolvedAppearance;
    document.documentElement.dataset.appearanceMode = appearance;
  } catch (error) {
    /* localStorage may be unavailable */
  }
})();
