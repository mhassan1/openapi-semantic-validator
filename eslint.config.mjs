import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(js.configs.recommended, tseslint.configs.recommended, globalIgnores(['**/*.js', '**/*.d.ts']))
