import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/coverage/",
      "**/dist/",
      "**/node_modules/",
      "**/.angular/",
      "**/index.html",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  ...compat
    .extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates"
    )
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.html"],
    })),
  {
    files: [
      "projects/ngx-whats-new/src/**/*.ts",
      "projects/ngx-whats-new/src/**/*.html",
    ],

    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          style: "camelCase",
        },
      ],

      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "ngx",
          style: "kebab-case",
        },
      ],
    },
  },
  ...compat
    .extends(
      "plugin:@angular-eslint/template/recommended",
      "plugin:@angular-eslint/template/accessibility"
    )
    .map((config) => ({
      ...config,
      files: ["**/*component.html"],
    })),
  {
    files: ["**/*.component.html"],
    rules: {
      "@typescript-eslint/ban-ts-comment": ["off"],
    },
  },
];
