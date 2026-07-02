import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    defineConfig([
        globalIgnores(['**/metro.config.js', '**/tailwind.config.js']),
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: import.meta.dirname,
                },
                globals: {
                    ...globals.node,
                },
            },

            plugins: {
                import: importPlugin,
                'unused-imports': unusedImports,
            },

            rules: {
                'no-console': ['error', { allow: ['warn', 'error', 'info'] }],

                'import/order': [
                    'error',
                    {
                        alphabetize: { order: 'asc', caseInsensitive: true },
                    },
                ],

                'unused-imports/no-unused-imports': 'error',

                'unused-imports/no-unused-vars': [
                    'error',
                    {
                        vars: 'all',
                        varsIgnorePattern: '^_',
                        args: 'after-used',
                        argsIgnorePattern: '^_',
                    },
                ],

                '@typescript-eslint/no-explicit-any': 'error',
            },

            ignores: ['node_modules', '.expo', 'dist', 'build', 'coverage'],
        },
    ]),
)
