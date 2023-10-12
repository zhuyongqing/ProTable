/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-empty-function': 'off', // 关闭空方法检查
    '@typescript-eslint/no-explicit-any': 'off', // 关闭any类型的警告
    'vue/no-v-model-argument': 'off',
    'no-undef': 'off',
    'vue/valid-v-slot': 'off',
    'vue/no-mutating-props': 'off'
  }
}
