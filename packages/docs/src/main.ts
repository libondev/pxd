import UI from 'pxd'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.css'
import '@jongwooo/prism-theme-github/themes/prism-github-default-auto.css'

const app = createApp(App)

app.use(router)
app.use(UI)

app.mount('#app')
