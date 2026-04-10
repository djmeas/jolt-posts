// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'vue/block-order': ['error', {
      order: ['script', 'template', 'style']
    }],
    'vue/require-default-prop': 'off',
    'vue/html-self-closing': ['error', {
      html: { void: 'always', normal: 'never', component: 'always' }
    }]
  }
})