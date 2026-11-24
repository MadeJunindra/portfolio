import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", "public/assets/vendor/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  {
    files: ["public/assets/js/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } },
    rules: {
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-implicit-globals": "error",
      // XSS: innerHTML hanya boleh lewat lib/html.js (template yang auto-escape)
      "no-restricted-properties": [
        "error",
        { property: "innerHTML", message: "Gunakan render(el, html`...`) dari lib/html.js." },
        { property: "outerHTML", message: "Gunakan render(el, html`...`) dari lib/html.js." },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: "Gunakan render() dari lib/html.js.",
        },
        { selector: "CallExpression[callee.name='eval']", message: "eval dilarang." },
      ],
    },
  },
  {
    files: ["public/assets/js/lib/html.js"],
    rules: { "no-restricted-properties": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "tests/**/*.js", "*.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } },
  },
  {
    files: ["tests/e2e/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
