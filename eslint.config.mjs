import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import stylistic from "@stylistic/eslint-plugin"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Project style: never use semicolons (kept only where ASI would break code).
  {
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/member-delimiter-style": ["error", {
        multiline: { delimiter: "none" },
        singleline: { delimiter: "comma", requireLast: false },
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
