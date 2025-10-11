import pluginJs from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";
import nodePlugin from "eslint-plugin-n";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      "n/no-unpublished-import": [
        "error",
        {
          allowModules: ["xml2js", "vercel-node-server", "supertest"],
        },
      ],
    },
  },
  { ignores: ["eslint.config.mjs"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  nodePlugin.configs["flat/recommended"],
  jestPlugin.configs["flat/recommended"],
];
