/* eslint-disable */

const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2018,
      parserOptions: {},
      parser: tsParser,
    },
    extends: compat.extends('plugin:@typescript-eslint/recommended'),
  },
  globalIgnores(['**/*.js', '**/*.d.ts']),
]);
