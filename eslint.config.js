// @ts-check
const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'jest.config.js', 'eslint.config.js'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Variável não usada é erro, salvo quando prefixada com `_` — o que
      // cobre o `_next` obrigatório na assinatura do error handler do Express.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // `any` derruba a verificação de tipos justamente onde ela mais importa:
      // no limite entre a aplicação e o mundo externo.
      '@typescript-eslint/no-explicit-any': 'error',

      // Erro deve ser esperado com `await`, não virar rejeição não tratada.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // `import type` mantém o import fora do JavaScript emitido.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // O logger estruturado ainda não existe (ver NEXT-STEPS); até lá, o
      // console é o log da aplicação — mas só nos pontos de saída.
      'no-console': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  {
    files: ['**/*.test.ts'],
    rules: {
      // Dublê de teste precisa de conversão dupla para montar só o que o
      // código sob teste realmente usa.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
