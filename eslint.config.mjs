import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript", "prettier")];

const config = [
  ...eslintConfig,
  {
    rules: {
      "no-shadow": [
        "error",
        {
          builtinGlobals: false,
          hoist: "functions",
          allow: [],
          ignoreOnInitialization: false,
        },
      ],
      "react/no-unescaped-entities": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "dist/",
      "coverage/",
      ".husky/",
      ".env*",
      "*.log",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      ".DS_Store",
    ],
  },
];

export default config;
