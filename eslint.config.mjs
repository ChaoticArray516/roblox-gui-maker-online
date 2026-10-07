import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // SOP-3H: 客户端数据加载 hook（useOverview / AccountMenu / AIGenerator）在 effect
  // 内 async fetch 后 setState 是标准模式；React 19 react-hooks/set-state-in-effect
  // 规则对此误报，降为 warn。
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vercel build output (may contain generated chunks):
    ".vercel/output/**",
  ]),
]);

export default eslintConfig;
