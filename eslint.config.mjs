import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendor files copied from node_modules by scripts/copy-vendor-assets.mjs.
    "public/pdfjs/**",
    "public/oxipng/**",
    "public/qpdf/**",
    // Local design reference (git-excluded); generated support files, not source.
    "design_handoff_filehush_identity/**",
  ]),
]);

export default eslintConfig;
