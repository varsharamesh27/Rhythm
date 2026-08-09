import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });
const eslintConfig = [
  {
    ignores: [".next*/**", ".open-next/**", ".sites-bundle/**", ".wrangler/**", "node_modules/**", "out/**", "dist/**", "coverage/**", "playwright-report/**", "test-results/**", ".tools/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
