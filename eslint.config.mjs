import nextPlugin from '@next/eslint-plugin-next'

const eslintConfig = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'out/',
      'coverage/',
      '*.min.js',
      'next-env.d.ts',
      'playwright-report/',
      'test-results/',
      '.supabase/',
    ],
  },
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

export default eslintConfig
