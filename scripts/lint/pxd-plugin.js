import { definePlugin } from 'vite-plus/lint/plugins'
import fileEolPlugin from './file-eol-plugin.js'
import importJsSuffixPlugin from './import-js-suffix-plugin.js'
import vueSetupApiOrderPlugin from './vue-setup-api-order-plugin.js'

export default definePlugin({
  meta: { name: 'pxd' },
  rules: {
    ...vueSetupApiOrderPlugin.rules,
    ...importJsSuffixPlugin.rules,
    ...fileEolPlugin.rules,
  },
})
